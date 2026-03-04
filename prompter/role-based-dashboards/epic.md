# 🧠 Epic: Role-Based Dashboard Experience for Admin, Farm Owner & Investor

### 🎯 Epic Goal

We need to **build three distinct, role-tailored dashboards** in order for **Admins, Farm Owners, and Investors** to **see relevant, actionable data and insights specific to their role immediately upon login — replacing the current placeholder/navigation-only dashboards with rich, data-driven experiences**.

---

### 🚀 Definition of Done

- [ ] **Admin Dashboard** displays platform-wide KPIs (users, investments, revenue, KYC queue, farm approvals), recent activity feed, and quick moderation actions — all backed by real data from the existing `DashboardController.getMetrics()` plus new metrics
- [ ] **Farm Owner Dashboard** displays farm-specific stats (total farms, active trees, pending harvests, investor count, total earnings), recent harvest timeline, and farm health summary — all backed by a new `FarmOwnerDashboardController`
- [ ] **Investor Dashboard** displays portfolio-specific stats (total invested, active trees, upcoming payouts, ROI performance), recent investment activity, and payout history — all backed by a new `InvestorDashboardController`
- [ ] Each dashboard has a **visually distinct header and color accent** that reinforces the role context (Admin = authoritative/neutral, Farm Owner = agricultural/green, Investor = financial/blue-indigo)
- [ ] All three dashboards use the `AppLayout` component consistently (not `AuthenticatedLayout`)
- [ ] All stat cards display **real data** from the backend — no hardcoded `$0.00` or `0` placeholders
- [ ] Dashboards are fully responsive (mobile, tablet, desktop)
- [ ] Date range filtering is supported on at least the Admin and Investor dashboards
- [ ] All pages pass TypeScript strict mode with properly typed Props interfaces
- [ ] Route middleware ensures each dashboard is only accessible by the corresponding role

---

### 📌 High-Level Scope (Included)

#### 1. Admin Dashboard (`/admin/dashboard`)

- **Platform KPI Cards**: Total Users, KYC-Verified Users, Active Investments Count, Total Investment Volume (MYR), Pending KYC Reviews, Pending Farm Approvals, Completed Harvests, Total Payouts Distributed
- **Content Management Section**: Total Articles, Published, Drafts (already exists — keep and refine)
- **Popular Articles & Stale Content** lists (already exists — keep and refine)
- **Recent Platform Activity Feed**: Latest user registrations, new investments, farm submissions, KYC submissions (new)
- **Quick Action Cards**: Manage Users, Review KYC, Approve Farms, Create Article (new)
- **Date Range Filter**: Filter KPI metrics by date range (new)
- Display all existing `getMetrics()` data that is currently fetched but not rendered in the frontend

#### 2. Farm Owner Dashboard (`/farm-owner/dashboard`)

- **Farm Performance Cards**: Total Farms (active/pending), Total Trees Across Farms, Total Investors in My Farms, Pending Harvests, Total Earnings (MYR)
- **Farm Status Overview**: List of owned farms with status badges (active, pending_approval, suspended)
- **Harvest Timeline**: Upcoming and recent harvests across all owned farms
- **Investor Summary**: Aggregate count and recent investment activity on owned farms
- **Health Update Summary**: Recent health updates posted, any overdue updates
- **Quick Actions**: Create Farm, Schedule Harvest, Post Health Update, View Farm Analytics
- **New `FarmOwnerDashboardController`**: Aggregates data across all farms owned by the authenticated user

#### 3. Investor Dashboard (`/investor/dashboard` or `/dashboard`)

- **Portfolio KPI Cards**: Total Invested (MYR), Active Trees, Expected Annual Yield, Total Payouts Received, Portfolio ROI %
- **Portfolio Value Trend**: Mini chart showing portfolio value over time (reuse `PerformanceChart` from Portfolio page if applicable)
- **Upcoming Harvests**: Next 5 upcoming harvests for invested trees
- **Recent Payouts**: Latest 5 payout transactions
- **Investment Activity**: Recent investments made
- **Quick Actions**: Browse Farms, View Full Portfolio, Download Reports, KYC Verification
- **New `InvestorDashboardController`**: Aggregates data from the user's investments, payouts, and associated harvests

#### 4. Visual Design Differentiation

- Each dashboard uses a **distinct accent color palette** within the existing Treevest design system (pine, sage, sun, earth tones)
- Admin: Pine-800 header with platform shield icon
- Farm Owner: Sage/Earth header with farm/leaf icon
- Investor: Pine/Sun header with growth chart icon
- Consistent card design (`rounded-3xl`, `shadow-card`, `border-sand-200`) across all three, matching the established Treevest design language

#### 5. Backend Services

- `FarmOwnerDashboardService`: Collects farm owner-specific metrics
- `InvestorDashboardService`: Collects investor-specific metrics
- Extend existing `Admin\DashboardController` to expose all pre-computed metrics to the frontend
- Cache dashboard metrics with appropriate TTL (5 minutes)

---

### ❌ Out of Scope

- Real-time WebSocket / live-updating dashboards (use cached data with page refresh)
- PDF export of dashboard data
- Customizable / drag-and-drop dashboard widget layout
- Historical chart data beyond what is already available in the Portfolio `PerformanceChart`
- Push notifications or in-app notification center
- Admin dashboard for managing individual user accounts (covered by separate User Management EPIC)
- Mobile native app dashboards

---

### 📁 Deliverables

| #   | Deliverable                             | Path / Location                                                                                      |
| --- | --------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| 1   | **Admin Dashboard Page (updated)**      | `resources/js/Pages/Admin/Dashboard.tsx`                                                             |
| 2   | **Farm Owner Dashboard Page (rewrite)** | `resources/js/Pages/FarmOwner/Dashboard.tsx`                                                         |
| 3   | **Investor Dashboard Page (rewrite)**   | `resources/js/Pages/Investor/Dashboard.tsx` or `resources/js/Pages/Dashboard.tsx`                    |
| 4   | **Admin DashboardController (updated)** | `app/Http/Controllers/Admin/DashboardController.php`                                                 |
| 5   | **FarmOwner DashboardController (new)** | `app/Http/Controllers/FarmOwner/DashboardController.php`                                             |
| 6   | **Investor DashboardController (new)**  | `app/Http/Controllers/Investor/DashboardController.php`                                              |
| 7   | **FarmOwnerDashboardService (new)**     | `app/Services/FarmOwnerDashboardService.php`                                                         |
| 8   | **InvestorDashboardService (new)**      | `app/Services/InvestorDashboardService.php`                                                          |
| 9   | **Shared Dashboard Components**         | `resources/js/Components/Dashboard/StatCard.tsx`, `ActivityFeed.tsx`, `QuickActionGrid.tsx`          |
| 10  | **Route registrations**                 | `routes/web.php` — farm-owner and investor dashboard routes                                          |
| 11  | **TypeScript type definitions**         | `resources/js/types/` — Dashboard props interfaces                                                   |
| 12  | **Feature Tests**                       | `tests/Feature/Admin/DashboardTest.php`, `FarmOwner/DashboardTest.php`, `Investor/DashboardTest.php` |

---

### 🧩 Dependencies

- **User Role System**: The existing `RoleMiddleware` (`role:admin`, `role:investor`, `role:farm_owner`) must be functional — **currently implemented** ✅
- **Existing Models & Enums**: `User`, `Farm`, `Investment`, `Harvest`, `Payout`, `KycVerification`, `Article` and their status enums — **currently implemented** ✅
- **AppLayout Component**: Must be used consistently — **currently implemented** ✅ (Admin already migrated; Farm Owner and Investor dashboards still use `AuthenticatedLayout`)
- **Portfolio Components**: `PerformanceChart`, `PortfolioSummaryCard` from `Components/Portfolio/` may be reused — **currently implemented** ✅
- **Admin Metrics Cache**: `getMetrics()` with 5-minute cache in `DashboardController` — **currently implemented** ✅ (but frontend doesn't render the metrics)
- **Route Definitions**: Dashboard routes for Farm Owner and Investor need to be verified or created — **TBD**

---

### ⚠️ Risks / Assumptions

| #   | Risk / Assumption                                                                                                        | Mitigation                                                                                 |
| --- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| 1   | **Performance**: Aggregating metrics across farms, investments, and harvests could be slow for users with large datasets | Use cached/denormalized values with 5-minute TTL; eager-load critical relationships        |
| 2   | **Assumption**: The existing `Dashboard.tsx` (root) is currently used as the main investor landing page                  | Confirm routing — may need to redirect `/dashboard` to `/investor/dashboard` based on role |
| 3   | **Assumption**: Farm Owner model relationships (`user->farms->trees->investments`) are well-established                  | Verify Eloquent relationships exist for all required aggregations                          |
| 4   | **Data Availability**: Some stat cards may show `0` or empty states if the platform has limited seed data                | Design proper empty states with helpful CTAs for each dashboard                            |
| 5   | **Layout Migration**: Farm Owner and Investor dashboards currently use `AuthenticatedLayout` instead of `AppLayout`      | Migration needed as part of this Epic                                                      |
| 6   | **Assumption**: The `metrics` prop is already passed from Admin `DashboardController` but not consumed in the frontend   | This Epic will surface all existing backend metrics in the Admin dashboard UI              |

---

### 🎯 Success Metrics

| #   | Metric                                                                                                    | Target                                                  |
| --- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| 1   | **All three dashboards render real data** — no hardcoded placeholder values                               | 100% of stat cards backed by backend data               |
| 2   | **Role isolation** — each dashboard is only accessible by the correct role                                | Middleware-enforced, verified by feature tests          |
| 3   | **Visual differentiation** — a user can immediately tell which role's dashboard they are on               | Distinct header, accent colors, and role-specific icons |
| 4   | **Page load performance** — each dashboard loads within 200ms server response time                        | < 200ms with cached metrics                             |
| 5   | **TypeScript strict compliance** — zero TS errors on all three dashboard pages                            | `npm run build` passes without errors                   |
| 6   | **Full responsiveness** — all dashboards usable on mobile (360px) through desktop (1440px+)               | Visual QA on 3 breakpoints                              |
| 7   | **Test coverage** — each dashboard has at least 3 feature tests (access control, data rendering, caching) | 9+ feature tests total                                  |
