# farm-owner-dashboard Specification

## Purpose
TBD - created by archiving change build-role-based-dashboards. Update Purpose after archive.
## Requirements
### Requirement: Farm Owner Dashboard — Backend Service and Controller
The system SHALL provide a `FarmOwnerDashboardService` that aggregates, with a 5-minute cache keyed by `farm_owner.dashboard.metrics.{userId}`, the following metrics scoped to the authenticated user's farms:
- `total_farms` — count of all farms owned by the user
- `active_farms` — farms with `status = active`
- `pending_farms` — farms with `status = pending_approval`
- `total_trees` — count of all trees across all owned farms (via `farms → fruit_crops → trees`)
- `total_investors` — distinct count of investors (users) who have active investments in any of the owner's trees
- `pending_harvests_count` — count of `Harvest` records with `status = scheduled` linked to owned farms
- `total_earnings_cents` — sum of `net_amount_cents` from completed `Payout` records where the payout's investment is in an owned tree
- `recent_health_updates` — latest 5 `TreeHealthUpdate` records authored by this user (with `fruit_crop.name` and `severity`)
- `upcoming_harvests` — next 5 `Harvest` records with `status = scheduled` ordered by `scheduled_date ASC`, including tree identifier and farm name
- `recent_harvests` — last 5 `Harvest` records with `status = completed` ordered by `harvest_date DESC`, including yield and farm name
- `farms_overview` — list of all owned farms with `id`, `name`, `status`, and tree count

A new `FarmOwner\DashboardController` SHALL call this service and return an `Inertia::render('FarmOwner/Dashboard', $data)` response. The route `farm-owner.dashboard` SHALL point to this controller instead of the current inline closure.

#### Scenario: Dashboard data returned for farm owner
- **WHEN** a farm owner navigates to `/farm-owner/dashboard`
- **THEN** the Inertia response includes all metrics listed above, scoped to the authenticated user's farms
- **AND** the response is cached for 5 minutes per user

#### Scenario: Farm owner with no farms
- **WHEN** a farm owner has no farms
- **THEN** all count metrics are zero, all list metrics are empty arrays, and the page renders without error

#### Scenario: Non-farm-owner cannot access
- **WHEN** a user without the `farm_owner` role navigates to `/farm-owner/dashboard`
- **THEN** they receive a 403 Forbidden response (enforced by the existing `role:farm_owner` middleware)

### Requirement: Farm Owner Dashboard — Frontend Page
The `FarmOwner/Dashboard.tsx` page SHALL be rewritten to use `AppLayout` (replacing `AuthenticatedLayout`) and SHALL render:
- A role-differentiated header with a sage/earth color accent and a farm/leaf icon
- Five KPI stat cards using the shared `StatCard` component: Total Farms, Active Farms, Total Trees, Total Investors, Total Earnings (MYR formatted from cents)
- A "Farm Status Overview" section listing each farm with a `FarmStatusBadge`
- An "Upcoming Harvests" timeline showing the next 5 scheduled harvests
- A "Recent Health Updates" section showing the latest 5 updates with severity badges
- A "Quick Actions" grid (`QuickActionGrid`) with: Create Farm, Schedule Harvest, Post Health Update, View Farm Analytics
All TypeScript props MUST be strictly typed via a `FarmOwnerDashboardProps` interface. No hardcoded placeholder values.

#### Scenario: KPI cards display real data
- **WHEN** a farm owner loads the dashboard
- **THEN** all five KPI stat cards show values from the backend props (not `0` or `$0.00` hardcoded)

#### Scenario: Upcoming harvests list
- **WHEN** there are scheduled harvests
- **THEN** up to 5 upcoming harvest entries are shown with tree identifier, farm name, and scheduled date

#### Scenario: Empty state when no farms
- **WHEN** a farm owner has no farms
- **THEN** the page renders an empty state with a CTA to create the first farm

#### Scenario: Layout uses AppLayout
- **WHEN** the farm owner dashboard is rendered
- **THEN** the page uses `AppLayout` and the header shows a distinct sage/earth color accent

