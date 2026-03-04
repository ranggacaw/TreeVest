# Tasks: Build Role-Based Dashboard Experience

## 1. Shared Frontend Components (prerequisite for all dashboards)

- [x] 1.1 Create `resources/js/Components/Dashboard/StatCard.tsx` — generic stat card accepting `label`, `value`, `accent?`, `linkHref?`, `icon?` props; uses `rounded-3xl shadow-card border-sand-200` design tokens
- [x] 1.2 Create `resources/js/Components/Dashboard/ActivityFeed.tsx` — renders a list of activity entries with event type, description, actor name, and relative timestamp; includes empty-state slot
- [x] 1.3 Create `resources/js/Components/Dashboard/QuickActionGrid.tsx` — renders a configurable grid of action cards (icon + label + href); re-uses Inertia `Link`
- [x] 1.4 Add `AdminDashboardProps`, `FarmOwnerDashboardProps`, `InvestorDashboardProps` interfaces to `resources/js/types/index.d.ts`

## 2. Admin Dashboard — Backend

- [x] 2.1 Create `app/Services/AdminDashboardService.php` — move aggregation logic out of `DashboardController::getMetrics()` into `AdminDashboardService::getMetrics(?DateRange): array`; add optional date-window scoping for investment/payout aggregations; keep cache key `admin.dashboard.metrics` for the unfiltered case
- [x] 2.2 Add `AdminDashboardService::getRecentActivity(int $limit = 10): array` — queries the 10 most recent events across User registrations, Investment creations, Farm creations, and KycVerification submissions, returning a unified array sorted by `created_at` DESC
- [x] 2.3 Update `app/Http/Controllers/Admin/DashboardController.php` — inject `AdminDashboardService`; read optional `date_from` / `date_to` request params; pass `metrics`, `recentActivity`, and existing article data to `Inertia::render`

## 3. Admin Dashboard — Frontend

- [x] 3.1 Update `resources/js/Pages/Admin/Dashboard.tsx` — add `metrics` to the Props interface; render eight platform KPI `StatCard` components in a responsive grid; amber-accent cards for pending KYC and farm approvals when count > 0
- [x] 3.2 Add date-range filter form to `Admin/Dashboard.tsx` — two date inputs (`date_from`, `date_to`), submit via `router.get(route('admin.dashboard'), { date_from, date_to })`, reset button that calls `router.get(route('admin.dashboard'))`
- [x] 3.3 Add `ActivityFeed` component to `Admin/Dashboard.tsx` — renders `recentActivity` prop; empty state if empty
- [x] 3.4 Add `QuickActionGrid` to `Admin/Dashboard.tsx` — four actions: Manage Users, Review KYC, Approve Farms, Create Article
- [x] 3.5 Preserve existing Popular Articles and Stale Content sections; keep `AppLayout` usage

## 4. Farm Owner Dashboard — Backend

- [x] 4.1 Create `app/Services/FarmOwnerDashboardService.php` — accepts `User $owner`; aggregates all metrics listed in the spec; caches per-user with key `farm_owner.dashboard.metrics.{$owner->id}` and 5-minute TTL
- [x] 4.2 Create `app/Http/Controllers/FarmOwner/DashboardController.php` — inject `FarmOwnerDashboardService`; return `Inertia::render('FarmOwner/Dashboard', $data)`
- [x] 4.3 Update `routes/web.php` — replace the inline closure for `farm-owner.dashboard` with `[FarmOwner\DashboardController::class, 'index']`; add `use` import

## 5. Farm Owner Dashboard — Frontend

- [x] 5.1 Rewrite `resources/js/Pages/FarmOwner/Dashboard.tsx` — switch from `AuthenticatedLayout` to `AppLayout`; sage/earth header accent
- [x] 5.2 Add five KPI `StatCard` components: Total Farms, Active Farms, Total Trees, Total Investors, Total Earnings
- [x] 5.3 Add "Farm Status Overview" section listing each farm with `FarmStatusBadge`
- [x] 5.4 Add "Upcoming Harvests" timeline (up to 5 entries)
- [x] 5.5 Add "Recent Health Updates" section (up to 5 entries with `HealthSeverityBadge`)
- [x] 5.6 Add `QuickActionGrid` with: Create Farm, Schedule Harvest, Post Health Update, View Farm Analytics
- [x] 5.7 Implement empty state for farm owners with no farms (CTA to create first farm)

## 6. Investor Dashboard — Backend

- [x] 6.1 Create `app/Services/InvestorDashboardService.php` — accepts `User $investor`; aggregates all metrics listed in the spec; caches per-user with key `investor.dashboard.metrics.{$investor->id}` and 5-minute TTL
- [x] 6.2 Create `app/Http/Controllers/Investor/DashboardController.php` — inject `InvestorDashboardService`; return `Inertia::render('Investor/Dashboard', $data)`
- [x] 6.3 Update `routes/web.php` — replace the inline closure for `investor.dashboard` with `[Investor\DashboardController::class, 'index']`; add `use` import

## 7. Investor Dashboard — Frontend

- [x] 7.1 Rewrite `resources/js/Pages/Investor/Dashboard.tsx` — switch from `AuthenticatedLayout` to `AppLayout`; pine/sun header accent
- [x] 7.2 Add five KPI `StatCard` components: Total Invested, Active Trees, Total Payouts Received, Portfolio ROI %, Total Investments Count
- [x] 7.3 Add KYC verification CTA banner when `kyc_status !== 'verified'`
- [x] 7.4 Add "Upcoming Harvests" section (up to 5 entries)
- [x] 7.5 Add "Recent Payouts" section (up to 5 entries)
- [x] 7.6 Add "Recent Investments" section (up to 5 entries with status badges)
- [x] 7.7 Add `QuickActionGrid` with: Browse Farms, View Full Portfolio, Download Reports, KYC Verification
- [x] 7.8 Implement empty state for investors with no investments (CTA to browse trees)

## 8. Tests

- [x] 8.1 Create `tests/Feature/Admin/DashboardTest.php`
    - [x] 8.1.1 Admin can access `/admin/dashboard` (200, Inertia component `Admin/Dashboard`)
    - [x] 8.1.2 Non-admin receives 403
    - [x] 8.1.3 Response includes `metrics` prop with all eight keys
    - [x] 8.1.4 Date-range filter scopes investment/payout aggregations
    - [x] 8.1.5 Cache is invalidated when a farm is approved
- [x] 8.2 Create `tests/Feature/FarmOwner/DashboardTest.php`
    - [x] 8.2.1 Farm owner can access `/farm-owner/dashboard` (200, Inertia component `FarmOwner/Dashboard`)
    - [x] 8.2.2 Non-farm-owner receives 403
    - [x] 8.2.3 Response includes correct farm count for the authenticated user
    - [x] 8.2.4 Metrics for a different farm owner's farms do not leak into the response
- [x] 8.3 Create `tests/Feature/Investor/DashboardTest.php`
    - [x] 8.3.1 Investor can access `/investor/dashboard` (200, Inertia component `Investor/Dashboard`)
    - [x] 8.3.2 Non-investor receives 403
    - [x] 8.3.3 Response includes `total_invested_cents` equal to sum of user's active investment amounts
    - [x] 8.3.4 KYC status is included in the response

## 9. Build Verification

- [x] 9.1 Run `npm run build` — zero TypeScript errors
- [x] 9.2 Run `php artisan test tests/Feature/Admin/DashboardTest.php tests/Feature/FarmOwner/DashboardTest.php tests/Feature/Investor/DashboardTest.php` — all tests pass
- [x] 9.3 Run `./vendor/bin/pint` — no PHP formatting errors

## Post-Implementation

- [x] Update `AGENTS.md` to reflect the new services (`AdminDashboardService`, `FarmOwnerDashboardService`, `InvestorDashboardService`) and new controllers under `app/Http/Controllers/FarmOwner/DashboardController.php` and `app/Http/Controllers/Investor/DashboardController.php`
