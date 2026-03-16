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
            $policy = config('security.csp.policy');
            
            // In development, dynamically add Vite dev server ports
            if (app()->environment('local')) {
                // Get Vite dev server URL from environment
                $viteUrl = env('VITE_DEV_SERVER_URL', 'http://localhost:5173');
                $viteParsed = parse_url($viteUrl);
                $vitePort = $viteParsed['port'] ?? 5173;
                $viteHost = $viteParsed['host'] ?? 'localhost';
                
                // Support common Vite ports (in case port is in use and Vite uses next available)
                $vitePorts = array_unique([$vitePort, 5173, 5174, 5175]);
                $viteHosts = array_unique([$viteHost, 'localhost', '127.0.0.1']);
                
                $scriptSources = [];
                $connectSources = [];
                
                foreach ($viteHosts as $host) {
                    foreach ($vitePorts as $port) {
                        $scriptSources[] = "http://{$host}:{$port}";
                        $connectSources[] = "ws://{$host}:{$port}";
                        $connectSources[] = "http://{$host}:{$port}";
                    }
                }
                
                // Add to policy (deduplicated)
                $scriptSourcesStr = implode(' ', array_unique($scriptSources));
                $connectSourcesStr = implode(' ', array_unique($connectSources));
                
                // Inject into script-src and connect-src if not already present
                if (strpos($policy, 'script-src') !== false) {
                    $policy = preg_replace(
                        '/(script-src[^;]+)/',
                        '$1 ' . $scriptSourcesStr,
                        $policy,
                        1
                    );
                }
                
                if (strpos($policy, 'connect-src') !== false) {
                    $policy = preg_replace(
                        '/(connect-src[^;]+)/',
                        '$1 ' . $connectSourcesStr,
                        $policy,
                        1
                    );
                }
            }
            
            $response->headers->set('Content-Security-Policy', $policy);
        }

        return $response;
    }
}
