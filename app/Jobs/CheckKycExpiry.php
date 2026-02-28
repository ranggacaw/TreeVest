<?php

namespace App\Jobs;

use App\Enums\AuditEventType;
use App\Models\KycVerification;
use App\Services\AuditLogService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class CheckKycExpiry implements ShouldQueue
{
    use Queueable;

    public function handle(): void
    {
        $reminderDays = config('treevest.kyc.expiry_reminder_days', [30, 14, 7]);

        KycVerification::where('status', 'verified')
            ->whereNotNull('expires_at')
            ->where('expires_at', '>', now())
            ->get()
            ->each(function (KycVerification $verification) use ($reminderDays) {
                $daysUntilExpiry = now()->diffInDays($verification->expires_at, false);

                if (in_array($daysUntilExpiry, $reminderDays)) {
                    dispatch(new SendKycExpiryReminder($verification, $daysUntilExpiry));
                }
            });

        AuditLogService::logSystemEvent(AuditEventType::KYC_EXPIRY_CHECKED, [
            'checked_count' => KycVerification::where('status', 'verified')->count(),
        ]);
    }
}
