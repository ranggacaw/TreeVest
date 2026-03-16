<?php

namespace App\Services;

use App\Enums\InvestmentStatus;
use App\Enums\LotStatus;
use App\Exceptions\InsufficientTreesException;
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
     * Validates and creates a lot investment record for a given quantity of trees.
     * Payment initiation is handled separately by the payment service.
     *
     * @param  int  $quantity  Number of trees the investor wants to purchase (default 1).
     *
     * @throws \App\Exceptions\InvestmentCycleClosedException
     * @throws \App\Exceptions\KycNotVerifiedException
     * @throws \App\Exceptions\InsufficientTreesException
     */
    public function purchase(User $investor, Lot $lot, int $quantity = 1): Investment
    {
        $this->validateCycleOpen($lot);
        $this->validateKyc($investor);

        $currentMonth = $this->pricingService->currentCycleMonth($lot);

        return DB::transaction(function () use ($investor, $lot, $quantity, $currentMonth) {
            // Re-read lot with a row-level lock to safely check and decrement available_trees.
            /** @var Lot $lockedLot */
            $lockedLot = Lot::lockForUpdate()->findOrFail($lot->id);

            if ($lockedLot->available_trees < $quantity) {
                throw new InsufficientTreesException(
                    "Only {$lockedLot->available_trees} tree(s) available in this lot, but {$quantity} requested."
                );
            }

            $lockedLot->decrement('available_trees', $quantity);

            $totalIdr = $lockedLot->current_price_per_tree_idr * $quantity;

            $investment = Investment::create([
                'user_id' => $investor->id,
                'lot_id' => $lockedLot->id,
                'tree_id' => null,
                'amount_idr' => $totalIdr,
                'currency' => 'IDR',
                'purchase_date' => now()->toDateString(),
                'purchase_month' => $currentMonth,
                'status' => InvestmentStatus::Active,
                'metadata' => [
                    'price_per_tree_idr' => $lockedLot->current_price_per_tree_idr,
                    'quantity' => $quantity,
                    'cycle_month_at_purchase' => $currentMonth,
                ],
            ]);

            Log::info('Lot investment created', [
                'investment_id' => $investment->id,
                'investor_id' => $investor->id,
                'lot_id' => $lockedLot->id,
                'quantity' => $quantity,
                'amount_idr' => $totalIdr,
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
     * Purchases trees from a lot using wallet balance instead of payment gateway.
     * Investment is immediately activated (no pending_payment state).
     *
     * @param  int  $quantity  Number of trees to purchase (default 1).
     *
     * @throws \App\Exceptions\InvestmentCycleClosedException
     * @throws \App\Exceptions\InsufficientWalletBalanceException
     * @throws \App\Exceptions\InsufficientTreesException
     */
    public function reinvestFromWallet(User $investor, Lot $lot, WalletService $walletService, int $quantity = 1): Investment
    {
        $this->validateCycleOpen($lot);
        $this->validateKyc($investor);

        $totalIdr = $lot->current_price_per_tree_idr * $quantity;

        return DB::transaction(function () use ($investor, $lot, $quantity, $totalIdr, $walletService) {
            $investment = $this->purchase($investor, $lot, $quantity);
            $walletService->debit(
                $investor,
                $totalIdr,
                \App\Enums\WalletTransactionType::Reinvestment,
                $investment
            );

            return $investment;
        });
    }
}

