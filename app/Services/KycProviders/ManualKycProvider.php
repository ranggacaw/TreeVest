<?php

namespace App\Services\KycProviders;

use App\Contracts\KycProviderInterface;
use App\Models\KycVerification;

class ManualKycProvider implements KycProviderInterface
{
    public function submitForVerification(KycVerification $verification): string
    {
        return 'manual-'.$verification->id;
    }

    public function checkVerificationStatus(string $referenceId): array
    {
        $verificationId = str_replace('manual-', '', $referenceId);
        $verification = KycVerification::find($verificationId);

        if (! $verification) {
            return [
                'status' => 'not_found',
                'message' => 'Verification record not found',
            ];
        }

        return [
            'status' => $verification->status->value,
            'message' => $verification->rejection_reason ?? 'Pending manual review',
            'verified_at' => $verification->verified_at?->toIso8601String(),
            'rejected_at' => $verification->rejected_at?->toIso8601String(),
        ];
    }

    public function cancelVerification(string $referenceId): bool
    {
        $verificationId = str_replace('manual-', '', $referenceId);
        $verification = KycVerification::find($verificationId);

        if (! $verification || ! $verification->isSubmitted()) {
            return false;
        }

        $verification->status = 'pending';
        $verification->submitted_at = null;
        $verification->provider_reference_id = null;
        $verification->save();

        return true;
    }

    public function handleWebhook(array $payload, string $signature): bool
    {
        return false;
    }
}
