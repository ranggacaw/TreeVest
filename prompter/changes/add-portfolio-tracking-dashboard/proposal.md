# Change: Implement Portfolio Tracking Dashboard

## Why
Provide investors with a comprehensive, real-time view of their investment portfolio, enabling them to monitor performance, track upcoming harvests, and make informed decisions about future investments. The dashboard serves as the primary daily-use interface for existing investors and implements EPIC-007.

Without this change, investors have no way to view their portfolio, monitor tree health, track expected harvest dates, or analyze portfolio diversification. This feature completes the investment lifecycle by providing ongoing portfolio management and performance tracking.

## What Changes
- Add portfolio tracking capability (new spec)
- Implement investor portfolio dashboard as default landing page for authenticated investors
- Add portfolio data aggregation service (InvestmentPortfolioService)
- Add portfolio analytics calculations (diversification, performance, projections)
- Add portfolio dashboard controller (PortfolioDashboardController)
- Add portfolio dashboard Inertia page component with Recharts visualizations
- Add individual investment detail page (`/investments/{id}`)
- Add portfolio summary component (total value, tree count, performance metrics)
- Add harvest calendar component (upcoming harvest dates)
- Add diversification visualization charts (by fruit type, farm, risk level)
- Add projected vs. actual returns comparison view
- Add investment performance summary (gains/losses calculation)
- Add empty state for new investors with CTA to marketplace
- Add portfolio data refresh capability (pull-to-refresh pattern)
- Add responsive mobile layout for portfolio dashboard
- Optimize database queries with eager loading for performance (50+ investments)

## Impact
**New Specs Created:**
- `portfolio-tracking` (new capability)

**Modified Specs:**
- None (self-contained new capability, depends on existing investment-purchase)

**Affected Code:**
- `app/Services/InvestmentPortfolioService.php` — new service (portfolio data aggregation and analytics)
- `app/Http/Controllers/PortfolioDashboardController.php` — new controller
- `resources/js/Pages/Portfolio/Dashboard.tsx` — new page (main portfolio dashboard)
- `resources/js/Pages/Investments/Show.tsx` — new page (individual investment detail)
- `resources/js/Components/Portfolio/PortfolioSummaryCard.tsx` — new component
- `resources/js/Components/Portfolio/HarvestCalendar.tsx` — new component
- `resources/js/Components/Portfolio/DiversificationChart.tsx` — new component (uses Recharts)
- `resources/js/Components/Portfolio/PerformanceChart.tsx` — new component (projected vs. actual returns)
- `resources/js/Components/Portfolio/InvestmentCard.tsx` — new component
- `resources/js/Components/Portfolio/EmptyPortfolio.tsx` — new component
- `routes/web.php` — add portfolio routes
- `package.json` — add `recharts` dependency

**Dependencies:**
- Requires `investment-purchase` spec (investments must exist to display)
- Requires `tree-marketplace` spec (tree data)
- Requires `farm-management` spec (farm data)
- Requires `fruit-crop-catalog` spec (crop and harvest cycle data)
- Requires `user-authentication` spec (investor role protection)

**Breaking Changes:**
- None (net new feature)

**Data Migration:**
- None (uses existing tables)

**Risks:**
- Portfolio aggregation queries across multiple tables (investments, trees, farms, crops, harvests) could be expensive for large portfolios (50+ investments)
  - **Mitigation:** Use Eloquent eager loading with `with()` clauses, add database indexes on foreign keys, consider view/cache layer if performance degrades
- Projected vs. actual returns calculation requires clear business rules
  - **Mitigation:** Define calculation formulas in InvestmentPortfolioService with documented examples and test cases
- Large portfolios may cause rendering performance issues in React
  - **Mitigation:** Use pagination or virtualization for investment lists beyond 50 items, lazy load chart data
- Harvest date calendar may need to handle timezone differences
  - **Mitigation:** Store harvest dates in UTC, display in user's timezone (or farm's local time with indicator)
