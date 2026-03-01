<?php

namespace App\Services;

use App\Enums\GeneratedReportStatus;
use App\Enums\ReportType;
use App\Models\GeneratedReport;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;

class PdfReportService
{
    public function generate(GeneratedReport $report): void
    {
        $report->update(['status' => GeneratedReportStatus::Generating]);

        try {
            $data = $this->buildReportData($report);

            $view = $report->report_type === ReportType::ProfitLoss
                ? 'reports.pdf.financial-report'
                : 'reports.pdf.tax-summary';

            $pdf = Pdf::loadView($view, ['data' => $data]);

            $filePath = $this->storePdf($pdf, $report);

            $report->update([
                'status' => GeneratedReportStatus::Completed,
                'file_path' => $filePath,
                'expires_at' => now()->addDays(7),
            ]);
        } catch (\Exception $e) {
            $report->update([
                'status' => GeneratedReportStatus::Failed,
                'failure_reason' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    protected function buildReportData(GeneratedReport $report): array
    {
        $user = $report->user;
        $parameters = $report->parameters ?? [];

        if ($report->report_type === ReportType::ProfitLoss) {
            $reportDataService = new ReportDataService;
            $profitLossData = $reportDataService->getProfitLossData($user, $parameters);
            $performanceData = $reportDataService->getPerformanceData($user, $parameters);

            return [
                'user' => $user,
                'generatedAt' => now()->format('Y-m-d H:i:s'),
                'filters' => $parameters,
                'profitLoss' => $profitLossData,
                'performance' => $performanceData,
            ];
        }

        if ($report->report_type === ReportType::TaxSummary) {
            $reportDataService = new ReportDataService;
            $year = $parameters['year'] ?? now()->year;
            $taxData = $reportDataService->getTaxSummaryData($user, $year);

            return [
                'user' => $user,
                'generatedAt' => now()->format('Y-m-d H:i:s'),
                'year' => $year,
                'taxSummary' => $taxData,
            ];
        }

        return [];
    }

    protected function storePdf($pdf, GeneratedReport $report): string
    {
        $directory = sprintf('private/reports/%d', $report->user_id);

        if (! Storage::exists($directory)) {
            Storage::makeDirectory($directory);
        }

        $filename = sprintf('%s_%s.pdf', $report->report_type->value, $report->id);
        $path = sprintf('%s/%s', $directory, $filename);

        Storage::put($path, $pdf->output());

        return $path;
    }
}
