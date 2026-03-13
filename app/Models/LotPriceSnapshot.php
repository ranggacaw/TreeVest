<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LotPriceSnapshot extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'lot_id',
        'cycle_month',
        'price_per_tree_cents',
        'recorded_at',
    ];

    protected function casts(): array
    {
        return [
            'recorded_at' => 'datetime',
            'price_per_tree_cents' => 'integer',
            'cycle_month' => 'integer',
        ];
    }

    public function lot(): BelongsTo
    {
        return $this->belongsTo(Lot::class);
    }
}
