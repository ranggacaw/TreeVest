<?php

namespace App\Models;

use App\Enums\HealthSeverity;
use App\Enums\HealthUpdateType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

class TreeHealthUpdate extends Model
{
    use HasFactory;

    protected $fillable = [
        'fruit_crop_id',
        'author_id',
        'severity',
        'update_type',
        'title',
        'description',
        'photos',
        'visibility',
    ];

    protected function casts(): array
    {
        return [
            'severity' => HealthSeverity::class,
            'update_type' => HealthUpdateType::class,
            'photos' => 'array',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function fruitCrop(): BelongsTo
    {
        return $this->belongsTo(FruitCrop::class);
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function farm(): Farm
    {
        return $this->fruitCrop->farm;
    }

    public function getPhotoUrls(): array
    {
        if (empty($this->photos)) {
            return [];
        }

        return collect($this->photos)->map(function ($photo) {
            return Storage::disk('public')->url($photo);
        })->toArray();
    }

    public function getThumbnailUrls(): array
    {
        if (empty($this->photos)) {
            return [];
        }

        return collect($this->photos)->map(function ($photo) {
            $thumbnailPath = str_replace('/photos/', '/photos/thumbnails/', $photo);
            return Storage::disk('public')->url($thumbnailPath);
        })->toArray();
    }

    public function scopeForInvestor($query, User $investor)
    {
        $cropIds = $investor->investments()
            ->with('tree.fruitCrop')
            ->get()
            ->pluck('tree.fruitCrop.id')
            ->unique();

        return $query->whereIn('fruit_crop_id', $cropIds)
            ->where('visibility', 'investors_only');
    }

    public function scopeRecent($query, int $days = 30)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    public function scopeBySeverity($query, HealthSeverity $severity)
    {
        return $query->where('severity', $severity);
    }

    public function scopeByType($query, HealthUpdateType $type)
    {
        return $query->where('update_type', $type);
    }

    public function isEditable(): bool
    {
        return $this->created_at->greaterThan(now()->subHours(24));
    }

    public function isCritical(): bool
    {
        return $this->severity === HealthSeverity::CRITICAL;
    }

    public function requiresNotification(): bool
    {
        return in_array($this->severity, [HealthSeverity::MEDIUM, HealthSeverity::HIGH, HealthSeverity::CRITICAL]);
    }
}
