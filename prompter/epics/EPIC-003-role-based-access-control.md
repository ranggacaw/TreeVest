# EPIC-003: Implement Role-Based Access Control

> **Status:** DRAFT (PRD-based, pending FSD/TDD-Lite refinement)

## Business Value Statement
Establish a secure permission system that ensures users can only access features and data appropriate to their role (Investor, Farm Owner, Administrator), protecting sensitive operations and maintaining platform integrity.

## Description
This EPIC implements the role-based access control (RBAC) system that governs what each user type can see and do on the platform. The PRD defines three roles: Investors, Farm Owners/Partners, and Administrators. A custom `RoleMiddleware` already exists in the codebase with a `role:admin` / `role:cashier` enum check pattern. This EPIC extends that middleware to support `role:investor`, `role:farm_owner`, and `role:admin` — replacing the temporary `role:cashier` entry and establishing the full role set required by the platform. This EPIC covers role assignment at registration, permission enforcement across all platform features, and the ability for admins to modify user roles. It establishes the authorization layer that all other EPICs depend on for access control.

## Source Traceability
| Document | Reference | Section/Page |
|----------|-----------|--------------|
| PRD | User Roles (Investors, Farm Owners, Administrators) | Section 1 - User Management System |
| AGENTS.md | Permission Matrix | Section 8 - Target Users & Personas |
| AGENTS.md | User Entity (role attribute) | Section 6 - Data Models |

## Scope Definition
| In Scope | Out of Scope |
|----------|--------------|
| Role definition (Investor, Farm Owner, Admin) | Feature-level UI rendering per role (each EPIC handles its own) |
| Role assignment during registration | Admin role management dashboard (EPIC-014) |
| Permission middleware/guard for API endpoints | Specific feature permissions (defined per EPIC) |
| Permission check utilities for frontend | |
| Role-based route protection | |
| Role change audit logging | |

## High-Level Acceptance Criteria
- [ ] Three roles are defined: Investor, Farm Owner/Partner, Administrator
- [ ] Users are assigned a role during registration
- [ ] API endpoints enforce role-based access control
- [ ] Unauthorized access attempts return appropriate error responses
- [ ] Frontend routes are protected based on user role
- [ ] Role changes are logged for audit purposes
- [ ] Permission checks are performant and do not add significant latency
- [ ] The RBAC system is extensible for future role additions

## Dependencies
- **Prerequisite EPICs:** EPIC-001 (User Authentication - roles attach to users)
- **External Dependencies:** None
- **Technical Prerequisites:** Authentication system from EPIC-001; Laravel middleware pipeline (existing `RoleMiddleware`); Inertia.js shared props for passing authenticated user role data to React frontend

## Complexity Assessment
- **Size:** S
- **Technical Complexity:** Low-Medium (standard RBAC pattern; existing `RoleMiddleware` with `role:admin` / `role:cashier` enum check reduces implementation effort — primarily an extension rather than a greenfield build)
- **Integration Complexity:** Low (internal system only)
- **Estimated Story Count:** 5-7

## Risks & Assumptions
**Assumptions:**
- A user has exactly one primary role (no multi-role users at launch)
- The permission matrix from AGENTS.md Section 8 is authoritative
- RBAC is enforced via Laravel middleware on routes (e.g., `->middleware('role:admin')`)
- Admin role is assigned manually (not self-service)
- Role data is shared with React frontend via Inertia shared props
- Existing RoleMiddleware pattern is extended (not replaced)

**Risks:**
- Future requirement for multi-role users could require RBAC redesign
- Permission granularity may need to increase as features are added
- Inconsistent enforcement between frontend and backend could create security gaps

## Related EPICs
- **Depends On:** EPIC-001 (User Authentication)
- **Blocks:** EPIC-004 (Farm Management - Farm Owner permissions), EPIC-014 (Admin Panel - Admin permissions)
- **Related:** EPIC-015 (Security Infrastructure)
