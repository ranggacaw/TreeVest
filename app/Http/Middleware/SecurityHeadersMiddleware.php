<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeadersMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $headers = config('security.headers', []);

        foreach ($headers as $key => $value) {
            $response->headers->set($key, $value);
        }

        if (config('security.csp.enabled')) {
            $response->headers->set('Content-Security-Policy', config('security.csp.policy'));
        }

        return $response;
    }
}
