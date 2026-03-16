<?php

namespace App\Models;

use App\Enums\RiskRating;
use App\Enums\TreeLifecycleStage;
use App\Services\TreeTokenService;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Tree extends Model
{
    use HasFactory, SoftDeletes;

    protected static function booted(): void
    {
        static::created(function (Tree $tree) {
            if ($tree->token_id === null && $tree->lot_id !== null) {
                // Count how many trees in this lot have token_ids already
                // (including the just-created tree itself), then assign the next number.
                $treeNumber = static::where('lot_id', $tree->lot_id)
                    ->whereNotNull('token_id')
                    ->count() + 1;

                $tree->token_id = app(TreeTokenService::class)->generateTokenId(
                    $tree->lot,
                    $treeNumber
                );
                $tree->saveQuietly();
            }
        });
    }

    protected $fillable = [
        'fruit_crop_id',
        'lot_id',
        'token_id',
        'tree_identifier',
        'latitude',
        'longitude',
        'qr_code',
        'price_idr',
        'expected_roi_percent',
        'age_years',
        'productive_lifespan_years',
        'risk_rating',
        'min_investment_idr',
        'max_investment_idr',
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
            'price_idr' => 'integer',
            'expected_roi_percent' => 'decimal:2',
            'min_investment_idr' => 'integer',
            'max_investment_idr' => 'integer',
            'latitude' => 'float',
            'longitude' => 'float',
        ];
    }

    public function fruitCrop(): BelongsTo
    {
        return $this->belongsTo(FruitCrop::class);
    }

    public function lot(): BelongsTo
    {
        return $this->belongsTo(Lot::class);
    }

    public function fruitType(): \Illuminate\Database\Eloquent\Relations\HasOneThrough
    {
        return $this->hasOneThrough(
            FruitType::class,
            FruitCrop::class,
            'id', // Foreign key on FruitCrop
            'id', // Foreign key on FruitType
            'fruit_crop_id', // Local key on Tree
            'fruit_type_id' // Local key on FruitCrop
        );
    }

    public function harvests(): HasMany
    {
        return $this->hasMany(Harvest::class)->orderBy('scheduled_date', 'desc');
    }

    public function investments(): HasMany
    {
        return $this->hasMany(Investment::class);
    }

    public function growthTimeline(): HasMany
    {
        return $this->hasMany(TreeGrowthTimeline::class)->orderBy('recorded_date', 'desc');
    }

    public function visibleGrowthTimeline(): HasMany
    {
        return $this->hasMany(TreeGrowthTimeline::class)
            ->where('is_visible_to_investors', true)
            ->orderBy('recorded_date', 'desc');
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
        return $query->whereBetween('price_idr', [$min, $max]);
    }

    public function getPriceFormattedAttribute(): string
    {
        return 'Rp '.number_format($this->price_idr, 0, ',', '.');
    }

    public function getExpectedRoiFormattedAttribute(): string
    {
        return rtrim(rtrim(number_format($this->expected_roi_percent, 2), '0'), '.').'%';
    }

    public function isInvestable(): bool
    {
        return $this->status->isInvestable();
    }

    public function canTransitionTo(TreeLifecycleStage $newStatus): bool
    {
        return $this->status->canTransitionTo($newStatus);
    }

    public function wishlistItems(): MorphMany
    {
        return $this->morphMany(WishlistItem::class, 'wishlistable');
    }

    public function hasLocation(): bool
    {
        return $this->latitude !== null && $this->longitude !== null;
    }

    public function getGoogleMapsUrl(): ?string
    {
        if (! $this->hasLocation()) {
            return null;
        }

        return "https://www.google.com/maps?q={$this->latitude},{$this->longitude}";
    }

    public function getLocationLabel(): string
    {
        if (! $this->hasLocation()) {
            return 'Location not set';
        }

        return "{$this->latitude}, {$this->longitude}";
    }

    public function generateQrCode(): string
    {
        if ($this->qr_code) {
            return $this->qr_code;
        }

        // Generate unique QR code format: TREE-{FARM_ID}-{WAREHOUSE_ID}-{RACK_ID}-{LOT_ID}-{TREE_ID}
        $qrCode = sprintf(
            'TREE-%d-%d-%d-%d-%d',
            $this->lot->rack->warehouse->farm_id ?? 0,
            $this->lot->rack->warehouse_id ?? 0,
            $this->lot->rack_id ?? 0,
            $this->lot_id ?? 0,
            $this->id
        );

        $this->update(['qr_code' => $qrCode]);

        return $qrCode;
    }

    public function scopeWithLocation($query)
    {
        return $query->whereNotNull('latitude')->whereNotNull('longitude');
    }

    public function scopeNearby($query, float $lat, float $lng, float $radiusKm = 10)
    {
        return $query->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->whereRaw(
                'ST_Distance_Sphere(point(longitude, latitude), point(?, ?)) <= ?',
                [$lng, $lat, $radiusKm * 1000]
            );
    }
}
