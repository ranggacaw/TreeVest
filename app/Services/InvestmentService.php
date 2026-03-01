<?php

namespace App\Services;

use App\Enums\AuditEventType;
use App\Enums\InvestmentStatus;
use App\Enums\TransactionType;
use App\Exceptions\InvalidInvestmentAmountException;
use App\Exceptions\InvestmentLimitExceededException;
use App\Exceptions\InvestmentNotCancellableException;
use App\Exceptions\KycNotVerifiedException;
use App\Exceptions\TreeNotInvestableException;
use App\Models\Investment;
use App\Models\Tree;
use App\Models\User;
use App\Notifications\InvestmentCancelledNotification;
use App\Notifications\InvestmentConfirmedNotification;
use App\Notifications\InvestmentPurchasedNotification;
use Illuminate\Support\Facades\DB;

class InvestmentService
{
    public function __construct(
        protected PaymentService $paymentService,
        protected AuditLogService $auditLogService,
    ) {}

    public function validateInvestmentEligibility(User $user, Tree $tree, int $amountCents): array
    {
        $errors = [];

        if (! $user->isKycValid()) {
            $errors['kyc'] = 'KYC verification is required before investing.';
        }

        if (! $tree->isInvestable()) {
            $errors['tree'] = 'This tree is not currently available for investment.';
        }

        if ($amountCents < $tree->min_investment_cents) {
            $errors['amount_min'] = 'Minimum investment is '.number_format($tree->min_investment_cents / 100, 2);
        }

        if ($amountCents > $tree->max_investment_cents) {
            $errors['amount_max'] = 'Maximum investment is '.number_format($tree->max_investment_cents / 100, 2);
        }

        return [
            'eligible' => empty($errors),
            'errors' => $errors,
        ];
    }

    public function initiateInvestment(
        User $user,
        Tree $tree,
        int $amountCents,
        ?int $paymentMethodId = null
    ): Investment {
        $eligibility = $this->validateInvestmentEligibility($user, $tree, $amountCents);

        if (! $eligibility['eligible']) {
            $firstError = array_values($eligibility['errors'])[0] ?? 'Investment eligibility check failed';

            if (isset($eligibility['errors']['kyc'])) {
                throw new KycNotVerifiedException;
            }

            if (isset($eligibility['errors']['tree'])) {
                throw new TreeNotInvestableException($tree->id);
            }

            if (isset($eligibility['errors']['amount_min'])) {
                throw new InvalidInvestmentAmountException($amountCents, $tree->min_investment_cents);
            }

            if (isset($eligibility['errors']['amount_max'])) {
                throw new InvestmentLimitExceededException($amountCents, $tree->max_investment_cents);
            }

            throw new \InvalidArgumentException($firstError);
        }

        return DB::transaction(function () use ($user, $tree, $amountCents, $paymentMethodId) {
            $transaction = $this->paymentService->initiatePayment(
                $user->id,
                $amountCents,
                'MYR',
                TransactionType::InvestmentPurchase,
                $paymentMethodId
            );

            $investment = Investment::create([
                'user_id' => $user->id,
                'tree_id' => $tree->id,
                'amount_cents' => $amountCents,
                'currency' => 'MYR',
                'purchase_date' => now()->toDateString(),
                'status' => InvestmentStatus::PendingPayment,
                'transaction_id' => $transaction->id,
                'metadata' => [
                    'tree_identifier' => $tree->tree_identifier,
                    'fruit_crop_id' => $tree->fruit_crop_id,
                ],
            ]);

            $this->auditLogService->logEvent(
                AuditEventType::INVESTMENT_PURCHASED,
                $user->id,
                [
                    'investment_id' => $investment->id,
                    'tree_id' => $tree->id,
                    'amount' => $amountCents,
                    'transaction_id' => $transaction->id,
                    'payment_intent_id' => $transaction->stripe_payment_intent_id,
                    'event' => 'investment_initiated',
                ]
            );

            // Dispatch notification
            $user->notify(new InvestmentPurchasedNotification([
                'tree_identifier' => $tree->tree_identifier,
                'formatted_amount' => 'RM '.number_format($amountCents / 100, 2),
                'investment_url' => route('investments.confirmation', $investment->id),
            ]));

            return $investment;
        });
    }

    public function confirmInvestment(int $investmentId): Investment
    {
        $investment = Investment::findOrFail($investmentId);

        $investment->status = InvestmentStatus::Active;
        $investment->save();

        $this->auditLogService->logEvent(
            AuditEventType::INVESTMENT_PURCHASED,
            $investment->user_id,
            [
                'investment_id' => $investment->id,
                'transaction_id' => $investment->transaction_id,
                'event' => 'investment_confirmed',
            ]
        );

        // Dispatch notification
        $investment->user->notify(new InvestmentConfirmedNotification([
            'tree_identifier' => $investment->tree->tree_identifier,
            'formatted_amount' => $investment->formatted_amount,
            'investment_url' => route('investments.show', $investment->id),
        ]));

        return $investment;
    }

    public function cancelInvestment(int $investmentId, ?string $reason = null): Investment
    {
        $investment = Investment::findOrFail($investmentId);

        if (! $investment->canBeCancelled()) {
            throw new InvestmentNotCancellableException($investmentId);
        }

        return DB::transaction(function () use ($investment, $reason) {
            if ($investment->transaction_id) {
                $this->paymentService->cancelPendingTransaction($investment->transaction_id);
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
                ]
            );

            // Dispatch notification
            $investment->user->notify(new InvestmentCancelledNotification([
                'tree_identifier' => $investment->tree->tree_identifier,
                'formatted_amount' => $investment->formatted_amount,
                'cancellation_reason' => $reason ?? 'User request',
            ]));

            return $investment;
        });
    }

    public function topUpInvestment(
        int $investmentId,
        int $topUpAmountCents,
        ?int $paymentMethodId = null
    ): Investment {
        $investment = Investment::findOrFail($investmentId);

        if (! $investment->isActive()) {
            throw new \InvalidArgumentException('Only active investments can be topped up.');
        }

        $tree = $investment->tree;
        $newTotalAmount = $investment->amount_cents + $topUpAmountCents;

        if ($newTotalAmount > $tree->max_investment_cents) {
            throw new InvestmentLimitExceededException($newTotalAmount, $tree->max_investment_cents);
        }

        return DB::transaction(function () use ($investment, $topUpAmountCents, $paymentMethodId, $newTotalAmount) {
            $originalAmount = $investment->amount_cents;

            $transaction = $this->paymentService->initiatePayment(
                $investment->user_id,
                $topUpAmountCents,
                'MYR',
                TransactionType::TopUp,
                $paymentMethodId
            );

            $investment->amount_cents = $newTotalAmount;
            $investment->transaction_id = $transaction->id;
            $investment->save();

            $this->auditLogService->logEvent(
                AuditEventType::INVESTMENT_PURCHASED,
                $investment->user_id,
                [
                    'investment_id' => $investment->id,
                    'original_amount' => $originalAmount,
                    'top_up_amount' => $topUpAmountCents,
                    'new_total' => $newTotalAmount,
                    'transaction_id' => $transaction->id,
                    'event' => 'investment_top_up',
                ]
            );

            return $investment;
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
