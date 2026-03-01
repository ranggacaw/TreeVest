<?php

namespace App\Jobs;

use App\Enums\GeneratedReportStatus;
use App\Events\ReportReady;
use App\Models\GeneratedReport;
use App\Services\PdfReportService;
use Exception;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class GeneratePdfReport implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public array $backoff = [60, 300, 900];

    public function __construct(
        public GeneratedReport $report
    ) {}

    public function handle(PdfReportService $pdfReportService): void
    {
        try {
            $pdfReportService->generate($this->report->fresh());

            event(new ReportReady($this->report->fresh()));
        } catch (Exception $e) {
            Log::error('Failed to generate PDF report', [
                'report_id' => $this->report->id,
                'error' => $e->getMessage(),
            ]);

            $this->report->fresh()->update([
                'status' => GeneratedReportStatus::Failed,
                'failure_reason' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    public function failed(?Exception $exception): void
    {
        if ($this->report) {
            $this->report->update([
                'status' => GeneratedReportStatus::Failed,
                'failure_reason' => $exception?->getMessage() ?? 'Unknown error',
            ]);
        }
    }
}
