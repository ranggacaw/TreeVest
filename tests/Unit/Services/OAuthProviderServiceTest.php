<?php

namespace Tests\Unit\Services;

use App\Models\OAuthProvider;
use App\Models\User;
use App\Services\OAuthProviderService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Socialite\Contracts\User as SocialiteUser;
use Mockery;
use Tests\TestCase;

class OAuthProviderServiceTest extends TestCase
{
    use RefreshDatabase;

    protected OAuthProviderService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new OAuthProviderService;
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    public function test_creates_new_user_from_oauth_callback()
    {
        $socialiteUser = $this->createSocialiteUser('123', 'john@example.com', 'John Doe');

        $user = $this->service->handleCallback('google', $socialiteUser);

        $this->assertInstanceOf(User::class, $user);
        $this->assertEquals('john@example.com', $user->email);
        $this->assertEquals('John Doe', $user->name);
        $this->assertNotNull($user->email_verified_at);

        $oauthProvider = OAuthProvider::where('user_id', $user->id)->first();
        $this->assertNotNull($oauthProvider);
        $this->assertEquals('google', $oauthProvider->provider);
        $this->assertEquals('123', $oauthProvider->provider_user_id);
    }

    public function test_links_oauth_provider_to_existing_user()
    {
        $user = User::factory()->create(['email' => 'jane@example.com']);
        $socialiteUser = $this->createSocialiteUser('456', 'jane@example.com', 'Jane Doe');

        $result = $this->service->handleCallback('google', $socialiteUser);

        $this->assertEquals($user->id, $result->id);

        $oauthProvider = OAuthProvider::where('user_id', $user->id)->first();
        $this->assertNotNull($oauthProvider);
        $this->assertEquals('google', $oauthProvider->provider);
        $this->assertEquals('456', $oauthProvider->provider_user_id);
    }

    public function test_returns_existing_user_on_subsequent_oauth_login()
    {
        $user = User::factory()->create();
        $socialiteUser = $this->createSocialiteUser('123', 'john@example.com', 'John Doe');

        OAuthProvider::create([
            'user_id' => $user->id,
            'provider' => 'google',
            'provider_user_id' => '123',
            'access_token' => 'old-token',
            'expires_at' => null,
        ]);

        $result = $this->service->handleCallback('google', $socialiteUser);

        $this->assertEquals($user->id, $result->id);
    }

    public function test_prevents_duplicate_oauth_linkage()
    {
        $user = User::factory()->create();
        $socialiteUser = $this->createSocialiteUser('123', 'john@example.com', 'John Doe');

        OAuthProvider::create([
            'user_id' => $user->id,
            'provider' => 'google',
            'provider_user_id' => '123',
            'access_token' => 'old-token',
            'expires_at' => null,
        ]);

        $newUser = User::factory()->create(['email' => 'new@example.com']);
        $newSocialiteUser = $this->createSocialiteUser('123', 'new@example.com', 'New User');

        $result = $this->service->handleCallback('google', $newSocialiteUser);

        $this->assertEquals($user->id, $result->id);
        $this->assertCount(1, OAuthProvider::where('provider', 'google')->where('provider_user_id', '123')->get());
    }

    public function test_link_provider_to_authenticated_user()
    {
        $user = User::factory()->create();
        $socialiteUser = $this->createSocialiteUser('789', 'john@example.com', 'John Doe');

        $oauthProvider = $this->service->linkProvider($user, 'facebook', $socialiteUser);

        $this->assertInstanceOf(OAuthProvider::class, $oauthProvider);
        $this->assertEquals($user->id, $oauthProvider->user_id);
        $this->assertEquals('facebook', $oauthProvider->provider);
        $this->assertEquals('789', $oauthProvider->provider_user_id);
        $this->assertEquals('access-token-123', $oauthProvider->access_token);
    }

    public function test_update_existing_oauth_provider_link()
    {
        $user = User::factory()->create();

        OAuthProvider::create([
            'user_id' => $user->id,
            'provider' => 'google',
            'provider_user_id' => '123',
            'access_token' => 'old-token',
            'refresh_token' => 'old-refresh',
            'expires_at' => null,
        ]);

        $socialiteUser = $this->createSocialiteUser('456', 'john@example.com', 'John Doe');

        $oauthProvider = $this->service->linkProvider($user, 'google', $socialiteUser);

        $this->assertEquals($user->id, $oauthProvider->user_id);
        $this->assertEquals('456', $oauthProvider->provider_user_id);
        $this->assertEquals('access-token-123', $oauthProvider->access_token);
        $this->assertEquals('refresh-token-456', $oauthProvider->refresh_token);
    }

    public function test_unlink_oauth_provider()
    {
        $user = User::factory()->create();

        OAuthProvider::create([
            'user_id' => $user->id,
            'provider' => 'google',
            'provider_user_id' => '123',
            'access_token' => 'token',
            'expires_at' => null,
        ]);

        $result = $this->service->unlinkProvider($user, 'google');

        $this->assertTrue($result);

        $this->assertDatabaseMissing('oauth_providers', [
            'user_id' => $user->id,
            'provider' => 'google',
        ]);
    }

    public function test_unlink_returns_false_when_provider_not_found()
    {
        $user = User::factory()->create();

        $result = $this->service->unlinkProvider($user, 'google');

        $this->assertFalse($result);
    }

    public function test_refresh_token_returns_true_for_non_expired_token()
    {
        $oauthProvider = OAuthProvider::create([
            'user_id' => User::factory()->create()->id,
            'provider' => 'google',
            'provider_user_id' => '123',
            'access_token' => 'token',
            'refresh_token' => 'refresh',
            'expires_at' => Carbon::now()->addHour(),
        ]);

        $result = $this->service->refreshToken($oauthProvider);

        $this->assertTrue($result);
    }

    public function test_refresh_token_returns_false_when_token_expired_without_refresh_token()
    {
        $oauthProvider = OAuthProvider::create([
            'user_id' => User::factory()->create()->id,
            'provider' => 'google',
            'provider_user_id' => '123',
            'access_token' => 'token',
            'refresh_token' => null,
            'expires_at' => Carbon::now()->subHour(),
        ]);

        $result = $this->service->refreshToken($oauthProvider);

        $this->assertFalse($result);
    }

    protected function createSocialiteUser(string $id, string $email, string $name): SocialiteUser
    {
        $socialiteUser = Mockery::mock(SocialiteUser::class);
        $socialiteUser->shouldReceive('getId')->andReturn($id);
        $socialiteUser->shouldReceive('getEmail')->andReturn($email);
        $socialiteUser->shouldReceive('getName')->andReturn($name);
        $socialiteUser->shouldReceive('getToken')->andReturn('access-token-123');
        $socialiteUser->shouldReceive('getRefreshToken')->andReturn('refresh-token-456');
        $socialiteUser->shouldReceive('getExpiresIn')->andReturn(3600);

        return $socialiteUser;
    }
}
