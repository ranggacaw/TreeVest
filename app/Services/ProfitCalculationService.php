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
     * `farm_owner_share_cents` on the harvest record.
     */
    public const INVESTOR_SHARE_RATE = 0.40;

    /**
     * Calculate and create payout records for a completed harvest.
     *
     * Split logic:
     *   investorPoolCents  = ROUND(totalYieldCents * INVESTOR_SHARE_RATE)   [40%]
     *   farmOwnerShareCents = totalYieldCents - investorPoolCents            [60%]
     *
     * Each investor receives a proportion of investorPoolCents equal to their
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
            $totalYieldCents = $harvest->actual_yield_kg * $marketPrice->price_per_kg_cents;

            // 60/40 split: investors receive 40% of total yield revenue
            $investorPoolCents = (int) round($totalYieldCents * self::INVESTOR_SHARE_RATE);
            $farmOwnerShareCents = (int) ($totalYieldCents - $investorPoolCents);

            // Store farm owner's 60% share on the harvest for financial audit purposes.
            // The farm owner payout pipeline is handled separately and is out of scope
            // for this change (design.md §Non-Goals).
            $harvest->update(['farm_owner_share_cents' => $farmOwnerShareCents]);

            $activeInvestments = Investment::where('tree_id', $harvest->tree_id)
                ->where('status', InvestmentStatus::Active)
                ->get();

            if ($activeInvestments->isEmpty()) {
                return collect();
            }

            $totalInvestedCents = $activeInvestments->sum('amount_cents');

            $payouts = collect();

            foreach ($activeInvestments as $investment) {
                // Proportional share of the 40% investor pool
                $grossAmountCents = (int) round(
                    ($investment->amount_cents / $totalInvestedCents) * $investorPoolCents
                );

                $platformFeeCents = (int) round(
                    $grossAmountCents * $harvest->platform_fee_rate
                );

                $netAmountCents = $grossAmountCents - $platformFeeCents;

                $payout = Payout::create([
                    'investment_id' => $investment->id,
                    'harvest_id' => $harvest->id,
                    'investor_id' => $investment->user_id,
                    'gross_amount_cents' => $grossAmountCents,
                    'platform_fee_cents' => $platformFeeCents,
                    'net_amount_cents' => $netAmountCents,
                    'currency' => $marketPrice->currency,
                    'status' => \App\Enums\PayoutStatus::Pending,
                ]);

                $payouts->push($payout);
            }

            return $payouts;
        });
    }
}
