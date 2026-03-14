<?php

namespace App\Models;

use App\Enums\GrowthMilestoneType;
use App\Enums\TreeHealthStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class TreeGrowthTimeline extends Model
{
    use HasFactory;

    protected $fillable = [
        'tree_id',
        'lot_id',
        'recorded_by',
        'title',
        'description',
        'milestone_type',
        'photos',
        'tree_height_cm',
        'trunk_diameter_cm',
        'estimated_fruit_count',
        'health_status',
        'notes',
        'recorded_date',
        'is_visible_to_investors',
    ];

    protected function casts(): array
    {
        return [
            'milestone_type' => GrowthMilestoneType::class,
            'health_status' => TreeHealthStatus::class,
            'photos' => 'array',
            'recorded_date' => 'date',
            'is_visible_to_investors' => 'boolean',
            'tree_height_cm' => 'decimal:2',
            'trunk_diameter_cm' => 'decimal:2',
            'estimated_fruit_count' => 'integer',
        ];
    }

    public function tree(): BelongsTo
    {
        return $this->belongsTo(Tree::class);
    }

    public function lot(): BelongsTo
    {
        return $this->belongsTo(Lot::class);
    }

    public function recordedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }

    public function scopeVisibleToInvestors($query)
    {
        return $query->where('is_visible_to_investors', true);
    }

    public function scopeForTree($query, int $treeId)
    {
        return $query->where('tree_id', $treeId);
    }

    public function scopeForLot($query, int $lotId)
    {
        return $query->where('lot_id', $lotId);
    }

    public function scopeByMilestoneType($query, GrowthMilestoneType $type)
    {
        return $query->where('milestone_type', $type);
    }

    public function scopeRecent($query, int $limit = 10)
    {
        return $query->orderBy('recorded_date', 'desc')->limit($limit);
    }

    public function getPhotoUrls(): array
    {
        if (! $this->photos || ! is_array($this->photos)) {
            return [];
        }

        return array_map(function ($path) {
            return Storage::disk('public')->url($path);
        }, $this->photos);
    }

    public function hasPhotos(): bool
    {
        return ! empty($this->photos) && is_array($this->photos);
    }

    public function getFirstPhotoUrl(): ?string
    {
        $urls = $this->getPhotoUrls();

        return $urls[0] ?? null;
    }
}
