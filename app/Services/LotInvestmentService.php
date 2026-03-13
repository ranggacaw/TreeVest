<?php

namespace App\Services;

use App\Enums\InvestmentStatus;
use App\Enums\LotStatus;
use App\Exceptions\InvestmentCycleClosedException;
use App\Models\Investment;
use App\Models\Lot;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class LotInvestmentService
{
    public function __construct(
        private readonly DynamicPricingService $pricingService,
    ) {}

    /**
     * Validates and creates a lot investment record.
     * Payment initiation is handled separately by the payment service.
     *
     * @throws \App\Exceptions\InvestmentCycleClosedException
     * @throws \App\Exceptions\KycNotVerifiedException
     */
    public function purchase(User $investor, Lot $lot): Investment
    {
        $this->validateCycleOpen($lot);
        $this->validateKyc($investor);

        $totalCents = $lot->current_price_per_tree_cents * $lot->total_trees;
        $currentMonth = $this->pricingService->currentCycleMonth($lot);

        return DB::transaction(function () use ($investor, $lot, $totalCents, $currentMonth) {
            $investment = Investment::create([
                'user_id' => $investor->id,
                'lot_id' => $lot->id,
                'tree_id' => null,
                'amount_cents' => $totalCents,
                'currency' => 'IDR',
                'purchase_date' => now()->toDateString(),
                'purchase_month' => $currentMonth,
                'status' => InvestmentStatus::Active,
                'metadata' => [
                    'price_per_tree_cents' => $lot->current_price_per_tree_cents,
                    'total_trees' => $lot->total_trees,
                    'cycle_month_at_purchase' => $currentMonth,
                ],
            ]);

            Log::info('Lot investment created', [
                'investment_id' => $investment->id,
                'investor_id' => $investor->id,
                'lot_id' => $lot->id,
                'amount_cents' => $totalCents,
                'purchase_month' => $currentMonth,
            ]);

            return $investment;
        });
    }

    /**
     * Validates that the lot's investment window is still open.
     *
     * @throws \App\Exceptions\InvestmentCycleClosedException
     */
    public function validateCycleOpen(Lot $lot): void
    {
        if ($lot->status !== LotStatus::Active) {
            throw new InvestmentCycleClosedException(
                "This lot is not currently accepting investments. Current status: {$lot->status->getLabel()}."
            );
        }

        if (! $this->pricingService->isInvestmentOpen($lot)) {
            throw new InvestmentCycleClosedException(
                'Investment window for this lot has closed. The crop is in the growing phase.'
            );
        }
    }

    /**
     * @throws \App\Exceptions\KycNotVerifiedException
     */
    private function validateKyc(User $investor): void
    {
        if ($investor->kyc_status !== 'verified') {
            throw new \App\Exceptions\KycNotVerifiedException(
                'Complete identity verification to start investing.'
            );
        }
    }

    /**
     * Purchases a lot using wallet balance instead of payment gateway.
     * Investment is immediately activated (no pending_payment state).
     *
     * @throws \App\Exceptions\InvestmentCycleClosedException
     * @throws \App\Exceptions\InsufficientWalletBalanceException
     */
    public function reinvestFromWallet(User $investor, Lot $lot, WalletService $walletService): Investment
    {
        $this->validateCycleOpen($lot);
        $this->validateKyc($investor);

        $totalCents = $lot->current_price_per_tree_cents * $lot->total_trees;

        return DB::transaction(function () use ($investor, $lot, $totalCents, $walletService) {
            $investment = $this->purchase($investor, $lot);
            $walletService->debit(
                $investor,
                $totalCents,
                \App\Enums\WalletTransactionType::Reinvestment,
                $investment
            );

            return $investment;
        });
    }
}
