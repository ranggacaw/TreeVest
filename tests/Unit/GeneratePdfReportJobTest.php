<?php

namespace Tests\Unit;

use App\Enums\GeneratedReportStatus;
use App\Enums\ReportType;
use App\Events\ReportReady;
use App\Jobs\GeneratePdfReport;
use App\Models\GeneratedReport;
use App\Models\User;
use App\Services\PdfReportService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class GeneratePdfReportJobTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected GeneratedReport $report;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->investor()->create();
        $this->report = GeneratedReport::factory()->create([
            'user_id' => $this->user->id,
            'report_type' => ReportType::ProfitLoss,
            'status' => GeneratedReportStatus::Pending,
        ]);

        Storage::fake('private');
    }

    public function test_job_calls_pdf_report_service_generate(): void
    {
        $service = $this->mock(PdfReportService::class);
        $service->shouldReceive('generate')->once()->with($this->report);

        $job = new GeneratePdfReport($this->report);
        $job->handle($service);
    }

    public function test_job_updates_report_status_to_completed_on_success(): void
    {
        Storage::put('private/reports/test.pdf', 'PDF content');

        $job = new GeneratePdfReport($this->report);
        $job->handle(app(PdfReportService::class));

        $this->report->refresh();
        $this->assertEquals(GeneratedReportStatus::Completed, $this->report->status);
        $this->assertNotNull($this->report->file_path);
        $this->assertNotNull($this->report->expires_at);
    }

    public function test_job_dispatches_report_ready_event_on_success(): void
    {
        Event::fake();

        Storage::put('private/reports/test.pdf', 'PDF content');

        $job = new GeneratePdfReport($this->report);
        $job->handle(app(PdfReportService::class));

        Event::assertDispatched(ReportReady::class, function ($event) {
            return $event->report->id === $this->report->id &&
                $event->user->id === $this->user->id;
        });
    }

    public function test_job_sets_status_to_failed_after_max_retries(): void
    {
        $this->mock(PdfReportService::class)
            ->shouldReceive('generate')
            ->andThrow(new \Exception('PDF generation failed'));

        $job = new GeneratePdfReport($this->report);

        $job->failed(new \Exception('PDF generation failed'));

        $this->report->refresh();
        $this->assertEquals(GeneratedReportStatus::Failed, $this->report->status);
        $this->assertStringContainsString('PDF generation failed', $this->report->failure_reason ?? '');
    }

    public function test_job_logs_error_on_failure(): void
    {
        $this->mock(PdfReportService::class)
            ->shouldReceive('generate')
            ->andThrow(new \Exception('Test error'));

        \Log::shouldReceive('error')
            ->once()
            ->with(
                'Failed to generate PDF report',
                \Mockery::on(function ($context) {
                    return isset($context['report_id']) &&
                        isset($context['error']);
                }),
            );

        $job = new GeneratePdfReport($this->report);

        try {
            $job->handle(app(PdfReportService::class));
        } catch (\Exception $e) {
            $this->assertEquals('Test error', $e->getMessage());
        }
    }

    public function test_job_has_correct_retry_configuration(): void
    {
        $job = new GeneratePdfReport($this->report);

        $this->assertEquals(3, $job->tries);
        $this->assertEquals([60, 300, 900], $job->backoff);
    }

    public function test_job_is_queued(): void
    {
        Queue::fake();

        GeneratePdfReport::dispatch($this->report);

        Queue::assertPushed(GeneratePdfReport::class);
    }

    public function test_job_sets_failure_reason_on_exception(): void
    {
        $errorMessage = 'PDF generation error';

        $this->mock(PdfReportService::class)
            ->shouldReceive('generate')
            ->andThrow(new \Exception($errorMessage));

        $job = new GeneratePdfReport($this->report);

        try {
            $job->handle(app(PdfReportService::class));
        } catch (\Exception $e) {
            $this->assertEquals($errorMessage, $e->getMessage());
        }

        $this->report->refresh();
        $this->assertEquals(GeneratedReportStatus::Failed, $this->report->status);
        $this->assertEquals($errorMessage, $this->report->failure_reason);
    }

    public function test_job_updates_status_to_generating(): void
    {
        $this->mock(PdfReportService::class)
            ->shouldReceive('generate')
            ->andReturnUsing(function ($report) {
                $this->assertEquals(GeneratedReportStatus::Generating, $report->status);
                throw new \Exception('Test');
            });

        $job = new GeneratePdfReport($this->report);

        try {
            $job->handle(app(PdfReportService::class));
        } catch (\Exception $e) {
        }
    }

    public function test_job_handles_tax_summary_report(): void
    {
        $taxReport = GeneratedReport::factory()->create([
            'user_id' => $this->user->id,
            'report_type' => ReportType::TaxSummary,
            'status' => GeneratedReportStatus::Pending,
            'parameters' => ['year' => 2024],
        ]);

        Storage::put('private/reports/tax_summary_test.pdf', 'Tax PDF content');

        $service = $this->mock(PdfReportService::class);
        $service->shouldReceive('generate')->once()->with($taxReport);

        $job = new GeneratePdfReport($taxReport);
        $job->handle($service);
    }
}
