<?php

namespace App\Services;

use App\Enums\AuditEventType;
use App\Enums\InvestmentStatus;
use App\Enums\TransactionType;
use App\Exceptions\InvalidInvestmentAmountException;
use App\Exceptions\InvestmentLimitExceededException;
use App\Exceptions\InvestmentNotCancellableException;
use App\Exceptions\KycNotVerifiedException;
use App\Exceptions\PaymentConfigurationException;
use App\Exceptions\PaymentProviderException;
use App\Exceptions\TreeNotInvestableException;
use App\Models\Investment;
use App\Models\Tree;
use App\Models\User;
use App\Notifications\InvestmentCancelledNotification;
use App\Notifications\InvestmentConfirmedNotification;
use App\Notifications\InvestmentPurchasedNotification;
use App\Support\TransactionHelper;
use Illuminate\Support\Facades\Log;
use Throwable;

class InvestmentServiceEnhanced extends InvestmentService
{
    public function validateInvestmentEligibility(User $user, Tree $tree, int $quantity): array
    {
        $errors = [];

        if (! $user->isKycValid()) {
            $errors['kyc'] = 'KYC verification is required before investing.';
        }

        if (! $tree->isInvestable()) {
            $errors['tree'] = 'This tree is not currently available for investment.';
        }

        if ($quantity < 1) {
            $errors['quantity_min'] = 'You must invest in at least 1 tree.';
        } else {
            $minTrees = (int) ceil($tree->min_investment_cents / $tree->price_cents);
            $maxTrees = (int) floor($tree->max_investment_cents / $tree->price_cents);

            if ($quantity < $minTrees) {
                $errors['quantity_min'] = "Minimum investment is {$minTrees} trees.";
            }

            if ($quantity > $maxTrees) {
                $errors['quantity_max'] = "Maximum investment is {$maxTrees} trees.";
            }
        }

        return [
            'eligible' => empty($errors),
            'errors' => $errors,
        ];
    }

    public function initiateInvestment(
        User $user,
        Tree $tree,
        int $quantity,
        ?int $paymentMethodId = null
    ): Investment {
        $eligibility = $this->validateInvestmentEligibility($user, $tree, $quantity);

        if (! $eligibility['eligible']) {
            $firstError = array_values($eligibility['errors'])[0] ?? 'Investment eligibility check failed';

            if (isset($eligibility['errors']['kyc'])) {
                throw new KycNotVerifiedException;
            }

            if (isset($eligibility['errors']['tree'])) {
                throw new TreeNotInvestableException($tree->id);
            }

            if (isset($eligibility['errors']['quantity_min'])) {
                throw new InvalidInvestmentAmountException($quantity * $tree->price_cents, $tree->min_investment_cents);
            }

            if (isset($eligibility['errors']['quantity_max'])) {
                throw new InvestmentLimitExceededException($quantity * $tree->price_cents, $tree->max_investment_cents);
            }

            throw new \InvalidArgumentException($firstError);
        }

        $amountCents = $quantity * $tree->price_cents;

        return TransactionHelper::smart(function () use ($user, $tree, $quantity, $amountCents, $paymentMethodId) {
            $transaction = null;
            $investment = null;

            try {
                // Enhanced error handling for payment initiation
                $transaction = $this->paymentService->initiatePayment(
                    $user->id,
                    $amountCents,
                    'IDR',
                    TransactionType::InvestmentPurchase,
                    $paymentMethodId
                );

                if (! $transaction) {
                    throw new PaymentConfigurationException('Failed to create payment transaction');
                }

                $investment = Investment::create([
                    'user_id' => $user->id,
                    'tree_id' => $tree->id,
                    'amount_cents' => $amountCents,
                    'quantity' => $quantity,
                    'currency' => 'IDR',
                    'purchase_date' => now()->toDateString(),
                    'status' => InvestmentStatus::PendingPayment,
                    'transaction_id' => $transaction->id,
                    'metadata' => [
                        'tree_identifier' => $tree->tree_identifier,
                        'fruit_crop_id' => $tree->fruit_crop_id,
                        'initiated_at' => now()->toISOString(),
                    ],
                ]);

                $this->auditLogService->logEvent(
                    AuditEventType::INVESTMENT_PURCHASED,
                    $user->id,
                    [
                        'investment_id' => $investment->id,
                        'tree_id' => $tree->id,
                        'quantity' => $quantity,
                        'amount' => $amountCents,
                        'transaction_id' => $transaction->id,
                        'payment_intent_id' => $transaction->stripe_payment_intent_id,
                        'event' => 'investment_initiated',
                    ]
                );

                // Enhanced notification error handling
                try {
                    $user->notify(new InvestmentPurchasedNotification([
                        'tree_identifier' => $tree->tree_identifier,
                        'formatted_amount' => 'Rp '.number_format($amountCents / 100, 2),
                        'investment_url' => route('investments.confirmation', $investment->id),
                    ]));
                } catch (Throwable $e) {
                    // Log notification failure but don't fail the investment
                    Log::warning('Failed to send investment purchased notification', [
                        'user_id' => $user->id,
                        'investment_id' => $investment->id,
                        'error' => $e->getMessage(),
                    ]);
                }

                return $investment;
            } catch (PaymentProviderException $e) {
                // Handle payment provider specific errors
                Log::error('Payment provider error during investment initiation', [
                    'user_id' => $user->id,
                    'tree_id' => $tree->id,
                    'quantity' => $quantity,
                    'amount_cents' => $amountCents,
                    'error' => $e->getMessage(),
                    'provider_code' => $e->getProviderCode() ?? null,
                ]);

                // Clean up any created investment record
                if ($investment) {
                    $investment->delete();
                }

                throw new PaymentConfigurationException(
                    'Payment processing is temporarily unavailable. Please try again later.',
                    0,
                    $e
                );
            } catch (\Stripe\Exception\ApiErrorException $e) {
                // Handle Stripe-specific errors
                Log::error('Stripe API error during investment initiation', [
                    'user_id' => $user->id,
                    'tree_id' => $tree->id,
                    'quantity' => $quantity,
                    'amount_cents' => $amountCents,
                    'error' => $e->getMessage(),
                    'stripe_error_code' => $e->getError()->code ?? null,
                    'stripe_error_type' => $e->getError()->type ?? null,
                ]);

                if ($investment) {
                    $investment->delete();
                }

                // Map Stripe errors to user-friendly messages
                $message = match ($e->getError()->code ?? '') {
                    'card_declined' => 'Your payment method was declined. Please try a different payment method.',
                    'insufficient_funds' => 'Insufficient funds available. Please check your account balance.',
                    'invalid_cvc' => 'Invalid security code. Please check your payment details.',
                    'expired_card' => 'Your payment method has expired. Please use a different card.',
                    'processing_error' => 'A processing error occurred. Please try again.',
                    default => 'Payment processing failed. Please check your payment method and try again.',
                };

                throw new PaymentConfigurationException($message, 0, $e);
            } catch (\Exception $e) {
                // Handle any other unexpected errors
                Log::error('Unexpected error during investment initiation', [
                    'user_id' => $user->id,
                    'tree_id' => $tree->id,
                    'quantity' => $quantity,
                    'amount_cents' => $amountCents,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                ]);

                if ($investment) {
                    $investment->delete();
                }

                throw new PaymentConfigurationException(
                    'An unexpected error occurred. Please try again or contact support if the problem persists.',
                    0,
                    $e
                );
            }
        });
    }

    public function confirmInvestment(int $investmentId): Investment
    {
        $investment = Investment::findOrFail($investmentId);

        // Idempotency check - if already active, return without logging again
        if ($investment->status === InvestmentStatus::Active) {
            return $investment;
        }

        try {
            $investment->status = InvestmentStatus::Active;
            $investment->save();

            $this->auditLogService->logEvent(
                AuditEventType::INVESTMENT_PURCHASED,
                $investment->user_id,
                [
                    'investment_id' => $investment->id,
                    'transaction_id' => $investment->transaction_id,
                    'event' => 'investment_confirmed',
                    'confirmed_at' => now()->toISOString(),
                ]
            );

            // Enhanced notification error handling
            try {
                $investment->user->notify(new InvestmentConfirmedNotification([
                    'tree_identifier' => $investment->tree->tree_identifier,
                    'formatted_amount' => $investment->formatted_amount,
                    'investment_url' => route('investments.show', $investment->id),
                ]));
            } catch (Throwable $e) {
                Log::warning('Failed to send investment confirmed notification', [
                    'user_id' => $investment->user_id,
                    'investment_id' => $investment->id,
                    'error' => $e->getMessage(),
                ]);
            }

            return $investment;
        } catch (Throwable $e) {
            Log::error('Error confirming investment', [
                'investment_id' => $investmentId,
                'error' => $e->getMessage(),
            ]);

            throw new \RuntimeException('Failed to confirm investment. Please contact support.', 0, $e);
        }
    }

    public function cancelInvestment(int $investmentId, ?string $reason = null): Investment
    {
        $investment = Investment::findOrFail($investmentId);

        if (! $investment->canBeCancelled()) {
            throw new InvestmentNotCancellableException($investmentId);
        }

        return TransactionHelper::smart(function () use ($investment, $reason) {
            try {
                // Enhanced payment cancellation error handling
                if ($investment->transaction_id) {
                    try {
                        $this->paymentService->cancelPendingTransaction($investment->transaction_id);
                    } catch (PaymentProviderException $e) {
                        Log::warning('Failed to cancel payment transaction', [
                            'investment_id' => $investment->id,
                            'transaction_id' => $investment->transaction_id,
                            'error' => $e->getMessage(),
                        ]);
                        // Continue with investment cancellation even if payment cancellation fails
                    }
                }

                $investment->status = InvestmentStatus::Cancelled;
                $investment->save();

                $this->auditLogService->logEvent(
                    AuditEventType::INVESTMENT_PURCHASED,
                    $investment->user_id,
                    [
                        'investment_id' => $investment->id,
                        'reason' => $reason ?? 'User cancelled',
                        'event' => 'investment_cancelled',
                        'cancelled_at' => now()->toISOString(),
                    ]
                );

                // Enhanced notification error handling
                try {
                    $investment->user->notify(new InvestmentCancelledNotification([
                        'tree_identifier' => $investment->tree->tree_identifier,
                        'formatted_amount' => $investment->formatted_amount,
                        'cancellation_reason' => $reason ?? 'User request',
                    ]));
                } catch (Throwable $e) {
                    Log::warning('Failed to send investment cancelled notification', [
                        'user_id' => $investment->user_id,
                        'investment_id' => $investment->id,
                        'error' => $e->getMessage(),
                    ]);
                }

                return $investment;
            } catch (Throwable $e) {
                Log::error('Error cancelling investment', [
                    'investment_id' => $investment->id,
                    'error' => $e->getMessage(),
                ]);

                throw new \RuntimeException('Failed to cancel investment. Please contact support.', 0, $e);
            }
        });
    }

    public function topUpInvestment(
        int $investmentId,
        int $topUpQuantity,
        ?int $paymentMethodId = null
    ): Investment {
        $investment = Investment::findOrFail($investmentId);

        if (! $investment->isActive()) {
            throw new \InvalidArgumentException('Only active investments can be topped up.');
        }

        $tree = $investment->tree;
        $maxTrees = (int) floor($tree->max_investment_cents / $tree->price_cents);
        $newQuantity = $investment->quantity + $topUpQuantity;

        if ($newQuantity > $maxTrees) {
            throw new InvestmentLimitExceededException(
                $newQuantity * $tree->price_cents,
                $tree->max_investment_cents
            );
        }

        $topUpAmountCents = $topUpQuantity * $tree->price_cents;
        $newTotalAmount = $investment->amount_cents + $topUpAmountCents;

        return TransactionHelper::smart(function () use ($investment, $topUpQuantity, $topUpAmountCents, $paymentMethodId, $newQuantity, $newTotalAmount) {
            $originalAmount = $investment->amount_cents;
            $originalQuantity = $investment->quantity;
            $transaction = null;

            try {
                $transaction = $this->paymentService->initiatePayment(
                    $investment->user_id,
                    $topUpAmountCents,
                    'IDR',
                    TransactionType::TopUp,
                    $paymentMethodId
                );

                if (! $transaction) {
                    throw new PaymentConfigurationException('Failed to create top-up payment transaction');
                }

                $investment->amount_cents = $newTotalAmount;
                $investment->quantity = $newQuantity;
                $investment->transaction_id = $transaction->id;
                $investment->save();

                $this->auditLogService->logEvent(
                    AuditEventType::INVESTMENT_PURCHASED,
                    $investment->user_id,
                    [
                        'investment_id' => $investment->id,
                        'original_amount' => $originalAmount,
                        'original_quantity' => $originalQuantity,
                        'top_up_quantity' => $topUpQuantity,
                        'top_up_amount' => $topUpAmountCents,
                        'new_total' => $newTotalAmount,
                        'new_quantity' => $newQuantity,
                        'transaction_id' => $transaction->id,
                        'event' => 'investment_top_up',
                        'topped_up_at' => now()->toISOString(),
                    ]
                );

                return $investment;
            } catch (PaymentProviderException $e) {
                Log::error('Payment provider error during investment top-up', [
                    'investment_id' => $investment->id,
                    'top_up_quantity' => $topUpQuantity,
                    'top_up_amount' => $topUpAmountCents,
                    'error' => $e->getMessage(),
                ]);

                throw new PaymentConfigurationException(
                    'Payment processing is temporarily unavailable. Please try again later.',
                    0,
                    $e
                );
            } catch (\Exception $e) {
                Log::error('Unexpected error during investment top-up', [
                    'investment_id' => $investment->id,
                    'top_up_quantity' => $topUpQuantity,
                    'top_up_amount' => $topUpAmountCents,
                    'error' => $e->getMessage(),
                ]);

                throw new PaymentConfigurationException(
                    'An unexpected error occurred. Please try again or contact support.',
                    0,
                    $e
                );
            }
        });
    }

    public function getUserInvestments(User $user)
    {
        return Investment::forUser($user->id)
            ->with(['tree', 'transaction'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function getActiveInvestments(User $user)
    {
        return Investment::forUser($user->id)
            ->active()
            ->with(['tree', 'transaction'])
            ->get();
    }

    public function getTotalInvestmentValue(User $user): int
    {
        return Investment::forUser($user->id)
            ->active()
            ->sum('amount_cents');
    }
}
