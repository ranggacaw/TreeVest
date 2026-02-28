<?php

namespace Tests\Integration;

use App\Contracts\SmsServiceInterface;
use App\Services\PhoneVerificationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Tests\TestCase;

class SmsGatewayTest extends TestCase
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

    public function test_sms_delivery_success()
    {
        $this->smsServiceMock->shouldReceive('sendOtp')
            ->once()
            ->with('+60123456789', \Mockery::on(function ($code) {
                return is_numeric($code) && strlen($code) === 6;
            }))
            ->andReturn(true);

        $service = new PhoneVerificationService($this->smsServiceMock);
        $result = $service->sendVerificationCode('+60123456789');

        $this->assertTrue($result);
    }

    public function test_sms_delivery_network_error()
    {
        $this->smsServiceMock->shouldReceive('sendOtp')
            ->once()
            ->andThrow(new \Exception('Network error'));

        $service = new PhoneVerificationService($this->smsServiceMock);
        $result = $service->sendVerificationCode('+60123456789');

        $this->assertFalse($result);
    }

    public function test_sms_delivery_invalid_phone_number()
    {
        $this->smsServiceMock->shouldReceive('sendOtp')
            ->once()
            ->andThrow(new \Exception('Invalid phone number'));

        $service = new PhoneVerificationService($this->smsServiceMock);
        $result = $service->sendVerificationCode('+60123456789');

        $this->assertFalse($result);
    }

    public function test_sms_delivery_rate_limit_exceeded()
    {
        $this->smsServiceMock->shouldReceive('sendOtp')
            ->once()
            ->andThrow(new \Exception('Rate limit exceeded'));

        $service = new PhoneVerificationService($this->smsServiceMock);
        $result = $service->sendVerificationCode('+60123456789');

        $this->assertFalse($result);
    }

    public function test_sms_retry_logic_on_failure()
    {
        $this->smsServiceMock->shouldReceive('sendOtp')
            ->times(3)
            ->andReturn(false, false, true);

        $service = new PhoneVerificationService($this->smsServiceMock);

        for ($i = 0; $i < 3; $i++) {
            $result = $service->sendVerificationCode('+60123456789');
        }

        $this->assertTrue($result);
    }
}
