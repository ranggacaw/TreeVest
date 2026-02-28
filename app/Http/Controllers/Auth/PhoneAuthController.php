<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\PhoneVerificationService;
use App\Services\SessionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PhoneAuthController extends Controller
{
    public function __construct(
        private PhoneVerificationService $phoneVerificationService,
        private SessionService $sessionService
    ) {}

    public function showRegisterForm(): Response
    {
        return Inertia::render('Auth/PhoneRegister', [
            'status' => session('status'),
        ]);
    }

    public function register(Request $request): RedirectResponse
    {
        $request->validate([
            'phone' => ['required', 'string'],
            'phone_country_code' => ['required', 'string', 'size:2'],
        ]);

        $this->ensureIsNotRateLimited($request->input('phone'));

        $sent = $this->phoneVerificationService->sendVerificationCode($request->input('phone'));

        if (! $sent) {
            RateLimiter::hit($this->throttleKey($request->input('phone')));
            throw ValidationException::withMessages([
                'phone' => 'Failed to send verification code. Please try again.',
            ]);
        }

        RateLimiter::clear($this->throttleKey($request->input('phone')));

        Session::put('phone_registration', [
            'phone' => $request->input('phone'),
            'phone_country_code' => $request->input('phone_country_code'),
        ]);

        return redirect()->route('phone.verify')->with('status', 'verification-code-sent');
    }

    public function verify(Request $request): RedirectResponse
    {
        $registrationData = Session::get('phone_registration');

        if (! $registrationData) {
            return redirect()->route('phone.register');
        }

        $request->validate([
            'code' => ['required', 'string', 'size:6'],
        ]);

        $this->ensureIsNotRateLimited($registrationData['phone']);

        $isValid = $this->phoneVerificationService->verifyCode($registrationData['phone'], $request->input('code'));

        if (! $isValid) {
            RateLimiter::hit($this->throttleKey($registrationData['phone']));

            throw ValidationException::withMessages([
                'code' => 'Invalid or expired verification code.',
            ]);
        }

        RateLimiter::clear($this->throttleKey($registrationData['phone']));

        $user = User::create([
            'phone' => $registrationData['phone'],
            'phone_country_code' => $registrationData['phone_country_code'],
            'phone_verified_at' => now(),
            'password' => bcrypt(Str::random(32)),
        ]);

        $this->phoneVerificationService->markPhoneAsVerified($user);

        Auth::login($user);
        $request->session()->regenerate();
        $this->sessionService->updateLastLogin($user, $request);

        Session::forget('phone_registration');

        return redirect()->intended(route('dashboard', absolute: false));
    }

    public function showLoginForm(): Response
    {
        return Inertia::render('Auth/PhoneLogin', [
            'status' => session('status'),
        ]);
    }

    public function login(Request $request): RedirectResponse
    {
        $request->validate([
            'identifier' => ['required', 'string'],
        ]);

        $user = User::where('phone', 'like', '%'.$request->input('identifier'))->first();

        if (! $user) {
            throw ValidationException::withMessages([
                'identifier' => 'No account found with this phone number.',
            ]);
        }

        $this->ensureIsNotRateLimited($user->phone);

        $sent = $this->phoneVerificationService->sendVerificationCode($user->phone);

        if (! $sent) {
            RateLimiter::hit($this->throttleKey($user->phone));
            throw ValidationException::withMessages([
                'identifier' => 'Failed to send verification code. Please try again.',
            ]);
        }

        RateLimiter::clear($this->throttleKey($user->phone));

        Session::put('phone_login', [
            'user_id' => $user->id,
            'phone' => $user->phone,
        ]);

        return redirect()->route('phone.login.verify')->with('status', 'verification-code-sent');
    }

    public function verifyLogin(Request $request): RedirectResponse
    {
        $loginData = Session::get('phone_login');

        if (! $loginData) {
            return redirect()->route('phone.login');
        }

        $user = User::find($loginData['user_id']);

        if (! $user) {
            Session::forget('phone_login');

            return redirect()->route('phone.login');
        }

        $request->validate([
            'code' => ['required', 'string', 'size:6'],
        ]);

        $this->ensureIsNotRateLimited($user->phone);

        $isValid = $this->phoneVerificationService->verifyCode($user->phone, $request->input('code'));

        if (! $isValid) {
            RateLimiter::hit($this->throttleKey($user->phone));

            throw ValidationException::withMessages([
                'code' => 'Invalid or expired verification code.',
            ]);
        }

        RateLimiter::clear($this->throttleKey($user->phone));

        Auth::login($user);
        $request->session()->regenerate();
        $this->sessionService->updateLastLogin($user, $request);

        Session::forget('phone_login');

        return redirect()->intended(route('dashboard', absolute: false));
    }

    public function resendOtp(Request $request): RedirectResponse
    {
        $loginData = Session::get('phone_login');
        $registrationData = Session::get('phone_registration');

        $phone = $loginData['phone'] ?? $registrationData['phone'] ?? null;

        if (! $phone) {
            throw ValidationException::withMessages([
                'phone' => 'Session expired. Please start over.',
            ]);
        }

        $this->ensureIsNotRateLimited($phone);

        $sent = $this->phoneVerificationService->sendVerificationCode($phone);

        if (! $sent) {
            RateLimiter::hit($this->throttleKey($phone));
            throw ValidationException::withMessages([
                'phone' => 'Failed to send verification code. Please try again.',
            ]);
        }

        RateLimiter::clear($this->throttleKey($phone));

        return back()->with('status', 'verification-code-resent');
    }

    protected function ensureIsNotRateLimited(string $phone): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey($phone), 5)) {
            return;
        }

        $seconds = RateLimiter::availableIn($this->throttleKey($phone));

        throw ValidationException::withMessages([
            'phone' => trans('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }

    protected function throttleKey(string $phone): string
    {
        return Str::transliterate(Str::lower($phone).'|'.request()->ip());
    }
}
