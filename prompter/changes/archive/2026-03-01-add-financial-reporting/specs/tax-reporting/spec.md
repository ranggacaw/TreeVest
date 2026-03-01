## ADDED Requirements

### Requirement: Tax Summary Page Access
Authenticated investors SHALL have access to a year-end tax summary page at `/reports/tax/{year}`.

#### Scenario: Investor accesses current year tax summary
- **WHEN** an authenticated investor navigates to `/reports/tax/2025`
- **THEN** the system displays the tax summary page for the year 2025
- **AND** the page is rendered via `Inertia::render('Investor/Reports/Tax/Show', $props)`
- **AND** the page title is "2025 Tax Summary"

#### Scenario: Investor navigates to available tax years
- **WHEN** an investor visits `/reports/tax`
- **THEN** the system redirects to `/reports/tax/{current_year}`
- **AND** the page displays a year selector dropdown listing all years in which the investor had completed payouts, plus the current year

#### Scenario: Non-investor attempts to access tax summary
- **WHEN** an authenticated user with role `admin` or `farm_owner` attempts to access `/reports/tax/2025`
- **THEN** the system returns HTTP 403 Forbidden

#### Scenario: Invalid year parameter
- **WHEN** an investor navigates to `/reports/tax/2015` (year before platform launch) or `/reports/tax/2099` (future year more than 1 year ahead)
- **THEN** the system returns HTTP 404 Not Found

---

### Requirement: Tax Summary Statement
The tax summary page SHALL display a structured summary of the investor's financial activity for the selected calendar year, including all completed payouts, total investment purchases, and platform fees.

#### Scenario: Tax summary with completed payouts for the year
- **WHEN** an investor views the tax summary for a year in which they received completed payouts
- **THEN** the system displays: Year Summary header (investor name, tax year, generated date), Income Section: all completed payouts (date, farm, tree identifier, fruit type, gross payout amount in RM), Investment Activity Section: all investment purchases made in the year (date, tree identifier, farm, amount invested), Platform Fees Section: total platform fees deducted from payouts in the year (if fee data is available), Summary Totals: gross income from payouts, total invested, net income (gross payouts − fees), and a disclaimer
- **AND** all amounts are displayed in MYR
- **AND** payouts are listed in chronological order

#### Scenario: Tax summary disclaimer displayed
- **WHEN** an investor views the tax summary page
- **THEN** a disclaimer is displayed prominently: "This summary is provided for informational purposes only. Treevest does not provide tax advice. Please consult a qualified tax advisor regarding your obligations in your jurisdiction."
- **AND** the disclaimer is displayed above the financial data

#### Scenario: Tax summary for year with no activity
- **WHEN** an investor views the tax summary for a year in which they had no completed payouts and no investment purchases
- **THEN** the system displays a message: "No financial activity recorded for [Year]. This summary will update when payouts are received or investments are made."

#### Scenario: Tax summary payout data accuracy
- **WHEN** the system builds the tax summary payout list
- **THEN** only payouts with `status=completed` and `created_at` (or `completed_at`) within the calendar year (Jan 1 00:00:00 to Dec 31 23:59:59 UTC) are included
- **AND** payout amounts are sourced directly from the `payouts` table (`amount_cents` / 100)

---

### Requirement: Tax Summary PDF Download
The tax summary page SHALL support async PDF download using the same `report-downloads` infrastructure, generating a formatted tax summary PDF report.

#### Scenario: Investor requests tax summary PDF
- **WHEN** an investor clicks "Download PDF" on the tax summary page for year 2025
- **THEN** the system creates a `GeneratedReport` record with `report_type=tax_summary` and `parameters={"year": 2025}`
- **AND** the `GeneratePdfReport` job is dispatched
- **AND** the UI shows a "Generating..." indicator with message: "Your tax summary PDF is being generated. You will be notified when it is ready."

#### Scenario: Tax summary PDF Blade template content
- **WHEN** the PDF template is rendered for a `tax_summary` report
- **THEN** the template includes: header (Treevest logo, investor full name, tax year, generated-at timestamp), income table (date, description, gross payout in RM, per row), investment activity table (date, description, amount invested in RM), summary totals, disclaimer (identical to on-screen disclaimer)
- **AND** the PDF filename is `treevest-tax-summary-{year}-{investor_name}.pdf`

---

### Requirement: Tax Summary CSV Export
The tax summary page SHALL support synchronous streaming CSV export of the investor's annual tax data.

#### Scenario: Investor downloads tax summary CSV
- **WHEN** an authenticated investor submits a CSV export request on the tax summary page for year 2025
- **THEN** the system returns a `StreamedResponse` with `Content-Type: text/csv` and `Content-Disposition: attachment; filename="treevest-tax-summary-2025.csv"`
- **AND** the CSV contains two sections: an Income section with header `Date,Description,Farm,Tree,Fruit Type,Gross Payout (MYR)` and one row per completed payout; an Investment section with header `Date,Description,Farm,Tree,Amount Invested (MYR)` and one row per investment purchase
- **AND** a totals row at the end of each section
