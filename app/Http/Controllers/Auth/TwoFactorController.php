<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\TwoFactorAuthService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class TwoFactorController extends Controller
{
    public function __construct(
        private TwoFactorAuthService $twoFactorAuthService
    ) {}

    public function show(): Response
    {
        $user = Auth::user();

        $twoFactorSecret = $user->twoFactorSecret;
        $recoveryCodes = [];

        if ($twoFactorSecret && $twoFactorSecret->isEnabled()) {
            $recoveryCodes = $user->recoveryCodes->map(fn ($code) => [
                'id' => $code->id,
                'code' => $code->code ? '•••••••••••••••••••' : null,
                'used_at' => $code->used_at,
            ]);
        }

        return Inertia::render('Profile/TwoFactorAuthentication', [
            'two_factor_enabled' => $user->two_factor_enabled_at !== null,
            'two_factor_type' => $twoFactorSecret?->type,
            'recovery_codes' => $recoveryCodes,
        ]);
    }

    public function enable(Request $request): RedirectResponse
    {
        $request->validate([
            'type' => ['required', 'in:totp,sms'],
            'password' => ['required', 'current_password'],
        ]);

        $user = Auth::user();

        if ($user->twoFactorSecret) {
            return back()->with('error', '2FA is already enabled.');
        }

        if ($request->input('type') === 'totp') {
            $result = $this->twoFactorAuthService->enableTotp($user);

            return back()->with([
                'two_factor_setup' => [
                    'secret' => $result['secret'],
                    'qr_code_url' => $result['qr_code_url'],
                    'recovery_codes' => $result['recovery_codes'],
                ],
            ]);
        }

        if ($request->input('type') === 'sms') {
            $this->twoFactorAuthService->enableSms($user);

            return back()->with('status', 'sms-2fa-enabled');
        }

        return back()->with('error', 'Invalid 2FA type.');
    }

    public function confirmEnable(Request $request): RedirectResponse
    {
        $request->validate([
            'code' => ['required', 'string'],
        ]);

        $user = Auth::user();
        $twoFactorSecret = $user->twoFactorSecret;

        if (! $twoFactorSecret) {
            return back()->with('error', '2FA setup not initialized.');
        }

        $isValid = $this->twoFactorAuthService->verify($user, $request->input('code'));

        if (! $isValid) {
            return back()->with('error', 'Invalid 2FA code.');
        }

        $this->twoFactorAuthService->confirmEnable($user);

        return back()->with('status', 'two-factor-enabled');
    }

    public function disable(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $this->twoFactorAuthService->disable(Auth::user());

        return back()->with('status', 'two-factor-disabled');
    }

    public function regenerateRecoveryCodes(): RedirectResponse
    {
        $user = Auth::user();

        if (! $user->twoFactorSecret || ! $user->twoFactorSecret->isEnabled()) {
            return back()->with('error', '2FA is not enabled.');
        }

        $recoveryCodes = $this->twoFactorAuthService->regenerateRecoveryCodes($user);

        return back()->with('recovery_codes', $recoveryCodes);
    }
}
