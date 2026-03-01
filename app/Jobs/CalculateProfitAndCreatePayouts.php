<?php

namespace App\Jobs;

use App\Events\PayoutsCreated;
use App\Models\Harvest;
use App\Services\ProfitCalculationService;
use Exception;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class CalculateProfitAndCreatePayouts implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public int $backoff = [60, 300, 900];

    public function __construct(
        public Harvest $harvest
    ) {}

    public function handle(ProfitCalculationService $profitCalculationService): void
    {
        try {
            $payouts = $profitCalculationService->calculate($this->harvest);

            if ($payouts->isNotEmpty()) {
                event(new PayoutsCreated($payouts));
            }
        } catch (Exception $e) {
            Log::error('Failed to calculate profit and create payouts', [
                'harvest_id' => $this->harvest->id,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }
}
