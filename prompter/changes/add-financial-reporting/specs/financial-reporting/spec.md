## ADDED Requirements

### Requirement: Financial Reports Page Access
Authenticated investors SHALL have access to a dedicated financial reports page at `/reports`.

#### Scenario: Investor accesses reports page
- **WHEN** an authenticated user with role `investor` navigates to `/reports`
- **THEN** the system displays the financial reports page
- **AND** the page is rendered via `Inertia::render('Investor/Reports/Index', $props)`
- **AND** the page title is "Financial Reports"

#### Scenario: Non-investor attempts to access reports page
- **WHEN** an authenticated user with role `admin` or `farm_owner` attempts to access `/reports`
- **THEN** the system returns HTTP 403 Forbidden

#### Scenario: Unauthenticated user attempts to access reports page
- **WHEN** an unauthenticated user attempts to access `/reports`
- **THEN** the system redirects to the login page

---

### Requirement: Profit / Loss Statement
The financial reports page SHALL display a profit/loss statement table for the authenticated investor, aggregating data from all completed investment payouts and investment costs.

#### Scenario: P&L table displayed with data
- **WHEN** an investor views the reports page with at least one completed payout
- **THEN** the system displays a P&L statement table with columns: Investment (tree identifier + fruit type + variant), Farm, Amount Invested (RM), Total Payouts Received (RM), Net Profit/Loss (RM), ROI % (actual), Status
- **AND** "Net Profit/Loss" = Total Payouts Received − Amount Invested
- **AND** positive net values are displayed in green, negative in red
- **AND** a summary row at the bottom of the table shows: Total Invested, Total Returns, Overall Net, Overall ROI %

#### Scenario: P&L table with no completed payouts
- **WHEN** an investor has active investments but no completed payouts
- **THEN** the P&L table is displayed with all investment rows showing RM 0.00 for payouts, net = negative (−amount invested), ROI 0%
- **AND** a note is displayed: "Returns will appear after harvest payouts are distributed"

#### Scenario: P&L table for investor with no investments
- **WHEN** an investor has zero investments
- **THEN** the system displays an empty state: "No investment data available. Start investing to see your financial reports."

---

### Requirement: Report Filter Controls
The financial reports page SHALL provide filter controls to narrow the P&L statement by date range, farm, crop type, and individual investment.

#### Scenario: Filter by date range
- **WHEN** an investor sets a start date and end date in the filter form and submits
- **THEN** the P&L table shows only payouts received within that date range
- **AND** the "Amount Invested" column still reflects the full investment amount (not prorated)
- **AND** the filter values persist in the URL query string (e.g., `?from=2025-01-01&to=2025-12-31`)

#### Scenario: Filter by farm
- **WHEN** an investor selects a specific farm from the farm filter dropdown
- **THEN** the P&L table shows only investments in trees on the selected farm
- **AND** the farm dropdown lists only farms in which the investor holds at least one investment

#### Scenario: Filter by crop type
- **WHEN** an investor selects a specific fruit type from the crop type filter
- **THEN** the P&L table shows only investments in trees of the selected fruit type
- **AND** the crop type dropdown lists only fruit types present in the investor's portfolio

#### Scenario: Filter by individual investment
- **WHEN** an investor selects a specific investment from the investment dropdown
- **THEN** the P&L table shows only that single investment row

#### Scenario: Clear all filters
- **WHEN** an investor clicks "Clear Filters"
- **THEN** all filter fields are reset to their default (empty) state
- **AND** the P&L table reloads to show all investments without filters
- **AND** the URL query string is cleared

#### Scenario: Filter validation — invalid date range
- **WHEN** an investor submits a filter with end date earlier than start date
- **THEN** the system returns a validation error: "End date must be on or after start date"
- **AND** the P&L table is not reloaded

---

### Requirement: Investment Performance Analytics Charts
The financial reports page SHALL display interactive charts comparing projected vs. actual returns across the investor's portfolio.

#### Scenario: Performance comparison bar chart
- **WHEN** an investor views the reports page with at least one investment with actual payouts
- **THEN** the system displays a bar chart with: X-axis = investment identifiers (tree name + variant), Y-axis = amount in RM, two bars per investment: projected return (blue) and actual return (green)
- **AND** a tooltip on hover displays the exact projected amount, actual amount, and percentage difference
- **AND** the chart is rendered using Recharts `BarChart` component
- **AND** a summary line below the chart shows: "Total projected: RM X | Total actual: RM Y | Difference: ±RM Z (±N%)"

#### Scenario: Performance chart with no actual returns
- **WHEN** an investor has active investments but no completed payouts
- **THEN** the chart displays only projected return bars
- **AND** a note is displayed: "Actual returns will appear after harvest payouts are completed"

#### Scenario: Negative performance display
- **WHEN** actual returns are lower than projected returns
- **THEN** the summary difference is displayed in red (e.g., "−RM 500 (−10%)")

#### Scenario: ROI trend line chart
- **WHEN** an investor has completed payouts spanning at least two calendar months
- **THEN** the system displays a line chart showing cumulative actual returns over time
- **AND** the X-axis shows months (e.g., "Jan 2025", "Feb 2025")
- **AND** the Y-axis shows cumulative RM returned
- **AND** the chart is rendered using Recharts `LineChart` component

---

### Requirement: Performance Metrics Summary
The financial reports page SHALL display a summary card with key performance metrics for the investor's full portfolio.

#### Scenario: Summary metrics displayed
- **WHEN** an investor views the reports page
- **THEN** the system displays a summary card showing: Total Amount Invested (RM), Total Returns Received (RM), Overall Net Profit/Loss (RM), Overall ROI % (actual), Unrealised Gains (sum of projected remaining returns for active investments not yet paid out)
- **AND** all monetary values are displayed in RM format (e.g., "RM 12,345.67")
- **AND** "Unrealised Gains" = sum of (projected return − actual return paid) for all active investments with incomplete harvest cycles

#### Scenario: Metrics respect active date range filter
- **WHEN** an investor applies a date range filter
- **THEN** the summary card recalculates all metrics using only payouts within the filtered date range
- **AND** "Total Amount Invested" remains unfiltered (reflects total capital deployed)

---

### Requirement: Reports Page Performance
The reports page data queries SHALL be optimised to load within acceptable time limits for investors with up to 100 investments.

#### Scenario: Reports page loads within time limit
- **WHEN** the system executes a report data query for an investor with up to 100 investments
- **THEN** the query execution time is less than 1000ms
- **AND** the system uses Eloquent eager loading: `Investment::with('tree.fruitCrop.fruitType', 'tree.fruitCrop.farm', 'payouts')`
- **AND** all filter queries use indexed columns (`investments.user_id`, `payouts.status`, `payouts.created_at`)

#### Scenario: Reports page uses pagination for large investment lists
- **WHEN** an investor has more than 50 investments
- **THEN** the P&L table paginates at 50 rows per page
- **AND** the performance charts display data for all investments (not paginated) up to 100 investments
