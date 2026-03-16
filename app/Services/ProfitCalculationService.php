<?php

namespace App\Services;

use App\Enums\InvestmentStatus;
use App\Models\Harvest;
use App\Models\Investment;
use App\Models\Payout;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class ProfitCalculationService
{
    /**
     * Platform fee rate applied at the top of the yield split.
     * 10% of total yield is taken as the platform fee first.
     */
    public const PLATFORM_FEE_RATE = 0.10;

    /**
     * Investor pool fraction of the remaining yield after platform fee.
     * Investors receive 70% of the post-fee remainder; farm owner receives 30%.
     */
    public const INVESTOR_POOL_RATE = 0.70;

    /**
     * Calculate and create payout records for a completed harvest.
     *
     * Split logic (10% fee → 70/30):
     *   platformFeeIdr   = ROUND(totalYieldIdr * PLATFORM_FEE_RATE)    [10%]
     *   remainingIdr     = totalYieldIdr - platformFeeIdr               [90%]
     *   investorPoolIdr  = ROUND(remainingIdr * INVESTOR_POOL_RATE)    [70% of 90% = 63%]
     *   farmOwnerShareIdr = remainingIdr - investorPoolIdr              [30% of 90% = 27%]
     *
     * The platform fee is already deducted at the pool-split level, so each
     * individual payout record carries platform_fee_idr = 0 and
     * net_amount_idr == gross_amount_idr.
     *
     * @return Collection<int, Payout>
     *
     * @throws \InvalidArgumentException if harvest is missing required data
     */
    public function calculate(Harvest $harvest): Collection
    {
        $alreadyCalculated = Payout::where('harvest_id', $harvest->id)->exists();
        if ($alreadyCalculated) {
            return Payout::where('harvest_id', $harvest->id)->get();
        }

        if ($harvest->actual_yield_kg === null || $harvest->market_price_id === null) {
            throw new \InvalidArgumentException('Harvest must have actual yield and market price to calculate payouts');
        }

        return DB::transaction(function () use ($harvest) {
            $marketPrice = $harvest->marketPrice;
            $totalYieldIdr = $harvest->actual_yield_kg * $marketPrice->price_per_kg_idr;

            // Step 1: deduct platform fee at the top level
            $platformFeeIdr = (int) round($totalYieldIdr * self::PLATFORM_FEE_RATE);
            $remainingIdr = (int) ($totalYieldIdr - $platformFeeIdr);

            // Step 2: split remainder 70% investors / 30% farm owner
            $investorPoolIdr = (int) round($remainingIdr * self::INVESTOR_POOL_RATE);
            $farmOwnerShareIdr = (int) ($remainingIdr - $investorPoolIdr);

            // Store farm owner's share on the harvest for financial audit purposes.
            // The farm owner payout pipeline is handled separately and is out of scope
            // for this change (design.md §Non-Goals).
            $harvest->update(['farm_owner_share_idr' => $farmOwnerShareIdr]);

            $activeInvestments = Investment::where('tree_id', $harvest->tree_id)
                ->where('status', InvestmentStatus::Active)
                ->get();

            if ($activeInvestments->isEmpty()) {
                return collect();
            }

            $totalInvestedIdr = $activeInvestments->sum('amount_idr');

            $payouts = collect();

            foreach ($activeInvestments as $investment) {
                // Proportional share of the investor pool.
                // Platform fee was already deducted at the pool level, so
                // platform_fee_idr per payout is 0 and net == gross.
                $grossAmountIdr = (int) round(
                    ($investment->amount_idr / $totalInvestedIdr) * $investorPoolIdr
                );

                $payout = Payout::create([
                    'investment_id' => $investment->id,
                    'harvest_id' => $harvest->id,
                    'investor_id' => $investment->user_id,
                    'gross_amount_idr' => $grossAmountIdr,
                    'platform_fee_idr' => 0,
                    'net_amount_idr' => $grossAmountIdr,
                    'currency' => $marketPrice->currency,
                    'status' => \App\Enums\PayoutStatus::Pending,
                ]);

                $payouts->push($payout);
            }

            return $payouts;
        });
    }
}
