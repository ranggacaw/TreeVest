<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Warehouse extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'farm_id',
        'name',
        'description',
    ];

    public function farm(): BelongsTo
    {
        return $this->belongsTo(Farm::class);
    }

    public function racks(): HasMany
    {
        return $this->hasMany(Rack::class);
    }

    public function lots(): \Illuminate\Database\Eloquent\Relations\HasManyThrough
    {
        return $this->hasManyThrough(Lot::class, Rack::class);
    }

    public function scopeForFarm($query, int $farmId)
    {
        return $query->where('farm_id', $farmId);
    }

    public function hasActiveLots(): bool
    {
        return $this->lots()
            ->whereNotIn('status', ['completed', 'cancelled'])
            ->exists();
    }
}
