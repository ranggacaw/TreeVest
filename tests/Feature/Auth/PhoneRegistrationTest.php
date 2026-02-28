<?php

namespace Tests\Feature\Auth;

use App\Models\PhoneVerification;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class PhoneRegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register_with_phone_number()
    {
        $response = $this->get('/register/phone');

        $response->assertStatus(200);
    }

    public function test_phone_registration_sends_otp()
    {
        Cache::shouldReceive('remember')
            ->once()
            ->andReturn(0);

        $response = $this->post('/auth/phone/register', [
            'phone' => '+60123456789',
            'country_code' => 'MY',
        ]);

        $response->assertStatus(302);

        $verification = PhoneVerification::where('phone', '+60123456789')->first();
        $this->assertNotNull($verification);
    }

    public function test_phone_registration_requires_otp_verification()
    {
        $response = $this->post('/auth/phone/verify', [
            'phone' => '+60123456789',
            'code' => '123456',
        ]);

        $response->assertStatus(302);
    }

    public function test_invalid_otp_rejects_registration()
    {
        PhoneVerification::create([
            'phone' => '+60123456789',
            'code' => bcrypt('123456'),
            'expires_at' => now()->addMinutes(10),
        ]);

        $response = $this->post('/auth/phone/verify', [
            'phone' => '+60123456789',
            'code' => '000000',
            'name' => 'John Doe',
        ]);

        $this->assertGuest();
    }

    public function test_expired_otp_rejects_verification()
    {
        PhoneVerification::create([
            'phone' => '+60123456789',
            'code' => bcrypt('123456'),
            'expires_at' => now()->subMinute(),
        ]);

        $response = $this->post('/auth/phone/verify', [
            'phone' => '+60123456789',
            'code' => '123456',
            'name' => 'John Doe',
        ]);

        $this->assertGuest();
    }

    public function test_phone_registration_rate_limited_after_5_attempts()
    {
        Cache::shouldReceive('remember')
            ->times(5)
            ->andReturn(4);

        for ($i = 0; $i < 5; $i++) {
            $this->post('/auth/phone/register', [
                'phone' => '+60123456789',
                'country_code' => 'MY',
            ]);
        }

        Cache::shouldReceive('remember')
            ->once()
            ->andReturn(5);

        $response = $this->post('/auth/phone/register', [
            'phone' => '+60123456789',
            'country_code' => 'MY',
        ]);

        $response->assertStatus(429);
    }

    public function test_successful_phone_registration_creates_user()
    {
        PhoneVerification::create([
            'phone' => '+60123456789',
            'code' => bcrypt('123456'),
            'expires_at' => now()->addMinutes(10),
        ]);

        $response = $this->post('/auth/phone/verify', [
            'phone' => '+60123456789',
            'code' => '123456',
            'name' => 'John Doe',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));

        $user = User::where('phone', '+60123456789')->first();
        $this->assertNotNull($user);
        $this->assertEquals('John Doe', $user->name);
    }
}
