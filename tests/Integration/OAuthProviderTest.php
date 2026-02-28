<?php

namespace Tests\Integration;

use App\Models\OAuthProvider;
use App\Models\User;
use App\Services\OAuthProviderService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Socialite\Facades\Socialite;
use Mockery;
use Tests\TestCase;

class OAuthProviderTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    public function test_oauth_callback_with_conflicting_emails()
    {
        $existingUser = User::factory()->create(['email' => 'user@example.com']);

        $socialiteUser = Mockery::mock('Laravel\Socialite\Contracts\User');
        $socialiteUser->shouldReceive('getId')->andReturn('123');
        $socialiteUser->shouldReceive('getEmail')->andReturn('user@example.com');
        $socialiteUser->shouldReceive('getName')->andReturn('OAuth User');
        $socialiteUser->shouldReceive('getToken')->andReturn('new-token');
        $socialiteUser->shouldReceive('getRefreshToken')->andReturn('new-refresh');
        $socialiteUser->shouldReceive('getExpiresIn')->andReturn(3600);

        Socialite::shouldReceive('driver->stateless->user')
            ->once()
            ->andReturn($socialiteUser);

        $service = new OAuthProviderService;
        $user = $service->handleCallback('google', $socialiteUser);

        $this->assertEquals($existingUser->id, $user->id);

        $oauthProvider = OAuthProvider::where('user_id', $user->id)->first();
        $this->assertEquals('new-token', $oauthProvider->access_token);
    }

    public function test_oauth_token_refresh_flow()
    {
        $user = User::factory()->create();

        $oauthProvider = OAuthProvider::create([
            'user_id' => $user->id,
            'provider' => 'google',
            'provider_user_id' => '123',
            'access_token' => 'old-token',
            'refresh_token' => 'refresh-token',
            'expires_at' => now()->subHour(),
        ]);

        $newToken = Mockery::mock('Laravel\Socialite\Two\User');
        $newToken->shouldReceive('token')->andReturn('new-access-token');
        $newToken->shouldReceive('refreshToken')->andReturn('new-refresh-token');
        $newToken->shouldReceive('expiresIn')->andReturn(3600);

        $provider = Mockery::mock('Laravel\Socialite\Two\AbstractProvider');
        $provider->shouldReceive('refreshToken')
            ->with('refresh-token')
            ->andReturn($newToken);

        Socialite::shouldReceive('driver')
            ->andReturn($provider);

        $service = new OAuthProviderService;
        $result = $service->refreshToken($oauthProvider);

        $this->assertTrue($result);

        $oauthProvider->refresh();
        $this->assertEquals('new-access-token', $oauthProvider->access_token);
    }

    public function test_oauth_token_refresh_fails_without_refresh_token()
    {
        $user = User::factory()->create();

        $oauthProvider = OAuthProvider::create([
            'user_id' => $user->id,
            'provider' => 'google',
            'provider_user_id' => '123',
            'access_token' => 'old-token',
            'refresh_token' => null,
            'expires_at' => now()->subHour(),
        ]);

        $service = new OAuthProviderService;
        $result = $service->refreshToken($oauthProvider);

        $this->assertFalse($result);
    }

    public function test_oauth_callback_with_new_provider()
    {
        $socialiteUser = Mockery::mock('Laravel\Socialite\Contracts\User');
        $socialiteUser->shouldReceive('getId')->andReturn('456');
        $socialiteUser->shouldReceive('getEmail')->andReturn('newuser@example.com');
        $socialiteUser->shouldReceive('getName')->andReturn('New User');
        $socialiteUser->shouldReceive('getToken')->andReturn('access-token');
        $socialiteUser->shouldReceive('getRefreshToken')->andReturn('refresh-token');
        $socialiteUser->shouldReceive('getExpiresIn')->andReturn(3600);

        Socialite::shouldReceive('driver->stateless->user')
            ->once()
            ->andReturn($socialiteUser);

        $service = new OAuthProviderService;
        $user = $service->handleCallback('facebook', $socialiteUser);

        $this->assertNotNull($user);
        $this->assertEquals('newuser@example.com', $user->email);

        $oauthProvider = OAuthProvider::where('user_id', $user->id)->first();
        $this->assertEquals('facebook', $oauthProvider->provider);
        $this->assertEquals('456', $oauthProvider->provider_user_id);
    }

    public function test_oauth_token_refresh_with_api_error()
    {
        $user = User::factory()->create();

        $oauthProvider = OAuthProvider::create([
            'user_id' => $user->id,
            'provider' => 'google',
            'provider_user_id' => '123',
            'access_token' => 'old-token',
            'refresh_token' => 'refresh-token',
            'expires_at' => now()->subHour(),
        ]);

        $provider = Mockery::mock('Laravel\Socialite\Two\AbstractProvider');
        $provider->shouldReceive('refreshToken')
            ->andThrow(new \Exception('API error'));

        Socialite::shouldReceive('driver')
            ->andReturn($provider);

        $service = new OAuthProviderService;
        $result = $service->refreshToken($oauthProvider);

        $this->assertFalse($result);
    }
}
