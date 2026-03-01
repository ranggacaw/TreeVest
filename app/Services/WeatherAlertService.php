<?php

namespace App\Services;

use App\Enums\HealthAlertType;
use App\Enums\HealthSeverity;
use App\Models\Farm;
use App\Models\HealthAlert;
use App\Models\WeatherData;
use Illuminate\Support\Facades\Log;

class WeatherAlertService
{
    private const THRESHOLD_HEAVY_RAINFALL = 50;
    private const THRESHOLD_EXTREME_HEAT = 35;
    private const THRESHOLD_STRONG_WIND = 30;
    private const THRESHOLD_LOW_HUMIDITY = 30;
    private const HUMIDITY_CHECK_DAYS = 3;

    public function generateAlertsForWeatherData(WeatherData $weatherData): array
    {
        $alerts = [];

        if ($weatherData->hasHeavyRainfall()) {
            $alerts[] = $this->createAlert(
                $weatherData->farm,
                HealthAlertType::WEATHER,
                HealthSeverity::HIGH,
                'Heavy Rainfall Alert',
                "Heavy rainfall of {$weatherData->rainfall_mm_24h}mm detected in the last 24 hours. Risk of flooding and soil erosion. Monitor drainage systems and ensure proper water management.",
                null
            );
        }

        if ($weatherData->hasExtremeHeat()) {
            $alerts[] = $this->createAlert(
                $weatherData->farm,
                HealthAlertType::WEATHER,
                HealthSeverity::HIGH,
                'Extreme Heat Alert',
                "Temperature reached {$weatherData->temperature_celsius}°C. Risk of heat stress for fruit trees. Ensure adequate irrigation and monitor for signs of heat damage.",
                null
            );
        }

        if ($weatherData->hasStrongWind()) {
            $alerts[] = $this->createAlert(
                $weatherData->farm,
                HealthAlertType::WEATHER,
                HealthSeverity::MEDIUM,
                'Strong Wind Alert',
                "Wind speeds of {$weatherData->wind_speed_kmh} km/h detected. Risk of tree damage and fruit drop. Secure young trees and support branches if needed.",
                null
            );
        }

        if ($weatherData->hasLowHumidity()) {
            $recentLowHumidity = $this->checkRecentLowHumidity($weatherData->farm);
            
            if ($recentLowHumidity >= self::THRESHOLD_LOW_HUMIDITY) {
                $alerts[] = $this->createAlert(
                    $weatherData->farm,
                    HealthAlertType::WEATHER,
                    HealthSeverity::MEDIUM,
                    'Low Humidity Alert',
                    "Humidity has been below 30% for at least 3 consecutive days. Risk of drought stress. Increase irrigation frequency and monitor soil moisture levels.",
                    null
                );
            }
        }

        return $alerts;
    }

    public function generateAlertsForAllFarms(): int
    {
        $weatherData = WeatherData::where('alert_triggered', false)
            ->where('fetched_at', '>=', now()->subHours(6))
            ->get();

        $count = 0;
        foreach ($weatherData as $data) {
            $alerts = $this->generateAlertsForWeatherData($data);
            $count += count($alerts);
            
            $data->update(['alert_triggered' => count($alerts) > 0]);
        }

        return $count;
    }

    private function checkRecentLowHumidity(Farm $farm): int
    {
        return WeatherData::where('farm_id', $farm->id)
            ->where('fetched_at', '>=', now()->subDays(self::HUMIDITY_CHECK_DAYS))
            ->where('humidity_percent', '<', self::THRESHOLD_LOW_HUMIDITY)
            ->count();
    }

    private function createAlert(
        Farm $farm,
        HealthAlertType $type,
        HealthSeverity $severity,
        string $title,
        string $message,
        ?int $fruitCropId
    ): HealthAlert {
        $recentAlert = HealthAlert::where('farm_id', $farm->id)
            ->where('alert_type', $type)
            ->where('created_at', '>=', now()->subHours(24))
            ->exists();

        if ($recentAlert) {
            Log::info("Alert debounced: {$type->value} for farm {$farm->id}");
            return new HealthAlert();
        }

        return HealthAlert::create([
            'farm_id' => $farm->id,
            'fruit_crop_id' => $fruitCropId,
            'created_by' => null,
            'alert_type' => $type,
            'severity' => $severity,
            'title' => $title,
            'message' => $message,
            'resolved_at' => null,
        ]);
    }

    public function checkAndCreateManualAlert(
        Farm $farm,
        string $title,
        string $message,
        HealthSeverity $severity,
        ?int $fruitCropId = null
    ): HealthAlert {
        return $this->createAlert(
            $farm,
            HealthAlertType::MANUAL,
            $severity,
            $title,
            $message,
            $fruitCropId
        );
    }
}
