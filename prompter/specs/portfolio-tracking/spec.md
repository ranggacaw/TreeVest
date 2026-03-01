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
The portfolio dashboard SHALL display a summary card showing total portfolio value, tree count, average ROI, and total payouts received.

#### Scenario: Portfolio summary card displayed
- **WHEN** an investor views the portfolio dashboard with active investments
- **THEN** the system displays a portfolio summary card with: total portfolio value (sum of all investment amounts in RM), total tree count (number of distinct trees invested in), average expected ROI (mean of all investments' expected ROI), total payouts received (sum of all completed payouts)
- **AND** values are formatted as currency where applicable (RM format: "RM 12,345.67")
- **AND** the card uses Tailwind CSS styling with shadow and responsive grid

#### Scenario: Portfolio summary for empty portfolio
- **WHEN** an investor views the portfolio dashboard with zero investments
- **THEN** the portfolio summary card displays: total portfolio value = RM 0.00, total tree count = 0, average ROI = 0%, total payouts = RM 0.00

---

### Requirement: Investment List Display on Dashboard
The portfolio dashboard SHALL display a list of the investor's investments with key details.

#### Scenario: Investment cards displayed on dashboard
- **WHEN** an investor views the portfolio dashboard with active investments
- **THEN** the system displays a list of investment cards, each showing: farm featured image (or tree photo), tree identifier and fruit type/variant (e.g., "Tree-042 - Durian Musang King"), investment amount, purchase date, current tree growth stage badge, next scheduled harvest date (or "No harvest scheduled"), ROI progress indicator (actual vs. projected), "View Details" button
- **AND** investment cards are displayed in a responsive grid (3 columns on desktop, 2 on tablet, 1 on mobile)
- **AND** the system limits display to 12 investments with "View All" link if more exist

#### Scenario: Investment card links to investment detail page
- **WHEN** an investor clicks the "View Details" button on an investment card
- **THEN** the system navigates to `/investments/{investment_id}`

#### Scenario: Empty portfolio state
- **WHEN** an investor views the portfolio dashboard with zero investments
- **THEN** the system displays an empty state component with: message "You haven't invested in any trees yet", subtitle "Start building your agricultural portfolio today", "Browse Marketplace" button linking to `/trees`
- **AND** the empty state is centered with illustration or icon

---

### Requirement: Portfolio Diversification Visualization
The portfolio dashboard SHALL display diversification charts showing investment allocation by fruit type, farm, and risk level.

#### Scenario: Diversification chart by fruit type
- **WHEN** an investor views the portfolio dashboard with investments in multiple fruit types
- **THEN** the system displays a pie chart showing investment value breakdown by fruit type
- **AND** each segment is labeled with fruit type name and percentage (e.g., "Durian - 45%")
- **AND** a legend displays all fruit types with corresponding values (e.g., "Durian: RM 15,000 (45%)")
- **AND** the chart is rendered using Recharts `PieChart` component

#### Scenario: Diversification chart by farm
- **WHEN** an investor selects the "By Farm" tab on the diversification chart
- **THEN** the system displays a pie chart showing investment value breakdown by farm
- **AND** each segment is labeled with farm name and percentage

#### Scenario: Diversification chart by risk level
- **WHEN** an investor selects the "By Risk" tab on the diversification chart
- **THEN** the system displays a pie chart showing investment value breakdown by risk rating
- **AND** the chart uses color coding: green for low risk, yellow for medium, red for high
- **AND** the legend shows risk levels with values and percentages

#### Scenario: Single-category diversification
- **WHEN** an investor has investments in only one fruit type (or farm, or risk level)
- **THEN** the system displays a pie chart with a single segment showing 100%
- **AND** the legend displays the single category with full value

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
- **AND** the page displays: investment summary card (purchase date, amount, current value, status), tree details section (tree profile with all attributes), farm profile summary with link to `/farms/{farm_id}`, harvest history table (past harvests with yields and payouts), upcoming harvest schedule, payout history table (dates, amounts, methods), "View Full Tree Details" button linking to `/trees/{tree_id}`, "Back to Portfolio" link

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
- **THEN** the system displays a harvest history table with columns: harvest date, status (e.g., "Completed"), actual yield (kg), quality grade, payout amount (RM), payout status
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
- **THEN** the system displays a payout history table with columns: payout date, amount (RM), payment method (bank transfer / digital wallet / reinvestment), status (completed / pending / failed), transaction reference
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
- **AND** the system updates all dashboard components with the latest data
- **AND** the system displays a brief loading indicator during refresh
- **AND** the system displays a success toast: "Portfolio data refreshed"

---

### Requirement: Portfolio Performance Optimization
The portfolio dashboard data queries SHALL be optimized to perform well with portfolios of 50+ investments.

#### Scenario: Portfolio query with 50+ investments completes quickly
- **WHEN** the system executes a portfolio data query for an investor with 50 or more active investments
- **THEN** the query execution time is less than 500ms
- **AND** the system uses Eloquent eager loading: `Investment::with('tree.fruitCrop.farm', 'payouts', 'tree.harvests')`
- **AND** database indexes exist on foreign keys: `investments.user_id`, `investments.tree_id`

#### Scenario: Large portfolio uses pagination
- **WHEN** an investor has more than 12 investments
- **THEN** the dashboard displays only the first 12 investments
- **AND** the system displays a "View All Investments" link
- **AND** the full investment list page implements pagination (24 per page)

---

### Requirement: Mobile-Responsive Portfolio Layout
The portfolio dashboard SHALL be fully responsive and usable on mobile devices.

#### Scenario: Portfolio dashboard on mobile device
- **WHEN** an investor accesses the portfolio dashboard on a device with screen width < 768px
- **THEN** the system displays a single-column layout for portfolio summary and charts
- **AND** investment cards display in a single column
- **AND** charts are scaled appropriately for mobile viewport
- **AND** navigation and buttons are optimized for touch interaction

---

### Requirement: Portfolio Data Calculation Rules
The system SHALL calculate portfolio metrics using the following business rules.

#### Scenario: Total portfolio value calculation
- **WHEN** the system calculates total portfolio value
- **THEN** the value equals the sum of all investment amounts (in cents, converted to RM for display)
- **AND** only investments with status `active` are included
- **AND** investments with status `sold`, `cancelled`, or `matured` are excluded

#### Scenario: Average ROI calculation
- **WHEN** the system calculates average expected ROI
- **THEN** the value equals the arithmetic mean of all active investments' `expected_roi_percent` values
- **AND** the result is rounded to 2 decimal places

#### Scenario: Projected returns calculation
- **WHEN** the system calculates projected returns for an investment
- **THEN** projected return = investment amount × (expected ROI / 100)
- **AND** the calculation accounts for the harvest cycle frequency (annual, biannual, seasonal)
- **AND** partial years prorate the expected return proportionally

#### Scenario: Actual returns calculation
- **WHEN** the system calculates actual returns for an investment
- **THEN** actual return = sum of all completed payouts linked to the investment
- **AND** only payouts with status `completed` are included

#### Scenario: Performance difference calculation
- **WHEN** the system calculates performance difference
- **THEN** difference = actual return - projected return
- **AND** percentage = (difference / projected return) × 100
- **AND** positive values indicate outperformance, negative values indicate underperformance

---

### Requirement: Investment Status Indicators
The portfolio dashboard SHALL display visual status indicators for each investment's tree growth stage.

#### Scenario: Tree growth stage badge displayed
- **WHEN** an investment card is displayed on the portfolio dashboard
- **THEN** the system displays a badge indicating the tree's current lifecycle stage
- **AND** badge colors: `seedling` (gray), `growing` (yellow), `productive` (green), `declining` (orange), `retired` (red)
- **AND** badge text matches the tree's `lifecycle_stage` value

#### Scenario: Investment status badge displayed
- **WHEN** an investment card is displayed on the portfolio dashboard
- **THEN** the system displays a badge indicating the investment's status
- **AND** badge colors: `active` (green), `matured` (blue), `sold` (purple), `cancelled` (red)

---

### Requirement: SEO and Metadata for Portfolio Pages
Portfolio pages SHALL include appropriate meta tags for search engine optimization and social sharing.

#### Scenario: Portfolio dashboard meta tags
- **WHEN** a search engine crawler or social media bot accesses the portfolio dashboard
- **THEN** the system renders meta tags: title="My Portfolio | Treevest", description="Track your fruit tree investments, monitor harvest schedules, and view portfolio performance.", robots="noindex, nofollow" (private page)

#### Scenario: Investment detail page meta tags
- **WHEN** a crawler accesses an investment detail page
- **THEN** the system renders meta tags: title="Investment in [Tree Name] | Treevest", description="View details of your investment in [Fruit Type] [Variant] tree on [Farm Name].", robots="noindex, nofollow" (private page)

