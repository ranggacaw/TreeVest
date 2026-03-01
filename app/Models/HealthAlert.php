<?php

namespace App\Models;

use App\Enums\HealthAlertType;
use App\Enums\HealthSeverity;
use App\Enums\InvestmentStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HealthAlert extends Model
{
    use HasFactory;

    protected $fillable = [
        'farm_id',
        'fruit_crop_id',
        'created_by',
        'alert_type',
        'severity',
        'title',
        'message',
        'resolved_at',
    ];

    protected function casts(): array
    {
        return [
            'alert_type' => HealthAlertType::class,
            'severity' => HealthSeverity::class,
            'resolved_at' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function farm(): BelongsTo
    {
        return $this->belongsTo(Farm::class);
    }

    public function fruitCrop(): BelongsTo
    {
        return $this->belongsTo(FruitCrop::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scopeUnresolved($query)
    {
        return $query->whereNull('resolved_at');
    }

    public function scopeResolved($query)
    {
        return $query->whereNotNull('resolved_at');
    }

    public function scopeByType($query, HealthAlertType $type)
    {
        return $query->where('alert_type', $type);
    }

    public function scopeBySeverity($query, HealthSeverity $severity)
    {
        return $query->where('severity', $severity);
    }

    public function scopeForFarm($query, int $farmId)
    {
        return $query->where('farm_id', $farmId);
    }

    public function scopeForCrop($query, int $cropId)
    {
        return $query->where('fruit_crop_id', $cropId);
    }

    public function scopeRecent($query, int $days = 30)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    public function isResolved(): bool
    {
        return $this->resolved_at !== null;
    }

    public function isWeatherAlert(): bool
    {
        return $this->alert_type === HealthAlertType::WEATHER;
    }

    public function isPestOrDiseaseAlert(): bool
    {
        return in_array($this->alert_type, [HealthAlertType::PEST, HealthAlertType::DISEASE]);
    }

    public function resolve(): void
    {
        $this->resolved_at = now();
        $this->save();
    }

    public function requiresNotification(): bool
    {
        return !$this->isResolved() && 
               in_array($this->severity, [HealthSeverity::MEDIUM, HealthSeverity::HIGH, HealthSeverity::CRITICAL]);
    }

    public function getInvestorNotificationRecipients(): \Illuminate\Database\Eloquent\Collection
    {
        $cropId = $this->fruit_crop_id;
        
        if (!$cropId) {
            return collect();
        }

        $treeIds = Tree::where('fruit_crop_id', $cropId)->pluck('id');
        
        return User::whereHas('investments', function ($query) use ($treeIds) {
            $query->whereIn('tree_id', $treeIds)
                ->where('status', InvestmentStatus::Active);
        })->get();
    }
}
