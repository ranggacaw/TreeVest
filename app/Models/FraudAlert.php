<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Enums\FraudRuleType;

class FraudAlert extends Model
{
    protected $fillable = [
        'user_id',
        'rule_type',
        'severity',
        'notes',
        'detected_at',
        'resolved_at',
    ];

    protected $casts = [
        'rule_type' => FraudRuleType::class,
        'detected_at' => 'datetime',
        'resolved_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
