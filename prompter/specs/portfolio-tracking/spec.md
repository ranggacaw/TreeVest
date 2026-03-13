# portfolio-tracking Specification

## Purpose
TBD - created by archiving change add-portfolio-tracking-dashboard. Update Purpose after archive.
## Requirements
### Requirement: Portfolio Dashboard Access
Authenticated investors SHALL have access to a portfolio dashboard as their default landing page after login.

#### Scenario: Investor accesses portfolio dashboard
- **WHEN** an authenticated user with role `investor` navigates to `/portfolio`
- **THEN** the system displays the portfolio dashboard page
- **AND** the dashboard is rendered via Inertia with component `Portfolio/Dashboard.tsx`
- **AND** the user's browser URL is `/portfolio`

#### Scenario: Non-investor attempts to access portfolio
- **WHEN** an authenticated user with role `admin` or `farm_owner` attempts to access `/portfolio`
- **THEN** the system returns HTTP 403 Forbidden
- **AND** the system displays an error message: "Access denied. Portfolio dashboard is available to investors only."

#### Scenario: Unauthenticated user attempts to access portfolio
- **WHEN** an unauthenticated user attempts to access `/portfolio`
- **THEN** the system redirects to the login page
- **AND** after successful login as investor, the system redirects back to `/portfolio`

#### Scenario: Investor logs in and is redirected to portfolio
- **WHEN** an investor successfully authenticates via login form
- **THEN** the system redirects to `/portfolio` (not `/dashboard`)

---

### Requirement: Portfolio Summary Display
The portfolio dashboard SHALL display a prominent summary header card showing total invested value, current portfolio value, total gain/loss in both absolute and percentage terms, and total payouts received — modelled after Bibit's and Stockbit's portfolio summary header.

#### Scenario: Portfolio summary header displayed with data
- **WHEN** an investor views the portfolio dashboard with active investments
- **THEN** the system displays a full-width summary header card containing:
  - Total Invested (sum of all active `investment.amount_cents`, formatted as currency)
  - Current Value (total invested + total completed payouts received, formatted as currency)
  - Total Gain/Loss (current value − total invested, formatted as currency with +/− prefix)
  - Return Percentage ((gain/loss ÷ total invested) × 100, rounded to 2 decimal places)
  - Total Payouts Received (sum of completed `Payout.net_amount_cents`)
- **AND** the gain/loss amount and percentage are displayed in green if positive, red if negative, gray if zero

#### Scenario: Portfolio summary header for empty portfolio
- **WHEN** an investor views the portfolio dashboard with zero investments
- **THEN** the summary header displays all values as zero (RM 0.00 / 0.00%)
- **AND** an empty-state CTA is displayed below the header: "Start your portfolio — Browse Marketplace"

---

### Requirement: Investment List Display on Dashboard
The portfolio dashboard SHALL display a holdings list where each investment row shows tree details, quantity, current value, and per-investment gain/loss — modelled after Stockbit's portfolio holdings tab.

#### Scenario: Holdings list displayed
- **WHEN** an investor views the portfolio dashboard "Holdings" tab
- **THEN** the system displays a scrollable list of investment rows, each showing:
  - Tree thumbnail (farm featured image)
  - Tree identifier and fruit type/variant (e.g., "Tree-042 — Durian Musang King")
  - **Quantity** (number of trees, e.g., "3 trees")
  - Amount invested (`quantity × price_cents` at purchase time, formatted)
  - Total payouts received for this investment (sum of completed payout `net_amount_cents`)
  - Gain/Loss (total payouts − amount invested, with +/− prefix, green/red colouring)
  - Gain/Loss % ((gain/loss ÷ amount invested) × 100, 2 d.p.)
  - Tree lifecycle stage badge
  - "View Details" link to `/investments/{id}`
- **AND** rows are ordered by `purchase_date DESC` by default
- **AND** a sort control allows sorting by: Date (default), Gain/Loss %, Investment Amount

#### Scenario: Performance sparkline per holding
- **WHEN** a holding row is rendered and the investment has ≥ 2 completed payouts
- **THEN** a mini sparkline chart is rendered on the row showing cumulative payout value over time
- **AND** the sparkline uses green colour if total payouts > 0, gray if no payouts yet
- **AND** the sparkline is rendered using a lightweight Recharts `LineChart` (no axes, no labels, 60×24 px)

#### Scenario: Holdings list empty state
- **WHEN** an investor has no investments
- **THEN** the holdings list displays: "No holdings yet. Browse available trees to start investing."
- **AND** a "Browse Marketplace" button is shown linking to `/trees`

#### Scenario: Holdings list pagination
- **WHEN** an investor has more than 20 holdings
- **THEN** the holdings list paginates at 20 items per page
- **AND** pagination controls are displayed at the bottom of the list

---

---

### Requirement: Portfolio Diversification Visualization
The portfolio dashboard SHALL display a donut chart showing portfolio allocation by fruit type, farm, and risk level — modelled after Bibit's allocation chart.

#### Scenario: Allocation donut chart displayed
- **WHEN** an investor views the portfolio dashboard with investments in multiple fruit types
- **THEN** the system displays a donut chart (Recharts `PieChart` with `innerRadius`) showing allocation by fruit type
- **AND** each segment is colour-coded by fruit type
- **AND** the chart centre displays the total portfolio value
- **AND** a legend shows each fruit type with value (formatted) and percentage

#### Scenario: Allocation chart tab switching
- **WHEN** an investor uses the chart tab control to switch between "By Fruit Type", "By Farm", and "By Risk"
- **THEN** the donut chart updates to show the selected grouping
- **AND** the legend updates accordingly
- **AND** the transition is animated (Recharts built-in animation)

#### Scenario: Single-category allocation
- **WHEN** an investor has investments in only one fruit type
- **THEN** the donut chart shows a single full-circle segment at 100%
- **AND** the legend shows the single category

---

### Requirement: Harvest Calendar Display
The portfolio dashboard SHALL display upcoming harvest dates for all invested trees in a timeline view.

#### Scenario: Upcoming harvests displayed
- **WHEN** an investor views the portfolio dashboard with investments in trees with scheduled harvests
- **THEN** the system displays a harvest calendar showing the next 10 upcoming harvest events
- **AND** each harvest event displays: date (formatted: "Mar 15, 2026"), farm name, fruit type and variant, estimated yield (kg), tree identifier with link to investment detail
- **AND** harvest events are grouped by month for readability
- **AND** harvest events are ordered chronologically (earliest first)

#### Scenario: No upcoming harvests
- **WHEN** an investor views the portfolio dashboard with no scheduled harvests
- **THEN** the harvest calendar displays a message: "No upcoming harvests scheduled for your investments"

#### Scenario: Harvest event links to investment detail
- **WHEN** an investor clicks on a harvest event in the calendar
- **THEN** the system navigates to `/investments/{investment_id}` for that tree investment

---

### Requirement: Performance Metrics Display
The portfolio dashboard SHALL display a comparison of projected vs. actual returns across all investments.

#### Scenario: Performance chart with actual returns
- **WHEN** an investor views the portfolio dashboard with investments that have completed payouts
- **THEN** the system displays a bar chart comparing projected vs. actual returns
- **AND** the X-axis shows investment identifiers (or tree names)
- **AND** the Y-axis shows return amounts in RM
- **AND** each investment has two bars: projected return (blue) and actual return (green)
- **AND** a tooltip displays exact values and percentage difference on hover
- **AND** a summary text displays: "Total projected: RM X | Total actual: RM Y | Difference: +RM Z (+15%)"
- **AND** the chart is rendered using Recharts `BarChart` component

#### Scenario: Performance chart with no actual returns yet
- **WHEN** an investor views the portfolio dashboard with investments that have no completed payouts
- **THEN** the system displays only projected return bars (blue)
- **AND** the actual return bars are absent or shown as zero
- **AND** a note displays: "Actual returns will appear after harvest payouts are completed"

#### Scenario: Negative performance (actual < projected)
- **WHEN** an investor views the portfolio dashboard with actual returns lower than projected
- **THEN** the performance summary displays a negative difference (e.g., "-RM 500 (-10%)")
- **AND** the difference value is displayed in red color for emphasis

---

### Requirement: Individual Investment Detail Page
Investors SHALL be able to view comprehensive details for a single investment, including tree information, farm profile, harvest history, and payout history.

#### Scenario: Investor views their own investment detail page
- **WHEN** an authenticated investor navigates to `/investments/{investment_id}` for an investment they own
- **THEN** the system displays the investment detail page
- **AND** breadcrumb navigation shows: "Portfolio > [Tree Name] > Investment Details"
- **AND** the page displays: investment summary card (purchase date, **quantity (trees)**, total amount invested, current value, status), tree details section, farm profile summary with link to `/farms/{farm_id}`, harvest history table, upcoming harvest schedule, payout history table, "View Full Tree Details" button, "Back to Portfolio" link

#### Scenario: Investor attempts to view another investor's investment
- **WHEN** an authenticated investor navigates to `/investments/{investment_id}` for an investment they do not own
- **THEN** the system returns HTTP 403 Forbidden
- **AND** the system displays an error message: "You do not have permission to view this investment"

#### Scenario: Investment does not exist
- **WHEN** an authenticated investor navigates to `/investments/{invalid_id}` for a non-existent investment
- **THEN** the system returns HTTP 404 Not Found
- **AND** the system displays an error message: "Investment not found"

#### Scenario: Unauthenticated user attempts to view investment detail
- **WHEN** an unauthenticated user attempts to access `/investments/{investment_id}`
- **THEN** the system redirects to the login page

---

### Requirement: Investment Harvest History Display
The individual investment detail page SHALL display a table of all past harvests for the invested tree with corresponding payouts.

#### Scenario: Harvest history table displayed
- **WHEN** an investor views an investment detail page for a tree with completed harvests
- **THEN** the system displays a harvest history table with columns: harvest date, status (e.g., "Completed"), actual yield (kg), quality grade, payout amount (formatted currency), payout status
- **AND** harvests are ordered by date descending (most recent first)
- **AND** payout amounts link to corresponding payout detail (if available)

#### Scenario: No harvest history
- **WHEN** an investor views an investment detail page for a tree with no completed harvests
- **THEN** the harvest history section displays: "No harvests completed yet. Estimated first harvest: [Date]"

---

### Requirement: Investment Payout History Display
The individual investment detail page SHALL display a table of all payouts received for the investment.

#### Scenario: Payout history table displayed
- **WHEN** an investor views an investment detail page with completed payouts
- **THEN** the system displays a payout history table with columns: payout date, amount (formatted), payment method, status badge, transaction reference
- **AND** payouts are ordered by date descending (most recent first)

#### Scenario: No payout history
- **WHEN** an investor views an investment detail page with no completed payouts
- **THEN** the payout history section displays: "No payouts received yet. Payouts will appear after harvests are completed and profits are distributed."

---

### Requirement: Portfolio Data Refresh
Investors SHALL be able to manually refresh portfolio data to see the latest information.

#### Scenario: Investor clicks refresh button
- **WHEN** an investor clicks the "Refresh Portfolio" button on the dashboard
- **THEN** the system reloads portfolio data from the server
- **AND** updates all dashboard components with the latest data
- **AND** displays a brief loading indicator during refresh
- **AND** displays a success toast: "Portfolio data refreshed"

---

### Requirement: Portfolio Performance Optimization
The portfolio dashboard data queries SHALL be optimized to perform well with portfolios of 50+ investments.

#### Scenario: Portfolio query with 50+ investments completes quickly
- **WHEN** the system executes a portfolio data query for an investor with 50 or more active investments
- **THEN** the query execution time is less than 500ms
- **AND** the system uses Eloquent eager loading: `Investment::with('tree.fruitCrop.farm', 'payouts', 'tree.harvests')`
- **AND** database indexes exist on foreign keys: `investments.user_id`, `investments.tree_id`

#### Scenario: Large portfolio uses pagination
- **WHEN** an investor has more than 20 investments in the holdings list
- **THEN** the holdings list paginates at 20 items per page
- **AND** the system displays pagination controls

---

### Requirement: Mobile-Responsive Portfolio Layout
The portfolio dashboard SHALL be fully responsive and usable on mobile devices.

#### Scenario: Portfolio dashboard on mobile device
- **WHEN** an investor accesses the portfolio dashboard on a device with screen width < 768px
- **THEN** the system displays a single-column layout for the summary header and charts
- **AND** investment holding rows stack vertically
- **AND** charts are scaled appropriately for mobile viewport
- **AND** tabs are horizontally scrollable if needed
- **AND** navigation and buttons are optimized for touch interaction

---

### Requirement: Portfolio Data Calculation Rules
The system SHALL calculate portfolio metrics using the following business rules.

#### Scenario: Total portfolio value calculation
- **WHEN** the system calculates total portfolio value
- **THEN** the value equals the sum of `investment.amount_cents` for all investments with status `active`
- **AND** investments with status `sold`, `cancelled`, or `matured` are excluded

#### Scenario: Current portfolio value calculation
- **WHEN** the system calculates current portfolio value
- **THEN** current value = total invested + total completed payouts received (across all active investments)

#### Scenario: Total gain/loss calculation
- **WHEN** the system calculates total gain/loss
- **THEN** gain/loss = current value − total invested
- **AND** percentage = (gain/loss ÷ total invested) × 100, rounded to 2 decimal places
- **AND** if total invested = 0, percentage = 0

#### Scenario: Actual returns per investment calculation
- **WHEN** the system calculates actual returns for an individual investment
- **THEN** actual return = sum of `net_amount_cents` from all `Payout` records with `status = completed` and `investment_id = investment.id`

#### Scenario: Pending payout value shown in portfolio summary
- **WHEN** an investor has payouts with `status = pending` or `status = processing`
- **THEN** the portfolio summary includes a "Pending Payouts" line showing total `net_amount_cents` of all non-completed, non-failed payouts

---

### Requirement: Investment Status Indicators
The portfolio dashboard SHALL display visual status indicators for each investment's tree growth stage.

#### Scenario: Tree growth stage badge displayed
- **WHEN** an investment row is displayed on the holdings list
- **THEN** the system displays a badge indicating the tree's current lifecycle stage
- **AND** badge colors: `seedling` (gray), `growing` (yellow), `productive` (green), `declining` (orange), `retired` (red)

#### Scenario: Investment status badge displayed
- **WHEN** an investment row is displayed on the holdings list
- **THEN** the system displays a badge indicating the investment's current status
- **AND** badge colors: `active` (green), `matured` (blue), `sold` (purple), `cancelled` (red)

---

### Requirement: SEO and Metadata for Portfolio Pages
Portfolio pages SHALL include appropriate meta tags.

#### Scenario: Portfolio dashboard meta tags
- **WHEN** a search engine crawler accesses the portfolio dashboard
- **THEN** the system renders meta tags: `title="My Portfolio | Treevest"`, `description="Track your fruit tree investments, monitor harvest schedules, and view portfolio performance."`, `robots="noindex, nofollow"`

#### Scenario: Investment detail page meta tags
- **WHEN** a crawler accesses an investment detail page
- **THEN** the system renders meta tags: `title="Investment in [Tree Name] | Treevest"`, `robots="noindex, nofollow"`

---

### Requirement: Harvest Calendar Data from Harvest Records
The portfolio dashboard harvest calendar SHALL source upcoming harvest data from the `harvests` table.

#### Scenario: Harvest calendar displays upcoming scheduled harvests
- **WHEN** an investor views the portfolio dashboard
- **THEN** the harvest calendar queries `Harvest` records where `status IN (scheduled, in_progress)` and `tree_id IN` (the investor's active investment tree IDs)
- **AND** displays up to 10 upcoming harvest events ordered by `scheduled_date ASC`
- **AND** each event shows: scheduled date, farm name, fruit type, variant, estimated yield (if set), status badge

#### Scenario: In-progress harvest shown distinctly
- **WHEN** a harvest has `status = in_progress`
- **THEN** the calendar entry shows an "In Progress" badge instead of "Scheduled"

---

### Requirement: Payout History Sourced from Payouts Table
The investment detail page payout history table SHALL source data from the `payouts` table.

#### Scenario: Payout history table shows all payout records
- **WHEN** an investor views an investment detail page for an investment with payout records
- **THEN** the payout history table queries `Payout` records where `investment_id = investment.id`
- **AND** each row shows: harvest date, gross amount, platform fee, net amount, status, completed date (if `status = completed`), transaction reference
- **AND** rows are ordered by `created_at DESC`

#### Scenario: Pending payouts shown with "Processing" indicator
- **WHEN** a payout has `status = pending` or `status = processing`
- **THEN** the payout row shows "Pending Disbursement" or "Processing" status badge
- **AND** the completed date and transaction reference columns show "—"

---

### Requirement: Actual Returns Calculation from Completed Payouts
The portfolio dashboard performance metrics SHALL calculate actual returns by summing completed payouts.

#### Scenario: Actual returns shown from completed payouts
- **WHEN** an investor views the holdings list
- **THEN** the system calculates actual returns for each investment as: `SUM(net_amount_cents) WHERE investment_id = X AND status = completed`
- **AND** pending or processing payouts are shown in a separate "Pending Payouts" summary

---

### Requirement: Portfolio Tabs Navigation
The portfolio dashboard SHALL be organized into tabs — Holdings, Watchlist, Transactions — for clear information hierarchy.

#### Scenario: Portfolio page renders with tabs
- **WHEN** an investor views the portfolio dashboard
- **THEN** the page displays three tabs: "Holdings", "Watchlist", "Transactions"
- **AND** the "Holdings" tab is active by default
- **AND** the active tab is visually indicated (underline or filled style)
- **AND** switching tabs does not trigger a full page reload (client-side tab state)

#### Scenario: Watchlist tab shows saved items
- **WHEN** an investor clicks the "Watchlist" tab
- **THEN** the system displays the investor's saved wishlist items (trees, farms, fruit crops)
- **AND** the wishlist content matches the investor's `/investor/wishlist` data, fetched as part of the portfolio Inertia props
- **AND** each item shows: entity name, price or key metric, "Invest Now" or "View" action, "Remove from Watchlist" icon

---

### Requirement: Portfolio Transaction History Tab
The portfolio dashboard SHALL include a "Transactions" tab that displays a complete chronological record of the investor's investment-related financial activity.

#### Scenario: Transactions tab displays full history
- **WHEN** an investor clicks the "Transactions" tab on the portfolio page
- **THEN** the system queries all `Transaction` records where `user_id = authenticated investor's id`
- **AND** displays rows ordered by `created_at DESC`
- **AND** each row shows: date, transaction type label, entity name (tree identifier + fruit type), direction arrow and amount (formatted), status badge

#### Scenario: Transactions tab filter by type
- **WHEN** an investor selects a filter ("Purchases", "Payouts", "Top-Ups", or "All")
- **THEN** the system filters the transaction list to the selected type
- **AND** the row count updates accordingly

#### Scenario: Transactions tab pagination
- **WHEN** an investor has more than 25 transactions
- **THEN** the transactions list paginates at 25 per page
- **AND** pagination controls are displayed at the bottom

