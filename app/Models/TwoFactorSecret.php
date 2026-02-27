<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TwoFactorSecret extends Model
{
    protected $fillable = [
        'user_id',
        'type',
        'secret',
        'enabled_at',
        'last_used_at',
    ];

    protected $casts = [
        'secret' => 'encrypted',
        'enabled_at' => 'datetime',
        'last_used_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function recoveryCodes(): HasMany
    {
        return $this->hasMany(TwoFactorRecoveryCode::class);
    }

    public function isTotp(): bool
    {
        return $this->type === 'totp';
    }

    public function isSms(): bool
    {
        return $this->type === 'sms';
    }

    public function isEnabled(): bool
    {
        return $this->enabled_at !== null;
    }
}
