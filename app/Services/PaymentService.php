<?php

namespace App\Services;

use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use App\Exceptions\FraudDetectedException;
use App\Models\FraudAlert;
use App\Models\Transaction;
use Illuminate\Support\Facades\Log;
use Stripe\Exception\ApiErrorException;

class PaymentService
{
    public function __construct(
        public StripeService $stripeService,
        protected FraudDetectionService $fraudDetectionService,
        protected AuditLogService $auditLogService,
        protected ?InvestmentService $investmentService = null,
    ) {}

    public function setInvestmentService(InvestmentService $investmentService): void
    {
        $this->investmentService = $investmentService;
    }

    public function initiatePayment(int $userId, int $amount, string $currency, TransactionType $type, ?int $paymentMethodId = null, ?int $relatedId = null): Transaction
    {
        $transaction = Transaction::create([
            'user_id' => $userId,
            'type' => $type,
            'status' => TransactionStatus::Pending,
            'amount' => $amount,
            'currency' => $currency,
            'payment_method_id' => $paymentMethodId,
            'metadata' => [
                'ip_address' => request()->ip(),
            ],
        ]);

        $this->fraudDetectionService->evaluateTransaction($transaction);

        $highSeverityAlerts = FraudAlert::where('user_id', $userId)
            ->where('severity', 'high')
            ->where('detected_at', '>=', now()->subMinutes(30))
            ->exists();

        if ($highSeverityAlerts && config('fraud-detection.blocking_enabled', false)) {
            throw new FraudDetectedException('Transaction blocked due to recent high-severity fraud alerts');
        }

        $paymentIntent = $this->stripeService->createPaymentIntent(
            $amount,
            $currency,
            [
                'transaction_id' => $transaction->id,
                'user_id' => $userId,
                'type' => $type->value,
            ]
        );

        $transaction->update([
            'stripe_payment_intent_id' => $paymentIntent->id,
            'status' => TransactionStatus::Processing,
        ]);

        $this->auditLogService->logEvent(
            \App\Enums\AuditEventType::INVESTMENT_PURCHASED,
            $userId,
            [
                'transaction_id' => $transaction->id,
                'payment_intent_id' => $paymentIntent->id,
                'amount' => $amount,
                'currency' => $currency,
            ]
        );

        return $transaction;
    }

    public function confirmPayment(string $paymentIntentId): Transaction
    {
        $paymentIntent = $this->stripeService->retrievePaymentIntent($paymentIntentId);
        $transaction = Transaction::where('stripe_payment_intent_id', $paymentIntentId)->firstOrFail();

        if ($paymentIntent->status === 'succeeded') {
            $transaction->update([
                'status' => TransactionStatus::Completed,
                'completed_at' => now(),
                'stripe_metadata' => $paymentIntent->toArray(),
            ]);

            $this->auditLogService->logEvent(
                \App\Enums\AuditEventType::INVESTMENT_PURCHASED,
                $transaction->user_id,
                [
                    'transaction_id' => $transaction->id,
                    'status' => 'completed',
                    'amount' => $transaction->amount,
                ]
            );

            return $transaction;
        }

        throw new \RuntimeException("Payment intent status is {$paymentIntent->status}, expected succeeded");
    }

    public function handleWebhookEvent(string $eventId, string $eventType, array $eventData): void
    {
        switch ($eventType) {
            case 'payment_intent.succeeded':
                $this->handlePaymentIntentSucceeded($eventId, $eventData);
                break;

            case 'payment_intent.payment_failed':
                $this->handlePaymentIntentFailed($eventId, $eventData);
                break;

            default:
                break;
        }
    }

    protected function handlePaymentIntentSucceeded(string $eventId, array $eventData): void
    {
        $paymentIntentId = $eventData['id'] ?? null;
        if (! $paymentIntentId) {
            return;
        }

        $transaction = Transaction::where('stripe_payment_intent_id', $paymentIntentId)->first();
        if (! $transaction) {
            return;
        }

        if ($transaction->status === TransactionStatus::Completed) {
            return;
        }

        $transaction->update([
            'status' => TransactionStatus::Completed,
            'completed_at' => now(),
            'stripe_metadata' => $eventData,
        ]);

        $this->auditLogService->logEvent(
            \App\Enums\AuditEventType::INVESTMENT_PURCHASED,
            $transaction->user_id,
            [
                'transaction_id' => $transaction->id,
                'stripe_event_id' => $eventId,
                'status' => 'completed_via_webhook',
            ]
        );

        if ($this->investmentService && $transaction->type === TransactionType::InvestmentPurchase) {
            $investment = \App\Models\Investment::where('transaction_id', $transaction->id)->first();
            if ($investment) {
                $this->investmentService->confirmInvestment($investment->id);
            }
        }
    }

    protected function handlePaymentIntentFailed(string $eventId, array $eventData): void
    {
        $paymentIntentId = $eventData['id'] ?? null;
        $lastPaymentError = $eventData['last_payment_error'] ?? [];

        if (! $paymentIntentId) {
            return;
        }

        $transaction = Transaction::where('stripe_payment_intent_id', $paymentIntentId)->first();
        if (! $transaction) {
            return;
        }

        if ($transaction->status === TransactionStatus::Failed) {
            return;
        }

        $failureReason = $lastPaymentError['message'] ?? 'Unknown error';

        $transaction->update([
            'status' => TransactionStatus::Failed,
            'failed_at' => now(),
            'failure_reason' => $failureReason,
            'stripe_metadata' => $eventData,
        ]);

        $this->auditLogService->logEvent(
            \App\Enums\AuditEventType::INVESTMENT_PURCHASED,
            $transaction->user_id,
            [
                'transaction_id' => $transaction->id,
                'stripe_event_id' => $eventId,
                'status' => 'failed',
                'failure_reason' => $failureReason,
            ]
        );
    }

    public function cancelPendingTransaction(int $transactionId): Transaction
    {
        $transaction = Transaction::findOrFail($transactionId);

        if ($transaction->status !== TransactionStatus::Pending) {
            throw new \RuntimeException("Cannot cancel transaction with status {$transaction->status->value}");
        }

        if ($transaction->stripe_payment_intent_id) {
            try {
                $paymentIntent = $this->stripeService->retrievePaymentIntent($transaction->stripe_payment_intent_id);
                if ($paymentIntent->status !== 'canceled') {
                    $paymentIntent->cancel();
                }
            } catch (ApiErrorException $e) {
                Log::error("Failed to cancel Stripe payment intent: {$e->getMessage()}");
            }
        }

        $transaction->update([
            'status' => TransactionStatus::Cancelled,
        ]);

        return $transaction;
    }
}
