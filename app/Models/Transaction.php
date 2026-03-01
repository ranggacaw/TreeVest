<?php

namespace App\Models;

use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'status',
        'amount',
        'currency',
        'stripe_payment_intent_id',
        'payment_method_id',
        'related_investment_id',
        'related_payout_id',
        'metadata',
        'stripe_metadata',
        'failure_reason',
        'completed_at',
        'failed_at',
    ];

    protected function casts(): array
    {
        return [
            'type' => TransactionType::class,
            'status' => TransactionStatus::class,
            'metadata' => 'array',
            'stripe_metadata' => 'array',
            'amount' => 'integer',
            'completed_at' => 'datetime',
            'failed_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function paymentMethod(): BelongsTo
    {
        return $this->belongsTo(PaymentMethod::class);
    }

    public function getFormattedAmountAttribute(): string
    {
        return number_format($this->amount / 100, 2);
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', TransactionStatus::Completed);
    }

    public function scopePending($query)
    {
        return $query->where('status', TransactionStatus::Pending);
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeByType($query, TransactionType $type)
    {
        return $query->where('type', $type);
    }
}
