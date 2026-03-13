<?php

namespace App\Console\Commands;

use App\Enums\LotStatus;
use App\Models\Lot;
use App\Services\DynamicPricingService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class RecalculateLotPrices extends Command
{
    protected $signature = 'app:recalculate-lot-prices';

    protected $description = 'Recalculate current price for all active/in-progress lots and auto-transition to in_progress when investment window closes.';

    public function handle(DynamicPricingService $pricingService): int
    {
        $lots = Lot::whereIn('status', [LotStatus::Active->value, LotStatus::InProgress->value])
            ->whereNotNull('cycle_started_at')
            ->get();

        $this->info("Processing {$lots->count()} lots...");

        $transitioned = 0;
        $updated = 0;

        foreach ($lots as $lot) {
            try {
                $pricingService->recalculateCurrentPrice($lot);
                $updated++;

                // Auto-transition active → in_progress when investment window closes
                if ($lot->status === LotStatus::Active) {
                    $currentMonth = $pricingService->currentCycleMonth($lot);
                    if ($currentMonth > $lot->last_investment_month) {
                        $lot->transitionTo(LotStatus::InProgress);
                        $transitioned++;

                        Log::info('Lot transitioned to in_progress (cycle cutoff)', [
                            'lot_id' => $lot->id,
                            'current_month' => $currentMonth,
                            'last_investment_month' => $lot->last_investment_month,
                        ]);
                    }
                }
            } catch (\Throwable $e) {
                Log::critical('RecalculateLotPrices failed for lot', [
                    'lot_id' => $lot->id,
                    'error' => $e->getMessage(),
                ]);

                $this->error("Failed lot {$lot->id}: {$e->getMessage()}");
            }
        }

        $this->info("Updated: {$updated} lots. Transitioned to in_progress: {$transitioned}.");

        return self::SUCCESS;
    }
}
