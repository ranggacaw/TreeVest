# admin-dashboard-metrics Specification

## Purpose
TBD - created by archiving change add-admin-panel-core. Update Purpose after archive.
## Requirements
### Requirement: Admin Platform Metrics Dashboard
The admin dashboard SHALL display platform-wide key metrics aggregated via Eloquent and cached using the Laravel database cache driver with a 5-minute TTL.

#### Scenario: Metrics displayed on dashboard load
- **WHEN** an admin navigates to `/admin/dashboard`
- **THEN** the page renders with the following metric cards: total registered users, users with verified KYC, active investments count, total investment volume (in cents), pending KYC reviews count, pending farm approvals count, total completed harvests, and total payouts distributed (in cents)

#### Scenario: Metrics are cached
- **WHEN** the dashboard is requested
- **THEN** the metric values are retrieved from the database cache (key: `admin.dashboard.metrics`)
- **AND** on cache miss the values are recomputed via Eloquent aggregations and cached for 5 minutes
- **AND** cache TTL of 5 minutes is used to balance freshness and query cost

#### Scenario: Pending items highlighted
- **WHEN** there are pending KYC reviews or pending farm approvals
- **THEN** those metric cards are visually highlighted (e.g., amber/yellow background)
- **AND** each card links to the corresponding admin list page

#### Scenario: Metrics update after admin action
- **WHEN** an admin approves or rejects a KYC verification or farm
- **THEN** the dashboard cache is invalidated
- **AND** the next dashboard load shows updated counts

