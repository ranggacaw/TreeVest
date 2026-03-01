<?php

namespace App\Services;

use App\Models\Farm;
use App\Models\WeatherData;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WeatherService
{
    private const BASE_URL = 'https://api.openweathermap.org/data/2.5';
    
    private ?string $apiKey;

    public function __construct()
    {
        $this->apiKey = config('services.openweathermap.api_key', config('app.openweathermap_api_key'));
    }

    public function fetchWeatherForFarm(Farm $farm): ?WeatherData
    {
        if (!$farm->hasLocation()) {
            Log::warning("Farm {$farm->id} has no location coordinates for weather fetching");
            return null;
        }

        if (empty($this->apiKey)) {
            Log::warning('OpenWeatherMap API key not configured');
            return null;
        }

        try {
            $response = Http::timeout(10)->get(self::BASE_URL . '/weather', [
                'lat' => $farm->latitude,
                'lon' => $farm->longitude,
                'appid' => $this->apiKey,
                'units' => 'metric',
            ]);

            if (!$response->successful()) {
                Log::error('OpenWeatherMap API error', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
                return null;
            }

            $data = $response->json();

            return $this->storeWeatherData($farm, $data);
        } catch (\Exception $e) {
            Log::error('Weather fetch failed', [
                'farm_id' => $farm->id,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    public function fetchForecastForFarm(Farm $farm, int $hours = 24): ?array
    {
        if (!$farm->hasLocation() || empty($this->apiKey)) {
            return null;
        }

        try {
            $response = Http::timeout(10)->get(self::BASE_URL . '/forecast', [
                'lat' => $farm->latitude,
                'lon' => $farm->longitude,
                'appid' => $this->apiKey,
                'units' => 'metric',
                'cnt' => ceil($hours / 3),
            ]);

            if (!$response->successful()) {
                return null;
            }

            return $response->json();
        } catch (\Exception $e) {
            Log::error('Weather forecast fetch failed', [
                'farm_id' => $farm->id,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    private function storeWeatherData(Farm $farm, array $data): WeatherData
    {
        $main = $data['main'] ?? [];
        $wind = $data['wind'] ?? [];
        $rain = $data['rain'] ?? [];
        $weather = $data['weather'][0] ?? [];

        return WeatherData::create([
            'farm_id' => $farm->id,
            'temperature_celsius' => $main['temp'] ?? 0,
            'humidity_percent' => $main['humidity'] ?? 0,
            'wind_speed_kmh' => ($wind['speed'] ?? 0) * 3.6,
            'rainfall_mm_24h' => ($rain['1h'] ?? 0) + ($rain['3h'] ?? 0),
            'weather_condition' => $weather['main'] ?? 'Unknown',
            'alert_triggered' => false,
            'fetched_at' => now(),
        ]);
    }

    public function getCachedWeatherForFarm(Farm $farm): ?WeatherData
    {
        return $farm->weatherData()
            ->where('fetched_at', '>=', now()->subHours(6))
            ->first();
    }

    public function refreshWeatherForAllFarms(): int
    {
        $farms = Farm::active()
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->get();

        $count = 0;
        foreach ($farms as $farm) {
            if ($this->fetchWeatherForFarm($farm)) {
                $count++;
            }
        }

        return $count;
    }
}
