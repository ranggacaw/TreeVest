<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Symfony\Component\HttpFoundation\Response;

class EnsureKycIsVerified
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user()->hasVerifiedKyc()) {
            return Redirect::route('kyc.index')
                ->with('error', 'You must complete KYC verification before accessing this feature.');
        }

        if ($request->user()->needsKycReverification()) {
            return Redirect::route('kyc.index')
                ->with('error', 'Your KYC verification has expired. Please re-verify your identity.');
        }

        return $next($request);
    }
}
