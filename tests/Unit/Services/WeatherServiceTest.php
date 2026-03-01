<?php

namespace Tests\Unit\Services;

use App\Models\Farm;
use App\Services\WeatherService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class WeatherServiceTest extends TestCase
{
    use RefreshDatabase;

    protected WeatherService $weatherService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->weatherService = app(WeatherService::class);
        config(['services.openweathermap.api_key' => 'test-api-key']);
    }

    public function test_fetch_weather_for_farm_returns_weather_data()
    {
        $farm = Farm::factory()->create([
            'latitude' => 3.1390,
            'longitude' => 101.6869,
        ]);

        Http::fake([
            'api.openweathermap.org/*' => Http::response([
                'main' => [
                    'temp' => 28.5,
                    'humidity' => 75,
                ],
                'wind' => [
                    'speed' => 1.5,
                ],
                'rain' => [
                    '1h' => 2.5,
                ],
                'weather' => [
                    ['main' => 'Rain'],
                ],
            ], 200),
        ]);

        $result = $this->weatherService->fetchWeatherForFarm($farm);

        $this->assertNotNull($result);
        $this->assertEquals($farm->id, $result->farm_id);
        $this->assertEquals(28.5, $result->temperature_celsius);
        $this->assertEquals(75, $result->humidity_percent);
        $this->assertEquals(5.4, $result->wind_speed_kmh); // 1.5 m/s * 3.6
        $this->assertEquals(2.5, $result->rainfall_mm_24h);
        $this->assertEquals('Rain', $result->weather_condition);
    }

    public function test_fetch_weather_for_farm_caches_results()
    {
        $farm = Farm::factory()->create([
            'latitude' => 3.1390,
            'longitude' => 101.6869,
        ]);

        Http::fake([
            'api.openweathermap.org/*' => Http::response([
                'main' => ['temp' => 30, 'humidity' => 80],
                'wind' => ['speed' => 1],
                'weather' => [['main' => 'Clear']],
            ], 200),
        ]);

        // First call - should hit API
        $this->weatherService->fetchWeatherForFarm($farm);

        // Second call within 6 hours - should use cached data
        $cached = $this->weatherService->getCachedWeatherForFarm($farm);
        $this->assertNotNull($cached);
        $this->assertEquals(30, $cached->temperature_celsius);
    }

    public function test_fetch_weather_for_farm_handles_api_errors()
    {
        $farm = Farm::factory()->create([
            'latitude' => 3.1390,
            'longitude' => 101.6869,
        ]);

        Http::fake([
            'api.openweathermap.org/*' => Http::response([], 500),
        ]);

        $result = $this->weatherService->fetchWeatherForFarm($farm);

        $this->assertNull($result);
    }

    public function test_fetch_weather_for_farm_handles_missing_rain_data()
    {
        $farm = Farm::factory()->create([
            'latitude' => 3.1390,
            'longitude' => 101.6869,
        ]);

        Http::fake([
            'api.openweathermap.org/*' => Http::response([
                'main' => ['temp' => 25, 'humidity' => 60],
                'wind' => ['speed' => 2.7],
                'weather' => [['main' => 'Sunny']],
            ], 200),
        ]);

        $result = $this->weatherService->fetchWeatherForFarm($farm);

        $this->assertNotNull($result);
        $this->assertEquals(0, $result->rainfall_mm_24h);
    }

    public function test_fetch_weather_for_farm_requires_location()
    {
        $farm = Farm::factory()->create([
            'latitude' => null,
            'longitude' => null,
        ]);

        $result = $this->weatherService->fetchWeatherForFarm($farm);

        $this->assertNull($result);
    }

    public function test_fetch_weather_for_farm_requires_api_key()
    {
        config(['services.openweathermap.api_key' => null]);
        config(['app.openweathermap_api_key' => null]);

        $farm = Farm::factory()->create([
            'latitude' => 3.1390,
            'longitude' => 101.6869,
        ]);

        $result = $this->weatherService->fetchWeatherForFarm($farm);

        $this->assertNull($result);
    }

    public function test_refresh_weather_for_all_farms()
    {
        $farm1 = Farm::factory()->create([
            'status' => \App\Enums\FarmStatus::ACTIVE,
            'latitude' => 3.1390,
            'longitude' => 101.6869,
        ]);

        $farm2 = Farm::factory()->create([
            'status' => \App\Enums\FarmStatus::ACTIVE,
            'latitude' => 3.2500,
            'longitude' => 101.7000,
        ]);

        // Create farm without location (should be skipped)
        Farm::factory()->create([
            'status' => \App\Enums\FarmStatus::ACTIVE,
            'latitude' => null,
            'longitude' => null,
        ]);

        Http::fake([
            'api.openweathermap.org/*' => Http::response([
                'main' => ['temp' => 28, 'humidity' => 70],
                'wind' => ['speed' => 1],
                'weather' => [['main' => 'Clear']],
            ], 200),
        ]);

        $count = $this->weatherService->refreshWeatherForAllFarms();

        $this->assertEquals(2, $count);
        $this->assertDatabaseCount('weather_data', 2);
    }
}
