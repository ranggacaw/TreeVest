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
     * The fraction of total harvest revenue distributed to investors.
     * The remaining 60% is retained by the farm owner and tracked via
     * `farm_owner_share_idr` on the harvest record.
     */
    public const INVESTOR_SHARE_RATE = 0.40;

    /**
     * Calculate and create payout records for a completed harvest.
     *
     * Split logic:
     *   investorPoolIdr  = ROUND(totalYieldIdr * INVESTOR_SHARE_RATE)   [40%]
     *   farmOwnerShareIdr = totalYieldIdr - investorPoolIdr            [60%]
     *
     * Each investor receives a proportion of investorPoolIdr equal to their
     * share of total invested capital in the tree, minus the platform fee.
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

            // 60/40 split: investors receive 40% of total yield revenue
            $investorPoolIdr = (int) round($totalYieldIdr * self::INVESTOR_SHARE_RATE);
            $farmOwnerShareIdr = (int) ($totalYieldIdr - $investorPoolIdr);

            // Store farm owner's 60% share on the harvest for financial audit purposes.
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
                // Proportional share of the 40% investor pool
                $grossAmountIdr = (int) round(
                    ($investment->amount_idr / $totalInvestedIdr) * $investorPoolIdr
                );

                $platformFeeIdr = (int) round(
                    $grossAmountIdr * $harvest->platform_fee_rate
                );

                $netAmountIdr = $grossAmountIdr - $platformFeeIdr;

                $payout = Payout::create([
                    'investment_id' => $investment->id,
                    'harvest_id' => $harvest->id,
                    'investor_id' => $investment->user_id,
                    'gross_amount_idr' => $grossAmountIdr,
                    'platform_fee_idr' => $platformFeeIdr,
                    'net_amount_idr' => $netAmountIdr,
                    'currency' => $marketPrice->currency,
                    'status' => \App\Enums\PayoutStatus::Pending,
                ]);

                $payouts->push($payout);
            }

            return $payouts;
        });
    }
}
