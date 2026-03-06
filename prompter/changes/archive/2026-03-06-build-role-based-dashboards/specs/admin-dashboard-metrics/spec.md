## MODIFIED Requirements

### Requirement: Admin Platform Metrics Dashboard
The admin dashboard SHALL display platform-wide key metrics aggregated via Eloquent and cached using the Laravel database cache driver with a 5-minute TTL. The backend MUST extract aggregation logic into `AdminDashboardService` and the controller SHALL remain thin (≤ 20 lines per method). An optional `date_from` / `date_to` query-string filter SHALL be accepted and passed into the service to scope investment and payout aggregations to the chosen date window; when the filter is absent, all-time totals SHALL be returned.

#### Scenario: Metrics displayed on dashboard load
- **WHEN** an admin navigates to `/admin/dashboard`
- **THEN** the page renders with the following metric cards: total registered users, users with verified KYC, active investments count, total investment volume (in cents), pending KYC reviews count, pending farm approvals count, total completed harvests, and total payouts distributed (in cents)

#### Scenario: Metrics are cached
- **WHEN** the dashboard is requested without a date-range filter
- **THEN** the metric values are retrieved from the database cache (key: `admin.dashboard.metrics`)
- **AND** on cache miss the values are recomputed via Eloquent aggregations and cached for 5 minutes
- **AND** cache TTL of 5 minutes is used to balance freshness and query cost

#### Scenario: Date-range filter scopes metrics
- **WHEN** an admin supplies `date_from` and `date_to` query parameters
- **THEN** investment and payout aggregations are scoped to records created within that range
- **AND** the filtered result is NOT cached (cache is only used for the default all-time view)
- **AND** user-count metrics (total users, KYC-verified) remain all-time values regardless of the date filter

#### Scenario: Pending items highlighted
- **WHEN** there are pending KYC reviews or pending farm approvals
- **THEN** those metric cards are visually highlighted (amber/yellow background)
- **AND** each card links to the corresponding admin list page

#### Scenario: Metrics update after admin action
- **WHEN** an admin approves or rejects a KYC verification or farm
- **THEN** the dashboard cache is invalidated
- **AND** the next dashboard load shows updated counts

## ADDED Requirements

### Requirement: Admin Dashboard Frontend — Platform KPI Cards
The Admin Dashboard page (`Admin/Dashboard.tsx`) SHALL render all eight platform KPI metrics returned by the backend using `StatCard` components that match the established Treevest design language (`rounded-3xl`, `shadow-card`, `border-sand-200`). The `metrics` prop MUST be consumed; no hardcoded placeholder values are permitted. Pending-count cards (KYC reviews, farm approvals) SHALL use an amber accent when their value is greater than zero. The page MUST use `AppLayout` (not `AuthenticatedLayout`).

#### Scenario: All KPI cards render real data
- **WHEN** an admin loads the dashboard
- **THEN** eight stat cards are rendered, each displaying a non-placeholder value sourced from the `metrics` prop

#### Scenario: Pending-count cards highlighted
- **WHEN** `metrics.pending_kyc_review_count` or `metrics.pending_farm_approval_count` is greater than zero
- **THEN** the corresponding card renders with an amber background or border accent

#### Scenario: Empty state for zero values
- **WHEN** a metric value is zero (e.g., no completed harvests yet)
- **THEN** the card renders `0` without crashing and optionally shows a descriptive sub-label

### Requirement: Admin Dashboard — Recent Activity Feed
The admin dashboard SHALL display a "Recent Platform Activity" feed showing the latest 10 events across: new user registrations, new investments, new farm submissions, and new KYC submissions. Each entry SHALL include the event type, a short description, the actor's name (or "System"), and a relative timestamp. The feed SHALL be ordered by `created_at` descending.

#### Scenario: Activity feed populated
- **WHEN** the admin dashboard is loaded
- **THEN** up to 10 recent activity entries are shown, sourced from the `recentActivity` prop

#### Scenario: Empty activity feed
- **WHEN** no activity has occurred
- **THEN** the feed section renders an empty-state message ("No recent activity")

### Requirement: Admin Dashboard — Quick Action Cards
The admin dashboard SHALL render a quick-action grid with four cards: "Manage Users" → `admin.users.index`, "Review KYC" → `admin.kyc.index`, "Approve Farms" → `admin.farms.index`, "Create Article" → `admin.articles.create`. Each card SHALL use the `QuickActionGrid` component and match the Treevest design system.

#### Scenario: Quick actions render and navigate
- **WHEN** an admin clicks a quick-action card
- **THEN** they are navigated to the corresponding admin route via Inertia `Link`

### Requirement: Admin Dashboard — Date Range Filter
The admin dashboard SHALL render a date-range filter form (two date inputs: "From" and "To"). Submitting the form SHALL perform an Inertia `router.get()` with `date_from` and `date_to` query parameters, reloading the page with filtered metrics. Clearing the filter SHALL reload the page without those parameters, restoring all-time metrics.

#### Scenario: Date filter applied
- **WHEN** an admin sets a date range and submits the filter form
- **THEN** the page reloads with `date_from` and `date_to` in the URL and the metrics reflect only activity within that range

#### Scenario: Date filter cleared
- **WHEN** an admin clears the date filter
- **THEN** the page reloads without date parameters and all-time metrics are shown
