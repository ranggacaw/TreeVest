<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MarketPrice extends Model
{
    use HasFactory;

    protected $fillable = [
        'fruit_type_id',
        'price_per_kg_cents',
        'currency',
        'effective_date',
        'created_by',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'effective_date' => 'date',
            'price_per_kg_cents' => 'integer',
        ];
    }

    public function fruitType(): BelongsTo
    {
        return $this->belongsTo(FruitType::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
