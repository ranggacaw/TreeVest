<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $currentLocale = app()->getLocale();
        $supportedLocales = config('locales.supported', []);

        // Get current locale metadata
        $currentLocaleData = $supportedLocales[$currentLocale] ?? $supportedLocales['en'];
        $isRtl = ($currentLocaleData['dir'] ?? 'ltr') === 'rtl';

        view()->share('isRtl', $isRtl);

        return [
            ...parent::share($request),
            'locale' => $currentLocale,
            'locales' => [
                'current' => $currentLocaleData,
                'supported' => $supportedLocales,
            ],
            'availableLocales' => $supportedLocales, // Legacy support
            'isRtl' => $isRtl,
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'role' => $request->user()->role,
                    'phone' => $request->user()->phone,
                    'avatar_url' => $request->user()->avatar_url,
                    'email_verified_at' => $request->user()->email_verified_at?->toISOString(),
                    'phone_verified_at' => $request->user()->phone_verified_at?->toISOString(),
                    'two_factor_enabled_at' => $request->user()->two_factor_enabled_at?->toISOString(),
                    'last_login_at' => $request->user()->last_login_at?->toISOString(),
                ] : null,
            ],
            'stripe' => [
                'publishable_key' => config('services.stripe.key'),
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
                'warning' => $request->session()->get('warning'),
                'info' => $request->session()->get('info'),
            ],
        ];
    }
}
