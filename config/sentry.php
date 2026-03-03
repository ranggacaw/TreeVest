<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Sentry DSN
    |--------------------------------------------------------------------------
    |
    | The Sentry DSN. This is required to send error reports to Sentry.
    |
    */

    'dsn' => env('SENTRY_LARAVEL_DSN'),

    /*
    |--------------------------------------------------------------------------
    | Breadcrumbs
    |--------------------------------------------------------------------------
    |
    | Enable breadcrumbs to track user actions and context.
    |
    */

    'breadcrumbs' => [
        // Capture Laravel logs as breadcrumbs
        'logs' => true,

        // Capture SQL queries as breadcrumbs
        'sql_queries' => env('SENTRY_BREADCRUMBS_SQL_QUERIES_ENABLED', true),

        // Capture SQL transaction queries as breadcrumbs
        'sql_transactions' => env('SENTRY_BREADCRUMBS_SQL_TRANSACTIONS_ENABLED', false),

        // Capture SQL bindings as breadcrumb data
        'sql_bindings' => env('SENTRY_BREADCRUMBS_SQL_BINDINGS_ENABLED', false),

        // Capture queue job information as breadcrumbs
        'queue_info' => env('SENTRY_BREADCRUMBS_QUEUE_INFO_ENABLED', true),

        // Capture command information as breadcrumbs
        'command_info' => true,

        // Capture HTTP requests information as breadcrumbs
        'http_client_requests' => env('SENTRY_BREADCRUMBS_HTTP_CLIENT_REQUESTS_ENABLED', true),
    ],

    /*
    |--------------------------------------------------------------------------
    | Performance Monitoring
    |--------------------------------------------------------------------------
    |
    | This controls the sample rate for performance monitoring (traces).
    |
    */

    'traces_sample_rate' => (float) env('SENTRY_TRACES_SAMPLE_RATE', 0.0),

    /*
    |--------------------------------------------------------------------------
    | Profiles Sample Rate
    |--------------------------------------------------------------------------
    |
    | This controls the sample rate for profiling.
    |
    */

    'profiles_sample_rate' => (float) env('SENTRY_PROFILES_SAMPLE_RATE', 0.0),

    /*
    |--------------------------------------------------------------------------
    | Send Default PII
    |--------------------------------------------------------------------------
    |
    | If this option is enabled, certain personally identifiable information
    | is added by active integrations. Without this flag they are never added
    | to the event, to begin with.
    |
    */

    'send_default_pii' => env('SENTRY_SEND_DEFAULT_PII', false),

    /*
    |--------------------------------------------------------------------------
    | Server Name
    |--------------------------------------------------------------------------
    |
    | The server name to be sent with events.
    |
    */

    'server_name' => env('SENTRY_SERVER_NAME', php_uname('n')),

    /*
    |--------------------------------------------------------------------------
    | Environment
    |--------------------------------------------------------------------------
    |
    | The environment to be sent with events.
    |
    */

    'environment' => env('SENTRY_ENVIRONMENT', env('APP_ENV', 'production')),

    /*
    |--------------------------------------------------------------------------
    | Release
    |--------------------------------------------------------------------------
    |
    | The release to be sent with events.
    |
    */

    'release' => env('SENTRY_RELEASE'),

    /*
    |--------------------------------------------------------------------------
    | Excluded Exceptions
    |--------------------------------------------------------------------------
    |
    | List of exceptions that should not be reported to Sentry.
    |
    */

    'ignore_exceptions' => [
        Illuminate\Auth\AuthenticationException::class,
        Illuminate\Auth\Access\AuthorizationException::class,
        Illuminate\Database\Eloquent\ModelNotFoundException::class,
        Illuminate\Session\TokenMismatchException::class,
        Illuminate\Validation\ValidationException::class,
        Symfony\Component\HttpKernel\Exception\HttpException::class,
        Symfony\Component\HttpKernel\Exception\NotFoundHttpException::class,
        Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException::class,
    ],

    /*
    |--------------------------------------------------------------------------
    | Ignored URLs
    |--------------------------------------------------------------------------
    |
    | List of URLs that should be ignored by Sentry.
    |
    */

    'ignore_transactions' => [
        // Ignore health check endpoints
        '/health',
        '/ping',
        '/status',
        
        // Ignore telescope routes if using telescope
        '/telescope*',
        
        // Ignore horizon routes if using horizon
        '/horizon*',
    ],



    /*
    |--------------------------------------------------------------------------
    | Custom Integrations
    |--------------------------------------------------------------------------
    |
    | Custom integrations can be configured here.
    |
    */

    'integrations' => [
        Sentry\Laravel\Integration::class,
    ],

    /*
    |--------------------------------------------------------------------------
    | Before Send
    |--------------------------------------------------------------------------
    |
    | This callback is called for every event before it is sent to Sentry.
    | You can use this to filter events or add additional context.
    |
    */

    'before_send' => function (\Sentry\Event $event, ?\Sentry\EventHint $hint): ?\Sentry\Event {
        // Filter out specific errors in development
        if (app()->environment('local')) {
            // Don't send events in local development unless explicitly enabled
            if (!env('SENTRY_SEND_LOCAL_EVENTS', false)) {
                return null;
            }
        }

        // Add custom tags for financial operations
        if ($event->getTransaction() && str_contains($event->getTransaction(), 'investment')) {
            $event->setTag('category', 'financial');
        }

        return $event;
    },
];