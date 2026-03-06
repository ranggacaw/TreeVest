# investor-dashboard Specification

## Purpose
TBD - created by archiving change build-role-based-dashboards. Update Purpose after archive.
## Requirements
### Requirement: Investor Dashboard — Backend Service and Controller
The system SHALL provide an `InvestorDashboardService` that aggregates, with a 5-minute cache keyed by `investor.dashboard.metrics.{userId}`, the following metrics scoped to the authenticated investor:
- `total_invested_cents` — sum of `amount_cents` from all `active` investments
- `active_trees_count` — count of distinct trees with at least one active investment by this user
- `total_payouts_received_cents` — sum of `net_amount_cents` from all `completed` payouts belonging to this user
- `portfolio_roi_percent` — computed as `(total_payouts_received_cents / total_invested_cents) * 100`, returning `null` if `total_invested_cents` is zero
- `upcoming_harvests` — next 5 `Harvest` records with `status = scheduled` linked to the user's active investments, ordered by `scheduled_date ASC`, including tree identifier, fruit crop name, farm name, and scheduled date
- `recent_payouts` — last 5 completed `Payout` records belonging to the user, including `net_amount_cents`, `currency`, `status`, and `created_at`
- `recent_investments` — last 5 `Investment` records belonging to the user, including tree identifier, farm name, `amount_cents`, `status`, and `created_at`
- `kyc_status` — the user's `kyc_status` value, passed to allow the frontend to render a KYC prompt when not verified

A new `Investor\DashboardController` SHALL call this service and return an `Inertia::render('Investor/Dashboard', $data)` response. The route `investor.dashboard` SHALL point to this controller instead of the current inline closure.

#### Scenario: Dashboard data returned for investor
- **WHEN** an investor navigates to `/investor/dashboard`
- **THEN** the Inertia response includes all metrics listed above, scoped to the authenticated user
- **AND** the response is cached for 5 minutes per user

#### Scenario: Investor with no investments
- **WHEN** an investor has no active investments
- **THEN** all monetary metrics are zero, all list metrics are empty arrays, ROI is null, and the page renders without error

#### Scenario: KYC not verified — prompt surfaced
- **WHEN** the investor's `kyc_status` is not `verified`
- **THEN** the `kyc_status` prop is passed so the frontend can render a KYC-verification call-to-action banner

#### Scenario: Non-investor cannot access
- **WHEN** a user without the `investor` role navigates to `/investor/dashboard`
- **THEN** they receive a 403 Forbidden response (enforced by the existing `role:investor` middleware)

### Requirement: Investor Dashboard — Frontend Page
The `Investor/Dashboard.tsx` page SHALL be rewritten to use `AppLayout` (replacing `AuthenticatedLayout`) and SHALL render:
- A role-differentiated header with a pine/sun color accent and a growth-chart icon
- Five KPI stat cards using the shared `StatCard` component: Total Invested (MYR), Active Trees, Total Payouts Received (MYR), Portfolio ROI %, and Total Investments Count
- A KYC verification CTA banner when `kyc_status` is not `verified`
- An "Upcoming Harvests" section listing the next 5 scheduled harvests for invested trees
- A "Recent Payouts" section listing the last 5 completed payouts with amounts and dates
- A "Recent Investments" section listing the last 5 investments with status badges
- A "Quick Actions" grid (`QuickActionGrid`) with: Browse Farms, View Full Portfolio, Download Reports, KYC Verification
All TypeScript props MUST be strictly typed via an `InvestorDashboardProps` interface. No hardcoded placeholder values. Monetary values SHALL be formatted client-side using `Intl.NumberFormat`.

#### Scenario: KPI cards display real data
- **WHEN** an investor loads the dashboard
- **THEN** all five KPI stat cards show values from the backend props (not `0` or `$0.00` hardcoded)

#### Scenario: KYC banner shown
- **WHEN** the investor's `kyc_status` is `pending` or `submitted` or `rejected`
- **THEN** a prominent banner linking to `/profile/kyc` is displayed above the stat cards

#### Scenario: Upcoming harvests list
- **WHEN** there are scheduled harvests for the investor's trees
- **THEN** up to 5 upcoming entries are shown with tree identifier, fruit crop name, farm name, and scheduled date

#### Scenario: Empty state for new investor
- **WHEN** an investor has no investments yet
- **THEN** the page renders an empty-state prompt to browse available trees

#### Scenario: Layout uses AppLayout
- **WHEN** the investor dashboard is rendered
- **THEN** the page uses `AppLayout` and the header shows a distinct pine/sun color accent

