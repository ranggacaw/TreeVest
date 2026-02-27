## 1. Database Schema
- [ ] 1.1 Create migration to add `role` enum column to `users` table
- [ ] 1.2 Set default value to `investor` in migration
- [ ] 1.3 Add index on `role` column for query performance
- [ ] 1.4 Run migration and verify schema changes
- [ ] 1.5 Create database seeder for admin user with `role:admin`

## 2. User Model Enhancement
- [ ] 2.1 Add `role` attribute to `$fillable` array in User model
- [ ] 2.2 Add `role` enum cast in User model
- [ ] 2.3 Implement `isInvestor()` method
- [ ] 2.4 Implement `isFarmOwner()` method
- [ ] 2.5 Implement `isAdmin()` method
- [ ] 2.6 Implement `hasRole(string $role)` method
- [ ] 2.7 Add PHPDoc annotations for role methods

## 3. Middleware Implementation
- [ ] 3.1 Extend `RoleMiddleware` to accept role parameter
- [ ] 3.2 Implement role verification logic in middleware
- [ ] 3.3 Return 403 Forbidden for unauthorized access
- [ ] 3.4 Register `role` middleware alias in `app/Http/Kernel.php`
- [ ] 3.5 Remove deprecated `role:cashier` references

## 4. Route Protection
- [ ] 4.1 Create admin route group with `role:admin` middleware in `routes/web.php`
- [ ] 4.2 Create farm owner route group with `role:farm_owner` middleware
- [ ] 4.3 Create investor route group with `role:investor` middleware
- [ ] 4.4 Move existing routes into appropriate role groups
- [ ] 4.5 Add fallback route for unauthorized access (403 error page)
- [ ] 4.6 Verify dashboard route is accessible to all authenticated users

## 5. Frontend Integration
- [ ] 5.1 Add `Role` type definition to `resources/js/types/index.d.ts`
- [ ] 5.2 Update `User` type to include `role: Role` property
- [ ] 5.3 Share user role data via Inertia in `AppServiceProvider`
- [ ] 5.4 Create `useAuth` hook in React for accessing user data
- [ ] 5.5 Create `useRole` hook for role-based conditional rendering
- [ ] 5.6 Create `Can` component for declarative permission checks
- [ ] 5.7 Update navigation components to show/hide based on role

## 6. Registration Enhancement
- [ ] 6.1 Add role selection field to registration form (default: investor)
- [ ] 6.2 Validate role value in `RegisteredUserController`
- [ ] 6.3 Assign role during user creation
- [ ] 6.4 Update registration tests to verify role assignment

## 7. Audit Logging
- [ ] 7.1 Create `RoleChanged` event class
- [ ] 7.2 Create `LogRoleChange` listener
- [ ] 7.3 Register event listener in `EventServiceProvider`
- [ ] 7.4 Add audit log table migration (if not exists)
- [ ] 7.5 Log failed authorization attempts in middleware
- [ ] 7.6 Create audit log model and factory

## 8. Error Handling
- [ ] 8.1 Create custom 403 error page (Inertia component)
- [ ] 8.2 Add error message explaining unauthorized access
- [ ] 8.3 Provide navigation back to dashboard
- [ ] 8.4 Test 403 page rendering with Inertia

## 9. Testing
- [ ] 9.1 Write unit tests for User model role methods (5 tests)
- [ ] 9.2 Write feature tests for RoleMiddleware (6 tests: each role + unauthorized)
- [ ] 9.3 Write feature tests for admin route protection (3 tests)
- [ ] 9.4 Write feature tests for farm owner route protection (3 tests)
- [ ] 9.5 Write feature tests for investor route protection (3 tests)
- [ ] 9.6 Write feature tests for role assignment during registration (2 tests)
- [ ] 9.7 Write integration tests for Inertia shared props (2 tests)
- [ ] 9.8 Ensure all 25 existing authentication tests still pass
- [ ] 9.9 Run full test suite and verify 100% pass rate

## 10. Documentation
- [ ] 10.1 Update README.md with role information
- [ ] 10.2 Document role-based route protection pattern
- [ ] 10.3 Document frontend role checking utilities
- [ ] 10.4 Add code examples for common role check patterns
- [ ] 10.5 Document migration process for existing users

## 11. Code Quality
- [ ] 11.1 Run Laravel Pint to format all modified PHP files
- [ ] 11.2 Run TypeScript compiler to check for type errors
- [ ] 11.3 Verify no console warnings in frontend build
- [ ] 11.4 Review code for security best practices

## Post-Implementation
- [ ] Update AGENTS.md Section 4 (Folder Structure) if new directories added
- [ ] Update AGENTS.md Section 6 (Data Models) with role enum values
- [ ] Update AGENTS.md Section 8 (Permission Matrix) if changes made
- [ ] Validate change proposal: `prompter validate add-role-based-access-control --strict --no-interactive`
- [ ] Request review and approval before merging
