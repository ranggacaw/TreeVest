<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\TwoFactorAuthService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;
use Inertia\Inertia;
use Inertia\Response;

class TwoFactorChallengeController extends Controller
{
    public function __construct(
        private TwoFactorAuthService $twoFactorAuthService
    ) {}

    public function show(): Response|RedirectResponse
    {
        if (! Auth::check()) {
            return redirect()->route('login');
        }

        $user = Auth::user();

        if (! $user->twoFactorSecret || ! $user->twoFactorSecret->isEnabled()) {
            return redirect()->intended(route('dashboard', absolute: false));
        }

        return Inertia::render('Auth/TwoFactorChallenge', [
            'two_factor_type' => $user->twoFactorSecret->type,
        ]);
    }

    public function verify(Request $request): RedirectResponse
    {
        $request->validate([
            'code' => ['required', 'string'],
        ]);

        $user = Auth::user();

        $isValid = $this->twoFactorAuthService->verify($user, $request->input('code'));

        if (! $isValid) {
            return back()->withErrors(['code' => 'Invalid 2FA code.']);
        }

        Session::forget('auth.two_factor_confirmed');

        return redirect()->intended(route('dashboard', absolute: false));
    }

    public function useRecoveryCode(Request $request): RedirectResponse
    {
        $request->validate([
            'code' => ['required', 'string'],
        ]);

        $user = Auth::user();

        $isValid = $this->twoFactorAuthService->verifyRecoveryCode($user, $request->input('code'));

        if (! $isValid) {
            return back()->withErrors(['code' => 'Invalid recovery code.']);
        }

        Session::forget('auth.two_factor_confirmed');

        return redirect()
            ->intended(route('dashboard', absolute: false))
            ->with('status', 'recovery-code-used');
    }
}
