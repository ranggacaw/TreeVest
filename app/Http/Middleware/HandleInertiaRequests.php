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
        return [
            ...parent::share($request),
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
        ];
    }
}
