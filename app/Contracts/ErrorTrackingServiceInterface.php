<?php

namespace App\Contracts;

use Throwable;

interface ErrorTrackingServiceInterface
{
    /**
     * Report an error to the error tracking service
     */
    public function reportError(Throwable $exception, array $context = [], ?string $user_id = null): void;

    /**
     * Report a financial operation error with enhanced context
     */
    public function reportFinancialError(
        Throwable $exception,
        string $operation,
        array $financial_context = [],
        ?string $user_id = null
    ): void;

    /**
     * Report a user interface error from React components
     */
    public function reportUIError(array $error_info, ?string $user_id = null): void;

    /**
     * Check if error tracking is enabled
     */
    public function isEnabled(): bool;

    /**
     * Get error tracking configuration info
     */
    public function getConfig(): array;
}
