<?php

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Http\Request;

RateLimiter::for('phone-otp-send', function (Request $request) {
    return Limit::perHour(5)->by($request->input('phone', $request->ip()));
});

RateLimiter::for('phone-otp-verify', function (Request $request) {
    return Limit::perHour(5)->by($request->input('phone', $request->ip()));
});

RateLimiter::for('2fa-verify', function (Request $request) {
    return Limit::perMinute(5)->by($request->user()?->id ?? $request->ip());
});

RateLimiter::for('oauth-callback', function (Request $request) {
    return Limit::perMinute(10)->by($request->ip());
});

RateLimiter::for('auth-throttle', function (Request $request) {
    return Limit::perMinute(5)->by($request->ip());
});
