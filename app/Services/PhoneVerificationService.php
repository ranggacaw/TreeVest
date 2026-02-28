<?php

namespace App\Services;

use App\Contracts\SmsServiceInterface;
use App\Models\PhoneVerification;
use App\Models\User;
use Carbon\Carbon;

class PhoneVerificationService
{
    public function __construct(
        private SmsServiceInterface $smsService
    ) {}

    public function sendVerificationCode(string $phone): bool
    {
        $normalizedPhone = $this->normalizePhoneNumber($phone);
        $code = $this->generateOtp();
        $expiresAt = Carbon::now()->addMinutes(config('auth.two_factor.otp_expiry', 10));

        PhoneVerification::where('phone', $normalizedPhone)->delete();

        PhoneVerification::create([
            'phone' => $normalizedPhone,
            'code' => bcrypt($code),
            'expires_at' => $expiresAt,
        ]);

        return $this->smsService->sendOtp($normalizedPhone, $code);
    }

    public function verifyCode(string $phone, string $code): bool
    {
        $normalizedPhone = $this->normalizePhoneNumber($phone);
        $verification = PhoneVerification::where('phone', $normalizedPhone)
            ->where('expires_at', '>', Carbon::now())
            ->latest()
            ->first();

        if (! $verification) {
            return false;
        }

        if ($verification->isVerified()) {
            return false;
        }

        if (! password_verify($code, $verification->code)) {
            return false;
        }

        $verification->verified_at = Carbon::now();
        $verification->save();

        return true;
    }

    public function resendCode(string $phone): bool
    {
        return $this->sendVerificationCode($phone);
    }

    public function markPhoneAsVerified(User $user): void
    {
        $user->phone_verified_at = Carbon::now();
        $user->save();

        PhoneVerification::where('phone', $user->phone)->delete();
    }

    protected function generateOtp(): string
    {
        return (string) random_int(100000, 999999);
    }

    protected function normalizePhoneNumber(string $phone): string
    {
        $phone = preg_replace('/[^0-9+]/', '', $phone);

        if (! str_starts_with($phone, '+')) {
            $phone = '+'.$phone;
        }

        return $phone;
    }
}
