<?php

namespace App\Http\Controllers\Investor;

use App\Enums\GeneratedReportStatus;
use App\Enums\ReportType;
use App\Http\Controllers\Controller;
use App\Http\Requests\TaxSummaryRequest;
use App\Jobs\GeneratePdfReport;
use App\Models\GeneratedReport;
use App\Services\CsvReportService;
use App\Services\ReportDataService;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class TaxReportController extends Controller
{
    public function __construct(
        protected ReportDataService $reportDataService,
        protected CsvReportService $csvReportService
    ) {}

    public function show(int $year, TaxSummaryRequest $request)
    {
        $user = $request->user();
        $taxData = $this->reportDataService->getTaxSummaryData($user, $year);

        $recentReports = GeneratedReport::where('user_id', $user->id)
            ->where('report_type', ReportType::TaxSummary)
            ->where('parameters', 'like', sprintf('%%"year":%d%%', $year))
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get(['id', 'status', 'created_at', 'expires_at']);

        return Inertia::render('Investor/Reports/Tax/Show', [
            'taxData' => $taxData,
            'year' => $year,
            'recentReports' => $recentReports,
        ]);
    }

    public function requestPdf(TaxSummaryRequest $request)
    {
        $user = $request->user();
        $year = $request->validated()['year'];

        $report = GeneratedReport::create([
            'user_id' => $user->id,
            'report_type' => ReportType::TaxSummary,
            'parameters' => ['year' => $year],
            'status' => GeneratedReportStatus::Pending,
        ]);

        GeneratePdfReport::dispatch($report);

        return response()->json(['message' => 'Report generation started', 'report_id' => $report->id], Response::HTTP_ACCEPTED);
    }

    public function exportCsv(TaxSummaryRequest $request)
    {
        $user = $request->user();
        $year = $request->validated()['year'];

        return $this->csvReportService->streamTaxSummary($user, $year);
    }
}
