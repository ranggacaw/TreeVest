<?php

namespace Database\Seeders;

use App\Models\Farm;
use App\Models\WeatherData;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class WeatherDataSeeder extends Seeder
{
    public function run(): void
    {
        // Guard: skip if weather data already exists
        if (WeatherData::count() > 0) {
            $this->command->info('WeatherDataSeeder: data already exists, skipping.');
            return;
        }

        $farms = Farm::all();

        foreach ($farms as $farm) {
            for ($i = 0; $i < 30; $i++) {
                WeatherData::create([
                    'farm_id' => $farm->id,
                    'temperature_celsius' => rand(220, 320) / 10,
                    'humidity_percent' => rand(60, 95),
                    'wind_speed_kmh' => rand(0, 250) / 10,
                    'rainfall_mm_24h' => rand(0, 100) / 10,
                    'weather_condition' => $this->getRandomWeatherCondition(),
                    'alert_triggered' => rand(0, 100) < 5,
                    'fetched_at' => now()->subDays($i),
                ]);
            }
        }

        $this->command->info('Weather data seeded successfully!');
    }

    private function getRandomWeatherCondition(): string
    {
        $conditions = [
            'Sunny',
            'Partly Cloudy',
            'Cloudy',
            'Overcast',
            'Light Rain',
            'Moderate Rain',
            'Heavy Rain',
            'Thunderstorm',
            'Mist',
            'Foggy',
        ];

        return $conditions[array_rand($conditions)];
    }
}
