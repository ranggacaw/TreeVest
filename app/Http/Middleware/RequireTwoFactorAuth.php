<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;
use Symfony\Component\HttpFoundation\Response;

class RequireTwoFactorAuth
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();

        if (!$user) {
            return $next($request);
        }

        if ($user->two_factor_enabled_at) {
            if (!Session::get('auth.two_factor_confirmed')) {
                return redirect()->route('two-factor.challenge');
            }
        }

        return $next($request);
    }
}
