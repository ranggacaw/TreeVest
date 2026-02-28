<?php

namespace App\Jobs;

use App\Models\KycVerification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class ProcessKycVerification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public KycVerification $verification
    ) {}

    public function handle(): void
    {
        $provider = app(\App\Contracts\KycProviderInterface::class);
        $status = $provider->checkVerificationStatus($this->verification->provider_reference_id);

        if ($status['status'] === 'verified') {
            $service = app(\App\Services\KycVerificationService::class);
            $admin = \App\Models\User::where('role', 'admin')->first();

            if ($admin) {
                $service->approveVerification($this->verification, $admin);
            }
        }
    }
}
