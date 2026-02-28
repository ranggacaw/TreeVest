<?php

namespace Tests\EndToEnd;

use App\Models\OAuthProvider;
use App\Models\PhoneVerification;
use App\Models\TwoFactorRecoveryCode;
use App\Models\TwoFactorSecret;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Socialite\Facades\Socialite;
use Mockery;
use Tests\TestCase;

class AuthenticationFlowsTest extends TestCase
{
    use RefreshDatabase;

    public function test_complete_phone_registration_flow()
    {
        $response = $this->post('/auth/phone/register', [
            'phone' => '+60123456789',
            'country_code' => 'MY',
        ]);

        $verification = PhoneVerification::where('phone', '+60123456789')->first();
        $this->assertNotNull($verification);

        $verification->code = bcrypt('123456');
        $verification->save();

        $response = $this->post('/auth/phone/verify', [
            'phone' => '+60123456789',
            'code' => '123456',
            'name' => 'John Doe',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));

        $user = User::where('phone', '+60123456789')->first();
        $this->assertNotNull($user);

        $response = $this->post('/auth/phone/login', [
            'phone' => '+60123456789',
        ]);

        $verification = PhoneVerification::where('phone', '+60123456789')->first();
        $verification->code = bcrypt('654321');
        $verification->save();

        $response = $this->post('/auth/phone/verify-login', [
            'phone' => '+60123456789',
            'code' => '654321',
        ]);

        $this->assertAuthenticatedAs($user);
    }

    public function test_complete_oauth_registration_flow()
    {
        $socialiteUser = Mockery::mock('Laravel\Socialite\Contracts\User');
        $socialiteUser->shouldReceive('getId')->andReturn('123');
        $socialiteUser->shouldReceive('getEmail')->andReturn('test@example.com');
        $socialiteUser->shouldReceive('getName')->andReturn('Test User');
        $socialiteUser->shouldReceive('getToken')->andReturn('access-token');
        $socialiteUser->shouldReceive('getRefreshToken')->andReturn('refresh-token');
        $socialiteUser->shouldReceive('getExpiresIn')->andReturn(3600);

        Socialite::shouldReceive('driver->stateless->user')
            ->once()
            ->andReturn($socialiteUser);

        $response = $this->get('/auth/google/callback');

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));

        $user = User::where('email', 'test@example.com')->first();
        $this->assertNotNull($user);

        $oauthProvider = OAuthProvider::where('user_id', $user->id)->first();
        $this->assertNotNull($oauthProvider);
        $this->assertEquals('google', $oauthProvider->provider);
    }

    public function test_complete_2fa_setup_flow()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->post('/profile/2fa/enable', [
                'type' => 'totp',
                'password' => 'password',
            ]);

        $response->assertStatus(200);

        $user->refresh();
        $secret = $user->twoFactorSecret;
        $this->assertNotNull($secret);

        $validCode = app()->make('Pragmarx\Google2FA\Google2FA')->getCurrentOtp($secret->secret);

        $response = $this->actingAs($user)
            ->post('/profile/2fa/confirm', [
                'code' => $validCode,
            ]);

        $response->assertStatus(200);

        $user->refresh();
        $this->assertNotNull($user->two_factor_enabled_at);

        $recoveryCodes = TwoFactorRecoveryCode::where('user_id', $user->id)->get();
        $this->assertCount(8, $recoveryCodes);
    }

    public function test_complete_2fa_login_flow()
    {
        $user = User::factory()->create();

        $secret = TwoFactorSecret::create([
            'user_id' => $user->id,
            'type' => 'totp',
            'secret' => 'test-secret',
            'enabled_at' => now(),
        ]);

        TwoFactorRecoveryCode::create([
            'user_id' => $user->id,
            'code' => bcrypt('recovery-code-123'),
        ]);

        $user->two_factor_enabled_at = now();
        $user->save();

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $response->assertRedirect(route('auth.2fa.challenge'));

        $validCode = app()->make('Pragmarx\Google2FA\Google2FA')->getCurrentOtp($secret->secret);

        $response = $this->post('/auth/2fa/verify', [
            'code' => $validCode,
        ]);

        $this->assertAuthenticatedAs($user);
        $response->assertRedirect(route('dashboard', absolute: false));
    }

    public function test_profile_update_flow()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->post('/profile/phone/update', [
                'phone' => '+60123456789',
            ]);

        $response->assertRedirect(route('profile.phone.verify'));

        PhoneVerification::create([
            'phone' => '+60123456789',
            'code' => bcrypt('123456'),
            'expires_at' => now()->addMinutes(10),
        ]);

        $response = $this->actingAs($user)
            ->post('/profile/phone/verify', [
                'phone' => '+60123456789',
                'code' => '123456',
            ]);

        $response->assertSessionHasNoErrors();

        $user->refresh();
        $this->assertEquals('+60123456789', $user->phone);

        $response = $this->actingAs($user)
            ->patch('/profile', [
                'name' => 'Updated Name',
                'email' => $user->email,
            ]);

        $response->assertSessionHasNoErrors();

        $user->refresh();
        $this->assertEquals('Updated Name', $user->name);
    }

    public function test_account_deactivation_flow()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->post('/profile/deactivate');

        $response->assertRedirect(route('dashboard', absolute: false));

        $this->assertGuest();

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $response->assertSessionHasErrors();
    }

    public function test_expired_otp_edge_case()
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

    public function test_invalid_2fa_code_edge_case()
    {
        $user = User::factory()->create();

        TwoFactorSecret::create([
            'user_id' => $user->id,
            'type' => 'totp',
            'secret' => 'test-secret',
            'enabled_at' => now(),
        ]);

        $user->two_factor_enabled_at = now();
        $user->save();

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $response->assertRedirect(route('auth.2fa.challenge'));

        $response = $this->post('/auth/2fa/verify', [
            'code' => '000000',
        ]);

        $response->assertSessionHasErrors();
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
}
