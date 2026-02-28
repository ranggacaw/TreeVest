<?php

namespace Tests\Feature\Auth;

use App\Models\OAuthProvider;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Socialite\Facades\Socialite;
use Mockery;
use Tests\TestCase;

class OAuthAuthenticationTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    public function test_user_redirected_to_google_oauth_consent()
    {
        Socialite::shouldReceive('driver->setScopes->stateless->redirect')
            ->once()
            ->andReturn(redirect('https://accounts.google.com/o/oauth2/auth'));

        $response = $this->get('/auth/google/redirect');

        $response->assertStatus(302);
    }

    public function test_oauth_callback_creates_new_user()
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
        $this->assertEquals('Test User', $user->name);
    }

    public function test_oauth_callback_logs_in_existing_user()
    {
        $user = User::factory()->create(['email' => 'existing@example.com']);

        $socialiteUser = Mockery::mock('Laravel\Socialite\Contracts\User');
        $socialiteUser->shouldReceive('getId')->andReturn('123');
        $socialiteUser->shouldReceive('getEmail')->andReturn('existing@example.com');
        $socialiteUser->shouldReceive('getName')->andReturn('Existing User');
        $socialiteUser->shouldReceive('getToken')->andReturn('access-token');
        $socialiteUser->shouldReceive('getRefreshToken')->andReturn('refresh-token');
        $socialiteUser->shouldReceive('getExpiresIn')->andReturn(3600);

        Socialite::shouldReceive('driver->stateless->user')
            ->once()
            ->andReturn($socialiteUser);

        $response = $this->get('/auth/google/callback');

        $this->assertAuthenticatedAs($user);
        $response->assertRedirect(route('dashboard', absolute: false));
    }

    public function test_oauth_callback_links_provider_to_existing_user()
    {
        $user = User::factory()->create(['email' => 'existing@example.com']);

        OAuthProvider::create([
            'user_id' => $user->id,
            'provider' => 'google',
            'provider_user_id' => '123',
            'access_token' => 'old-token',
            'expires_at' => null,
        ]);

        $socialiteUser = Mockery::mock('Laravel\Socialite\Contracts\User');
        $socialiteUser->shouldReceive('getId')->andReturn('123');
        $socialiteUser->shouldReceive('getEmail')->andReturn('existing@example.com');
        $socialiteUser->shouldReceive('getName')->andReturn('Existing User');
        $socialiteUser->shouldReceive('getToken')->andReturn('access-token');
        $socialiteUser->shouldReceive('getRefreshToken')->andReturn('refresh-token');
        $socialiteUser->shouldReceive('getExpiresIn')->andReturn(3600);

        Socialite::shouldReceive('driver->stateless->user')
            ->once()
            ->andReturn($socialiteUser);

        $this->get('/auth/google/callback');

        $oauthProvider = OAuthProvider::where('user_id', $user->id)->first();
        $this->assertEquals('access-token', $oauthProvider->access_token);
    }

    public function test_oauth_provider_linkage_requires_password_confirmation()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->post('/profile/oauth/link', [
                'provider' => 'google',
                'password' => 'wrong-password',
            ]);

        $response->assertSessionHasErrors();
    }

    public function test_user_can_unlink_oauth_provider()
    {
        $user = User::factory()->create();

        OAuthProvider::create([
            'user_id' => $user->id,
            'provider' => 'google',
            'provider_user_id' => '123',
            'access_token' => 'token',
            'expires_at' => null,
        ]);

        $response = $this->actingAs($user)
            ->delete('/profile/oauth/google');

        $response->assertStatus(200);

        $this->assertDatabaseMissing('oauth_providers', [
            'user_id' => $user->id,
            'provider' => 'google',
        ]);
    }

    public function test_oauth_state_parameter_prevents_csrf()
    {
        $response = $this->get('/auth/google/callback?state=invalid');

        $response->assertSessionHasErrors();
    }
}
