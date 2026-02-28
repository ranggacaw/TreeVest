<?php

namespace App\Services;

use App\Contracts\KycProviderInterface;
use App\Enums\AuditEventType;
use App\Enums\KycDocumentType;
use App\Enums\KycStatus;
use App\Models\KycDocument;
use App\Models\KycVerification;
use App\Models\User;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class KycVerificationService
{
    protected KycProviderInterface $provider;

    public function __construct(KycProviderInterface $provider)
    {
        $this->provider = $provider;
    }

    public function createVerification(User $user, string $jurisdiction = 'MY'): KycVerification
    {
        $verification = KycVerification::create([
            'user_id' => $user->id,
            'jurisdiction_code' => $jurisdiction,
            'status' => KycStatus::PENDING,
            'provider' => config('treevest.kyc.provider', 'manual'),
        ]);

        AuditLogService::log($user, AuditEventType::KYC_SUBMITTED, [
            'verification_id' => $verification->id,
            'jurisdiction' => $jurisdiction,
        ]);

        return $verification;
    }

    public function uploadDocument(
        KycVerification $verification,
        KycDocumentType $documentType,
        $file,
        string $originalFilename,
        string $mimeType,
        int $fileSize
    ): KycDocument {
        $filename = Str::uuid().'.'.pathinfo($originalFilename, PATHINFO_EXTENSION);
        $path = $verification->id.'/'.$filename;

        Storage::disk('kyc_documents')->put($path, $file);

        $document = KycDocument::create([
            'kyc_verification_id' => $verification->id,
            'document_type' => $documentType,
            'file_path' => $path,
            'original_filename' => $originalFilename,
            'mime_type' => $mimeType,
            'file_size' => $fileSize,
        ]);

        AuditLogService::log($verification->user, AuditEventType::KYC_SUBMITTED, [
            'verification_id' => $verification->id,
            'document_type' => $documentType->value,
            'filename' => $originalFilename,
        ]);

        return $document;
    }

    public function submitForReview(KycVerification $verification): bool
    {
        if (! $verification->hasRequiredDocuments()) {
            return false;
        }

        $referenceId = $this->provider->submitForVerification($verification);

        $verification->status = KycStatus::SUBMITTED;
        $verification->submitted_at = now();
        $verification->provider_reference_id = $referenceId;
        $verification->save();

        $verification->user->update([
            'kyc_status' => $verification->status,
        ]);

        $verification->user->notify(new \App\Notifications\KycSubmittedNotification($verification));

        return true;
    }

    public function approveVerification(KycVerification $verification, User $admin): bool
    {
        if (! $verification->isSubmitted()) {
            return false;
        }

        $expiryDays = config('treevest.kyc.expiry_period_days', 365);

        $verification->status = KycStatus::VERIFIED;
        $verification->verified_at = now();
        $verification->expires_at = now()->addDays($expiryDays);
        $verification->verified_by_admin_id = $admin->id;
        $verification->save();

        $verification->user->update([
            'kyc_status' => $verification->status,
            'kyc_verified_at' => $verification->verified_at,
            'kyc_expires_at' => $verification->expires_at,
        ]);

        AuditLogService::log($admin, AuditEventType::KYC_VERIFIED, [
            'verification_id' => $verification->id,
            'user_id' => $verification->user_id,
        ]);

        $verification->user->notify(new \App\Notifications\KycVerifiedNotification($verification));

        return true;
    }

    public function rejectVerification(KycVerification $verification, User $admin, string $reason): bool
    {
        if (! $verification->isSubmitted()) {
            return false;
        }

        $verification->status = KycStatus::REJECTED;
        $verification->rejected_at = now();
        $verification->rejection_reason = $reason;
        $verification->verified_by_admin_id = $admin->id;
        $verification->save();

        $verification->user->update([
            'kyc_status' => $verification->status,
        ]);

        AuditLogService::log($admin, AuditEventType::KYC_REJECTED, [
            'verification_id' => $verification->id,
            'user_id' => $verification->user_id,
            'reason' => $reason,
        ]);

        $verification->user->notify(new \App\Notifications\KycRejectedNotification($verification, $reason));

        return true;
    }

    public function checkExpiry(KycVerification $verification): bool
    {
        if (! $verification->isVerified()) {
            return false;
        }

        if ($verification->isExpired()) {
            return true;
        }

        return false;
    }

    public function getLatestVerification(User $user): ?KycVerification
    {
        return $user->kycVerifications()->latest()->first();
    }

    public function createOrUpdateVerification(User $user, string $jurisdiction = 'MY'): KycVerification
    {
        $verification = $this->getLatestVerification($user);

        if ($verification && $verification->status === KycStatus::PENDING) {
            return $verification;
        }

        return $this->createVerification($user, $jurisdiction);
    }
}
