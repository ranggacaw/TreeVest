<?php

namespace App\Http\Controllers\Investor;

use App\Enums\GeneratedReportStatus;
use App\Enums\ReportType;
use App\Http\Controllers\Controller;
use App\Http\Requests\ReportFilterRequest;
use App\Jobs\GeneratePdfReport;
use App\Models\Farm;
use App\Models\FruitType;
use App\Models\GeneratedReport;
use App\Models\Investment;
use App\Services\CsvReportService;
use App\Services\ReportDataService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function __construct(
        protected ReportDataService $reportDataService,
        protected CsvReportService $csvReportService
    ) {}

    public function index(ReportFilterRequest $request)
    {
        $user = $request->user();
        $filters = $request->validated();

        $profitLossData = $this->reportDataService->getProfitLossData($user, $filters);
        $performanceData = $this->reportDataService->getPerformanceData($user, $filters);

        $farms = Farm::whereHas('fruitCrops.trees.investments', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })->get(['id', 'name']);

        $fruitTypes = FruitType::whereHas('fruitCrops.trees.investments', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })->get(['id', 'name']);

        $investments = Investment::where('user_id', $user->id)
            ->with('tree.fruitCrop.farm')
            ->get(['id', 'tree_id', 'amount_cents', 'purchase_date'])
            ->map(function ($inv) {
                return [
                    'id' => $inv->id,
                    'label' => sprintf(
                        '%s - %s (%s)',
                        $inv->tree->fruitCrop->farm->name ?? 'Unknown Farm',
                        $inv->tree->tree_identifier,
                        number_format($inv->amount_cents / 100, 2)
                    ),
                ];
            });

        $recentReports = GeneratedReport::where('user_id', $user->id)
            ->where('report_type', ReportType::ProfitLoss)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get(['id', 'status', 'created_at', 'expires_at']);

        return Inertia::render('Investor/Reports/Index', [
            'profitLoss' => $profitLossData,
            'performance' => $performanceData,
            'filters' => $filters,
            'filterOptions' => [
                'farms' => $farms,
                'fruitTypes' => $fruitTypes,
                'investments' => $investments,
            ],
            'recentReports' => $recentReports,
        ]);
    }

    public function requestPdf(ReportFilterRequest $request)
    {
        $user = $request->user();
        $filters = $request->validated();

        $report = GeneratedReport::create([
            'user_id' => $user->id,
            'report_type' => ReportType::ProfitLoss,
            'parameters' => $filters,
            'status' => GeneratedReportStatus::Pending,
        ]);

        GeneratePdfReport::dispatch($report);

        return response()->json(['message' => 'Report generation started', 'report_id' => $report->id], Response::HTTP_ACCEPTED);
    }

    public function exportCsv(ReportFilterRequest $request)
    {
        $user = $request->user();
        $filters = $request->validated();

        return $this->csvReportService->streamProfitLoss($user, $filters);
    }

    public function download(GeneratedReport $report)
    {
        $user = auth()->user();

        if ($report->user_id !== $user->id) {
            abort(Response::HTTP_FORBIDDEN, 'You do not own this report.');
        }

        if ($report->status !== GeneratedReportStatus::Completed) {
            return response()->json(['message' => 'Report is not ready yet'], Response::HTTP_ACCEPTED);
        }

        if ($report->isExpired()) {
            return response()->json(['message' => 'Report has expired'], Response::HTTP_GONE);
        }

        if (! $report->file_path || ! Storage::exists($report->file_path)) {
            abort(Response::HTTP_NOT_FOUND, 'Report file not found.');
        }

        return Storage::download($report->file_path, sprintf('%s_report.pdf', $report->report_type->value));
    }
}
