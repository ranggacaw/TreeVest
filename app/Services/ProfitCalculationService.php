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

            $activeInvestments = Investment::where('tree_id', $harvest->tree_id)
                ->where('status', InvestmentStatus::Active)
                ->get();

            if ($activeInvestments->isEmpty()) {
                return collect();
            }

            $totalInvestedCents = $activeInvestments->sum('amount_cents');

            $payouts = collect();

            foreach ($activeInvestments as $investment) {
                $grossAmountCents = (int) round(
                    ($investment->amount_cents / $totalInvestedCents) * $totalYieldCents
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
