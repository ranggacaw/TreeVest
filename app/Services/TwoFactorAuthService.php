<?php

namespace App\Services;

use App\Models\TwoFactorSecret;
use App\Models\TwoFactorRecoveryCode;
use App\Models\User;
use PragmaRX\Google2FA\Google2FA;
use Illuminate\Support\Str;
use Carbon\Carbon;

class TwoFactorAuthService
{
    protected Google2FA $google2fa;

    public function __construct()
    {
        $this->google2fa = new Google2FA();
    }

    public function enableTotp(User $user): array
    {
        $this->google2fa->setWindow(config('auth.two_factor.totp_window', 1));

        $secret = $this->google2fa->generateSecretKey();
        $recoveryCodes = $this->generateRecoveryCodes(8);

        $qrCodeUrl = $this->google2fa->getQRCodeUrl(
            config('app.name'),
            $user->email ?? $user->phone,
            $secret
        );

        TwoFactorSecret::updateOrCreate(
            ['user_id' => $user->id],
            [
                'type' => 'totp',
                'secret' => $secret,
                'enabled_at' => null,
            ]
        );

        return [
            'secret' => $secret,
            'qr_code_url' => $qrCodeUrl,
            'recovery_codes' => $recoveryCodes,
        ];
    }

    public function enableSms(User $user): bool
    {
        TwoFactorSecret::updateOrCreate(
            ['user_id' => $user->id],
            [
                'type' => 'sms',
                'secret' => $user->phone,
                'enabled_at' => null,
            ]
        );

        return true;
    }

    public function confirmEnable(User $user): bool
    {
        $secret = $user->twoFactorSecret;

        if (!$secret) {
            return false;
        }

        $secret->enabled_at = Carbon::now();
        $secret->save();

        $user->two_factor_enabled_at = Carbon::now();
        $user->save();

        $this->storeRecoveryCodes($user);

        return true;
    }

    public function verify(User $user, string $code): bool
    {
        $secret = $user->twoFactorSecret;

        if (!$secret || !$secret->isEnabled()) {
            return false;
        }

        if ($secret->isTotp()) {
            return $this->verifyTotp($secret->secret, $code);
        }

        if ($secret->isSms()) {
            return $this->verifySms($user, $code);
        }

        return false;
    }

    public function verifyRecoveryCode(User $user, string $code): bool
    {
        $recoveryCode = TwoFactorRecoveryCode::where('user_id', $user->id)
            ->where('used_at', null)
            ->where('code', $code)
            ->first();

        if (!$recoveryCode) {
            return false;
        }

        $recoveryCode->used_at = Carbon::now();
        $recoveryCode->save();

        $user->twoFactorSecret->last_used_at = Carbon::now();
        $user->twoFactorSecret->save();

        return true;
    }

    public function disable(User $user): bool
    {
        $user->twoFactorSecret?->delete();
        TwoFactorRecoveryCode::where('user_id', $user->id)->delete();

        $user->two_factor_enabled_at = null;
        $user->save();

        return true;
    }

    public function regenerateRecoveryCodes(User $user): array
    {
        TwoFactorRecoveryCode::where('user_id', $user->id)->delete();

        $recoveryCodes = $this->generateRecoveryCodes(8);

        foreach ($recoveryCodes as $code) {
            TwoFactorRecoveryCode::create([
                'user_id' => $user->id,
                'code' => bcrypt($code),
            ]);
        }

        return $recoveryCodes;
    }

    protected function verifyTotp(string $secret, string $code): bool
    {
        return $this->google2fa->verifyKey($secret, $code);
    }

    protected function verifySms(User $user, string $code): bool
    {
        $verification = \App\Models\PhoneVerification::where('phone', $user->phone)
            ->where('verified_at', '!=', null)
            ->latest()
            ->first();

        if (!$verification) {
            return false;
        }

        return password_verify($code, $verification->code);
    }

    protected function generateRecoveryCodes(int $count): array
    {
        $codes = [];
        for ($i = 0; $i < $count; $i++) {
            $codes[] = strtoupper(Str::random(10) . '-' . Str::random(10));
        }
        return $codes;
    }

    protected function storeRecoveryCodes(User $user): void
    {
        $secret = $user->twoFactorSecret;
        $recoveryCodes = $this->generateRecoveryCodes(8);

        TwoFactorRecoveryCode::where('user_id', $user->id)->delete();

        foreach ($recoveryCodes as $code) {
            TwoFactorRecoveryCode::create([
                'user_id' => $user->id,
                'code' => bcrypt($code),
            ]);
        }
    }
}
