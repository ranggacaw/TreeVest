# report-downloads Specification

## Purpose
TBD - created by archiving change add-financial-reporting. Update Purpose after archive.
## Requirements
### Requirement: Generated Report Tracking
The system SHALL maintain a `generated_reports` table to track the lifecycle of every PDF report request, from dispatch through completion or failure.

#### Scenario: Report record created on PDF request
- **WHEN** an investor requests a PDF download for a financial report
- **THEN** a `GeneratedReport` record is created with: `user_id`, `report_type` (`profit_loss` or `tax_summary`), `parameters` (JSON of applied filters), `status=pending`
- **AND** the `GeneratePdfReport` job is dispatched to the queue
- **AND** the system returns a 202 response with the `generated_report_id` for polling

#### Scenario: Report record updated on generation completion
- **WHEN** the `GeneratePdfReport` job successfully generates the PDF
- **THEN** the `GeneratedReport` record is updated to `status=completed`
- **AND** the `file_path` is set to the relative path of the stored PDF in `storage/app/private/reports/{user_id}/{uuid}.pdf`
- **AND** `expires_at` is set to 7 days from completion

#### Scenario: Report record updated on generation failure
- **WHEN** the `GeneratePdfReport` job fails (e.g., DomPDF rendering error)
- **THEN** the `GeneratedReport` record is updated to `status=failed`
- **AND** the `failure_reason` field is populated with the error message
- **AND** no file is stored

#### Scenario: Report expires after 7 days
- **WHEN** a `GeneratedReport` record has `expires_at` in the past
- **THEN** the scheduled `app:purge-expired-reports` command deletes the stored PDF file
- **AND** the `GeneratedReport` record is soft-deleted
- **AND** any attempt to download the expired report returns HTTP 410 Gone with message: "This report has expired. Please generate a new one."

---

### Requirement: Async PDF Generation Job
The system SHALL generate PDF reports via a queued `GeneratePdfReport` job using `barryvdh/laravel-dompdf`, dispatching a notification when the report is ready for download.

#### Scenario: PDF generated successfully
- **WHEN** the `GeneratePdfReport` job executes
- **THEN** the job calls `ReportDataService` to build the report dataset
- **AND** renders the appropriate Blade PDF template (`resources/views/reports/pdf/financial-report.blade.php` or `tax-summary.blade.php`)
- **AND** converts the rendered HTML to PDF using the `Pdf` facade from `barryvdh/laravel-dompdf`
- **AND** stores the PDF at `storage/app/private/reports/{user_id}/{generated_report_id}.pdf`
- **AND** updates the `GeneratedReport` record to `status=completed`
- **AND** dispatches the `ReportReady` event

#### Scenario: PDF report notifies investor when ready
- **WHEN** the `ReportReady` event is dispatched
- **THEN** the `NotifyInvestorReportReady` listener sends an in-app notification and an email notification to the investor
- **AND** the notification message is: "Your [Report Type] report is ready. Click to download."
- **AND** the notification includes a link to `GET /reports/download/{generated_report_id}`

#### Scenario: PDF generation job retries on transient failure
- **WHEN** the `GeneratePdfReport` job fails due to a transient error (e.g., database timeout)
- **THEN** the Laravel queue retries the job up to 3 times with exponential backoff
- **AND** if all retries are exhausted, the `GeneratedReport` record is updated to `status=failed`
- **AND** the failure is logged with context: `user_id`, `generated_report_id`, `error_message`

#### Scenario: PDF Blade template content for financial report
- **WHEN** the PDF template is rendered for a `profit_loss` report
- **THEN** the template includes: report header (Treevest logo, investor name, date range, generated-at timestamp), P&L summary card (totals), P&L table (one row per investment: tree identifier, farm, invested amount, total payouts, net profit/loss, ROI %), footer with disclaimer: "This report is for informational purposes only and does not constitute tax advice."

---

### Requirement: PDF Download Endpoint
The system SHALL provide a secure download endpoint for completed PDF reports that serves the file directly with proper authentication and authorization checks.

#### Scenario: Investor downloads their own completed report
- **WHEN** an authenticated investor sends `GET /reports/download/{generated_report_id}` for a report they own with `status=completed`
- **THEN** the system serves the stored PDF file as a download response with: `Content-Type: application/pdf`, `Content-Disposition: attachment; filename="treevest-report-{type}-{date}.pdf"`
- **AND** the file is read from `storage/app/private/reports/` (never from a public path)

#### Scenario: Investor attempts to download another investor's report
- **WHEN** an authenticated investor requests download of a `GeneratedReport` that belongs to another user
- **THEN** the system returns HTTP 403 Forbidden

#### Scenario: Download of report still generating
- **WHEN** an investor requests download of a `GeneratedReport` with `status=pending` or `status=generating`
- **THEN** the system returns HTTP 202 with JSON: `{"status": "generating", "message": "Your report is still being generated. You will be notified when it is ready."}`

#### Scenario: Download of failed report
- **WHEN** an investor requests download of a `GeneratedReport` with `status=failed`
- **THEN** the system returns HTTP 422 with message: "Report generation failed. Please try again."

---

### Requirement: CSV Export (Streaming)
The system SHALL provide synchronous streaming CSV export for the financial reports, writing rows directly to the response output without buffering the full dataset in memory.

#### Scenario: Investor downloads P&L CSV
- **WHEN** an authenticated investor submits a CSV export request for the financial reports page (with any active filters)
- **THEN** the system returns a `StreamedResponse` with: `Content-Type: text/csv`, `Content-Disposition: attachment; filename="treevest-pl-report-{date}.csv"`
- **AND** the CSV contains a header row: `Investment,Tree ID,Farm,Fruit Type,Variant,Amount Invested (MYR),Total Payouts (MYR),Net Profit/Loss (MYR),ROI %,Status`
- **AND** one data row per investment matching the applied filters
- **AND** a summary row appended at the end: `TOTAL,,,,,,{total_invested},{total_payouts},{net_pl},{overall_roi},`
- **AND** all amounts are formatted as decimal values (e.g., `1500.00`) in the CSV, not as integers

#### Scenario: CSV export with applied filters
- **WHEN** an investor downloads a CSV with active filters (date range, farm, crop type)
- **THEN** the CSV data reflects only the filtered investments and payouts
- **AND** the CSV filename includes the filter context (e.g., `treevest-pl-report-2025-01-01-to-2025-12-31.csv`)

#### Scenario: CSV export uses lazy collection for memory efficiency
- **WHEN** the CSV export query executes
- **THEN** the system uses `Investment::cursor()` (Eloquent lazy collection) to iterate results without loading all rows into memory
- **AND** each row is written to the output stream immediately via `fputcsv()`

#### Scenario: CSV export for investor with no investments
- **WHEN** an investor with no investments requests a CSV export
- **THEN** the system returns a CSV with only the header row
- **AND** no data rows or summary row are included

---

### Requirement: Report Download Rate Limiting
The system SHALL rate limit PDF generation requests to prevent abuse and excessive queue load.

#### Scenario: Rate limit on PDF generation requests
- **WHEN** an investor submits more than 5 PDF generation requests within 10 minutes
- **THEN** subsequent requests are throttled with HTTP 429 (Too Many Requests)
- **AND** the response includes: "You have requested too many reports. Please wait before generating another."

#### Scenario: CSV exports are not rate limited by the report rate limit
- **WHEN** an investor requests multiple CSV exports
- **THEN** CSV exports are subject only to the standard global rate limit, not the PDF-specific limit

