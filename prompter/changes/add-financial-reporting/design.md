# Design: Financial Reporting & Analytics

## Context
EPIC-011 adds financial reporting for investors. Three report types are needed: a real-time P&L / performance analytics page, downloadable reports (PDF + CSV), and a year-end tax summary. Key constraints:
- PDF generation can time out for large portfolios — must be async via queue job.
- CSV export is row-by-row and streams without buffering the whole dataset.
- `barryvdh/laravel-dompdf` is the chosen library (pure PHP, no system binaries, compatible with Laragon/Windows).
- The platform uses a database-backed queue, so no additional infrastructure is needed for async jobs.
- All report data sourced from `investments`, `payouts`, `harvests`, `trees`, `fruit_crops`, `farms` — no external data source.
- Financial accuracy rule: all amounts are integers (cents); no floating-point arithmetic in calculations.

## Goals / Non-Goals
- **Goals:**
  - Investor-facing `/reports` page with P&L table and performance charts
  - Investor-facing `/reports/tax/{year}` page with annual tax summary
  - Async PDF download for both report types (job + notification + stored file)
  - Synchronous streaming CSV download for both report types
  - Date range + farm + crop type + investment filters on the P&L report
- **Non-Goals:**
  - Admin platform-level analytics (EPIC-014)
  - Real-time portfolio dashboard (already covered by `portfolio-tracking` spec)
  - Transaction ledger management (covered by `payment-processing` spec)
  - Report scheduling (deferred per EPIC-011)
  - Multi-currency display (deferred — MYR only for now)

## Decisions

### Decision 1: Async PDF via queue job + `generated_reports` table
**Problem:** DomPDF rendering a full P&L for an investor with 100+ investments could take 5–30 seconds, exceeding typical HTTP timeouts and degrading UX.

**Decision:** PDF generation is dispatched as a `GeneratePdfReport` queued job. The job:
1. Builds report data via `ReportDataService`.
2. Renders a Blade view to HTML.
3. Converts to PDF via DomPDF.
4. Stores the PDF in `storage/app/private/reports/{user_id}/{uuid}.pdf`.
5. Updates a `generated_reports` table row to `status=completed` with `download_url`.
6. Dispatches `ReportReady` event → `NotifyInvestorReportReady` listener → sends in-app + email notification with download link.

The UI shows a "Generating..." state immediately after request and polls or uses Inertia reload on notification click.

**Alternatives considered:**
- Synchronous PDF: simplest but risks timeout; not suitable for medium/large portfolios.
- Separate PDF microservice: unnecessary complexity — DomPDF is sufficient.

### Decision 2: Streaming CSV (synchronous)
**Problem:** Buffering a large CSV dataset in memory before sending causes memory exhaustion.

**Decision:** CSV exports use Laravel's `StreamedResponse` with `fputcsv()` writing directly to `php://output`. No file is stored; the download happens inline. CSV is small enough to not need async dispatch for typical portfolios (thousands of rows are fine with streaming).

**Alternative considered:** Laravel Excel (Maatwebsite) — adds a dependency with many features we don't need. Native PHP streaming is simpler and sufficient.

### Decision 3: Three capabilities, not one
The spec is split into three capabilities:
- `financial-reporting` — the reporting UI page (P&L, performance analytics, filters)
- `report-downloads` — the download mechanics (async PDF, streaming CSV, `generated_reports` lifecycle)
- `tax-reporting` — the year-end tax summary (separate page, separate report type, but reuses download capabilities)

This separation keeps each capability within the "10-minute understandability" rule and avoids a single 30-requirement spec.

### Decision 4: `generated_reports` table columns
| Column | Type | Notes |
|--------|------|-------|
| `id` | ULID/UUID | Primary key |
| `user_id` | FK | Belongs to investor |
| `report_type` | enum | `profit_loss`, `tax_summary` |
| `parameters` | JSON | Filters used (date range, farm_id, etc.) |
| `status` | enum | `pending`, `generating`, `completed`, `failed` |
| `file_path` | string (nullable) | Relative path in `storage/app/private/reports/` |
| `failure_reason` | string (nullable) | DomPDF or data error |
| `expires_at` | datetime | 7 days after completion — file purged by scheduled command |
| `created_at`, `updated_at` | timestamps | |

### Decision 5: Report data calculation rules (financial accuracy)
- All amounts queried from database as integer cents.
- All arithmetic (sums, ratios) performed as integers in PHP.
- Percentage ROI calculated as: `round(($actualReturn / $investmentAmount) * 100, 2)` — only divided to float at final display formatting step.
- Frontend formats with `Intl.NumberFormat` for RM display.
- No floating-point intermediate values stored.

### Decision 6: Performance — large dataset report queries
- `ReportDataService` uses Eloquent eager loading with chunking for PDF generation (to avoid loading thousands of rows at once).
- CSV streaming uses `cursor()` (lazy collection) to avoid memory spikes.
- Database indexes on `investments.user_id`, `payouts.status`, `payouts.created_at` are assumed from upstream specs.

## Risks / Trade-offs
- **DomPDF CSS limitations** — DomPDF does not support all modern CSS (no flexbox/grid). Blade PDF templates must use table-based layouts. Risk: low (reports are tabular by nature).
- **Stored PDF security** — PDF files stored in `storage/app/private/` (not `public/`). Download served via a signed temporary URL (`Storage::temporaryUrl()` or a controller-served response with auth check). Risk: medium — must ensure no public path is exposed.
- **Database-backed queue latency** — PDF generation is queued but the database queue worker must be running. Dev environment uses `composer dev` which starts the queue worker. Risk: low.
- **Tax summary jurisdiction variance** — the spec models the platform's available data; the legal interpretation of "taxable income" is out of scope and flagged for legal review.

## Migration Plan
1. `php artisan make:migration create_generated_reports_table`
2. `composer require barryvdh/laravel-dompdf`
3. New routes under `routes/web.php` in `Route::middleware(['auth', 'role:investor'])` group
4. No breaking changes to existing specs or tables

## Open Questions
- Should expired report files (>7 days) be purged by a scheduled `app:purge-expired-reports` command, or rely on S3 lifecycle rules? → Scheduled command (no S3 at launch).
- Should the performance analytics chart on `/reports` reuse the Recharts components already used in `portfolio-tracking`, or be new components? → Reuse existing `SeasonalityChart.tsx` / `PerformanceChart.tsx` pattern from `portfolio-tracking`.
