<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\OAuthProviderService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class OAuthController extends Controller
{
    public function __construct(
        private OAuthProviderService $oauthProviderService
    ) {}

    public function redirect(string $provider): RedirectResponse
    {
        abort_unless(in_array($provider, ['google', 'facebook', 'apple']), 404);

        return Socialite::driver($provider)->redirect();
    }

    public function callback(string $provider, Request $request): RedirectResponse
    {
        abort_unless(in_array($provider, ['google', 'facebook', 'apple']), 404);

        try {
            $socialiteUser = Socialite::driver($provider)->stateless()->user();
        } catch (\Exception $e) {
            return redirect()->route('login')->with('error', 'OAuth authentication failed.');
        }

        $user = $this->oauthProviderService->handleCallback($provider, $socialiteUser);

        Auth::login($user);
        $request->session()->regenerate();

        return redirect()->intended(route('dashboard', absolute: false));
    }

    public function link(Request $request, string $provider): RedirectResponse
    {
        abort_unless(in_array($provider, ['google', 'facebook', 'apple']), 404);

        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        abort_unless(Auth::check(), 401);

        try {
            $socialiteUser = Socialite::driver($provider)->stateless()->user();
        } catch (\Exception $e) {
            return back()->with('error', 'OAuth authentication failed.');
        }

        $this->oauthProviderService->linkProvider(Auth::user(), $provider, $socialiteUser);

        return back()->with('status', 'oauth-provider-linked');
    }

    public function unlink(string $provider): RedirectResponse
    {
        abort_unless(in_array($provider, ['google', 'facebook', 'apple']), 404);
        abort_unless(Auth::check(), 401);

        $success = $this->oauthProviderService->unlinkProvider(Auth::user(), $provider);

        if (! $success) {
            return back()->with('error', 'Failed to unlink OAuth provider.');
        }

        return back()->with('status', 'oauth-provider-unlinked');
    }
}
