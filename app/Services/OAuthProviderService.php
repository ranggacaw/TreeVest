<?php

namespace App\Services;

use App\Models\OAuthProvider;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Laravel\Socialite\Contracts\User as SocialiteUser;
use Laravel\Socialite\Facades\Socialite;

class OAuthProviderService
{
    public function handleCallback(string $provider, SocialiteUser $socialiteUser): User
    {
        $oauthProvider = OAuthProvider::where('provider', $provider)
            ->where('provider_user_id', $socialiteUser->getId())
            ->first();

        if ($oauthProvider) {
            $this->refreshTokenIfNeeded($oauthProvider);

            return $oauthProvider->user;
        }

        $existingUser = User::where('email', $socialiteUser->getEmail())->first();

        if ($existingUser) {
            $oauthProvider = OAuthProvider::create([
                'user_id' => $existingUser->id,
                'provider' => $provider,
                'provider_user_id' => $socialiteUser->getId(),
                'access_token' => $socialiteUser->token,
                'refresh_token' => $socialiteUser->refreshToken,
                'expires_at' => $socialiteUser->expiresIn ? now()->addSeconds($socialiteUser->expiresIn) : null,
            ]);

            return $existingUser;
        }

        $user = DB::transaction(function () use ($socialiteUser, $provider) {
            $user = User::create([
                'name' => $socialiteUser->getName(),
                'email' => $socialiteUser->getEmail(),
                'password' => bcrypt(Str::random(32)),
                'email_verified_at' => now(),
            ]);

            OAuthProvider::create([
                'user_id' => $user->id,
                'provider' => $provider,
                'provider_user_id' => $socialiteUser->getId(),
                'access_token' => $socialiteUser->token,
                'refresh_token' => $socialiteUser->refreshToken,
                'expires_at' => $socialiteUser->expiresIn ? now()->addSeconds($socialiteUser->expiresIn) : null,
            ]);

            return $user;
        });

        return $user;
    }

    public function linkProvider(User $user, string $provider, SocialiteUser $socialiteUser): OAuthProvider
    {
        $existingProvider = OAuthProvider::where('user_id', $user->id)
            ->where('provider', $provider)
            ->first();

        if ($existingProvider) {
            $existingProvider->update([
                'provider_user_id' => $socialiteUser->getId(),
                'access_token' => $socialiteUser->token,
                'refresh_token' => $socialiteUser->refreshToken,
                'expires_at' => $socialiteUser->expiresIn ? now()->addSeconds($socialiteUser->expiresIn) : null,
            ]);

            return $existingProvider;
        }

        return OAuthProvider::create([
            'user_id' => $user->id,
            'provider' => $provider,
            'provider_user_id' => $socialiteUser->getId(),
            'access_token' => $socialiteUser->token,
            'refresh_token' => $socialiteUser->refreshToken,
            'expires_at' => $socialiteUser->expiresIn ? now()->addSeconds($socialiteUser->expiresIn) : null,
        ]);
    }

    public function unlinkProvider(User $user, string $provider): bool
    {
        $deleted = OAuthProvider::where('user_id', $user->id)
            ->where('provider', $provider)
            ->delete();

        return $deleted > 0;
    }

    public function refreshToken(OAuthProvider $oauthProvider): bool
    {
        if (! $oauthProvider->isExpired()) {
            return true;
        }

        if (! $oauthProvider->refresh_token) {
            return false;
        }

        try {
            $provider = Socialite::driver($oauthProvider->provider);
            $newToken = $provider->refreshToken($oauthProvider->refresh_token);

            $oauthProvider->update([
                'access_token' => $newToken->token,
                'refresh_token' => $newToken->refreshToken,
                'expires_at' => $newToken->expiresIn ? now()->addSeconds($newToken->expiresIn) : null,
            ]);

            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    protected function refreshTokenIfNeeded(OAuthProvider $oauthProvider): void
    {
        if ($oauthProvider->isExpired()) {
            $this->refreshToken($oauthProvider);
        }
    }
}
