<?php

namespace Tests\Unit\Services;

use App\Models\TwoFactorRecoveryCode;
use App\Models\TwoFactorSecret;
use App\Models\User;
use App\Services\TwoFactorAuthService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TwoFactorAuthServiceTest extends TestCase
{
    use RefreshDatabase;

    protected TwoFactorAuthService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new TwoFactorAuthService;
    }

    public function test_totp_secret_is_generated()
    {
        $user = User::factory()->create(['email' => 'test@example.com']);

        $result = $this->service->enableTotp($user);

        $this->assertArrayHasKey('secret', $result);
        $this->assertArrayHasKey('qr_code_url', $result);
        $this->assertArrayHasKey('recovery_codes', $result);
        $this->assertIsString($result['secret']);
        $this->assertGreaterThan(16, strlen($result['secret']));
        $this->assertCount(8, $result['recovery_codes']);
    }

    public function test_totp_secret_is_stored_in_database()
    {
        $user = User::factory()->create();

        $result = $this->service->enableTotp($user);

        $secret = TwoFactorSecret::where('user_id', $user->id)->first();
        $this->assertNotNull($secret);
        $this->assertEquals('totp', $secret->type);
        $this->assertEquals($result['secret'], $secret->secret);
        $this->assertNull($secret->enabled_at);
    }

    public function test_totp_verification_accepts_valid_code()
    {
        $user = User::factory()->create();

        $result = $this->service->enableTotp($user);
        $secret = $result['secret'];

        $this->service->confirmEnable($user);

        $validCode = app()->make('Pragmarx\Google2FA\Google2FA')->getCurrentOtp($secret);

        $isValid = $this->service->verify($user, $validCode);
        $this->assertTrue($isValid);
    }

    public function test_totp_verification_rejects_invalid_code()
    {
        $user = User::factory()->create();

        $this->service->enableTotp($user);
        $this->service->confirmEnable($user);

        $isValid = $this->service->verify($user, '000000');
        $this->assertFalse($isValid);
    }

    public function test_totp_verification_fails_when_not_enabled()
    {
        $user = User::factory()->create();

        $this->service->enableTotp($user);

        $isValid = $this->service->verify($user, '123456');
        $this->assertFalse($isValid);
    }

    public function test_recovery_codes_are_single_use()
    {
        $user = User::factory()->create();

        $this->service->enableTotp($user);
        $this->service->confirmEnable($user);

        $recoveryCode = TwoFactorRecoveryCode::where('user_id', $user->id)->first();
        $code = 'recovery-code-123';

        $recoveryCode->code = bcrypt($code);
        $recoveryCode->save();

        $isValid = $this->service->verifyRecoveryCode($user, $code);
        $this->assertTrue($isValid);

        $isValidAgain = $this->service->verifyRecoveryCode($user, $code);
        $this->assertFalse($isValidAgain);
    }

    public function test_recovery_code_regeneration_invalidates_old_codes()
    {
        $user = User::factory()->create();

        $this->service->enableTotp($user);
        $this->service->confirmEnable($user);

        $oldRecoveryCode = TwoFactorRecoveryCode::where('user_id', $user->id)->first();
        $oldCode = 'old-code-123';
        $oldRecoveryCode->code = bcrypt($oldCode);
        $oldRecoveryCode->save();

        $newCodes = $this->service->regenerateRecoveryCodes($user);

        $this->assertCount(8, $newCodes);

        $isValid = $this->service->verifyRecoveryCode($user, $oldCode);
        $this->assertFalse($isValid);

        $this->assertCount(8, TwoFactorRecoveryCode::where('user_id', $user->id)->get());
    }

    public function test_sms_2fa_can_be_enabled()
    {
        $user = User::factory()->create(['phone' => '+1234567890']);

        $result = $this->service->enableSms($user);
        $this->assertTrue($result);

        $secret = TwoFactorSecret::where('user_id', $user->id)->first();
        $this->assertNotNull($secret);
        $this->assertEquals('sms', $secret->type);
        $this->assertEquals($user->phone, $secret->secret);
    }

    public function test_disable_2fa_removes_secret_and_recovery_codes()
    {
        $user = User::factory()->create();

        $this->service->enableTotp($user);
        $this->service->confirmEnable($user);

        $result = $this->service->disable($user);
        $this->assertTrue($result);

        $this->assertNull($user->fresh()->twoFactorSecret);
        $this->assertCount(0, TwoFactorRecoveryCode::where('user_id', $user->id)->get());
        $this->assertNull($user->fresh()->two_factor_enabled_at);
    }

    public function test_confirm_enable_marks_2fa_as_enabled()
    {
        $user = User::factory()->create();

        $this->service->enableTotp($user);
        $this->service->confirmEnable($user);

        $user->refresh();
        $this->assertNotNull($user->two_factor_enabled_at);

        $secret = $user->twoFactorSecret;
        $this->assertNotNull($secret->enabled_at);

        $this->assertCount(8, TwoFactorRecoveryCode::where('user_id', $user->id)->get());
    }

    public function test_recovery_codes_are_stored_hashed()
    {
        $user = User::factory()->create();

        $this->service->enableTotp($user);
        $this->service->confirmEnable($user);

        $recoveryCodes = TwoFactorRecoveryCode::where('user_id', $user->id)->get();
        $this->assertGreaterThan(0, $recoveryCodes->count());

        foreach ($recoveryCodes as $recoveryCode) {
            $this->assertTrue(password_verify('test', $recoveryCode->code) === false);
        }
    }

    public function test_verify_fails_when_no_secret_exists()
    {
        $user = User::factory()->create();

        $isValid = $this->service->verify($user, '123456');
        $this->assertFalse($isValid);
    }

    public function test_verify_recovery_code_fails_for_used_code()
    {
        $user = User::factory()->create();

        $this->service->enableTotp($user);
        $this->service->confirmEnable($user);

        $recoveryCode = TwoFactorRecoveryCode::where('user_id', $user->id)->first();
        $code = 'recovery-code-123';

        $recoveryCode->code = bcrypt($code);
        $recoveryCode->used_at = Carbon::now();
        $recoveryCode->save();

        $isValid = $this->service->verifyRecoveryCode($user, $code);
        $this->assertFalse($isValid);
    }
}
