<?php

namespace App\Jobs;

use App\Models\Farm;
use App\Services\WeatherService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class FetchWeatherData implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 60;

    public function handle(WeatherService $weatherService): void
    {
        $count = $weatherService->refreshWeatherForAllFarms();
        
        Log::info("Weather data fetched for {$count} farms");

        GenerateWeatherAlerts::dispatch();
    }

    public function failed(\Throwable $exception): void
    {
        Log::error('FetchWeatherData job failed', [
            'error' => $exception->getMessage(),
        ]);
    }
}
