<?php

namespace Tests\Unit\Services;

use App\Services\ErrorTrackingService;
use Exception;
use Illuminate\Support\Facades\Log;
use Tests\TestCase;

class ErrorTrackingServiceTest extends TestCase
{
    protected ErrorTrackingService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new ErrorTrackingService();
    }

    public function test_report_error_logs_to_laravel_logs()
    {
        Log::shouldReceive('error')
            ->once()
            ->with(
                'Error tracked: Test exception message',
                \Mockery::on(function ($context) {
                    return isset($context['timestamp']) 
                        && isset($context['environment'])
                        && isset($context['exception_class'])
                        && $context['exception_message'] === 'Test exception message';
                })
            );

        $exception = new Exception('Test exception message');
        $this->service->reportError($exception, ['test' => 'context'], 'user123');
    }

    public function test_report_financial_error_adds_financial_context()
    {
        Log::shouldReceive('error')
            ->once()
            ->with(
                'Error tracked: Payment failed',
                \Mockery::on(function ($context) {
                    return $context['category'] === 'financial'
                        && $context['operation'] === 'investment_purchase'
                        && $context['component'] === 'payment_system'
                        && isset($context['amount_cents']);
                })
            );

        $exception = new Exception('Payment failed');
        $this->service->reportFinancialError(
            $exception, 
            'investment_purchase', 
            ['amount_cents' => 500000], 
            'user456'
        );
    }

    public function test_report_ui_error_handles_react_error_info()
    {
        Log::shouldReceive('error')
            ->once()
            ->with(
                // reportUIError creates a synthetic exception with the message, then calls
                // reportError which logs "Error tracked: <message>"
                'Error tracked: Cannot read property of undefined',
                \Mockery::on(function ($context) {
                    return $context['category'] === 'ui'
                        && $context['component'] === 'InvestmentForm'
                        && isset($context['url'])
                        && isset($context['user_agent']);
                })
            );

        $errorInfo = [
            'message' => 'Cannot read property of undefined',
            'component' => 'InvestmentForm',
            'error_boundary' => 'FinancialErrorBoundary',
            'component_stack' => 'at InvestmentForm (InvestmentForm.tsx:45)',
            'props' => ['investment_id' => 123],
        ];

        $this->service->reportUIError($errorInfo, 'user789');
    }

    public function test_is_enabled_returns_false_when_no_dsn_configured()
    {
        config(['sentry.dsn' => null]);
        $this->assertFalse($this->service->isEnabled());

        config(['sentry.dsn' => '']);
        $this->assertFalse($this->service->isEnabled());
    }

    public function test_is_enabled_returns_true_when_dsn_configured()
    {
        config(['sentry.dsn' => 'https://test-dsn@sentry.io/project']);
        $this->assertTrue($this->service->isEnabled());
    }

    public function test_get_config_returns_service_configuration()
    {
        config([
            'sentry.dsn' => 'https://test-dsn@sentry.io/project',
            'sentry.environment' => 'testing',
            'sentry.traces_sample_rate' => 0.1,
            'sentry.send_default_pii' => false,
        ]);

        $config = $this->service->getConfig();

        $this->assertTrue($config['enabled']);
        $this->assertEquals('testing', $config['environment']);
        $this->assertEquals(0.1, $config['sample_rate']);
        $this->assertFalse($config['send_default_pii']);
    }

    public function test_report_error_handles_tracking_failure_gracefully()
    {
        // Mock Log to throw an exception on the first call, then succeed on the second
        Log::shouldReceive('error')
            ->twice()
            ->andReturnUsing(function ($message, $context) {
                static $callCount = 0;
                $callCount++;
                
                if ($callCount === 1) {
                    throw new Exception('Logging failed');
                }
                
                // Second call should be the error tracking failure log
                $this->assertStringContainsString('Error tracking service failed', $message);
            });

        $exception = new Exception('Original exception');
        
        // This should not throw an exception even if logging fails
        $this->service->reportError($exception);
    }
}