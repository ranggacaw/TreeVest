<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Throwable;

class ErrorTrackingService
{
    /**
     * Report an error to the error tracking service
     *
     * @param Throwable $exception
     * @param array $context
     * @param string|null $user_id
     * @return void
     */
    public function reportError(Throwable $exception, array $context = [], ?string $user_id = null): void
    {
        try {
            // Add context information
            $errorContext = array_merge($context, [
                'timestamp' => now()->toISOString(),
                'environment' => config('app.env'),
                'user_id' => $user_id,
                'exception_class' => get_class($exception),
                'exception_message' => $exception->getMessage(),
                'exception_file' => $exception->getFile(),
                'exception_line' => $exception->getLine(),
            ]);

            // Send to Sentry if available
            if (app()->bound('sentry') && config('sentry.dsn')) {
                \Sentry\withScope(function (\Sentry\State\Scope $scope) use ($exception, $errorContext, $user_id) {
                    // Set user context if available
                    if ($user_id) {
                        $scope->setUser(['id' => $user_id]);
                    }

                    // Set additional context
                    $scope->setContext('error_details', $errorContext);
                    
                    // Add tags for categorization
                    if (isset($errorContext['category'])) {
                        $scope->setTag('category', $errorContext['category']);
                    }
                    
                    if (isset($errorContext['component'])) {
                        $scope->setTag('component', $errorContext['component']);
                    }

                    // Report the exception
                    \Sentry\captureException($exception);
                });
            }

            // Always log to Laravel logs as backup
            Log::error('Error tracked: ' . $exception->getMessage(), $errorContext);

        } catch (Throwable $trackingError) {
            // If error tracking itself fails, log it but don't throw
            Log::error('Error tracking service failed', [
                'original_error' => $exception->getMessage(),
                'tracking_error' => $trackingError->getMessage(),
            ]);
        }
    }

    /**
     * Report a financial operation error with enhanced context
     *
     * @param Throwable $exception
     * @param string $operation
     * @param array $financial_context
     * @param string|null $user_id
     * @return void
     */
    public function reportFinancialError(
        Throwable $exception, 
        string $operation, 
        array $financial_context = [], 
        ?string $user_id = null
    ): void {
        $context = array_merge($financial_context, [
            'category' => 'financial',
            'operation' => $operation,
            'component' => 'payment_system',
        ]);

        $this->reportError($exception, $context, $user_id);
    }

    /**
     * Report a user interface error from React components
     *
     * @param array $error_info
     * @param string|null $user_id
     * @return void
     */
    public function reportUIError(array $error_info, ?string $user_id = null): void
    {
        try {
            $context = [
                'category' => 'ui',
                'component' => $error_info['component'] ?? 'unknown',
                'error_boundary' => $error_info['error_boundary'] ?? null,
                'component_stack' => $error_info['component_stack'] ?? null,
                'props' => $error_info['props'] ?? null,
                'url' => request()->url(),
                'user_agent' => request()->userAgent(),
            ];

            // Create a synthetic exception for UI errors
            $exception = new \Exception(
                $error_info['message'] ?? 'React component error',
                0,
                isset($error_info['original_error']) ? new \Exception($error_info['original_error']) : null
            );

            $this->reportError($exception, $context, $user_id);

        } catch (Throwable $trackingError) {
            Log::error('Failed to report UI error', [
                'ui_error' => $error_info,
                'tracking_error' => $trackingError->getMessage(),
            ]);
        }
    }

    /**
     * Check if error tracking is enabled
     *
     * @return bool
     */
    public function isEnabled(): bool
    {
        return config('sentry.dsn') !== null && config('sentry.dsn') !== '';
    }

    /**
     * Get error tracking configuration info
     *
     * @return array
     */
    public function getConfig(): array
    {
        return [
            'enabled' => $this->isEnabled(),
            'environment' => config('sentry.environment'),
            'sample_rate' => config('sentry.traces_sample_rate'),
            'send_default_pii' => config('sentry.send_default_pii'),
        ];
    }
}