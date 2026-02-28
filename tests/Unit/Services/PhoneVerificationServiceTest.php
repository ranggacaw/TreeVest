<?php

namespace Tests\Unit\Services;

use App\Contracts\SmsServiceInterface;
use App\Models\PhoneVerification;
use App\Models\User;
use App\Services\PhoneVerificationService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Tests\TestCase;

class PhoneVerificationServiceTest extends TestCase
{
    use RefreshDatabase;

    protected $smsServiceMock;

    protected function setUp(): void
    {
        parent::setUp();
        $this->smsServiceMock = Mockery::mock(SmsServiceInterface::class);
        $this->app->instance(SmsServiceInterface::class, $this->smsServiceMock);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    public function test_generates_6_digit_otp_code()
    {
        $service = new PhoneVerificationService($this->smsServiceMock);

        $this->smsServiceMock->shouldReceive('sendOtp')
            ->once()
            ->andReturn(true);

        $service->sendVerificationCode('+1234567890');

        $verification = PhoneVerification::where('phone', '+1234567890')->first();
        $this->assertNotNull($verification);

        $code = app()->make('encrypter')->decrypt($verification->code);
        $this->assertMatchesRegularExpression('/^\d{6}$/', $code);
    }

    public function test_otp_code_expires_after_10_minutes()
    {
        $service = new PhoneVerificationService($this->smsServiceMock);

        $this->smsServiceMock->shouldReceive('sendOtp')
            ->once()
            ->andReturn(true);

        $service->sendVerificationCode('+1234567890');

        $verification = PhoneVerification::where('phone', '+1234567890')->first();
        $this->assertNotNull($verification);

        $expiresAt = Carbon::parse($verification->expires_at);
        $expectedExpiry = Carbon::now()->addMinutes(10);

        $this->assertEquals($expectedExpiry->timestamp, $expiresAt->timestamp);
    }

    public function test_otp_code_is_single_use()
    {
        $service = new PhoneVerificationService($this->smsServiceMock);

        $this->smsServiceMock->shouldReceive('sendOtp')
            ->once()
            ->andReturn(true);

        $service->sendVerificationCode('+1234567890');

        $verification = PhoneVerification::where('phone', '+1234567890')->first();
        $code = '123456';
        $verification->code = bcrypt($code);
        $verification->save();

        $isValid = $service->verifyCode('+1234567890', $code);
        $this->assertTrue($isValid);

        $isValidAgain = $service->verifyCode('+1234567890', $code);
        $this->assertFalse($isValidAgain);
    }

    public function test_phone_number_normalized_to_e164_format()
    {
        $service = new PhoneVerificationService($this->smsServiceMock);

        $this->smsServiceMock->shouldReceive('sendOtp')
            ->once()
            ->andReturn(true);

        $service->sendVerificationCode('1234567890');

        $verification = PhoneVerification::where('phone', '+1234567890')->first();
        $this->assertNotNull($verification);
    }

    public function test_resend_otp_invalidates_previous_code()
    {
        $service = new PhoneVerificationService($this->smsServiceMock);

        $this->smsServiceMock->shouldReceive('sendOtp')
            ->twice()
            ->andReturn(true);

        $service->sendVerificationCode('+1234567890');

        $firstVerification = PhoneVerification::where('phone', '+1234567890')->first();
        $firstCode = '123456';
        $firstVerification->code = bcrypt($firstCode);
        $firstVerification->save();

        $service->resendCode('+1234567890');

        $verifications = PhoneVerification::where('phone', '+1234567890')->get();
        $this->assertCount(1, $verifications);

        $isValid = $service->verifyCode('+1234567890', $firstCode);
        $this->assertFalse($isValid);
    }

    public function test_verify_code_fails_for_expired_otp()
    {
        $service = new PhoneVerificationService($this->smsServiceMock);

        $this->smsServiceMock->shouldReceive('sendOtp')
            ->once()
            ->andReturn(true);

        $service->sendVerificationCode('+1234567890');

        $verification = PhoneVerification::where('phone', '+1234567890')->first();
        $verification->expires_at = Carbon::now()->subMinute();
        $verification->code = bcrypt('123456');
        $verification->save();

        $isValid = $service->verifyCode('+1234567890', '123456');
        $this->assertFalse($isValid);
    }

    public function test_mark_phone_as_verified()
    {
        $user = User::factory()->create([
            'phone' => '+1234567890',
            'phone_verified_at' => null,
        ]);

        PhoneVerification::create([
            'phone' => '+1234567890',
            'code' => bcrypt('123456'),
            'expires_at' => Carbon::now()->addMinutes(10),
        ]);

        $service = new PhoneVerificationService($this->smsServiceMock);
        $service->markPhoneAsVerified($user);

        $user->refresh();
        $this->assertNotNull($user->phone_verified_at);

        $this->assertDatabaseMissing('phone_verifications', [
            'phone' => '+1234567890',
        ]);
    }
}
