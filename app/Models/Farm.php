<?php

namespace App\Models;

use App\Enums\FarmStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class Farm extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'owner_id',
        'name',
        'description',
        'address',
        'city',
        'state',
        'country',
        'postal_code',
        'latitude',
        'longitude',
        'size_hectares',
        'capacity_trees',
        'status',
        'soil_type',
        'climate',
        'historical_performance',
        'virtual_tour_url',
        'rejection_reason',
        'approved_at',
        'approved_by',
    ];

    protected function casts(): array
    {
        return [
            'status' => FarmStatus::class,
            'size_hectares' => 'decimal:2',
            'capacity_trees' => 'integer',
            'approved_at' => 'datetime',
            'latitude' => 'float',
            'longitude' => 'float',
        ];
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function images(): HasMany
    {
        return $this->hasMany(FarmImage::class)->orderBy('sort_order');
    }

    public function certifications(): HasMany
    {
        return $this->hasMany(FarmCertification::class);
    }

    public function fruitCrops(): HasMany
    {
        return $this->hasMany(FruitCrop::class);
    }

    public function featuredImage(): ?FarmImage
    {
        return $this->images()->where('is_featured', true)->first();
    }

    public function getFullAddressAttribute(): string
    {
        $parts = array_filter([
            $this->address,
            $this->city,
            $this->state,
            $this->postal_code,
            $this->country,
        ]);

        return implode(', ', $parts);
    }

    public function scopeActive($query)
    {
        $query->where('status', FarmStatus::ACTIVE);
    }

    public function scopePendingApproval($query)
    {
        $query->where('status', FarmStatus::PENDING_APPROVAL);
    }

    public function scopeSuspended($query)
    {
        $query->where('status', FarmStatus::SUSPENDED);
    }

    public function scopeForOwner($query, int $ownerId)
    {
        $query->where('owner_id', $ownerId);
    }

    public function scopeSearchNearby($query, float $lat, float $lng, float $radiusKm = 50)
    {
        $query->whereRaw(
            'ST_Distance_Sphere(point(longitude, latitude), point(?, ?)) <= ?',
            [$lng, $lat, $radiusKm * 1000]
        );
    }

    public function isActive(): bool
    {
        return $this->status === FarmStatus::ACTIVE;
    }

    public function isPendingApproval(): bool
    {
        return $this->status === FarmStatus::PENDING_APPROVAL;
    }

    public function isSuspended(): bool
    {
        return $this->status === FarmStatus::SUSPENDED;
    }

    public function canTransitionTo(FarmStatus $newStatus): bool
    {
        return $this->status->canTransitionTo($newStatus);
    }

    public function transitionTo(FarmStatus $newStatus): bool
    {
        if (! $this->canTransitionTo($newStatus)) {
            return false;
        }

        $this->status = $newStatus;
        $this->save();

        return true;
    }

    public function approve(int $approvedBy): void
    {
        $this->status = FarmStatus::ACTIVE;
        $this->approved_at = now();
        $this->approved_by = $approvedBy;
        $this->rejection_reason = null;
        $this->save();
    }

    public function reject(int $rejectedBy, string $reason): void
    {
        $this->status = FarmStatus::DEACTIVATED;
        $this->rejection_reason = $reason;
        $this->save();
    }

    public function suspend(): void
    {
        $this->status = FarmStatus::SUSPENDED;
        $this->save();
    }

    public function reinstate(): void
    {
        $this->status = FarmStatus::ACTIVE;
        $this->save();
    }

    public function requireReapproval(): void
    {
        if ($this->status === FarmStatus::ACTIVE) {
            $this->status = FarmStatus::PENDING_APPROVAL;
            $this->approved_at = null;
            $this->approved_by = null;
            $this->save();
        }
    }

    public function getImageUrl(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        return Storage::disk('public')->url($path);
    }

    protected static function booted(): void
    {
        static::deleting(function ($farm) {
            foreach ($farm->images as $image) {
                if ($image->file_path) {
                    Storage::disk('public')->delete($image->file_path);
                }
            }
        });
    }
}
