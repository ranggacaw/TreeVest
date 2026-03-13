<?php

namespace App\Models;

use App\Enums\WalletTransactionType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Wallet extends Model
{
    use HasFactory;
    protected $fillable = [
        'user_id',
        'balance_cents',
        'currency',
        'is_platform',
    ];

    protected function casts(): array
    {
        return [
            'balance_cents' => 'integer',
            'is_platform' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(WalletTransaction::class);
    }

    public function getFormattedBalanceAttribute(): string
    {
        $symbol = match ($this->currency) {
            'IDR' => 'Rp',
            'MYR' => 'RM',
            'USD' => '$',
            default => $this->currency,
        };

        return $symbol . ' ' . number_format($this->balance_cents / 100, 2);
    }

    public function hasSufficientBalance(int $amountCents): bool
    {
        return $this->balance_cents >= $amountCents;
    }
}
