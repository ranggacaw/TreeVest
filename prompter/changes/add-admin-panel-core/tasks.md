## 1. Admin Dashboard Metrics

- [ ] 1.1 Update `DashboardController::index()` to aggregate platform metrics: total users, KYC-verified users, active investments count, total investment volume (cents), pending KYC review count, pending farm approval count, completed harvests count, total payouts distributed (cents)
- [ ] 1.2 Cache the metrics aggregation under key `admin.dashboard.metrics` with 5-minute TTL using Laravel's database cache driver
- [ ] 1.3 Invalidate `admin.dashboard.metrics` cache from `KycReviewController` after approve/reject and from `FarmApprovalController` after approve/reject/suspend/reinstate
- [ ] 1.4 Update `Admin/Dashboard.tsx` to display the new metric cards; highlight pending KYC and farm approval cards in amber when count > 0; each card links to its admin list page
- [ ] 1.5 Write feature test: `AdminDashboardTest` — asserts metrics props are returned and cached correctly

## 2. Admin User Management

- [ ] 2.1 Add `suspended_at` (nullable timestamp) and `suspended_reason` (nullable string, 1000 chars) columns to `users` table via migration; add soft-deletes to `User` model if not already present
- [ ] 2.2 Create `Admin\UserController` with methods: `index()` (search + role/KYC filter, paginate 20), `show()` (profile + KYC history + last 20 audit events), `update()` (role change only), `suspend()`, `reactivate()`, `destroy()` (soft-delete with active-investment guard)
- [ ] 2.3 Create `Admin\UpdateUserRoleRequest` (validates role enum, rejects self-change)
- [ ] 2.4 Create `Admin\SuspendUserRequest` (validates optional reason string ≤ 1000 chars, rejects admin-on-admin)
- [ ] 2.5 Register routes in `routes/web.php` inside existing `middleware(['auth', 'role:admin'])` group: `GET /admin/users`, `GET /admin/users/{user}`, `PATCH /admin/users/{user}/role`, `POST /admin/users/{user}/suspend`, `POST /admin/users/{user}/reactivate`, `DELETE /admin/users/{user}`
- [ ] 2.6 Create `resources/js/Pages/Admin/Users/Index.tsx` — paginated table with search input and role/KYC status filter dropdowns
- [ ] 2.7 Create `resources/js/Pages/Admin/Users/Show.tsx` — profile detail, KYC history table, recent audit events table, role-change form, suspend/reactivate button, delete button
- [ ] 2.8 Update `user-authentication` middleware (or add new `SuspendedUserMiddleware`) to reject login for suspended/deleted users; log appropriate audit event
- [ ] 2.9 Dispatch `admin_user_suspended`, `admin_user_reactivated`, `admin_user_deleted`, `user_role_changed` audit events via `AuditLogService` in the controller
- [ ] 2.10 Write feature tests: `AdminUserManagementTest` — list, search, filter, role change, suspend/reactivate, delete guards

## 3. Admin KYC Review

- [ ] 3.1 Create `Admin\KycReviewController` with methods: `index()` (paginated list filtered by status, default `submitted`), `show()` (verification detail + documents list), `approve()`, `reject()`, `documentPreview()` (generates signed URL)
- [ ] 3.2 Create `Admin\RejectKycRequest` (requires `reason` string, max 1000 chars)
- [ ] 3.3 Register routes in admin route group: `GET /admin/kyc`, `GET /admin/kyc/{verification}`, `POST /admin/kyc/{verification}/approve`, `POST /admin/kyc/{verification}/reject`, `GET /admin/kyc/documents/{document}/preview`
- [ ] 3.4 Create `resources/js/Pages/Admin/Kyc/Index.tsx` — paginated table of KYC verifications with status filter and pending count header
- [ ] 3.5 Create `resources/js/Pages/Admin/Kyc/Show.tsx` — verification detail, document list with Preview links, Approve button, Reject form (with reason textarea)
- [ ] 3.6 Wire `approve()` and `reject()` to call `KycVerificationService::approve()` / `KycVerificationService::reject()`; invalidate dashboard cache after action
- [ ] 3.7 Write feature tests: `AdminKycReviewTest` — queue listing, approve/reject flows, document preview URL, rejection validation

## 4. Admin Investment Oversight

- [ ] 4.1 Create `Admin\InvestmentController` with methods: `index()` (paginated list with status/farm/search filters), `show()` (investment detail + payout history)
- [ ] 4.2 Register routes in admin route group: `GET /admin/investments`, `GET /admin/investments/{investment}`
- [ ] 4.3 Create `resources/js/Pages/Admin/Investments/Index.tsx` — paginated table with status filter, farm filter dropdown, and investor/tree search input
- [ ] 4.4 Create `resources/js/Pages/Admin/Investments/Show.tsx` — investment detail card, investor info, tree info, payout history table
- [ ] 4.5 Write feature tests: `AdminInvestmentOversightTest` — list, filter by status/farm, search, show detail

## 5. Admin Audit Log Viewer

- [ ] 5.1 Create `Admin\AuditLogController` with methods: `index()` (paginated 50/page, filter by event_type, user, date range), `show()` (render full entry with event_data JSON)
- [ ] 5.2 Register routes in admin route group: `GET /admin/audit-logs`, `GET /admin/audit-logs/{auditLog}`
- [ ] 5.3 Create `resources/js/Pages/Admin/AuditLogs/Index.tsx` — paginated table with event type dropdown filter, user ID/email text filter, date range pickers
- [ ] 5.4 Create `resources/js/Pages/Admin/AuditLogs/Show.tsx` — full entry detail with formatted JSON event_data viewer
- [ ] 5.5 Log `admin_audit_log_accessed` event via `AuditLogService` in `index()` and `show()` methods
- [ ] 5.6 Add `admin_audit_log_accessed` case to `AuditLogEventType` enum if not present
- [ ] 5.7 Write feature tests: `AdminAuditLogViewerTest` — list, filter by type/user/date, show detail, non-admin 403

## 6. Admin Fruit Type Management

- [ ] 6.1 Ensure `FruitType` model uses `SoftDeletes` trait; add soft-deletes migration if `deleted_at` column not present
- [ ] 6.2 Implement `Admin\FruitTypeController` with full CRUD: `index()`, `create()`, `store()`, `edit()`, `update()`, `destroy()` (guard: no associated crops)
- [ ] 6.3 Create `Admin\StoreFruitTypeRequest` and `Admin\UpdateFruitTypeRequest` (name required, slug unique-except-self, description optional, is_active boolean)
- [ ] 6.4 Register routes in admin route group: `Route::resource('fruit-types', FruitTypeController::class)` (add route import)
- [ ] 6.5 Review and complete `resources/js/Pages/Admin/FruitTypes/Index.tsx` — confirm crop count column and active/inactive filter are present
- [ ] 6.6 Review and complete `resources/js/Pages/Admin/FruitTypes/Create.tsx` and `Edit.tsx` — form fields: name, slug (auto-generated from name), description, is_active toggle
- [ ] 6.7 Log `fruit_type.created`, `fruit_type.updated`, `fruit_type.deleted` events via `AuditLogService`
- [ ] 6.8 Write feature tests: `AdminFruitTypeTest` — CRUD flows, duplicate slug rejection, delete guard for associated crops

## Post-Implementation

- [ ] Run `php artisan test` and ensure all new and existing tests pass
- [ ] Run `./vendor/bin/pint` and fix any PHP code style issues
- [ ] Update `AGENTS.md` root file to reflect new admin controllers and pages in the folder structure (Section 4)
