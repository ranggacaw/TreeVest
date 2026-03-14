<?php

namespace App\Models;

use App\Enums\PayoutStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payout extends Model
{
    use HasFactory;

    protected $fillable = [
        'investment_id',
        'harvest_id',
        'investor_id',
        'gross_amount_idr',
        'platform_fee_idr',
        'net_amount_idr',
        'currency',
        'status',
        'payout_method',
        'transaction_id',
        'notes',
        'processing_started_at',
        'completed_at',
        'failed_at',
        'failed_reason',
    ];

    protected function casts(): array
    {
        return [
            'status' => PayoutStatus::class,
            'gross_amount_idr' => 'integer',
            'platform_fee_idr' => 'integer',
            'net_amount_idr' => 'integer',
            'processing_started_at' => 'datetime',
            'completed_at' => 'datetime',
            'failed_at' => 'datetime',
        ];
    }

    public function investment(): BelongsTo
    {
        return $this->belongsTo(Investment::class);
    }

    public function harvest(): BelongsTo
    {
        return $this->belongsTo(Harvest::class);
    }

    public function investor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'investor_id');
    }

    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class);
    }

    public function canTransitionTo(PayoutStatus $to): bool
    {
        return $this->status->canTransitionTo($to);
    }

    public function getGrossAmountFormattedAttribute(): string
    {
        return $this->currency.' '.number_format($this->gross_amount_idr, 0);
    }

    public function getPlatformFeeFormattedAttribute(): string
    {
        return $this->currency.' '.number_format($this->platform_fee_idr, 0);
    }

    public function getNetAmountFormattedAttribute(): string
    {
        return $this->currency.' '.number_format($this->net_amount_idr, 0);
    }
}
