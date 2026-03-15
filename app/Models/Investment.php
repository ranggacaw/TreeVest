<?php

namespace App\Models;

use App\Enums\InvestmentStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Investment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'tree_id',
        'lot_id',
        'amount_idr',
        'quantity',
        'currency',
        'purchase_date',
        'purchase_month',
        'status',
        'transaction_id',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'status' => InvestmentStatus::class,
            'metadata' => 'array',
            'amount_idr' => 'integer',
            'quantity' => 'integer',
            'purchase_date' => 'date',
            'purchase_month' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function investor(): BelongsTo
    {
        return $this->user();
    }

    public function tree(): BelongsTo
    {
        return $this->belongsTo(Tree::class);
    }

    public function lot(): BelongsTo
    {
        return $this->belongsTo(Lot::class);
    }

    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class);
    }

    public function payouts()
    {
        return $this->hasMany(Payout::class);
    }

    public function listings()
    {
        return $this->hasMany(MarketListing::class);
    }

    public function activeListing()
    {
        return $this->hasOne(MarketListing::class)->where('status', 'active');
    }

    public function transfers()
    {
        return $this->hasMany(InvestmentTransfer::class);
    }

    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeActive($query)
    {
        return $query->where('status', InvestmentStatus::Active);
    }

    public function scopeByTree($query, int $treeId)
    {
        return $query->where('tree_id', $treeId);
    }

    public function scopeByStatus($query, InvestmentStatus $status)
    {
        return $query->where('status', $status);
    }

    public function scopePendingPayment($query)
    {
        return $query->where('status', InvestmentStatus::PendingPayment);
    }

    public function isActive(): bool
    {
        return $this->status->isActive();
    }

    public function canBeCancelled(): bool
    {
        return $this->status->canTransitionTo(InvestmentStatus::Cancelled);
    }

    public function getMaxAdditionalTrees(int $maxInvestmentIdr, int $pricePerTreeIdr): int
    {
        $maxTrees = (int) floor($maxInvestmentIdr / $pricePerTreeIdr);

        return max(0, $maxTrees - $this->quantity);
    }

    public function getFormattedAmountAttribute(): string
    {
        $currencySymbol = match ($this->currency) {
            'IDR' => 'Rp',
            default => $this->currency,
        };

        return $currencySymbol.' '.number_format($this->amount_idr, 0);
    }

    public function transitionTo(InvestmentStatus $newStatus): bool
    {
        if (! $this->status->canTransitionTo($newStatus)) {
            return false;
        }

        $this->status = $newStatus;

        return $this->save();
    }
}
