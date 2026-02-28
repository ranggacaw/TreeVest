<?php

namespace Tests\Unit\Models;

use App\Models\OAuthProvider;
use App\Models\TwoFactorRecoveryCode;
use App\Models\TwoFactorSecret;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_has_many_oauth_providers()
    {
        $user = User::factory()->create();

        OAuthProvider::create([
            'user_id' => $user->id,
            'provider' => 'google',
            'provider_user_id' => '123',
            'access_token' => 'token',
            'expires_at' => null,
        ]);

        OAuthProvider::create([
            'user_id' => $user->id,
            'provider' => 'facebook',
            'provider_user_id' => '456',
            'access_token' => 'token',
            'expires_at' => null,
        ]);

        $this->assertCount(2, $user->oauthProviders);
        $this->assertEquals('google', $user->oauthProviders->first()->provider);
    }

    public function test_user_has_one_two_factor_secret()
    {
        $user = User::factory()->create();

        TwoFactorSecret::create([
            'user_id' => $user->id,
            'type' => 'totp',
            'secret' => 'test-secret',
            'enabled_at' => now(),
        ]);

        $this->assertInstanceOf(TwoFactorSecret::class, $user->twoFactorSecret);
        $this->assertEquals('test-secret', $user->twoFactorSecret->secret);
    }

    public function test_user_has_many_two_factor_recovery_codes()
    {
        $user = User::factory()->create();

        TwoFactorRecoveryCode::create([
            'user_id' => $user->id,
            'code' => bcrypt('code1'),
        ]);

        TwoFactorRecoveryCode::create([
            'user_id' => $user->id,
            'code' => bcrypt('code2'),
        ]);

        $this->assertCount(2, $user->twoFactorRecoveryCodes);
    }

    public function test_has_two_factor_enabled_returns_true_when_enabled()
    {
        $user = User::factory()->create([
            'two_factor_enabled_at' => now(),
        ]);

        TwoFactorSecret::create([
            'user_id' => $user->id,
            'type' => 'totp',
            'secret' => 'test-secret',
            'enabled_at' => now(),
        ]);

        $this->assertTrue($user->hasTwoFactorEnabled());
    }

    public function test_has_two_factor_enabled_returns_false_when_not_enabled()
    {
        $user = User::factory()->create([
            'two_factor_enabled_at' => null,
        ]);

        $this->assertFalse($user->hasTwoFactorEnabled());
    }

    public function test_has_two_factor_enabled_returns_false_when_no_secret()
    {
        $user = User::factory()->create([
            'two_factor_enabled_at' => now(),
        ]);

        $this->assertFalse($user->hasTwoFactorEnabled());
    }

    public function test_has_verified_email_returns_true()
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        $this->assertTrue($user->hasVerifiedEmail());
    }

    public function test_has_verified_email_returns_false()
    {
        $user = User::factory()->create([
            'email_verified_at' => null,
        ]);

        $this->assertFalse($user->hasVerifiedEmail());
    }

    public function test_has_verified_phone_returns_true()
    {
        $user = User::factory()->create([
            'phone_verified_at' => now(),
        ]);

        $this->assertTrue($user->hasVerifiedPhone());
    }

    public function test_has_verified_phone_returns_false()
    {
        $user = User::factory()->create([
            'phone_verified_at' => null,
        ]);

        $this->assertFalse($user->hasVerifiedPhone());
    }

    public function test_has_contact_returns_true_when_email_exists()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'phone' => null,
        ]);

        $this->assertTrue($user->hasContact());
    }

    public function test_has_contact_returns_true_when_phone_exists()
    {
        $user = User::factory()->create([
            'email' => null,
            'phone' => '+1234567890',
        ]);

        $this->assertTrue($user->hasContact());
    }

    public function test_has_contact_returns_false_when_neither_exists()
    {
        $user = User::factory()->create([
            'email' => null,
            'phone' => null,
        ]);

        $this->assertFalse($user->hasContact());
    }

    public function test_phone_is_encrypted()
    {
        $user = User::factory()->create([
            'phone' => '+1234567890',
        ]);

        $this->assertNotEquals('+1234567890', $user->getAttributes()['phone']);
        $this->assertEquals('+1234567890', $user->phone);
    }

    public function test_new_relationships_accessible()
    {
        $user = User::factory()->create();

        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Relations\HasMany::class, $user->oauthProviders());
        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Relations\HasOne::class, $user->twoFactorSecret());
        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Relations\HasMany::class, $user->twoFactorRecoveryCodes());
    }

    public function test_soft_deletes_enabled()
    {
        $user = User::factory()->create();

        $user->delete();

        $this->assertSoftDeleted('users', [
            'id' => $user->id,
        ]);
    }

    public function test_has_verified_kyc_returns_true_when_verified()
    {
        $user = User::factory()->create([
            'kyc_status' => 'verified',
            'kyc_verified_at' => now(),
        ]);

        $this->assertTrue($user->hasVerifiedKyc());
    }

    public function test_has_verified_kyc_returns_false_when_not_verified()
    {
        $user = User::factory()->create([
            'kyc_status' => 'pending',
        ]);

        $this->assertFalse($user->hasVerifiedKyc());
    }

    public function test_has_verified_kyc_returns_false_when_rejected()
    {
        $user = User::factory()->create([
            'kyc_status' => 'rejected',
        ]);

        $this->assertFalse($user->hasVerifiedKyc());
    }

    public function test_needs_kyc_reverification_returns_true_when_expired()
    {
        $user = User::factory()->create([
            'kyc_status' => 'verified',
            'kyc_verified_at' => now(),
            'kyc_expires_at' => now()->subDay(),
        ]);

        $this->assertTrue($user->needsKycReverification());
    }

    public function test_needs_kyc_reverification_returns_false_when_valid()
    {
        $user = User::factory()->create([
            'kyc_status' => 'verified',
            'kyc_verified_at' => now(),
            'kyc_expires_at' => now()->addYear(),
        ]);

        $this->assertFalse($user->needsKycReverification());
    }

    public function test_needs_kyc_reverification_returns_false_when_not_verified()
    {
        $user = User::factory()->create([
            'kyc_status' => 'pending',
        ]);

        $this->assertFalse($user->needsKycReverification());
    }

    public function test_is_kyc_valid_returns_true_when_verified_and_not_expired()
    {
        $user = User::factory()->create([
            'kyc_status' => 'verified',
            'kyc_verified_at' => now(),
            'kyc_expires_at' => now()->addYear(),
        ]);

        $this->assertTrue($user->isKycValid());
    }

    public function test_is_kyc_valid_returns_false_when_not_verified()
    {
        $user = User::factory()->create([
            'kyc_status' => 'pending',
        ]);

        $this->assertFalse($user->isKycValid());
    }

    public function test_is_kyc_valid_returns_false_when_expired()
    {
        $user = User::factory()->create([
            'kyc_status' => 'verified',
            'kyc_verified_at' => now(),
            'kyc_expires_at' => now()->subDay(),
        ]);

        $this->assertFalse($user->isKycValid());
    }
}
