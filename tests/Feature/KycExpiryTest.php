<?php

namespace Tests\Feature;

use App\Enums\KycStatus;
use App\Jobs\CheckKycExpiry;
use App\Jobs\SendKycExpiryReminder;
use App\Models\KycVerification;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class KycExpiryTest extends TestCase
{
    use RefreshDatabase;

    public function test_check_kyc_expiry_job_finds_expiring_verifications()
    {
        $reminderDays = config('treevest.kyc.expiry_reminder_days.0', 30);

        $userExpiring = User::factory()->create([
            'kyc_status' => 'verified',
            'kyc_expires_at' => now()->addDays($reminderDays - 1),
        ]);
        KycVerification::factory()->create([
            'user_id' => $userExpiring->id,
            'status' => KycStatus::VERIFIED,
            'expires_at' => now()->addDays($reminderDays - 1),
        ]);

        $userNotExpiring = User::factory()->create([
            'kyc_status' => 'verified',
            'kyc_expires_at' => now()->addDays($reminderDays + 1),
        ]);
        KycVerification::factory()->create([
            'user_id' => $userNotExpiring->id,
            'status' => KycStatus::VERIFIED,
            'expires_at' => now()->addDays($reminderDays + 1),
        ]);

        $job = new CheckKycExpiry;
        $job->handle();

        $this->assertDatabaseHas('kyc_verifications', [
            'user_id' => $userExpiring->id,
            'status' => KycStatus::VERIFIED,
        ]);
    }

    public function test_send_kyc_expiry_reminder_job_sends_notification()
    {
        Notification::fake();

        $user = User::factory()->create([
            'kyc_status' => 'verified',
            'kyc_expires_at' => now()->addDays(25),
        ]);
        $verification = KycVerification::factory()->create([
            'user_id' => $user->id,
            'status' => KycStatus::VERIFIED,
            'expires_at' => now()->addDays(25),
        ]);

        $job = new SendKycExpiryReminder($verification, 25);
        $job->handle();

        Notification::assertSentTo(
            $user,
            \App\Notifications\KycExpiryReminderNotification::class
        );
    }

    public function test_expired_kyc_status_is_handled()
    {
        $user = User::factory()->create([
            'kyc_status' => 'verified',
            'kyc_verified_at' => now()->subYear(),
            'kyc_expires_at' => now()->subDay(),
        ]);

        $verification = KycVerification::factory()->create([
            'user_id' => $user->id,
            'status' => KycStatus::VERIFIED,
            'verified_at' => now()->subYear(),
            'expires_at' => now()->subDay(),
        ]);

        $this->assertTrue($verification->isExpired());
    }

    public function test_kyc_expiry_reminder_scheduled_correctly()
    {
        Queue::fake();

        $user = User::factory()->create([
            'kyc_status' => 'verified',
            'kyc_expires_at' => now()->addDays(29),
        ]);
        KycVerification::factory()->create([
            'user_id' => $user->id,
            'status' => KycStatus::VERIFIED,
            'expires_at' => now()->addDays(29),
        ]);

        $job = new CheckKycExpiry;
        $job->handle();

        Queue::assertPushed(SendKycExpiryReminder::class);
    }
}
