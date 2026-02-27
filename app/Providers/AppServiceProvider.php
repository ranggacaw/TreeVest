<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);
        \App\Models\AuditLog::observe(\App\Observers\AuditLogObserver::class);
        \App\Models\Transaction::observe(\App\Observers\TransactionObserver::class);
        \Illuminate\Support\Facades\Event::subscribe(\App\Listeners\AuthenticationLogSubscriber::class);

        \Illuminate\Support\Facades\RateLimiter::for('auth-throttle', function (\Illuminate\Http\Request $request) {
            return \Illuminate\Cache\RateLimiting\Limit::perMinute(5)
                ->by($request->ip())
                ->response(function (\Illuminate\Http\Request $request, array $headers) {
                    return response('Too many attempts. Please try again later.', 429, $headers);
                });
        });

        \Illuminate\Support\Facades\RateLimiter::for('financial-throttle', function (\Illuminate\Http\Request $request) {
            return \Illuminate\Cache\RateLimiting\Limit::perMinute(10)
                ->by($request->user()?->id ?: $request->ip())
                ->response(function (\Illuminate\Http\Request $request, array $headers) {
                    return response('Too many financial attempts. Please try again later.', 429, $headers);
                });
        });
    }
}
