<?php

namespace App\Models;

use App\Enums\AgrotourismEventType;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class AgrotourismEvent extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'farm_id',
        'title',
        'description',
        'event_date',
        'event_type',
        'max_capacity',
        'location_notes',
        'is_registration_open',
        'cancelled_at',
    ];

    protected function casts(): array
    {
        return [
            'event_type' => AgrotourismEventType::class,
            'event_date' => 'datetime',
            'cancelled_at' => 'datetime',
            'is_registration_open' => 'boolean',
        ];
    }

    public function farm(): BelongsTo
    {
        return $this->belongsTo(Farm::class);
    }

    public function registrations(): HasMany
    {
        return $this->hasMany(AgrotourismRegistration::class, 'event_id');
    }

    public function confirmedRegistrations(): HasMany
    {
        return $this->hasMany(AgrotourismRegistration::class, 'event_id')->where('status', 'confirmed');
    }

    public function scopeUpcoming(Builder $query): Builder
    {
        return $query->where('event_date', '>', now());
    }

    public function scopeOpen(Builder $query): Builder
    {
        return $query->where('is_registration_open', true)->whereNull('cancelled_at');
    }

    public function isCancelled(): bool
    {
        return ! is_null($this->cancelled_at);
    }

    public function isFull(): bool
    {
        if (is_null($this->max_capacity)) {
            return false;
        }

        $totalParticipants = $this->confirmedRegistrations()->sum('participants_count');

        return $totalParticipants >= $this->max_capacity;
    }
}
