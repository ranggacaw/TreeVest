<?php

namespace App\Jobs;

use App\Services\WeatherAlertService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class GenerateWeatherAlerts implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(WeatherAlertService $alertService): void
    {
        $count = $alertService->generateAlertsForAllFarms();
        
        Log::info("Generated {$count} weather alerts");
    }

    public function failed(\Throwable $exception): void
    {
        Log::error('GenerateWeatherAlerts job failed', [
            'error' => $exception->getMessage(),
        ]);
    }
}
