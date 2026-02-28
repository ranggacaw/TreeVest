<?php

namespace Tests\Unit\Models;

use App\Models\OAuthProvider;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OAuthProviderTest extends TestCase
{
    use RefreshDatabase;

    public function test_oauth_provider_belongs_to_user()
    {
        $user = User::factory()->create();

        $oauthProvider = OAuthProvider::create([
            'user_id' => $user->id,
            'provider' => 'google',
            'provider_user_id' => '123',
            'access_token' => 'token',
            'expires_at' => null,
        ]);

        $this->assertInstanceOf(User::class, $oauthProvider->user);
        $this->assertEquals($user->id, $oauthProvider->user->id);
    }

    public function test_is_expired_returns_true_for_expired_token()
    {
        $oauthProvider = OAuthProvider::create([
            'user_id' => User::factory()->create()->id,
            'provider' => 'google',
            'provider_user_id' => '123',
            'access_token' => 'token',
            'expires_at' => Carbon::now()->subHour(),
        ]);

        $this->assertTrue($oauthProvider->isExpired());
    }

    public function test_is_expired_returns_false_for_non_expired_token()
    {
        $oauthProvider = OAuthProvider::create([
            'user_id' => User::factory()->create()->id,
            'provider' => 'google',
            'provider_user_id' => '123',
            'access_token' => 'token',
            'expires_at' => Carbon::now()->addHour(),
        ]);

        $this->assertFalse($oauthProvider->isExpired());
    }

    public function test_is_expired_returns_false_when_expires_at_is_null()
    {
        $oauthProvider = OAuthProvider::create([
            'user_id' => User::factory()->create()->id,
            'provider' => 'google',
            'provider_user_id' => '123',
            'access_token' => 'token',
            'expires_at' => null,
        ]);

        $this->assertFalse($oauthProvider->isExpired());
    }

    public function test_access_token_is_encrypted()
    {
        $oauthProvider = OAuthProvider::create([
            'user_id' => User::factory()->create()->id,
            'provider' => 'google',
            'provider_user_id' => '123',
            'access_token' => 'secret-token',
            'expires_at' => null,
        ]);

        $this->assertNotEquals('secret-token', $oauthProvider->getAttributes()['access_token']);
        $this->assertEquals('secret-token', $oauthProvider->access_token);
    }

    public function test_refresh_token_is_encrypted()
    {
        $oauthProvider = OAuthProvider::create([
            'user_id' => User::factory()->create()->id,
            'provider' => 'google',
            'provider_user_id' => '123',
            'access_token' => 'token',
            'refresh_token' => 'secret-refresh-token',
            'expires_at' => null,
        ]);

        $this->assertNotEquals('secret-refresh-token', $oauthProvider->getAttributes()['refresh_token']);
        $this->assertEquals('secret-refresh-token', $oauthProvider->refresh_token);
    }

    public function test_expires_at_is_cast_to_datetime()
    {
        $expiresAt = Carbon::now()->addDay();

        $oauthProvider = OAuthProvider::create([
            'user_id' => User::factory()->create()->id,
            'provider' => 'google',
            'provider_user_id' => '123',
            'access_token' => 'token',
            'expires_at' => $expiresAt,
        ]);

        $this->assertInstanceOf(Carbon::class, $oauthProvider->expires_at);
        $this->assertEquals($expiresAt->timestamp, $oauthProvider->expires_at->timestamp);
    }

    public function test_all_fields_are_fillable()
    {
        $oauthProvider = new OAuthProvider([
            'user_id' => 1,
            'provider' => 'google',
            'provider_user_id' => '123',
            'access_token' => 'token',
            'refresh_token' => 'refresh',
            'expires_at' => now(),
        ]);

        $this->assertEquals(1, $oauthProvider->user_id);
        $this->assertEquals('google', $oauthProvider->provider);
        $this->assertEquals('123', $oauthProvider->provider_user_id);
        $this->assertEquals('token', $oauthProvider->access_token);
        $this->assertEquals('refresh', $oauthProvider->refresh_token);
    }
}
