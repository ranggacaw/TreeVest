<?php

namespace App\Services;

use App\Enums\LotStatus;
use App\Enums\WalletTransactionType;
use App\Events\LotProfitsDistributed;
use App\Exceptions\InvalidLotTransitionException;
use App\Models\Lot;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class LotSellingService
{
    public function __construct(
        private readonly WalletService $walletService,
    ) {}

    /**
     * Records harvest data and transitions the lot to 'harvest' status.
     */
    public function recordHarvest(
        Lot $lot,
        int $totalFruit,
        float $totalWeightKg,
        string $proofPhotoPath,
        ?string $notes = null
    ): void {
        if ($lot->status !== LotStatus::InProgress) {
            throw new InvalidLotTransitionException(
                'Harvest data can only be recorded for lots in the growing phase.'
            );
        }

        $lot->update([
            'harvest_total_fruit' => $totalFruit,
            'harvest_total_weight_kg' => $totalWeightKg,
            'harvest_notes' => $notes,
            'harvest_recorded_at' => now(),
        ]);

        $lot->transitionTo(LotStatus::Harvest);

        Log::info('Lot harvest recorded', [
            'lot_id' => $lot->id,
            'total_fruit' => $totalFruit,
            'total_weight_kg' => $totalWeightKg,
        ]);
    }

    /**
     * Submits sales revenue for a harvested lot and dispatches profit distribution.
     */
    public function submitSellingRevenue(
        Lot $lot,
        int $revenueCents,
        string $proofPhotoPath
    ): void {
        if ($lot->status !== LotStatus::Harvest) {
            throw new InvalidLotTransitionException(
                'Revenue can only be submitted after harvest data has been recorded.'
            );
        }

        $lot->update([
            'selling_revenue_cents' => $revenueCents,
            'selling_proof_photo' => $proofPhotoPath,
            'selling_submitted_at' => now(),
        ]);

        $lot->transitionTo(LotStatus::Selling);

        Log::info('Lot selling revenue submitted', [
            'lot_id' => $lot->id,
            'revenue_cents' => $revenueCents,
        ]);

        // Dispatch queued job to distribute profits
        \App\Jobs\DistributeLotProfits::dispatch($lot);
    }

    /**
     * Distributes profits from lot revenue to investor and farm owner wallets.
     * Called by the DistributeLotProfits job.
     *
     * Formula:
     *   platform_fee = floor(revenue × 0.10)
     *   remaining    = revenue − platform_fee
     *   investor_pool = floor(remaining × 0.70)
     *   farm_owner_share = remaining − investor_pool
     *
     * Investor shares are proportional to investment amount.
     * Integer rounding residual goes to the largest investor.
     */
    public function distributeProfits(Lot $lot): void
    {
        if ($lot->status !== LotStatus::Selling) {
            Log::warning('distributeProfits called on non-selling lot', ['lot_id' => $lot->id]);

            return;
        }

        $revenueCents = (int) $lot->selling_revenue_cents;

        DB::transaction(function () use ($lot, $revenueCents) {
            // 1. Platform fee (10%)
            $platformFeeCents = (int) floor($revenueCents * 0.10);
            $remainingCents = $revenueCents - $platformFeeCents;

            // 2. Split remaining: 70% investors, 30% farm owner
            $investorPoolCents = (int) floor($remainingCents * 0.70);
            $farmOwnerShareCents = $remainingCents - $investorPoolCents;

            // 3. Load active investments
            $investments = $lot->activeInvestments()->with('user')->get();
            $totalInvestedCents = $investments->sum('amount_cents');

            // 4. Distribute investor pool proportionally
            $distributed = 0;
            $largestInvestment = null;
            $largestAmount = 0;

            foreach ($investments as $investment) {
                $share = ($totalInvestedCents > 0)
                    ? (int) floor($investorPoolCents * $investment->amount_cents / $totalInvestedCents)
                    : 0;

                $this->walletService->credit(
                    $investment->user,
                    $share,
                    WalletTransactionType::PayoutCredit,
                    $lot
                );

                $distributed += $share;

                if ($investment->amount_cents > $largestAmount) {
                    $largestAmount = $investment->amount_cents;
                    $largestInvestment = $investment;
                }
            }

            // 5. Rounding residual → largest investor
            $residual = $investorPoolCents - $distributed;
            if ($residual > 0 && $largestInvestment !== null) {
                $this->walletService->credit(
                    $largestInvestment->user,
                    $residual,
                    WalletTransactionType::PayoutCredit,
                    $lot
                );
            }

            // 6. Farm owner share
            $farmOwner = $lot->rack->warehouse->farm->owner;
            $this->walletService->credit(
                $farmOwner,
                $farmOwnerShareCents,
                WalletTransactionType::PayoutCredit,
                $lot
            );

            // 7. Platform fee → platform wallet
            $this->walletService->creditPlatform(
                $platformFeeCents,
                WalletTransactionType::PlatformFee,
                $lot
            );

            // 8. Transition lot to completed
            $lot->transitionTo(LotStatus::Completed);

            Log::info('Lot profits distributed', [
                'lot_id' => $lot->id,
                'revenue_cents' => $revenueCents,
                'platform_fee_cents' => $platformFeeCents,
                'investor_pool_cents' => $investorPoolCents,
                'farm_owner_share_cents' => $farmOwnerShareCents,
                'investor_count' => $investments->count(),
            ]);

            // 9. Dispatch event for notifications
            event(new LotProfitsDistributed($lot, $investorPoolCents, $farmOwnerShareCents, $platformFeeCents));
        });
    }
}
