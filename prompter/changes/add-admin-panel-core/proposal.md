# Change: Add Admin Panel Core Management Features

## Why
EPIC-014 defines a comprehensive admin panel for platform operations, but the current admin area only covers content management (articles), farm approval, market prices, notification templates, and a stub harvest overview. The core operational capabilities — user management, KYC review, platform-wide metrics dashboard, investment oversight, transaction monitoring, audit log viewer, and fruit type reference data management — are missing entirely or are empty stubs.

## What Changes
- **Admin Dashboard Metrics:** Expand `DashboardController` and `Admin/Dashboard.tsx` to show platform-wide metrics (total users, active investments, transaction volume, pending KYC reviews, pending farm approvals) cached via Laravel's database cache driver.
- **Admin User Management:** New `Admin\UserController` with list, show, edit (role change), suspend/reactivate, and delete actions; corresponding `Admin/Users/` Inertia pages.
- **Admin KYC Review:** New `Admin\KycReviewController` with queue view (submitted verifications), show (document preview), approve, and reject actions; corresponding `Admin/Kyc/` Inertia pages. Integrates with existing `KycVerificationService`.
- **Admin Investment Oversight:** New `Admin\InvestmentController` with paginated list (filterable by status, farm, investor) and detail view; corresponding `Admin/Investments/` Inertia pages.
- **Admin Audit Log Viewer:** New `Admin\AuditLogController` with searchable, filterable, paginated list; corresponding `Admin/AuditLogs/Index.tsx`.
- **Admin Fruit Type Management:** Implement the existing stub `Admin\FruitTypeController` with full CRUD; add `Admin/FruitTypes/` Inertia pages (Index, Create, Edit already exist as scaffolds).
- **Routes:** Register all new routes inside the existing `middleware(['auth', 'role:admin'])` route group in `routes/web.php`.

## Impact
- **New capabilities (specs):** `admin-user-management`, `admin-kyc-review`, `admin-dashboard-metrics`, `admin-investment-oversight`, `admin-audit-log-viewer`, `admin-fruit-type-management`
- **Affected existing specs:** `kyc-verification` (admin review actions already partially specified), `user-authorization` (admin full access patterns), `audit-logging` (admin retrieval)
- **Affected code:**
  - `app/Http/Controllers/Admin/` — new controllers: `UserController`, `KycReviewController`, `InvestmentController`, `AuditLogController`; filled stub: `FruitTypeController`
  - `app/Http/Controllers/Admin/DashboardController.php` — expanded metrics
  - `routes/web.php` — new admin route registrations
  - `resources/js/Pages/Admin/` — new page directories: `Users/`, `Kyc/`, `Investments/`, `AuditLogs/`; filled stubs: `FruitTypes/`
  - `app/Http/Requests/Admin/` — new FormRequests for user edit, KYC rejection reason
  - `app/Services/` — no new services; uses `KycVerificationService`, `AuditLogService`, `InvestmentPortfolioService`

## Out of Scope
- Transaction monitoring / dispute handling (separate EPIC-010 concern, deferred)
- System health monitoring (infrastructure-level, deferred)
- Platform-level analytics and PDF reports (deferred — complex async generation covered by financial-reporting spec)
- Secondary market administration (deferred)
