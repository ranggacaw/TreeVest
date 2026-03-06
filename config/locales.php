<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Supported Locales
    |--------------------------------------------------------------------------
    |
    | This array defines all locales that are supported by the application.
    | Each locale includes metadata such as the native name, English name,
    | flag emoji, and text direction (ltr or rtl).
    |
    */

    'supported' => [
        'en' => [
            'code' => 'en',
            'name' => 'English',
            'native_name' => 'English',
            'flag' => '🇬🇧',
            'dir' => 'ltr',
        ],
        'id' => [
            'code' => 'id',
            'name' => 'Indonesian',
            'native_name' => 'Bahasa Indonesia',
            'flag' => '🇮🇩',
            'dir' => 'ltr',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Default Locale
    |--------------------------------------------------------------------------
    |
    | The default locale to use when no user preference is set and browser
    | detection fails. This should always be one of the supported locales.
    |
    */

    'default' => env('APP_LOCALE', 'en'),

    /*
    |--------------------------------------------------------------------------
    | Fallback Locale
    |--------------------------------------------------------------------------
    |
    | The fallback locale is used when the requested locale is not available.
    | This should always be one of the supported locales.
    |
    */

    'fallback' => env('APP_FALLBACK_LOCALE', 'en'),

    /*
    |--------------------------------------------------------------------------
    | Available Locales (Legacy)
    |--------------------------------------------------------------------------
    |
    | This is a legacy configuration used by older parts of the codebase.
    | It will be deprecated in favor of the 'supported' array above.
    |
    */

    'available' => explode(',', env('APP_AVAILABLE_LOCALES', 'en,id')),

    /*
    |--------------------------------------------------------------------------
    | Machine Translation Service
    |--------------------------------------------------------------------------
    |
    | Configuration for automated translation drafting using external APIs.
    |
    */

    'translation_service' => [
        'driver' => env('TRANSLATION_DRIVER', 'google'),
        'api_key' => env('TRANSLATION_API_KEY'),
        'project_id' => env('TRANSLATION_PROJECT_ID'),
        'rate_limit' => env('TRANSLATION_RATE_LIMIT', 100), // requests per minute
    ],

];
