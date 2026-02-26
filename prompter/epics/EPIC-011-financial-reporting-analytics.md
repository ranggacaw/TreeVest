# EPIC-011: Build Financial Reporting & Analytics

> **Status:** DRAFT (PRD-based, pending FSD/TDD-Lite refinement)

## Business Value Statement
Empower investors with comprehensive financial reporting tools that provide transparency into investment performance, support tax obligations, and enable data-driven investment decisions. Reporting is a trust and compliance requirement for any investment platform.

## Description
This EPIC implements financial reporting and analytics for investors, including profit/loss statements, investment performance analytics with charts, downloadable reports (PDF, CSV), and year-end tax summaries. Reports aggregate data from investments, harvests, payouts, and transactions to present a complete financial picture of an investor's activity on the platform.

## Source Traceability
| Document | Reference | Section/Page |
|----------|-----------|--------------|
| PRD | Profit/loss statements | Section 5 - Financial Reporting |
| PRD | Investment performance analytics | Section 5 - Financial Reporting |
| PRD | Downloadable reports (PDF, CSV) | Section 5 - Financial Reporting |
| PRD | Year-end tax summaries | Section 5 - Financial Reporting |
| PRD | Tax documentation/reports | Section 4 - Profit Distribution |

## Scope Definition
| In Scope | Out of Scope |
|----------|--------------|
| Profit/loss statements per investment and aggregate | Real-time portfolio dashboard (EPIC-007) |
| Investment performance analytics with charts | Transaction ledger management (EPIC-010) |
| Downloadable reports in PDF and CSV formats | Admin-level platform analytics (EPIC-014) |
| Year-end tax summary generation | |
| Date range filtering for all reports | |
| Performance comparison across investments | |
| Return rate calculations (actual vs. projected) | |
| Report scheduling (optional) | |

## High-Level Acceptance Criteria
- [ ] Investors can view profit/loss statements for individual investments and portfolio-wide
- [ ] Investment performance analytics are displayed with interactive charts
- [ ] Reports can be filtered by date range, farm, crop type, and investment
- [ ] Reports can be downloaded in PDF format with professional formatting
- [ ] Reports can be downloaded in CSV format for spreadsheet analysis
- [ ] Year-end tax summaries are generated with all required tax-relevant data
- [ ] Performance metrics include: total invested, total returns, ROI percentage, unrealized gains
- [ ] Report generation handles large datasets without timeout
- [ ] Reports reflect accurate, up-to-date financial data

## Dependencies
- **Prerequisite EPICs:** EPIC-006 (Investment data), EPIC-009 (Harvest/Payout data), EPIC-010 (Transaction data)
- **External Dependencies:**
  - PDF generation: Laravel DomPDF or Snappy (server-side)
  - CSV export: Laravel Excel (Maatwebsite) or native PHP streaming
  - Charts: React charting library (e.g., Recharts, Chart.js via react-chartjs-2) rendered client-side in Inertia pages
- **Technical Prerequisites:** Complete investment and payout data model; Eloquent query scopes and aggregations for report data; Laravel queue jobs for large report generation; Inertia::render() pages for report viewing; FormRequest classes for report filter validation

## Complexity Assessment
- **Size:** M
- **Technical Complexity:** Medium (data aggregation, PDF generation, charting)
- **Integration Complexity:** Low (internal data, library integrations only)
- **Estimated Story Count:** 7-10

## Risks & Assumptions
**Assumptions:**
- Tax summary format will be defined by legal/finance team (jurisdiction-specific)
- Charts rendered client-side using a React charting library within Inertia page components
- PDF generation handled server-side via Laravel DomPDF or Snappy, dispatched as queue job for large reports
- CSV export uses streaming response for large datasets to avoid memory issues
- Report data aggregated via Eloquent query scopes with MySQL aggregate functions
- Historical data is retained indefinitely for reporting purposes

**Risks:**
- Tax reporting requirements vary significantly by jurisdiction
- Report generation for large portfolios could be resource-intensive
- Financial calculation accuracy is critical — rounding errors in aggregations could compound
- Report data must exactly match transaction ledger (reconciliation requirement)
- Large report generation dispatched via Laravel queue jobs — report download requires async generation + notification pattern

## Related EPICs
- **Depends On:** EPIC-006 (Investments), EPIC-009 (Harvest & Returns), EPIC-010 (Transactions)
- **Blocks:** None
- **Related:** EPIC-007 (Portfolio Dashboard), EPIC-014 (Admin - platform-level analytics)
