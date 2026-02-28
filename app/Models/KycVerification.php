<?php

namespace App\Models;

use App\Enums\KycStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class KycVerification extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'jurisdiction_code',
        'status',
        'submitted_at',
        'verified_at',
        'rejected_at',
        'rejection_reason',
        'verified_by_admin_id',
        'expires_at',
        'provider',
        'provider_reference_id',
    ];

    protected function casts(): array
    {
        return [
            'status' => KycStatus::class,
            'submitted_at' => 'datetime',
            'verified_at' => 'datetime',
            'rejected_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function verifiedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by_admin_id');
    }

    public function documents(): HasMany
    {
        return $this->hasMany(KycDocument::class);
    }

    public function isPending(): bool
    {
        return $this->status === KycStatus::PENDING;
    }

    public function isSubmitted(): bool
    {
        return $this->status === KycStatus::SUBMITTED;
    }

    public function isVerified(): bool
    {
        return $this->status === KycStatus::VERIFIED;
    }

    public function isRejected(): bool
    {
        return $this->status === KycStatus::REJECTED;
    }

    public function isExpired(): bool
    {
        return $this->expires_at !== null && $this->expires_at->isPast();
    }

    public function hasRequiredDocuments(): bool
    {
        $requiredTypes = config('treevest.kyc.jurisdictions.'.$this->jurisdiction_code.'.required_documents', []);
        $existingTypes = $this->documents->pluck('document_type.value')->unique()->values()->toArray();

        return empty(array_diff($requiredTypes, $existingTypes));
    }
}
