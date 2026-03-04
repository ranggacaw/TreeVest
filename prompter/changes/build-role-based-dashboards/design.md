# Design: Role-Based Dashboards

## Context

Three role dashboards exist as routes in `routes/web.php` but are either placeholder-level UIs or rendering incomplete data:

- `/admin/dashboard` — has a controller (`Admin\DashboardController`) that computes 8 platform KPIs via `getMetrics()` and caches them, but the frontend `Admin/Dashboard.tsx` ignores the `metrics` prop entirely and only renders article stats
- `/farm-owner/dashboard` — is an inline route closure returning `Inertia::render('FarmOwner/Dashboard')` with zero props; the page uses the legacy `AuthenticatedLayout`
- `/investor/dashboard` — same as farm owner: inline closure, zero props, legacy layout

The change introduces dedicated services and controllers for the two missing dashboards, upgrades the admin dashboard to surface all existing metrics, and rewrites all three frontend pages with real data.

## Goals / Non-Goals

**Goals:**
- Surface all eight existing `getMetrics()` KPIs in the Admin dashboard UI
- Add date-range filtering for admin metric scoping (no schema changes needed)
- Add recent-activity feed to admin dashboard (no new models; queries existing tables)
- Build `FarmOwnerDashboardService` and `InvestorDashboardService` with 5-minute per-user cache
- Replace two inline route closures with dedicated controllers
- Rewrite Farm Owner and Investor dashboard pages using `AppLayout` and real data
- Introduce three shared `Components/Dashboard/` components to avoid repetition across pages
- Maintain TypeScript strict mode throughout; zero `any` types

**Non-Goals:**
- Real-time updates (WebSocket/SSE)
- Database schema changes — all data is accessible through existing Eloquent relationships
- New middleware or permission changes
- Mobile-native dashboards

## Decisions

### Decision: Extract `AdminDashboardService` for admin metric logic
**Why:** `DashboardController` currently holds ~12 lines of aggregation logic inline in `getMetrics()`. Adding date-range filtering and recent-activity queries would push it well beyond the 20-line-per-method project convention. A dedicated service keeps the controller thin and the logic testable in isolation.

**Alternatives considered:** Keep everything in the controller (rejected — violates project convention); use a repository pattern (rejected — over-engineering for read-only dashboard queries).

### Decision: Per-user cache keys for Farm Owner and Investor services
**Key format:** `farm_owner.dashboard.metrics.{userId}` and `investor.dashboard.metrics.{userId}`
**Why:** Dashboard metrics are user-scoped. A shared key would return another user's data on cache hit. The 5-minute TTL matches the existing admin dashboard TTL.
**Cache invalidation:** Cache is tag-free (database driver does not support cache tags). Simple `Cache::forget(key)` is called by the service's `invalidate(User)` static method, invoked from existing event listeners (e.g., `HarvestCompleted`, `PayoutsCreated`) when those are wired in future Epics. For this Epic, TTL-based expiry is sufficient.

### Decision: Three shared Dashboard components (`StatCard`, `ActivityFeed`, `QuickActionGrid`)
**Why:** All three dashboard pages share stat-card, activity-feed, and quick-action patterns. Extracting to `Components/Dashboard/` avoids copy-paste and enforces consistent design tokens.
**Scope:** These are presentational/dumb components — they receive typed props and render markup; no internal state beyond hover effects.

### Decision: Inline route closures → dedicated controllers
**Why:** The farm-owner and investor dashboard closures currently pass zero props, which is exactly the problem. Moving to controllers is the correct pattern per the project architecture and allows the service to be injected via constructor.
**No route name changes:** `farm-owner.dashboard` and `investor.dashboard` names are preserved; only the handler changes.

### Decision: `recentActivity` assembled in `AdminDashboardService` rather than separate queries in controller
**Why:** The "recent activity feed" unions results from four tables (users, investments, farms, kyc_verifications). Doing this in a service method keeps the controller a single-call receiver and makes the logic unit-testable.
**Implementation:** PHP-level merge + `usort()` by `created_at` DESC on up to `$limit * 4` records (typically 40 rows max). No raw SQL union required; acceptable for a dashboard with 5-minute cache.

### Decision: Date-range filter is NOT cached
**Why:** The unfiltered (all-time) view is the 95% case and is warm in cache. Filtered views are ad-hoc admin queries; caching them would require a composite cache key incorporating the date range, complicating invalidation. The performance trade-off is acceptable because date-filtered queries add only a `BETWEEN` clause on indexed `created_at` columns.

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| `farms → fruit_crops → trees → investments` chain could be slow for large datasets | Use `withCount()` and `hasManyThrough` where supported; add `DB::enableQueryLog()` assertions in tests to catch N+1 |
| Per-user cache keys accumulate in the database cache table | TTL-based expiry (5 min) means stale keys are cleaned up by `php artisan cache:prune-stale-tags` (or DB expiry); acceptable at current scale |
| `InvestorDashboardService` joins investments → trees → harvests; could return many rows | Limit list metrics at the service level (`upcoming_harvests` = 5, `recent_payouts` = 5, etc.) before returning to the controller |
| Farm Owner service counts `total_investors` via `hasManyThrough` across 4 tables | Use a single DB query with `JOIN` via Eloquent scopes rather than in-PHP counting |

## Migration Plan

No database migrations required. All data is accessible through existing models and relationships.

Route changes: two closure handlers replaced by controller references — no URL changes, no breaking changes to frontend `route()` calls.

Rollback: revert `routes/web.php` to closures and restore the previous `Admin/Dashboard.tsx` — no data is mutated by this change.

## Open Questions

None blocking implementation. The following are noted for future consideration:
- Should the `/dashboard` (root, `auth` middleware only) route redirect to the role-specific dashboard based on `auth()->user()->role`? Currently it renders `Dashboard` page without role context. This is **out of scope** for this Epic but worth addressing in a routing cleanup change.
- Should `AdminDashboardService::getRecentActivity()` be paginated in a future iteration? For now, returning the latest 10 items is sufficient.
