# Tasks: Add Financial Reporting & Analytics (EPIC-011)

> **Depends on:** `add-harvest-returns-system` change must be implemented first (provides `Payout` model, `PayoutStatus` enum, `payouts` table).

---

## 1. Database & Models

- [x] 1.1 Create migration `create_generated_reports_table` with columns: `id` (ULID), `user_id` (FK), `report_type` (enum: `profit_loss`, `tax_summary`), `parameters` (JSON), `status` (enum: `pending`, `generating`, `completed`, `failed`), `file_path` (nullable string), `failure_reason` (nullable text), `expires_at` (nullable datetime), `deleted_at` (soft delete), timestamps
- [x] 1.2 Create `GeneratedReport` Eloquent model in `app/Models/GeneratedReport.php` with: `$fillable`, `$casts` (parameters as array, status as `GeneratedReportStatus` enum), `HasFactory`, `SoftDeletes`, relationship `belongsTo(User::class)`
- [x] 1.3 Create `GeneratedReportStatus` enum in `app/Enums/GeneratedReportStatus.php` with cases: `Pending`, `Generating`, `Completed`, `Failed`
- [x] 1.4 Create `ReportType` enum in `app/Enums/ReportType.php` with cases: `ProfitLoss`, `TaxSummary`

---

## 2. Backend — Services

- [x] 2.1 Create `app/Services/ReportDataService.php` with methods:
  - `getProfitLossData(User $user, array $filters): array` — returns investments with payout aggregates, filtered by date range / farm / crop type / investment
  - `getTaxSummaryData(User $user, int $year): array` — returns completed payouts and investment purchases for the calendar year
  - All monetary values returned as integers (cents); formatting is frontend responsibility
- [x] 2.2 Create `app/Services/PdfReportService.php` with method `generate(GeneratedReport $report): void` — renders Blade template, calls DomPDF, stores file, updates report status
- [x] 2.3 Create `app/Services/CsvReportService.php` with methods: `streamProfitLoss(User $user, array $filters, resource $output): void` and `streamTaxSummary(User $user, int $year, resource $output): void` — both use `Investment::cursor()` / `Payout::cursor()` and write with `fputcsv()`
- [x] 2.4 Install DomPDF: `composer require barryvdh/laravel-dompdf`

---

## 3. Backend — Jobs, Events & Listeners

- [x] 3.1 Create `app/Jobs/GeneratePdfReport.php` — queued, max 3 attempts, exponential backoff; constructor receives `GeneratedReport $report`; calls `PdfReportService::generate()`, dispatches `ReportReady` event on success, updates status to `failed` on exhausted retries
- [x] 3.2 Create `app/Events/ReportReady.php` — carries `GeneratedReport $report` and `User $user`
- [x] 3.3 Create `app/Listeners/NotifyInvestorReportReady.php` — sends database + email notification to investor; uses existing `notifications` infrastructure

---

## 4. Backend — Controllers & FormRequests

- [x] 4.1 Create `app/Http/Requests/ReportFilterRequest.php` with validation rules: `from` (nullable date), `to` (nullable date, after_or_equal:from), `farm_id` (nullable, exists:farms,id), `fruit_type_id` (nullable, exists:fruit_types,id), `investment_id` (nullable, exists:investments,id, owned by auth user)
- [x] 4.2 Create `app/Http/Requests/TaxSummaryRequest.php` with validation rules: `year` (required, integer, between:current_year−10, current_year+1)
- [x] 4.3 Create `app/Http/Controllers/Investor/ReportController.php` with methods:
  - `index(ReportFilterRequest $request)` — returns `Inertia::render('Investor/Reports/Index', [...])` with P&L data, performance data, filter options (farms, fruit types, investments for this user)
  - `requestPdf(ReportFilterRequest $request)` — creates `GeneratedReport`, dispatches `GeneratePdfReport` job, returns 202
  - `exportCsv(ReportFilterRequest $request)` — returns `StreamedResponse` via `CsvReportService::streamProfitLoss()`
  - `download(GeneratedReport $report)` — serves PDF file (auth + ownership check, status check)
- [x] 4.4 Create `app/Http/Controllers/Investor/TaxReportController.php` with methods:
  - `show(int $year)` — validates year range, returns `Inertia::render('Investor/Reports/Tax/Show', [...])`
  - `requestPdf(TaxSummaryRequest $request)` — creates `GeneratedReport` with `report_type=tax_summary`, dispatches job, returns 202
  - `exportCsv(TaxSummaryRequest $request)` — returns `StreamedResponse` via `CsvReportService::streamTaxSummary()`

---

## 5. Backend — Routes

- [x] 5.1 Add to `routes/web.php` under `Route::middleware(['auth', 'role:investor'])` group:
  ```php
  Route::prefix('reports')->name('reports.')->group(function () {
      Route::get('/', [ReportController::class, 'index'])->name('index');
      Route::post('/pdf', [ReportController::class, 'requestPdf'])->name('pdf.request');
      Route::get('/csv', [ReportController::class, 'exportCsv'])->name('csv');
      Route::get('/download/{report}', [ReportController::class, 'download'])->name('download');
      Route::get('/tax', fn() => redirect()->route('reports.tax.show', ['year' => now()->year]))->name('tax');
      Route::get('/tax/{year}', [TaxReportController::class, 'show'])->name('tax.show');
      Route::post('/tax/{year}/pdf', [TaxReportController::class, 'requestPdf'])->name('tax.pdf.request');
      Route::get('/tax/{year}/csv', [TaxReportController::class, 'exportCsv'])->name('tax.csv');
  });
  ```
- [x] 5.2 Apply rate limiting to `reports.pdf.request` and `reports.tax.pdf.request` routes (5 requests per 10 minutes per user)

---

## 6. Backend — Scheduled Command

- [x] 6.1 Create `app/Console/Commands/PurgeExpiredReports.php` — finds `GeneratedReport` records with `expires_at < now()`, deletes stored files from `storage/app/private/reports/`, then soft-deletes the records
- [x] 6.2 Register command in `app/Console/Kernel.php` (or `routes/console.php` for Laravel 11+) to run daily at 02:00

---

## 7. Backend — PDF Blade Templates

- [x] 7.1 Create `resources/views/reports/pdf/financial-report.blade.php` — table-based HTML layout (no flexbox/grid; DomPDF compatible) with: header section, P&L summary card, P&L investment table, footer disclaimer; accepts `$data` array from `PdfReportService`
- [x] 7.2 Create `resources/views/reports/pdf/tax-summary.blade.php` — table-based HTML with: header, income table (payouts), investment activity table, totals, disclaimer; accepts `$data` array

---

## 8. Frontend — TypeScript Types

- [x] 8.1 Add to `resources/js/types/index.d.ts` (or a new `reports.d.ts`):
  - `ProfitLossRow` interface: `{ investmentId, treeIdentifier, fruitType, variant, farmName, amountInvestedCents, totalPayoutsCents, netCents, actualRoiPercent, status }`
  - `ProfitLossSummary` interface: totals
  - `PerformanceDataPoint` interface for chart data
  - `GeneratedReport` interface: `{ id, reportType, status, expiresAt }`
  - `TaxSummaryPayoutRow` and `TaxSummaryInvestmentRow` interfaces

---

## 9. Frontend — Pages & Components

- [x] 9.1 Create `resources/js/Pages/Investor/Reports/Index.tsx` — reports page with: filter form (`ReportFilterForm`), summary metrics card, P&L table (`ProfitLossTable`), performance charts (`PerformanceBarChart`, `ReturnsTrendChart`), PDF request button with generating state, CSV download link
- [x] 9.2 Create `resources/js/Pages/Investor/Reports/Tax/Show.tsx` — tax summary page with: year selector, disclaimer, income table, investment activity table, totals, PDF request button, CSV download link
- [x] 9.3 Create `resources/js/Components/ReportFilterForm.tsx` — filter form with date pickers, farm/crop/investment dropdowns; uses `router.get()` with query params on submit
- [x] 9.4 Create `resources/js/Components/ProfitLossTable.tsx` — paginated table (50 rows/page) with green/red net values; summary row at bottom
- [x] 9.5 Create `resources/js/Components/PerformanceBarChart.tsx` — Recharts `BarChart` for projected vs. actual returns comparison; tooltip showing values and percentage difference
- [x] 9.6 Create `resources/js/Components/ReturnsTrendChart.tsx` — Recharts `LineChart` for cumulative returns over time by month

---

## 10. Tests

- [x] 10.1 `tests/Unit/ReportDataServiceTest.php` — unit tests for `getProfitLossData()`: correct aggregation of payouts, filter application, monetary integer arithmetic, edge cases (zero payouts, all-cancelled investments)
- [x] 10.2 `tests/Unit/ReportDataServiceTest.php` — unit tests for `getTaxSummaryData()`: correct year boundary filtering (Jan 1 to Dec 31), includes completed payouts only, includes investment purchases
- [x] 10.3 `tests/Feature/ReportControllerTest.php` — feature tests: investor can access `/reports`, non-investor gets 403, filter parameters are applied, CSV download returns correct content, PDF request creates `GeneratedReport` and dispatches job (faked queue)
- [x] 10.4 `tests/Feature/TaxReportControllerTest.php` — feature tests: investor can access `/reports/tax/2025`, invalid year returns 404, CSV export streams correct content, PDF request dispatches job
- [x] 10.5 `tests/Feature/ReportDownloadTest.php` — feature tests: completed report can be downloaded, pending report returns 202, expired report returns 410, other investor's report returns 403
- [x] 10.6 `tests/Unit/GeneratePdfReportJobTest.php` — unit test: job calls `PdfReportService`, updates `GeneratedReport` status, dispatches `ReportReady` event on success, sets `status=failed` after max retries

---

## Post-Implementation

- [x] Update `AGENTS.md` in project root to reflect the new `financial-reporting`, `report-downloads`, and `tax-reporting` specs and the `GeneratedReport` model / `generated_reports` table in the data model section
