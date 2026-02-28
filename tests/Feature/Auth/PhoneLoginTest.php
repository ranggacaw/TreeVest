<?php

namespace Tests\Feature\Auth;

use App\Models\PhoneVerification;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PhoneLoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_login_with_phone_screen()
    {
        $response = $this->get('/login/phone');

        $response->assertStatus(200);
    }

    public function test_phone_login_sends_otp()
    {
        $user = User::factory()->create(['phone' => '+60123456789']);

        $response = $this->post('/auth/phone/login', [
            'phone' => '+60123456789',
        ]);

        $response->assertStatus(302);

        $verification = PhoneVerification::where('phone', '+60123456789')->first();
        $this->assertNotNull($verification);
    }

    public function test_user_can_login_with_phone_and_otp()
    {
        $user = User::factory()->create(['phone' => '+60123456789']);

        PhoneVerification::create([
            'phone' => '+60123456789',
            'code' => bcrypt('123456'),
            'expires_at' => now()->addMinutes(10),
        ]);

        $response = $this->post('/auth/phone/verify-login', [
            'phone' => '+60123456789',
            'code' => '123456',
        ]);

        $this->assertAuthenticatedAs($user);
        $response->assertRedirect(route('dashboard', absolute: false));
    }

    public function test_invalid_otp_rejects_login()
    {
        $user = User::factory()->create(['phone' => '+60123456789']);

        PhoneVerification::create([
            'phone' => '+60123456789',
            'code' => bcrypt('123456'),
            'expires_at' => now()->addMinutes(10),
        ]);

        $this->post('/auth/phone/verify-login', [
            'phone' => '+60123456789',
            'code' => '000000',
        ]);

        $this->assertGuest();
    }

    public function test_expired_otp_rejects_login()
    {
        $user = User::factory()->create(['phone' => '+60123456789']);

        PhoneVerification::create([
            'phone' => '+60123456789',
            'code' => bcrypt('123456'),
            'expires_at' => now()->subMinute(),
        ]);

        $this->post('/auth/phone/verify-login', [
            'phone' => '+60123456789',
            'code' => '123456',
        ]);

        $this->assertGuest();
    }

    public function test_phone_login_fails_for_nonexistent_phone()
    {
        $response = $this->post('/auth/phone/login', [
            'phone' => '+60987654321',
        ]);

        $response->assertSessionHasErrors();
    }
}
