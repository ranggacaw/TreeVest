<?php

namespace App\Contracts;

use App\Models\KycVerification;

interface KycProviderInterface
{
    public function submitForVerification(KycVerification $verification): string;

    public function checkVerificationStatus(string $referenceId): array;

    public function cancelVerification(string $referenceId): bool;

    public function handleWebhook(array $payload, string $signature): bool;
}
