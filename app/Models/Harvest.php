<?php

namespace App\Models;

use App\Enums\HarvestStatus;
use App\Enums\QualityGrade;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Harvest extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'tree_id',
        'fruit_crop_id',
        'scheduled_date',
        'status',
        'estimated_yield_kg',
        'actual_yield_kg',
        'quality_grade',
        'market_price_id',
        'platform_fee_rate',
        'farm_owner_share_idr',
        'notes',
        'confirmed_by',
        'confirmed_at',
        'completed_at',
        'failed_at',
        'reminders_sent',
    ];

    protected function casts(): array
    {
        return [
            'status' => HarvestStatus::class,
            'quality_grade' => QualityGrade::class,
            'scheduled_date' => 'date',
            'confirmed_at' => 'datetime',
            'completed_at' => 'datetime',
            'failed_at' => 'datetime',
            'estimated_yield_kg' => 'decimal:2',
            'actual_yield_kg' => 'decimal:2',
            'platform_fee_rate' => 'decimal:4',
            'reminders_sent' => 'array',
        ];
    }

    public function tree(): BelongsTo
    {
        return $this->belongsTo(Tree::class);
    }

    public function fruitCrop(): BelongsTo
    {
        return $this->belongsTo(FruitCrop::class);
    }

    public function confirmedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'confirmed_by');
    }

    public function marketPrice(): BelongsTo
    {
        return $this->belongsTo(MarketPrice::class);
    }

    public function payouts(): HasMany
    {
        return $this->hasMany(Payout::class);
    }

    public function scopeScheduled($query)
    {
        return $query->where('status', HarvestStatus::Scheduled);
    }

    public function scopeActive($query)
    {
        return $query->whereIn('status', [
            HarvestStatus::Scheduled,
            HarvestStatus::InProgress,
        ]);
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', HarvestStatus::Completed)
            ->whereNotNull('actual_yield_kg')
            ->where('scheduled_date', '<=', now()->toDateString());
    }

    public function scopeUpcoming($query)
    {
        return $query->where('status', HarvestStatus::Scheduled)
            ->where('scheduled_date', '>', now()->toDateString());
    }

    public function canTransitionTo(HarvestStatus $to): bool
    {
        return $this->status->canTransitionTo($to);
    }
}
