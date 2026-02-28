<?php

namespace Tests\Feature\Auth;

use App\Models\TwoFactorRecoveryCode;
use App\Models\TwoFactorSecret;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TwoFactorAuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_enable_totp_2fa()
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
        $this->assertEquals('totp', $secret->type);
    }

    public function test_2fa_login_requires_totp_code_after_password()
    {
        $user = User::factory()->create();

        $secret = TwoFactorSecret::create([
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
    }

    public function test_invalid_totp_code_rejects_login()
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

        $response = $this->actingAs($user)
            ->post('/auth/2fa/verify', [
                'code' => '000000',
            ]);

        $response->assertSessionHasErrors();
    }

    public function test_recovery_code_allows_2fa_login()
    {
        $user = User::factory()->create();

        TwoFactorSecret::create([
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

        $response = $this->actingAs($user)
            ->post('/auth/2fa/recovery', [
                'code' => 'recovery-code-123',
            ]);

        $response->assertRedirect(route('dashboard', absolute: false));
    }

    public function test_recovery_code_is_single_use()
    {
        $user = User::factory()->create();

        TwoFactorSecret::create([
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

        $response = $this->actingAs($user)
            ->post('/auth/2fa/recovery', [
                'code' => 'recovery-code-123',
            ]);

        $response->assertRedirect(route('dashboard', absolute: false));

        \Illuminate\Support\Facades\Auth::logout();

        $user->refresh();
        $recoveryCode = TwoFactorRecoveryCode::where('user_id', $user->id)->first();
        $this->assertNotNull($recoveryCode->used_at);
    }

    public function test_user_can_disable_2fa_with_password_confirmation()
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

        $response = $this->actingAs($user)
            ->post('/profile/2fa/disable', [
                'password' => 'password',
            ]);

        $response->assertStatus(200);

        $user->refresh();
        $this->assertNull($user->two_factor_enabled_at);
        $this->assertNull($user->twoFactorSecret);
    }

    public function test_2fa_enabled_logged_in_audit_trail()
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

        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $user->id,
            'event_type' => 'user.2fa.enabled.totp',
        ]);
    }

    public function test_2fa_rate_limited_after_5_failed_attempts()
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

        for ($i = 0; $i < 5; $i++) {
            $this->actingAs($user)
                ->post('/auth/2fa/verify', ['code' => '000000']);
        }

        $response = $this->actingAs($user)
            ->post('/auth/2fa/verify', ['code' => '000000']);

        $response->assertStatus(429);
    }
}
