<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InvestmentTransfer extends Model
{
    use HasFactory;

    protected $fillable = [
        'investment_id',
        'listing_id',
        'from_user_id',
        'to_user_id',
        'transfer_price_idr',
        'platform_fee_idr',
        'transaction_id',
        'transferred_at',
    ];

    protected function casts(): array
    {
        return [
            'transfer_price_idr' => 'integer',
            'platform_fee_idr' => 'integer',
            'transferred_at' => 'datetime',
        ];
    }

    public function investment(): BelongsTo
    {
        return $this->belongsTo(Investment::class);
    }

    public function listing(): BelongsTo
    {
        return $this->belongsTo(MarketListing::class, 'listing_id');
    }

    public function fromUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'from_user_id');
    }

    public function toUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'to_user_id');
    }

    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class);
    }

    public function scopeForInvestment($query, int $investmentId)
    {
        return $query->where('investment_id', $investmentId);
    }

    public function scopeForUser($query, int $userId)
    {
        return $query->where(function ($q) use ($userId) {
            $q->where('from_user_id', $userId)->orWhere('to_user_id', $userId);
        });
    }

    public function getFormattedTransferPriceAttribute(): string
    {
        $currency = $this->listing?->currency ?? 'IDR';

        return $currency.' '.number_format($this->transfer_price_idr, 0);
    }

    public function getFormattedPlatformFeeAttribute(): string
    {
        $currency = $this->listing?->currency ?? 'IDR';

        return $currency.' '.number_format($this->platform_fee_idr, 0);
    }
}
