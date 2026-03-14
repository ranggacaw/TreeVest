<?php

namespace App\Services;

use App\Enums\LotStatus;
use App\Models\Lot;
use App\Models\LotPriceSnapshot;

class DynamicPricingService
{
    /**
     * Returns the 1-based current month within the lot's cycle.
     */
    public function currentCycleMonth(Lot $lot): int
    {
        if (! $lot->cycle_started_at) {
            return 1;
        }

        $daysDiff = (int) now()->diffInDays($lot->cycle_started_at, false) * -1;
        $month = (int) floor($daysDiff / 30) + 1;

        return max(1, min($month, $lot->cycle_months));
    }

    /**
     * Calculates price for a specific month using compound formula:
     * price = base_price × (1 + rate)^(month - 1)
     * Returns integer cents.
     */
    public function priceForMonth(Lot $lot, int $month): int
    {
        $rate = (float) $lot->monthly_increase_rate;
        $base = (int) $lot->base_price_per_tree_idr;

        return (int) round($base * (1 + $rate) ** ($month - 1));
    }

    /**
     * Determines if the lot's investment window is currently open.
     */
    public function isInvestmentOpen(Lot $lot): bool
    {
        return $lot->status === LotStatus::Active
            && $this->currentCycleMonth($lot) <= $lot->last_investment_month;
    }

    /**
     * Recomputes the current month price, updates the lot, and creates a price snapshot.
     */
    public function recalculateCurrentPrice(Lot $lot): void
    {
        $month = $this->currentCycleMonth($lot);
        $newPrice = $this->priceForMonth($lot, $month);

        $lot->current_price_per_tree_idr = $newPrice;
        $lot->save();

        // Only create snapshot if one doesn't exist for this month yet
        LotPriceSnapshot::firstOrCreate(
            ['lot_id' => $lot->id, 'cycle_month' => $month],
            [
                'price_per_tree_idr' => $newPrice,
                'recorded_at' => now(),
            ]
        );
    }

    /**
     * Generates the complete price table for all months in the lot's cycle.
     * Returns an array indexed by month number.
     */
    public function getPriceTable(Lot $lot): array
    {
        $table = [];
        $currentMonth = $this->currentCycleMonth($lot);

        for ($m = 1; $m <= $lot->cycle_months; $m++) {
            $table[$m] = [
                'month' => $m,
                'price_idr' => $this->priceForMonth($lot, $m),
                'is_current' => $m === $currentMonth,
                'is_open' => $m <= $lot->last_investment_month,
            ];
        }

        return $table;
    }
}
