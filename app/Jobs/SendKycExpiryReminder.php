<?php

namespace App\Jobs;

use App\Models\KycVerification;
use App\Notifications\KycExpiryReminderNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class SendKycExpiryReminder implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public KycVerification $verification,
        public int $daysUntilExpiry
    ) {}

    public function handle(): void
    {
        if ($this->verification->user) {
            $this->verification->user->notify(
                new KycExpiryReminderNotification($this->verification, $this->daysUntilExpiry)
            );
        }
    }
}
