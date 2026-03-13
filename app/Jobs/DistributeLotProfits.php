<?php

namespace App\Jobs;

use App\Models\Lot;
use App\Services\LotSellingService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class DistributeLotProfits implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public int $backoff = 60;

    public function __construct(
        public readonly Lot $lot
    ) {}

    public function handle(LotSellingService $service): void
    {
        Log::info('DistributeLotProfits job started', ['lot_id' => $this->lot->id]);

        // Refresh the lot from DB to get the latest state
        $lot = Lot::find($this->lot->id);

        if (! $lot) {
            Log::error('DistributeLotProfits: lot not found', ['lot_id' => $this->lot->id]);

            return;
        }

        $service->distributeProfits($lot);

        Log::info('DistributeLotProfits job completed', ['lot_id' => $lot->id]);
    }

    public function failed(\Throwable $exception): void
    {
        Log::critical('DistributeLotProfits job failed permanently', [
            'lot_id' => $this->lot->id,
            'error' => $exception->getMessage(),
        ]);
    }
}
