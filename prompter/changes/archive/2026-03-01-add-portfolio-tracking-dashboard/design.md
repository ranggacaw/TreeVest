# Design Document: Portfolio Tracking Dashboard

## Context
The portfolio tracking dashboard is the primary interface for investors to monitor their investment performance, track upcoming harvests, and analyze portfolio diversification. This feature aggregates data from multiple entities (investments, trees, farms, crops, harvests, payouts) and presents it through visualizations and summary metrics.

**Key Constraints:**
- Must perform well with portfolios of 50+ investments (target < 500ms query time)
- Real-time updates deferred to future iteration (manual refresh only in v1)
- Uses existing database schema (no new tables required)
- Charts must work with React + TypeScript + Tailwind CSS
- Responsive design required for mobile investors

**Stakeholders:**
- Investors: primary users, need daily portfolio monitoring
- Product team: portfolio is the "home screen" for existing investors
- Backend team: responsible for query performance and data aggregation logic
- Frontend team: responsible for chart rendering and UX

---

## Goals / Non-Goals

**Goals:**
- ✅ Provide comprehensive portfolio overview in a single dashboard view
- ✅ Enable investors to track upcoming harvests and payout history
- ✅ Visualize portfolio diversification across fruit types, farms, and risk levels
- ✅ Compare projected vs. actual investment returns
- ✅ Optimize database queries for performance with 50+ investments
- ✅ Mobile-responsive layout for on-the-go portfolio monitoring

**Non-Goals:**
- ❌ Real-time WebSocket updates (deferred to future iteration — manual refresh only)
- ❌ Portfolio editing or rebalancing recommendations
- ❌ Investment selling/transfer on secondary market (separate EPIC)
- ❌ Advanced analytics (Sharpe ratio, volatility, correlation)
- ❌ Export to PDF/CSV (separate EPIC-011: Financial Reporting)
- ❌ Push notifications for harvest events (handled by notifications spec)

---

## Decisions

### Decision 1: Service Layer for Portfolio Aggregation
**What:** Create `InvestmentPortfolioService` as a dedicated service for all portfolio data aggregation and calculation logic.

**Why:**
- Separates complex business logic from controllers (thin controller pattern)
- Enables reuse across multiple controllers (dashboard, API, reporting)
- Facilitates unit testing of calculations without HTTP layer
- Centralizes performance optimization efforts (caching, query optimization)

**Alternatives Considered:**
- **Option A:** Perform calculations in Eloquent accessors on Investment model
  - ❌ Would bloat the model with dashboard-specific logic
  - ❌ Harder to test multi-model aggregations
- **Option B:** Query aggregations directly in controller
  - ❌ Violates thin controller principle
  - ❌ Cannot reuse logic across API endpoints or reports

**Implementation:**
- `InvestmentPortfolioService` methods:
  - `getPortfolioSummary($userId)` — total value, tree count, ROI
  - `getInvestmentsByCategory($userId, $groupBy)` — diversification data
  - `getUpcomingHarvests($userId, $limit)` — harvest calendar
  - `getPerformanceMetrics($userId)` — projected vs. actual returns
  - `getInvestmentDetails($investmentId, $userId)` — single investment details
- Service is injected into `PortfolioDashboardController` via constructor

---

### Decision 2: Recharts for Data Visualization
**What:** Use Recharts (React charting library) for all portfolio visualizations.

**Why:**
- Native React component API (no wrapper needed like Chart.js requires)
- Excellent TypeScript support (type-safe props)
- Declarative API aligns with React patterns
- Built-in responsive behavior
- Tailwind-friendly styling via inline props
- Actively maintained with good documentation

**Alternatives Considered:**
- **Option A:** Chart.js with react-chartjs-2 wrapper
  - ❌ Requires wrapper library (additional dependency)
  - ❌ Imperative API less aligned with React
  - ✅ More powerful and flexible for complex charts
- **Option B:** D3.js
  - ❌ Steep learning curve, low-level API
  - ❌ Requires manual DOM manipulation (anti-pattern in React)
  - ✅ Maximum flexibility for custom visualizations

**Implementation:**
- Install: `npm install recharts @types/recharts`
- Charts to implement:
  - `PieChart` for diversification (3 variants: fruit type, farm, risk)
  - `BarChart` for projected vs. actual returns comparison
- All charts wrapped in responsive containers for mobile compatibility

---

### Decision 3: Eager Loading for Query Performance
**What:** Use Eloquent eager loading with `with()` to optimize portfolio queries.

**Why:**
- N+1 query problem is a major performance risk with 50+ investments
- Each investment needs tree → fruit crop → farm data
- Harvest and payout history requires nested relationships
- Eager loading reduces queries from O(n) to O(1) per relationship

**Alternatives Considered:**
- **Option A:** Lazy loading (default Eloquent behavior)
  - ❌ Would create hundreds of queries for large portfolios
  - ❌ Unacceptable performance (>5 seconds for 50 investments)
- **Option B:** Raw SQL with joins
  - ✅ Maximum performance control
  - ❌ Bypasses Eloquent relationships and accessors
  - ❌ Harder to maintain and test

**Implementation:**
```php
// In InvestmentPortfolioService
$investments = Investment::with([
    'tree.fruitCrop.farm',           // Tree → Crop → Farm
    'tree.harvests' => fn($q) => $q->orderBy('harvest_date', 'desc')->limit(5),
    'payouts' => fn($q) => $q->where('status', 'completed'),
])
->where('user_id', $userId)
->where('status', 'active')
->get();
```

**Database Indexes Required:**
- `investments.user_id` (filter by investor)
- `investments.tree_id` (join to trees)
- `tree_harvests.tree_id` (join to trees)
- `payouts.investment_id` (join to investments)

**Performance Target:** < 500ms query execution time for 50 investments

---

### Decision 4: Pull-to-Refresh Only (No Real-Time Updates in v1)
**What:** Dashboard data refreshes only on manual page reload or "Refresh" button click. No automatic polling or WebSocket updates.

**Why:**
- Simplicity: No infrastructure setup required (no Pusher/Soketi/Redis)
- Performance: Reduces server load (no persistent connections)
- Sufficient UX: Portfolio data changes infrequently (harvests are seasonal)
- Time to market: Real-time updates can be added in future iteration

**Alternatives Considered:**
- **Option A:** Polling every 30-60 seconds
  - ❌ Continuous server load even when data hasn't changed
  - ❌ Battery drain on mobile devices
  - ✅ Simple to implement (setInterval in React)
- **Option B:** WebSocket via Laravel Broadcasting (Pusher/Soketi)
  - ❌ Requires infrastructure setup and cost (Pusher) or self-hosting (Soketi)
  - ❌ Overkill for data that changes infrequently
  - ✅ True real-time updates (best UX)

**Future Enhancement Path:**
When ready to add real-time updates:
1. Set up Laravel Broadcasting with Soketi (free, self-hosted)
2. Dispatch `PortfolioUpdated` event when relevant data changes (harvest, payout)
3. Subscribe to `portfolio.{userId}` channel in React component
4. Update Zustand/context state on event receipt

**Implementation for v1:**
- Add "Refresh Portfolio" button with loading state
- Use Inertia's `router.reload()` to fetch fresh data from server
- Display success toast after refresh

---

### Decision 5: Dedicated Investment Detail Page (Not Overlay)
**What:** Create separate route `/investments/{id}` with dedicated Inertia page component.

**Why:**
- Clean URL structure for bookmarking and navigation
- Allows deep-linking to specific investments
- Separates concerns: investment-specific data vs. tree marketplace data
- Enables SEO for investment tracking pages (though private, good for structure)

**Alternatives Considered:**
- **Option A:** Modal overlay on dashboard
  - ❌ Cannot share link to specific investment
  - ❌ No browser history/back button support
  - ✅ Faster perceived navigation (no full page load)
- **Option B:** Link to tree detail page (`/trees/{id}`) with investment overlay
  - ❌ Confusing UX (tree page optimized for browsing/purchasing, not tracking)
  - ❌ Investment-specific data (payouts, harvest history) doesn't fit well

**Implementation:**
- Route: `GET /investments/{investment}` → `InvestmentController@show`
- Middleware: `auth`, `role:investor`
- Authorization: Verify `$investment->user_id === Auth::id()` in controller
- Page: `resources/js/Pages/Investments/Show.tsx`
- Link back to portfolio dashboard and link forward to tree marketplace page

---

### Decision 6: Portfolio Calculation Business Rules
**What:** Define clear formulas for portfolio metrics.

**Projected Returns Calculation:**
```
For an investment:
- Investment amount: $A (e.g., RM 5,000)
- Expected ROI: $R (e.g., 15%)
- Harvest cycle: $C (annual, biannual, seasonal)

Projected annual return = A × (R / 100)

For time-proportional projections (if investment held < 1 year):
- Days held: $D
- Days in year: 365
- Prorated projected return = (A × R / 100) × (D / 365)
```

**Actual Returns Calculation:**
```
Actual return = SUM(payouts with status = 'completed')
```

**Performance Difference:**
```
Difference (absolute) = Actual - Projected
Percentage gain/loss = (Difference / Projected) × 100

Example:
- Projected: RM 750
- Actual: RM 825
- Difference: +RM 75
- Percentage: +10%
```

**Diversification Breakdown:**
```
By fruit type:
- Group investments by tree.fruitCrop.fruitType.name
- Sum investment amounts per group
- Calculate percentage: (Group Total / Portfolio Total) × 100

By farm:
- Group investments by tree.fruitCrop.farm.name
- (same calculation)

By risk level:
- Group investments by tree.risk_rating
- (same calculation)
```

**Average ROI:**
```
Average ROI = MEAN(investment.expected_roi_percent for all active investments)
Rounded to 2 decimal places
```

---

### Decision 7: Empty Portfolio State Strategy
**What:** Display friendly empty state with single CTA button directing to marketplace.

**Why:**
- New investors need clear next action
- Simple design (no wizard complexity)
- Aligns with product goal: drive marketplace traffic

**Alternatives Considered:**
- **Option A:** Multi-step welcome wizard overlay
  - ❌ Adds complexity for marginal UX improvement
  - ❌ User has already completed onboarding/KYC — no need for tutorial
- **Option B:** Educational content about investment strategies
  - ❌ Delays primary action (browsing marketplace)
  - ✅ Could be valuable for investor education (consider for v2)

**Implementation:**
- Component: `EmptyPortfolio.tsx`
- Content: "You haven't invested in any trees yet" + "Start building your agricultural portfolio today"
- CTA: "Browse Marketplace" button → `/trees`
- Design: Centered layout with illustration/icon (Tailwind utilities only)

---

## Risks / Trade-offs

### Risk 1: Query Performance with Large Portfolios
**Risk:** Portfolio aggregation queries may be slow for investors with 100+ investments across many farms.

**Mitigation:**
- Use Eloquent eager loading (Decision 3)
- Add database indexes on foreign keys
- Implement pagination for full investment list (limit dashboard to 12 cards)
- Monitor query execution time in production; add caching layer if needed (Laravel cache or Redis)
- Consider denormalized portfolio summary table if performance degrades (last resort)

**Measurement:**
- Add performance monitoring for `/portfolio` route
- Alert if 95th percentile response time > 1 second

---

### Risk 2: Harvest Date Accuracy
**Risk:** Harvest dates are estimates; actual harvest timing may vary due to weather, farm conditions.

**Mitigation:**
- Display "Estimated" label on all future harvest dates
- Allow farm owners to update harvest schedules in EPIC-009
- Show date ranges instead of exact dates when uncertainty is high (future enhancement)

---

### Risk 3: Chart Rendering Performance on Mobile
**Risk:** Recharts with large datasets may be slow on low-end mobile devices.

**Mitigation:**
- Limit diversification chart to top 10 categories (group remaining as "Other")
- Limit performance chart to top 12 investments (with "View All" link)
- Use responsive sizing to reduce chart complexity on small screens
- Test on low-end Android devices (Chrome DevTools mobile simulation)

---

### Risk 4: Currency Formatting Consistency
**Risk:** Inconsistent currency formatting between backend and frontend could cause confusion.

**Mitigation:**
- Backend always returns amounts in cents (integer)
- Frontend converts to RM with helper function: `formatCurrency(cents)`
- Use Intl.NumberFormat for locale-aware formatting: `new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' })`
- Test with edge cases: zero, negative (shouldn't happen), very large values (>RM 1M)

---

## Migration Plan

**Phase 1: Backend Implementation**
1. Create `InvestmentPortfolioService` with all calculation methods
2. Create `PortfolioDashboardController` with `index()` action
3. Add routes and middleware
4. Write unit tests for service calculations
5. Write feature tests for controller responses

**Phase 2: Frontend Implementation**
6. Install Recharts dependency
7. Create TypeScript type definitions for portfolio data
8. Create `Portfolio/Dashboard.tsx` page (layout only, no data)
9. Create individual components (PortfolioSummaryCard, EmptyPortfolio, etc.)
10. Integrate components into dashboard page
11. Add Recharts visualizations (diversification, performance)
12. Create `Investments/Show.tsx` page for investment details
13. Add responsive styling and mobile testing

**Phase 3: Integration & Testing**
14. Connect frontend to backend (Inertia props)
15. Test with sample data (seed 50+ investments for performance testing)
16. Add database indexes
17. Performance testing and optimization
18. Browser testing (Chrome, Safari, Firefox, mobile browsers)

**Phase 4: Polish & Launch**
19. Add loading states and error handling
20. Add success/error toast notifications
21. Documentation (PHPDoc, JSDoc)
22. Code review and QA
23. Deploy to staging for user acceptance testing
24. Launch to production

**Rollback Plan:**
- If critical performance issue discovered post-launch:
  - Add aggressive caching to `InvestmentPortfolioService` (cache for 5 minutes)
  - Reduce eager loading depth (load only essential relationships)
  - Show degraded UX (e.g., hide charts, show summary only)
- If Recharts causes rendering issues:
  - Temporarily replace charts with simple HTML tables
  - Investigate alternative charting library

---

## Open Questions

1. **Should we cache portfolio summary data?**
   - Pro: Reduces database load, faster response times
   - Con: Stale data, cache invalidation complexity
   - **Decision:** Start without caching; add if performance monitoring shows need

2. **How should we handle investments in trees that are "retired" (end of productive lifespan)?**
   - Should they appear on dashboard? In separate "Completed Investments" section?
   - **Decision:** Include in portfolio but mark as "Matured" status; exclude from diversification calculations

3. **Should portfolio show "unrealized gains" (current tree value vs. purchase price)?**
   - Tree value may fluctuate based on market conditions, age, health
   - **Decision:** Deferred to EPIC-011 (Reporting) or future secondary market feature (tree value estimation complex)

4. **Should we show performance benchmarks (e.g., "Your portfolio is outperforming the average by 5%")?**
   - **Decision:** Not in v1 (requires platform-wide analytics); good idea for v2 engagement feature

5. **What happens if an investor's KYC expires while they have active investments?**
   - Can they still view portfolio? Yes (viewing != transacting)
   - Can they receive payouts? Yes (existing investments honored)
   - Can they purchase new investments? No (KYC gate blocks new purchases)
   - **Decision:** Portfolio dashboard accessible regardless of KYC status; investment detail page shows KYC warning if expired
