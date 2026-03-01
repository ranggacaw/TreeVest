# Change: Add Financial Reporting & Analytics (EPIC-011)

## Why
Investors need transparent, downloadable financial records to track performance, meet personal tax obligations, and make informed reinvestment decisions. Without P&L statements, performance analytics, and tax summaries, the platform cannot build investor trust or satisfy the compliance requirements of a regulated investment product.

## What Changes
- New capability `financial-reporting`: dedicated `/reports` page for investors with profit/loss statements and performance analytics charts, filterable by date range, farm, crop type, and investment.
- New capability `report-downloads`: async PDF generation (via Laravel queue job + DomPDF + notification when ready) and synchronous streaming CSV export for all report types.
- New capability `tax-reporting`: dedicated `/reports/tax/{year}` page generating a year-end tax summary of all completed payouts, investment activity, and fees for the selected calendar year.
- New `ReportGenerationJob` queued job and `ReportReady` notification.
- New `GeneratedReport` model to track async report status and download URLs.

## Impact
- **Affected specs (new):** `financial-reporting`, `report-downloads`, `tax-reporting`
- **Affected specs (modified):** none — this change introduces entirely new capabilities orthogonal to existing specs
- **Affected code (implementation):**
  - Models: `GeneratedReport`
  - Services: `ReportDataService`, `PdfReportService`, `CsvReportService`
  - Jobs: `GeneratePdfReport`
  - Events: `ReportReady`
  - Listeners: `NotifyInvestorReportReady`
  - Controllers: `Investor/ReportController`, `Investor/TaxReportController`
  - FormRequests: `ReportFilterRequest`, `TaxSummaryRequest`
  - Pages: `resources/js/Pages/Investor/Reports/Index.tsx`, `resources/js/Pages/Investor/Reports/Show.tsx`, `resources/js/Pages/Investor/Reports/Tax/Show.tsx`
  - Components: `ReportFilterForm.tsx`, `ProfitLossTable.tsx`, `PerformanceChart.tsx`
  - Migrations: `create_generated_reports_table`
  - New composer dependency: `barryvdh/laravel-dompdf`
  - Blade view: `resources/views/reports/pdf/financial-report.blade.php`, `resources/views/reports/pdf/tax-summary.blade.php`

## Dependencies
- `payment-processing` spec — `Transaction` model with type `investment_purchase` and `payout`
- `add-harvest-returns-system` change — `Payout` model with `status=completed`, `amount_cents`, `harvest_id`, `investment_id`
- `portfolio-tracking` spec — `Investment` model relationships (tree, fruitCrop, farm, payouts)
- `notifications` spec — notification infrastructure for `ReportReady` notification
