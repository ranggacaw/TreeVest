# Change: Build Role-Based Dashboard Experience for Admin, Farm Owner & Investor

## Why
The three role dashboards (Admin at `/admin/dashboard`, Farm Owner at `/farm-owner/dashboard`, Investor at `/investor/dashboard`) are currently navigation-only placeholders: the Admin dashboard renders article stats but ignores the eight platform KPI metrics already computed by `DashboardController::getMetrics()`; the Farm Owner and Investor dashboards are hard-coded navigation cards that pass zero real data from the backend and still use the legacy `AuthenticatedLayout`. This change replaces all three with rich, data-driven, role-differentiated pages backed by dedicated backend services.

## What Changes

### Admin Dashboard (`/admin/dashboard`)
- **MODIFIED** `Admin\DashboardController::index()` — add `date_from` / `date_to` filter support, pass full `$metrics` array AND a new `recentActivity` collection to the Inertia response
- **NEW** `AdminDashboardService` — extracts metric aggregation & recent-activity logic out of the controller (keeps controller thin per convention)
- **MODIFIED** `Admin/Dashboard.tsx` — surface the eight platform KPI cards (total users, KYC-verified, active investments, investment volume, pending KYC, pending farms, completed harvests, total payouts); add date-range filter UI; add recent-activity feed; add quick-action cards (Manage Users, Review KYC, Approve Farms, Create Article)

### Farm Owner Dashboard (`/farm-owner/dashboard`)
- **NEW** `FarmOwnerDashboardService` — aggregates metrics across all farms owned by the authenticated user
- **NEW** `FarmOwner\DashboardController` — replaces the current inline route closure, calls the service, returns Inertia props
- **MODIFIED** `routes/web.php` — point the farm-owner dashboard route at the new controller
- **NEW** `Pages/FarmOwner/Dashboard.tsx` — full rewrite using `AppLayout`; farm performance KPI cards, farm-status overview list, harvest timeline, health-update summary, quick-action grid

### Investor Dashboard (`/investor/dashboard`)
- **NEW** `InvestorDashboardService` — aggregates portfolio metrics for the authenticated investor
- **NEW** `Investor\DashboardController` — replaces current inline route closure, calls the service, returns Inertia props
- **MODIFIED** `routes/web.php` — point the investor dashboard route at the new controller
- **NEW** `Pages/Investor/Dashboard.tsx` — full rewrite using `AppLayout`; portfolio KPI cards, upcoming harvests list, recent payouts list, recent activity, quick-action grid

### Shared Frontend
- **NEW** `Components/Dashboard/StatCard.tsx` — reusable stat card (`rounded-3xl`, `shadow-card`, `border-sand-200`)
- **NEW** `Components/Dashboard/ActivityFeed.tsx` — recent-activity list component
- **NEW** `Components/Dashboard/QuickActionGrid.tsx` — role-specific quick-action card grid
- **MODIFIED** `resources/js/types/index.d.ts` — add typed Props interfaces for all three dashboard pages

### Tests
- **NEW** `tests/Feature/Admin/DashboardTest.php` — access control, metric data, cache invalidation, date-range filter
- **NEW** `tests/Feature/FarmOwner/DashboardTest.php` — access control, data aggregation
- **NEW** `tests/Feature/Investor/DashboardTest.php` — access control, portfolio data

## Impact

- **Affected specs:** `admin-dashboard-metrics` (MODIFIED), `farm-owner-dashboard` (new capability), `investor-dashboard` (new capability)
- **Affected code:**
  - `app/Http/Controllers/Admin/DashboardController.php` — modified
  - `app/Http/Controllers/FarmOwner/DashboardController.php` — new
  - `app/Http/Controllers/Investor/DashboardController.php` — new
  - `app/Services/AdminDashboardService.php` — new
  - `app/Services/FarmOwnerDashboardService.php` — new
  - `app/Services/InvestorDashboardService.php` — new
  - `resources/js/Pages/Admin/Dashboard.tsx` — modified
  - `resources/js/Pages/FarmOwner/Dashboard.tsx` — rewritten
  - `resources/js/Pages/Investor/Dashboard.tsx` — rewritten
  - `resources/js/Components/Dashboard/` — new directory (3 components)
  - `resources/js/types/index.d.ts` — new interfaces
  - `routes/web.php` — two route closures replaced by controller references
  - `tests/Feature/Admin/DashboardTest.php` — new
  - `tests/Feature/FarmOwner/DashboardTest.php` — new
  - `tests/Feature/Investor/DashboardTest.php` — new

## Not in Scope (per Epic)
- Real-time / WebSocket dashboard updates
- PDF export of dashboard data
- Drag-and-drop widget layout
- Historical chart data beyond existing `PerformanceChart`
- Admin user-account management (separate Epic)
- Mobile native dashboards
