# Implementation Tasks

## 1. Backend Setup

### 1.1 Service Layer
- [x] 1.1.1 Create `InvestmentPortfolioService.php`
- [x] 1.1.2 Implement `getPortfolioSummary($userId)` — returns total value, tree count, total ROI
- [x] 1.1.3 Implement `getInvestmentsByCategory($userId, $groupBy)` — groups by fruit type, farm, risk level
- [x] 1.1.4 Implement `getUpcomingHarvests($userId, $limit = 10)` — returns next scheduled harvests
- [x] 1.1.5 Implement `getPerformanceMetrics($userId)` — projected vs. actual returns, gains/losses
- [x] 1.1.6 Implement `getInvestmentDetails($investmentId, $userId)` — single investment with tree, farm, harvest history
- [x] 1.1.7 Add portfolio diversification calculation logic (by fruit type, farm, risk)
- [x] 1.1.8 Add projected returns calculation based on expected ROI and harvest cycles
- [x] 1.1.9 Add actual returns aggregation from completed payouts
- [x] 1.1.10 Optimize queries with eager loading: `Investment::with('tree.fruitCrop.farm', 'payouts', 'tree.harvests')`

### 1.2 Controller Layer
- [x] 1.2.1 Create `PortfolioDashboardController.php`
- [x] 1.2.2 Implement `index()` action — calls service, returns Inertia response with portfolio data
- [x] 1.2.3 Apply `auth` and `role:investor` middleware
- [x] 1.2.4 Handle empty portfolio state (no investments)
- [x] 1.2.5 Create `InvestmentController@show($id)` — individual investment detail page
- [x] 1.2.6 Verify investment ownership in `show()` action (user can only view their own investments)

### 1.3 Routes
- [x] 1.3.1 Add `GET /portfolio` → `PortfolioDashboardController@index` (named `portfolio.dashboard`)
- [x] 1.3.2 Add `GET /investments/{investment}` → `InvestmentController@show` (named `investments.show`)
- [x] 1.3.3 Apply middleware: `auth`, `role:investor`
- [ ] 1.3.4 Update default redirect after login for investors to `/portfolio`

---

## 2. Frontend Setup

### 2.1 Dependencies
- [x] 2.1.1 Add `recharts` package: `npm install recharts`
- [x] 2.1.2 Add TypeScript types for recharts: `npm install --save-dev @types/recharts`

### 2.2 Type Definitions
- [x] 2.2.1 Create `resources/js/types/Portfolio.ts`
- [x] 2.2.2 Define `PortfolioSummary` interface (total value, tree count, total ROI)
- [x] 2.2.3 Define `InvestmentWithDetails` interface (extends Investment, includes tree, farm, crop, payouts)
- [x] 2.2.4 Define `HarvestEvent` interface (tree, harvest date, estimated yield, status)
- [x] 2.2.5 Define `DiversificationData` interface (category, value, percentage, color)
- [x] 2.2.6 Define `PerformanceMetrics` interface (projected, actual, difference, percentage gain/loss)

### 2.3 Main Dashboard Page
- [x] 2.3.1 Create `resources/js/Pages/Portfolio/Dashboard.tsx`
- [x] 2.3.2 Layout structure: header with total value, grid with summary cards, charts section
- [x] 2.3.3 Integrate `PortfolioSummaryCard` component
- [x] 2.3.4 Integrate `HarvestCalendar` component
- [x] 2.3.5 Integrate `DiversificationChart` component
- [x] 2.3.6 Integrate `PerformanceChart` component
- [x] 2.3.7 Add investment list section with `InvestmentCard` components
- [x] 2.3.8 Add "View All Investments" link (pagination for 50+ investments)
- [ ] 2.3.9 Add pull-to-refresh button to manually reload portfolio data
- [x] 2.3.10 Handle empty portfolio state with `EmptyPortfolio` component

### 2.4 Components

#### Portfolio Summary Card
- [x] 2.4.1 Create `resources/js/Components/Portfolio/PortfolioSummaryCard.tsx`
- [x] 2.4.2 Display total portfolio value (formatted currency)
- [x] 2.4.3 Display total tree count with breakdown by status (productive, growing, etc.)
- [x] 2.4.4 Display average ROI across all investments
- [x] 2.4.5 Display total payouts received to date
- [x] 2.4.6 Add Tailwind styling (card with shadow, responsive grid)

#### Harvest Calendar
- [x] 2.4.7 Create `resources/js/Components/Portfolio/HarvestCalendar.tsx`
- [x] 2.4.8 Display next 10 upcoming harvest events in timeline view
- [x] 2.4.9 Each event shows: date, farm name, fruit type, estimated yield, tree count
- [x] 2.4.10 Group harvests by month for better readability
- [ ] 2.4.11 Add link to tree detail page for each harvest event
- [x] 2.4.12 Handle case when no upcoming harvests exist

#### Diversification Chart
- [x] 2.4.13 Create `resources/js/Components/Portfolio/DiversificationChart.tsx`
- [x] 2.4.14 Implement pie chart using Recharts `PieChart` component
- [x] 2.4.15 Add three chart variants: by fruit type, by farm, by risk level
- [x] 2.4.16 Add tab/toggle to switch between chart variants
- [x] 2.4.17 Display percentages and values in legend
- [x] 2.4.18 Use consistent color scheme (green for low risk, yellow for medium, red for high)
- [x] 2.4.19 Add responsive sizing for mobile devices

#### Performance Chart
- [x] 2.4.20 Create `resources/js/Components/Portfolio/PerformanceChart.tsx`
- [x] 2.4.21 Implement bar chart comparing projected vs. actual returns using Recharts `BarChart`
- [x] 2.4.22 X-axis: investment ID or tree name, Y-axis: return amount
- [x] 2.4.23 Display two bars per investment: projected (blue) and actual (green)
- [x] 2.4.24 Add tooltip showing exact values and percentage difference
- [x] 2.4.25 Handle case when no actual returns exist yet (show only projected)
- [x] 2.4.26 Add summary text: "Total projected: RM X | Total actual: RM Y | Difference: +RM Z (+15%)"

#### Investment Card
- [x] 2.4.27 Create `resources/js/Components/Portfolio/InvestmentCard.tsx`
- [ ] 2.4.28 Display investment thumbnail (farm featured image or tree photo)
- [x] 2.4.29 Display tree identifier, fruit type, and variant
- [x] 2.4.30 Display investment amount, purchase date, current value
- [x] 2.4.31 Display current tree growth stage badge
- [x] 2.4.32 Display next harvest date (if scheduled)
- [x] 2.4.33 Display ROI progress bar (actual vs. projected)
- [x] 2.4.34 Add "View Details" button linking to `/investments/{id}`
- [x] 2.4.35 Use consistent Tailwind card styling (hover effects, responsive grid)

#### Empty Portfolio
- [x] 2.4.36 Create `resources/js/Components/Portfolio/EmptyPortfolio.tsx`
- [x] 2.4.37 Display message: "You haven't invested in any trees yet"
- [x] 2.4.38 Add subtitle: "Start building your agricultural portfolio today"
- [x] 2.4.39 Add "Browse Marketplace" button linking to `/trees`
- [x] 2.4.40 Use centered layout with illustration or icon

### 2.5 Investment Detail Page
- [x] 2.5.1 Create `resources/js/Pages/Investments/Show.tsx`
- [x] 2.5.2 Display breadcrumb: Portfolio > Tree Name > Investment Details
- [x] 2.5.3 Display investment summary card: purchase date, amount, current value, status
- [x] 2.5.4 Display tree details section (embedded tree profile card)
- [x] 2.5.5 Display farm profile summary with link to `/farms/{id}`
- [x] 2.5.6 Display harvest history table (past harvests with actual yields and payouts)
- [x] 2.5.7 Display upcoming harvest schedule
- [ ] 2.5.8 Display payout history table (dates, amounts, methods)
- [x] 2.5.9 Add "View Full Tree Details" button linking to `/trees/{id}` (marketplace tree page)
- [x] 2.5.10 Add "Back to Portfolio" link

---

## 3. Testing

### 3.1 Unit Tests
- [ ] 3.1.1 Test `InvestmentPortfolioService::getPortfolioSummary()` with known investments
- [ ] 3.1.2 Test portfolio value calculation (sum of investment amounts)
- [ ] 3.1.3 Test diversification calculation (group by fruit type, farm, risk)
- [ ] 3.1.4 Test projected returns calculation (based on expected ROI and time elapsed)
- [ ] 3.1.5 Test actual returns aggregation (sum of completed payouts)
- [ ] 3.1.6 Test performance metrics calculation (difference, percentage gain/loss)
- [ ] 3.1.7 Test upcoming harvests query (correct ordering by date, limit applied)
- [ ] 3.1.8 Test empty portfolio handling (returns empty arrays, zero values)

### 3.2 Feature Tests
- [ ] 3.2.1 Test `GET /portfolio` requires authentication (redirects to login if unauthenticated)
- [ ] 3.2.2 Test `GET /portfolio` requires investor role (403 for non-investors)
- [ ] 3.2.3 Test `GET /portfolio` returns Inertia response with correct props structure
- [ ] 3.2.4 Test `GET /portfolio` returns empty state for investor with no investments
- [ ] 3.2.5 Test `GET /portfolio` returns correct portfolio data for investor with investments
- [ ] 3.2.6 Test `GET /investments/{id}` requires authentication
- [ ] 3.2.7 Test `GET /investments/{id}` verifies ownership (403 if not owner)
- [ ] 3.2.8 Test `GET /investments/{id}` returns 404 for non-existent investment
- [ ] 3.2.9 Test `GET /investments/{id}` returns correct investment details
- [ ] 3.2.10 Test portfolio query performance with 50+ investments (execution time < 500ms)

### 3.3 Browser/Component Tests (Optional)
- [ ] 3.3.1 Test Recharts render correctly with sample data
- [ ] 3.3.2 Test diversification chart tab switching
- [ ] 3.3.3 Test performance chart tooltip display
- [ ] 3.3.4 Test responsive layout on mobile viewport
- [ ] 3.3.5 Test empty portfolio CTA button navigation

---

## 4. Documentation & Polish

- [ ] 4.1 Add PHPDoc comments to `InvestmentPortfolioService` methods
- [ ] 4.2 Add JSDoc comments to complex React components
- [ ] 4.3 Add database indexes on foreign keys: `investments.user_id`, `investments.tree_id`
- [x] 4.4 Run `./vendor/bin/pint` to format PHP code
- [x] 4.5 Run prettier (if configured) to format TypeScript/React code
- [ ] 4.6 Update route list documentation (if exists)
- [ ] 4.7 Add example portfolio data factory for testing/seeding

---

## Post-Implementation

- [ ] 5.1 Update `AGENTS.md` Section 6 (Core Business Logic) if portfolio workflow needs documentation
- [ ] 5.2 Update `AGENTS.md` Section 9 (UI/UX Principles) if new UX patterns introduced
- [ ] 5.3 Mark EPIC-007 acceptance criteria as complete in `prompter/epics/EPIC-007-portfolio-tracking-dashboard.md`
- [ ] 5.4 Notify team of new `/portfolio` route as default investor landing page

(End of file - total 177 lines)
