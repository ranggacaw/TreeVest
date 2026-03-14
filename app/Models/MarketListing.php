<?php

namespace App\Models;

use App\Enums\ListingStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class MarketListing extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'investment_id',
        'seller_id',
        'ask_price_idr',
        'currency',
        'platform_fee_rate',
        'platform_fee_idr',
        'net_proceeds_idr',
        'status',
        'buyer_id',
        'purchased_at',
        'cancelled_at',
        'expires_at',
        'notes',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'status' => ListingStatus::class,
            'ask_price_idr' => 'integer',
            'platform_fee_rate' => 'decimal:4',
            'platform_fee_idr' => 'integer',
            'net_proceeds_idr' => 'integer',
            'purchased_at' => 'datetime',
            'cancelled_at' => 'datetime',
            'expires_at' => 'datetime',
            'metadata' => 'array',
        ];
    }

    public function investment(): BelongsTo
    {
        return $this->belongsTo(Investment::class);
    }

    public function seller(): BelongsTo
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    public function buyer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'buyer_id');
    }

    public function transfers()
    {
        return $this->hasMany(InvestmentTransfer::class, 'listing_id');
    }

    public function scopeActive($query)
    {
        return $query->where('status', ListingStatus::Active);
    }

    public function scopeSold($query)
    {
        return $query->where('status', ListingStatus::Sold);
    }

    public function scopeCancelled($query)
    {
        return $query->where('status', ListingStatus::Cancelled);
    }

    public function scopeForSeller($query, int $sellerId)
    {
        return $query->where('seller_id', $sellerId);
    }

    public function scopeExpired($query)
    {
        return $query->where('expires_at', '<', now())->where('status', ListingStatus::Active);
    }

    public function isActive(): bool
    {
        return $this->status === ListingStatus::Active;
    }

    public function isSold(): bool
    {
        return $this->status === ListingStatus::Sold;
    }

    public function isCancelled(): bool
    {
        return $this->status === ListingStatus::Cancelled;
    }

    public function isExpired(): bool
    {
        return $this->expires_at !== null && $this->expires_at->isPast();
    }

    public function getFormattedAskPriceAttribute(): string
    {
        return $this->currency.' '.number_format($this->ask_price_idr, 0);
    }

    public function getFormattedPlatformFeeAttribute(): string
    {
        return $this->currency.' '.number_format($this->platform_fee_idr, 0);
    }

    public function getFormattedNetProceedsAttribute(): string
    {
        return $this->currency.' '.number_format($this->net_proceeds_idr, 0);
    }
}
