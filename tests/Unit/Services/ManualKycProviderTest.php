<?php

namespace Tests\Unit\Services;

use App\Enums\KycStatus;
use App\Models\KycVerification;
use App\Models\User;
use App\Services\KycProviders\ManualKycProvider;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ManualKycProviderTest extends TestCase
{
    use RefreshDatabase;

    protected ManualKycProvider $provider;

    protected function setUp(): void
    {
        parent::setUp();
        $this->provider = new ManualKycProvider;
    }

    public function test_submit_for_verification_returns_reference_id()
    {
        $user = User::factory()->create();
        $verification = KycVerification::factory()->create([
            'user_id' => $user->id,
            'status' => KycStatus::PENDING,
        ]);

        $referenceId = $this->provider->submitForVerification($verification);

        $this->assertEquals('manual-'.$verification->id, $referenceId);
    }

    public function test_check_verification_status_returns_pending()
    {
        $user = User::factory()->create();
        $verification = KycVerification::factory()->create([
            'user_id' => $user->id,
            'status' => KycStatus::SUBMITTED,
        ]);

        $result = $this->provider->checkVerificationStatus('manual-'.$verification->id);

        $this->assertEquals('submitted', $result['status']);
    }

    public function test_check_verification_status_returns_verified()
    {
        $user = User::factory()->create();
        $verification = KycVerification::factory()->create([
            'user_id' => $user->id,
            'status' => KycStatus::VERIFIED,
            'verified_at' => now(),
        ]);

        $result = $this->provider->checkVerificationStatus('manual-'.$verification->id);

        $this->assertEquals('verified', $result['status']);
        $this->assertNotNull($result['verified_at']);
    }

    public function test_check_verification_status_returns_rejected()
    {
        $user = User::factory()->create();
        $verification = KycVerification::factory()->create([
            'user_id' => $user->id,
            'status' => KycStatus::REJECTED,
            'rejected_at' => now(),
            'rejection_reason' => 'Documents unclear',
        ]);

        $result = $this->provider->checkVerificationStatus('manual-'.$verification->id);

        $this->assertEquals('rejected', $result['status']);
        $this->assertEquals('Documents unclear', $result['message']);
    }

    public function test_check_verification_status_returns_not_found()
    {
        $result = $this->provider->checkVerificationStatus('manual-99999');

        $this->assertEquals('not_found', $result['status']);
    }

    public function test_cancel_verification_succeeds_for_submitted()
    {
        $user = User::factory()->create();
        $verification = KycVerification::factory()->create([
            'user_id' => $user->id,
            'status' => KycStatus::SUBMITTED,
            'submitted_at' => now(),
        ]);
        $verification->provider_reference_id = 'manual-'.$verification->id;
        $verification->save();

        $result = $this->provider->cancelVerification('manual-'.$verification->id);

        $this->assertTrue($result);
        $this->assertEquals(KycStatus::PENDING, $verification->refresh()->status);
        $this->assertNull($verification->refresh()->submitted_at);
    }

    public function test_cancel_verification_fails_for_non_submitted()
    {
        $user = User::factory()->create();
        $verification = KycVerification::factory()->create([
            'user_id' => $user->id,
            'status' => KycStatus::PENDING,
        ]);

        $result = $this->provider->cancelVerification('manual-'.$verification->id);

        $this->assertFalse($result);
    }

    public function test_cancel_verification_fails_for_invalid_reference()
    {
        $result = $this->provider->cancelVerification('manual-99999');

        $this->assertFalse($result);
    }

    public function test_handle_webhook_returns_false()
    {
        $result = $this->provider->handleWebhook([], 'signature');

        $this->assertFalse($result);
    }
}
