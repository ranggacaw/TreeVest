<?php

namespace App\Models;

use App\Enums\RiskRating;
use App\Enums\TreeLifecycleStage;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Tree extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'fruit_crop_id',
        'tree_identifier',
        'price_cents',
        'expected_roi_percent',
        'age_years',
        'productive_lifespan_years',
        'risk_rating',
        'min_investment_cents',
        'max_investment_cents',
        'status',
        'historical_yield_json',
        'pricing_config_json',
    ];

    protected function casts(): array
    {
        return [
            'risk_rating' => RiskRating::class,
            'status' => TreeLifecycleStage::class,
            'historical_yield_json' => 'array',
            'pricing_config_json' => 'array',
            'age_years' => 'integer',
            'productive_lifespan_years' => 'integer',
            'price_cents' => 'integer',
            'expected_roi_percent' => 'decimal:2',
            'min_investment_cents' => 'integer',
            'max_investment_cents' => 'integer',
        ];
    }

    public function fruitCrop(): BelongsTo
    {
        return $this->belongsTo(FruitCrop::class);
    }

    public function harvests(): HasMany
    {
        return $this->hasMany(TreeHarvest::class)->orderBy('harvest_date', 'desc');
    }

    public function scopeInvestable($query)
    {
        return $query->whereIn('status', [
            TreeLifecycleStage::GROWING,
            TreeLifecycleStage::PRODUCTIVE,
        ]);
    }

    public function scopeByFruitType($query, int $fruitTypeId)
    {
        return $query->whereHas('fruitCrop', function ($q) use ($fruitTypeId) {
            $q->where('fruit_type_id', $fruitTypeId);
        });
    }

    public function scopeByRiskRating($query, array $ratings)
    {
        return $query->whereIn('risk_rating', $ratings);
    }

    public function scopeByPriceRange($query, int $min, int $max)
    {
        return $query->whereBetween('price_cents', [$min, $max]);
    }

    public function getPriceFormattedAttribute(): string
    {
        return 'RM '.number_format($this->price_cents / 100, 2);
    }

    public function getExpectedRoiFormattedAttribute(): string
    {
        return $this->expected_roi_percent.'%';
    }

    public function isInvestable(): bool
    {
        return $this->status->isInvestable();
    }

    public function canTransitionTo(TreeLifecycleStage $newStatus): bool
    {
        return $this->status->canTransitionTo($newStatus);
    }
}
