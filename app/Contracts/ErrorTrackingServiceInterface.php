<?php

namespace App\Contracts;

use Throwable;

interface ErrorTrackingServiceInterface
{
    /**
     * Report an error to the error tracking service
     *
     * @param Throwable $exception
     * @param array $context
     * @param string|null $user_id
     * @return void
     */
    public function reportError(Throwable $exception, array $context = [], ?string $user_id = null): void;

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
    ): void;

    /**
     * Report a user interface error from React components
     *
     * @param array $error_info
     * @param string|null $user_id
     * @return void
     */
    public function reportUIError(array $error_info, ?string $user_id = null): void;

    /**
     * Check if error tracking is enabled
     *
     * @return bool
     */
    public function isEnabled(): bool;

    /**
     * Get error tracking configuration info
     *
     * @return array
     */
    public function getConfig(): array;
}