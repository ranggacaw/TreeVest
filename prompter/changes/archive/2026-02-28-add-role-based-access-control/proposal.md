# Change: Add Role-Based Access Control System

> **EPIC:** EPIC-003: Implement Role-Based Access Control
> **Created:** 2026-02-28
> **Status:** Proposal

## Why

The platform requires a secure permission system to ensure users can only access features and data appropriate to their role. The PRD defines three roles: Investors, Farm Owners/Partners, and Administrators. While a basic `RoleMiddleware` exists with `role:admin` and `role:cashier` checks, it needs to be extended to support the full role set and integrated throughout the application.

Without proper RBAC:
- Investors could access farm management features
- Farm owners could access admin functions
- Security vulnerabilities from unauthorized access
- No foundation for feature-level permissions in other EPICs

## What Changes

### User Model & Database
- **ADDED**: `role` enum column to `users` table (`investor`, `farm_owner`, `admin`)
- **ADDED**: Default role assignment (`investor`) during registration
- **ADDED**: Migration to add role column with default value

### Middleware & Authorization
- **MODIFIED**: Extend existing `RoleMiddleware` to support all three roles
- **REMOVED**: Temporary `role:cashier` check (replaced with proper roles)
- **ADDED**: Role verification methods in User model (`isInvestor()`, `isFarmOwner()`, `isAdmin()`)
- **ADDED**: Blade/Inertia authorization directives for conditional rendering

### Route Protection
- **ADDED**: Role-based route groups in `routes/web.php`
- **ADDED**: Protected routes for each role type
- **ADDED**: Fallback route for unauthorized access

### Frontend Integration
- **ADDED**: User role data passed via Inertia shared props
- **ADDED**: React hooks/utilities for role-based UI rendering
- **ADDED**: TypeScript type definitions for user roles

### Audit Logging
- **ADDED**: Event listeners for role change events
- **ADDED**: Audit log entries when admin changes user roles
- **ADDED**: Failed authorization attempt logging

### Testing
- **ADDED**: Unit tests for role checking methods
- **ADDED**: Feature tests for route protection
- **ADDED**: Integration tests for role-based access scenarios

## Impact

### Affected Specs
- **NEW CAPABILITY**: `user-authorization` (role-based access control system)

### Affected Code
- `database/migrations/` - Add role column migration
- `app/Models/User.php` - Add role methods and attributes
- `app/Http/Middleware/RoleMiddleware.php` - Extend for three roles
- `routes/web.php` - Add role-based route groups
- `app/Http/Kernel.php` - Register middleware aliases
- `resources/js/types/index.d.ts` - Add Role type definitions
- `app/Providers/AppServiceProvider.php` - Share user role via Inertia
- `tests/Feature/` - Add authorization tests
- `tests/Unit/` - Add role method tests

### Breaking Changes
- **BREAKING**: Removes `role:cashier` middleware check (replaced with `role:admin`, `role:farm_owner`, `role:investor`)
- **MIGRATION REQUIRED**: Existing users need role assignment (default to `investor`)

### Dependency Impact
- **Blocks**: EPIC-004 (Farm Management - requires `role:farm_owner`)
- **Blocks**: EPIC-014 (Admin Panel - requires `role:admin`)
- **Integrates With**: EPIC-001 (Authentication - roles attach to authenticated users)
- **Foundation For**: All future feature-level permissions

## Risks & Mitigation

### Risks
1. **Existing users without roles**: Migration must handle existing data
   - *Mitigation*: Migration sets default role (`investor`) for all existing users
   
2. **Frontend/backend permission mismatch**: UI shows features user cannot access
   - *Mitigation*: Centralized role checking via Inertia shared props; TypeScript types enforce consistency
   
3. **Performance impact**: Role checks on every request
   - *Mitigation*: Role data cached in session; no additional DB queries per request

4. **Future multi-role requirement**: Current design assumes single role per user
   - *Mitigation*: Use enum for now; document migration path to many-to-many if needed

### Assumptions
- A user has exactly one primary role (no multi-role users at launch)
- Admin role is assigned manually via database seeder or direct DB update (not self-service)
- The permission matrix from AGENTS.md Section 8 is authoritative
- RBAC is enforced via Laravel middleware on routes
- Role data is shared with React frontend via Inertia shared props

## Success Criteria
- [ ] All 25 existing authentication tests continue to pass
- [ ] New role-based authorization tests pass (minimum 15 tests covering all roles)
- [ ] Routes are properly protected with role middleware
- [ ] Unauthorized access attempts return 403 Forbidden
- [ ] User role is available in React components via Inertia props
- [ ] Role changes are logged in audit trail
- [ ] Migration runs successfully on fresh and existing databases
- [ ] No performance degradation (< 5ms latency added per request)

## Implementation Notes

### Middleware Extension Pattern
Extend existing `app/Http/Middleware/RoleMiddleware.php`:
```php
public function handle(Request $request, Closure $next, string $role): Response
{
    if (!$request->user() || $request->user()->role !== $role) {
        abort(403, 'Unauthorized access');
    }
    return $next($request);
}
```

### Route Protection Example
```php
Route::middleware(['auth', 'role:admin'])->group(function () {
    // Admin-only routes
});

Route::middleware(['auth', 'role:farm_owner'])->group(function () {
    // Farm owner routes
});

Route::middleware(['auth', 'role:investor'])->group(function () {
    // Investor routes
});
```

### Inertia Shared Props
Share user role data in `app/Providers/AppServiceProvider.php`:
```php
Inertia::share([
    'auth.user' => fn () => Auth::user() ? [
        'id' => Auth::user()->id,
        'name' => Auth::user()->name,
        'email' => Auth::user()->email,
        'role' => Auth::user()->role,
    ] : null,
]);
```

## References
- PRD Section 1: User Management System
- AGENTS.md Section 8: Target Users & Personas (Permission Matrix)
- AGENTS.md Section 6: Data Models (User Entity)
- EPIC-003: `prompter/epics/EPIC-003-role-based-access-control.md`
