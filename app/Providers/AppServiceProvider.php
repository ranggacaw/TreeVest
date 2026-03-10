<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use App\Contracts\ErrorTrackingServiceInterface;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Register translation service based on config driver
        $this->app->singleton(\App\Services\Translation\TranslationServiceInterface::class, function ($app) {
            $driver = config('locales.translation_service.driver', 'google');

            if ($driver === 'google') {
                return new \App\Services\Translation\GoogleTranslationService();
            }

            // Fallback to dummy implementation if needed, or throw exception
            return new \App\Services\Translation\GoogleTranslationService();
        });
        $this->app->bind(\App\Contracts\SmsServiceInterface::class, \App\Services\TwilioSmsProvider::class);
        $this->app->bind(\App\Contracts\KycProviderInterface::class, \App\Services\KycProviders\ManualKycProvider::class);

        // Bind the enhanced investment service
        $this->app->bind(\App\Services\InvestmentService::class, \App\Services\InvestmentServiceEnhanced::class);

        // Register error tracking service with interface validation
        $this->app->bind(ErrorTrackingServiceInterface::class, \App\Services\ErrorTrackingService::class);
        $this->app->singleton(\App\Services\ErrorTrackingService::class, function ($app) {
            $service = new \App\Services\ErrorTrackingService();

            // Validate that the service properly implements the interface
            if (!$service instanceof ErrorTrackingServiceInterface) {
                throw new \InvalidArgumentException(
                    'ErrorTrackingService must implement ErrorTrackingServiceInterface'
                );
            }

            // Validate that all required methods exist with proper signatures
            $this->validateErrorTrackingServiceInterface($service);

            return $service;
        });
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
        \Illuminate\Support\Facades\Event::listen(
            \App\Events\RoleChanged::class,
            \App\Listeners\LogRoleChange::class
        );

        \Illuminate\Support\Facades\Event::listen(
            \App\Events\HarvestCompleted::class,
            \App\Listeners\CalculateProfitAndCreatePayoutsListener::class
        );

        \Illuminate\Support\Facades\Event::listen(
            \App\Events\HarvestCompleted::class,
            \App\Listeners\NotifyInvestorsOfHarvestCompletion::class
        );

        \Illuminate\Support\Facades\Event::listen(
            \App\Events\HarvestFailed::class,
            \App\Listeners\NotifyInvestorsOfHarvestFailure::class
        );

        \Illuminate\Support\Facades\Event::listen(
            \App\Events\PayoutsCreated::class,
            \App\Listeners\NotifyInvestorsOfPayoutCreated::class
        );

        \Illuminate\Support\Facades\Event::listen(
            \App\Events\ReportReady::class,
            \App\Listeners\NotifyInvestorReportReady::class
        );

        \Illuminate\Support\Facades\Event::listen(
            \App\Events\ListingPurchased::class,
            \App\Listeners\NotifySellerOfSale::class
        );

        \Illuminate\Support\Facades\Event::listen(
            \App\Events\ListingPurchased::class,
            \App\Listeners\NotifyBuyerOfPurchase::class
        );

        \Illuminate\Support\Facades\Event::listen(
            \App\Events\AgrotourismRegistrationConfirmed::class,
            \App\Listeners\NotifyInvestorOfRegistrationConfirmation::class
        );

        \Illuminate\Support\Facades\Event::listen(
            \App\Events\AgrotourismEventCancelled::class,
            \App\Listeners\NotifyInvestorsOfEventCancellation::class
        );

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

        \Illuminate\Support\Facades\RateLimiter::for('phone-otp-send', function (\Illuminate\Http\Request $request) {
            return \Illuminate\Cache\RateLimiting\Limit::perHour(5)->by($request->input('phone', $request->ip()));
        });

        \Illuminate\Support\Facades\RateLimiter::for('phone-otp-verify', function (\Illuminate\Http\Request $request) {
            return \Illuminate\Cache\RateLimiting\Limit::perHour(5)->by($request->input('phone', $request->ip()));
        });

        \Illuminate\Support\Facades\RateLimiter::for('2fa-verify', function (\Illuminate\Http\Request $request) {
            return \Illuminate\Cache\RateLimiting\Limit::perMinute(5)->by($request->user()?->id ?? $request->ip());
        });

        \Illuminate\Support\Facades\RateLimiter::for('oauth-callback', function (\Illuminate\Http\Request $request) {
            return \Illuminate\Cache\RateLimiting\Limit::perMinute(10)->by($request->ip());
        });

        \Illuminate\Support\Facades\RateLimiter::for('kyc-upload', function (\Illuminate\Http\Request $request) {
            return \Illuminate\Cache\RateLimiting\Limit::perHour(5)->by($request->user()?->id ?? $request->ip());
        });

        \Illuminate\Support\Facades\RateLimiter::for('report-pdf', function (\Illuminate\Http\Request $request) {
            return \Illuminate\Cache\RateLimiting\Limit::perMinute(5)->by($request->user()?->id ?? $request->ip());
        });
    }

    /**
     * Validate ErrorTrackingService implements interface correctly
     *
     * @param \App\Services\ErrorTrackingService $service
     * @throws \InvalidArgumentException
     */
    private function validateErrorTrackingServiceInterface(\App\Services\ErrorTrackingService $service): void
    {
        $requiredMethods = [
            'reportError' => [3, 'reportError(\Throwable $exception, array $context = [], ?string $user_id = null): void'],
            'reportFinancialError' => [4, 'reportFinancialError(\Throwable $exception, string $operation, array $financial_context = [], ?string $user_id = null): void'],
            'reportUIError' => [2, 'reportUIError(array $error_info, ?string $user_id = null): void'],
            'isEnabled' => [0, 'isEnabled(): bool'],
            'getConfig' => [0, 'getConfig(): array']
        ];

        foreach ($requiredMethods as $methodName => [$expectedParamCount, $signature]) {
            if (!method_exists($service, $methodName)) {
                throw new \InvalidArgumentException(
                    "ErrorTrackingService missing required method: {$methodName}. Expected signature: {$signature}"
                );
            }

            $reflection = new \ReflectionMethod($service, $methodName);
            $actualParamCount = $reflection->getNumberOfParameters();
            $requiredParamCount = $reflection->getNumberOfRequiredParameters();

            // Check parameter count (accounting for optional parameters)
            if ($actualParamCount < $requiredParamCount || $requiredParamCount > $expectedParamCount) {
                throw new \InvalidArgumentException(
                    "ErrorTrackingService method '{$methodName}' has incorrect parameter count. " .
                    "Expected up to {$expectedParamCount} parameters, got {$actualParamCount} with {$requiredParamCount} required. " .
                    "Expected signature: {$signature}"
                );
            }
        }
    }
}
