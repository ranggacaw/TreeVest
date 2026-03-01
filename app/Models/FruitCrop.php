<?php

namespace App\Models;

use App\Enums\HarvestCycle;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class FruitCrop extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'farm_id',
        'fruit_type_id',
        'variant',
        'description',
        'harvest_cycle',
        'planted_date',
    ];

    protected function casts(): array
    {
        return [
            'harvest_cycle' => HarvestCycle::class,
            'planted_date' => 'date',
        ];
    }

    public function farm(): BelongsTo
    {
        return $this->belongsTo(Farm::class);
    }

    public function fruitType(): BelongsTo
    {
        return $this->belongsTo(FruitType::class);
    }

    public function trees(): HasMany
    {
        return $this->hasMany(Tree::class);
    }

    public function healthUpdates(): HasMany
    {
        return $this->hasMany(TreeHealthUpdate::class)->orderBy('created_at', 'desc');
    }

    public function healthAlerts(): HasMany
    {
        return $this->hasMany(HealthAlert::class)->orderBy('created_at', 'desc');
    }

    public function latestHealthUpdate(): ?TreeHealthUpdate
    {
        return $this->healthUpdates()->first();
    }

    public function activeHealthAlerts(): HasMany
    {
        return $this->healthAlerts()->unresolved();
    }
}
