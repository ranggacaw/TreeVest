<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    public function handle(Request $request, Closure $next): Response
    {
        $availableLocales = array_keys(config('app.available_locales', []));

        $locale = null;

        $user = $request->user();
        if ($user) {
            $userLocale = $user->locale;
            if ($userLocale && in_array($userLocale, $availableLocales, true)) {
                $locale = $userLocale;
            }
        }

        if (! $locale && session()->has('locale')) {
            $sessionLocale = session('locale');
            if (in_array($sessionLocale, $availableLocales, true)) {
                $locale = $sessionLocale;
            }
        }

        if (! $locale) {
            $acceptLanguage = $request->header('Accept-Language', '');
            $preferredLocales = explode(',', $acceptLanguage);
            $preferredLocales = array_map(function ($lang) {
                return trim(explode(';', $lang)[0]);
            }, $preferredLocales);

            foreach ($preferredLocales as $preferred) {
                $langCode = substr($preferred, 0, 2);
                if (in_array($langCode, $availableLocales, true)) {
                    $locale = $langCode;
                    break;
                }
            }
        }

        if (! $locale) {
            $locale = config('app.locale', 'en');
        }

        App::setLocale($locale);

        return $next($request)->withHeaders([
            'Content-Language' => $locale,
        ]);
    }
}
