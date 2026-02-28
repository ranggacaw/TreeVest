<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TreeHarvest extends Model
{
    use HasFactory;

    protected $fillable = [
        'tree_id',
        'harvest_date',
        'estimated_yield_kg',
        'actual_yield_kg',
        'quality_grade',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'harvest_date' => 'date',
            'estimated_yield_kg' => 'decimal:2',
            'actual_yield_kg' => 'decimal:2',
        ];
    }

    public function tree(): BelongsTo
    {
        return $this->belongsTo(Tree::class);
    }
}
