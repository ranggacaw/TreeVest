<?php

namespace App\Models;

use App\Enums\LotStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Lot extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'rack_id',
        'fruit_crop_id',
        'name',
        'total_trees',
        'available_trees',
        'base_price_per_tree_idr',
        'monthly_increase_rate',
        'current_price_per_tree_idr',
        'cycle_started_at',
        'cycle_months',
        'last_investment_month',
        'status',
        'harvest_total_fruit',
        'harvest_total_weight_kg',
        'harvest_notes',
        'harvest_recorded_at',
        'selling_revenue_idr',
        'selling_proof_photo',
        'selling_submitted_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => LotStatus::class,
            'cycle_started_at' => 'date',
            'harvest_recorded_at' => 'datetime',
            'selling_submitted_at' => 'datetime',
            'total_trees' => 'integer',
            'available_trees' => 'integer',
            'base_price_per_tree_idr' => 'integer',
            'current_price_per_tree_idr' => 'integer',
            'selling_revenue_idr' => 'integer',
            'monthly_increase_rate' => 'decimal:4',
            'harvest_total_weight_kg' => 'decimal:2',
            'cycle_months' => 'integer',
            'last_investment_month' => 'integer',
            'harvest_total_fruit' => 'integer',
        ];
    }

    /**
     * Returns true when all trees in this lot have been claimed by investors.
     */
    public function isFull(): bool
    {
        return $this->available_trees <= 0;
    }

    public function rack(): BelongsTo
    {
        return $this->belongsTo(Rack::class);
    }

    public function fruitCrop(): BelongsTo
    {
        return $this->belongsTo(FruitCrop::class);
    }

    public function trees(): HasMany
    {
        return $this->hasMany(Tree::class);
    }

    public function investments(): HasMany
    {
        return $this->hasMany(Investment::class);
    }

    public function priceSnapshots(): HasMany
    {
        return $this->hasMany(LotPriceSnapshot::class);
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

    public function activeInvestments(): HasMany
    {
        return $this->investments()->where('status', 'active');
    }

    /** Get the warehouse via rack */
    public function warehouse(): \Illuminate\Database\Eloquent\Relations\HasOneThrough
    {
        return $this->hasOneThrough(
            Warehouse::class,
            Rack::class,
            'id',
            'id',
            'rack_id',
            'warehouse_id'
        );
    }

    public function currentCycleMonth(): int
    {
        if (! $this->cycle_started_at) {
            return 1;
        }

        $daysDiff = (int) now()->diffInDays($this->cycle_started_at, false) * -1;
        $month = (int) floor($daysDiff / 30) + 1;

        return max(1, min($month, $this->cycle_months));
    }

    public function isInvestmentOpen(): bool
    {
        return $this->status === LotStatus::Active
            && $this->currentCycleMonth() <= $this->last_investment_month;
    }

    public function getTotalPriceIdr(): int
    {
        return $this->current_price_per_tree_idr * $this->total_trees;
    }

    public function canTransitionTo(LotStatus $newStatus): bool
    {
        return $this->status->canTransitionTo($newStatus);
    }

    public function transitionTo(LotStatus $newStatus): bool
    {
        if (! $this->canTransitionTo($newStatus)) {
            return false;
        }

        $this->status = $newStatus;

        return $this->save();
    }

    public function scopeActive($query)
    {
        return $query->where('status', LotStatus::Active);
    }

    public function scopeRequiringAction($query)
    {
        return $query->whereIn('status', [LotStatus::Harvest->value, LotStatus::Selling->value]);
    }

    public function scopeForFarmOwner($query, int $userId)
    {
        return $query->whereHas('rack.warehouse.farm', function ($q) use ($userId) {
            $q->where('owner_id', $userId);
        });
    }
}
