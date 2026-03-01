<?php

namespace App\Models;

use App\Enums\NotificationChannel;
use App\Enums\NotificationType;
// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'email_verified_at',
        'phone',
        'phone_country_code',
        'phone_verified_at',
        'avatar_url',
        'password',
        'role',
        'two_factor_enabled_at',
        'last_login_at',
        'last_login_ip',
        'kyc_status',
        'kyc_verified_at',
        'kyc_expires_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'phone_verified_at' => 'datetime',
            'two_factor_enabled_at' => 'datetime',
            'last_login_at' => 'datetime',
            'password' => 'hashed',
            'phone' => 'encrypted',
            'kyc_document_url' => 'encrypted',
            'role' => 'string',
        ];
    }

    public function oauthProviders()
    {
        return $this->hasMany(OAuthProvider::class);
    }

    public function twoFactorSecret()
    {
        return $this->hasOne(TwoFactorSecret::class);
    }

    public function twoFactorRecoveryCodes()
    {
        return $this->hasMany(TwoFactorRecoveryCode::class);
    }

    public function hasTwoFactorEnabled(): bool
    {
        return $this->two_factor_enabled_at !== null && $this->twoFactorSecret !== null;
    }

    public function hasVerifiedEmail(): bool
    {
        return $this->email_verified_at !== null;
    }

    public function hasVerifiedPhone(): bool
    {
        return $this->phone_verified_at !== null;
    }

    public function hasContact(): bool
    {
        return $this->email !== null || $this->phone !== null;
    }

    public function isInvestor(): bool
    {
        return $this->role === 'investor';
    }

    public function isFarmOwner(): bool
    {
        return $this->role === 'farm_owner';
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function hasRole(string $role): bool
    {
        return $this->role === $role;
    }

    public function kycVerifications()
    {
        return $this->hasMany(\App\Models\KycVerification::class);
    }

    public function latestKycVerification()
    {
        return $this->hasOne(\App\Models\KycVerification::class)->latestOfMany();
    }

    public function hasVerifiedKyc(): bool
    {
        return $this->kyc_status === 'verified' && $this->kyc_verified_at !== null;
    }

    public function needsKycReverification(): bool
    {
        if (! $this->hasVerifiedKyc()) {
            return false;
        }

        return $this->kyc_expires_at !== null && $this->kyc_expires_at->isPast();
    }

    public function canInvest(): bool
    {
        return $this->hasVerifiedKyc() && ! $this->needsKycReverification();
    }

    public function isKycValid(): bool
    {
        return $this->hasVerifiedKyc() && ! $this->needsKycReverification();
    }

    public function notificationPreferences()
    {
        return $this->hasMany(NotificationPreference::class);
    }

    public function getNotificationPreference(NotificationType|string $type, NotificationChannel|string $channel): ?NotificationPreference
    {
        return $this->notificationPreferences()
            ->forType($type)
            ->forChannel($channel)
            ->first();
    }

    public function paymentMethods()
    {
        return $this->hasMany(PaymentMethod::class);
    }
}
