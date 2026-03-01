<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WeatherData extends Model
{
    use HasFactory;

    protected $fillable = [
        'farm_id',
        'temperature_celsius',
        'humidity_percent',
        'wind_speed_kmh',
        'rainfall_mm_24h',
        'weather_condition',
        'alert_triggered',
        'fetched_at',
    ];

    protected function casts(): array
    {
        return [
            'alert_triggered' => 'boolean',
            'fetched_at' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
            'temperature_celsius' => 'float',
            'humidity_percent' => 'integer',
            'wind_speed_kmh' => 'float',
            'rainfall_mm_24h' => 'float',
        ];
    }

    public function farm(): BelongsTo
    {
        return $this->belongsTo(Farm::class);
    }

    public function scopeForFarm($query, int $farmId)
    {
        return $query->where('farm_id', $farmId);
    }

    public function scopeRecent($query, int $hours = 24)
    {
        return $query->where('fetched_at', '>=', now()->subHours($hours));
    }

    public function scopeWithAlerts($query)
    {
        return $query->where('alert_triggered', true);
    }

    public function isStale(): bool
    {
        return $this->fetched_at->lessThan(now()->subHours(6));
    }

    public function getTemperatureFahrenheit(): float
    {
        return ($this->temperature_celsius * 9 / 5) + 32;
    }

    public function getWindSpeedMph(): float
    {
        return $this->wind_speed_kmh * 0.621371;
    }

    public function hasExtremeHeat(): bool
    {
        return $this->temperature_celsius > 35;
    }

    public function hasHeavyRainfall(): bool
    {
        return $this->rainfall_mm_24h > 50;
    }

    public function hasStrongWind(): bool
    {
        return $this->wind_speed_kmh > 30;
    }

    public function hasLowHumidity(): bool
    {
        return $this->humidity_percent < 30;
    }
}
