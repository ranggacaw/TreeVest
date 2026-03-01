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
        'amount_cents',
        'currency',
        'purchase_date',
        'status',
        'transaction_id',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'status' => InvestmentStatus::class,
            'metadata' => 'array',
            'amount_cents' => 'integer',
            'purchase_date' => 'date',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function tree(): BelongsTo
    {
        return $this->belongsTo(Tree::class);
    }

    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class);
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

    public function getFormattedAmountAttribute(): string
    {
        return $this->currency.' '.number_format($this->amount_cents / 100, 2);
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
