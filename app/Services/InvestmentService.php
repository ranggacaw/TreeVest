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
use App\Support\TransactionHelper;

class InvestmentService
{
    public function __construct(
        protected PaymentService $paymentService,
        protected AuditLogService $auditLogService,
    ) {}

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
            $amountIdr = $quantity * $tree->price_idr;
            $minTrees = (int) ceil($tree->min_investment_idr / $tree->price_idr);
            $maxTrees = (int) floor($tree->max_investment_idr / $tree->price_idr);

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
                $minTrees = (int) ceil($tree->min_investment_idr / $tree->price_idr);
                throw new InvalidInvestmentAmountException($quantity * $tree->price_idr, $tree->min_investment_idr);
            }

            if (isset($eligibility['errors']['quantity_max'])) {
                $maxTrees = (int) floor($tree->max_investment_idr / $tree->price_idr);
                throw new InvestmentLimitExceededException($quantity * $tree->price_idr, $tree->max_investment_idr);
            }

            throw new \InvalidArgumentException($firstError);
        }

        $amountIdr = $quantity * $tree->price_idr;

        return TransactionHelper::smart(function () use ($user, $tree, $quantity, $amountIdr, $paymentMethodId) {
            $transaction = $this->paymentService->initiatePayment(
                $user->id,
                $amountIdr,
                'IDR',
                TransactionType::InvestmentPurchase,
                $paymentMethodId
            );

            $investment = Investment::create([
                'user_id' => $user->id,
                'tree_id' => $tree->id,
                'amount_idr' => $amountIdr,
                'quantity' => $quantity,
                'currency' => 'IDR',
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
                    'quantity' => $quantity,
                    'amount' => $amountIdr,
                    'transaction_id' => $transaction->id,
                    'payment_intent_id' => $transaction->stripe_payment_intent_id,
                    'event' => 'investment_initiated',
                ]
            );

            // Dispatch notification
            $user->notify(new InvestmentPurchasedNotification([
                'tree_identifier' => $tree->tree_identifier,
                'formatted_amount' => 'Rp '.number_format($amountIdr, 0),
                'investment_url' => route('investments.confirmation', $investment->id),
            ]));

            return $investment;
        });
    }

    public function confirmInvestment(int $investmentId): Investment
    {
        $investment = Investment::findOrFail($investmentId);

        // Idempotency check - if already active, return without logging again
        if ($investment->status === InvestmentStatus::Active) {
            return $investment;
        }

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

        return TransactionHelper::smart(function () use ($investment, $reason) {
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
        int $topUpQuantity,
        ?int $paymentMethodId = null
    ): Investment {
        $investment = Investment::findOrFail($investmentId);

        if (! $investment->isActive()) {
            throw new \InvalidArgumentException('Only active investments can be topped up.');
        }

        $tree = $investment->tree;
        $maxTrees = (int) floor($tree->max_investment_idr / $tree->price_idr);
        $newQuantity = $investment->quantity + $topUpQuantity;

        if ($newQuantity > $maxTrees) {
            throw new InvestmentLimitExceededException(
                $newQuantity * $tree->price_idr,
                $tree->max_investment_idr
            );
        }

        $topUpAmountIdr = $topUpQuantity * $tree->price_idr;
        $newTotalAmount = $investment->amount_idr + $topUpAmountIdr;

        return TransactionHelper::smart(function () use ($investment, $topUpQuantity, $topUpAmountIdr, $paymentMethodId, $newQuantity, $newTotalAmount) {
            $originalAmount = $investment->amount_idr;
            $originalQuantity = $investment->quantity;

            $transaction = $this->paymentService->initiatePayment(
                $investment->user_id,
                $topUpAmountIdr,
                'IDR',
                TransactionType::TopUp,
                $paymentMethodId
            );

            $investment->amount_idr = $newTotalAmount;
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
                    'top_up_amount' => $topUpAmountIdr,
                    'new_total' => $newTotalAmount,
                    'new_quantity' => $newQuantity,
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
            ->sum('amount_idr');
    }
}
