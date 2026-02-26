# EPIC-014: Build Admin Panel & Platform Management

> **Status:** DRAFT (PRD-based, pending FSD/TDD-Lite refinement)

## Business Value Statement
Provide administrators with a comprehensive web-based dashboard to manage all platform operations — users, farms, investments, finances, disputes, and system health — ensuring the platform runs smoothly and complies with regulatory requirements.

## Description
This EPIC builds the web-based admin panel for platform management. It is a cross-cutting EPIC that provides administrative interfaces for most platform features: user management (including KYC review), farm approval workflows, investment oversight, financial transaction monitoring, dispute handling, system health monitoring, and report generation. The admin panel is a desktop-optimized web dashboard used by the internal operations team.

## Source Traceability
| Document | Reference | Section/Page |
|----------|-----------|--------------|
| PRD | Administrators: Platform managers overseeing operations | Section 1 - User Roles |
| PRD | Admin Panel: Web-based management dashboard | Technical Specifications - Platform |
| AGENTS.md | Administrator role capabilities | Section 8 - Target Users |
| AGENTS.md | Permission Matrix (Admin column) | Section 8 |

## Scope Definition
| In Scope | Out of Scope |
|----------|--------------|
| Admin dashboard with key metrics overview | Investor-facing portfolio dashboard (EPIC-007) |
| User management (view, search, edit, suspend, delete) | Farm owner-facing management tools (EPIC-004) |
| KYC review and approval/rejection interface | Public marketplace (EPIC-005) |
| Farm listing approval and management | Payment gateway administration (gateway's own dashboard) |
| Investment oversight and monitoring | |
| Transaction monitoring and dispute handling | |
| System health monitoring dashboard | |
| Platform-level analytics and reports | |
| Content management for education center | |
| Notification template management | |
| Fruit type/variant reference data management | |
| Audit log viewer | |

## High-Level Acceptance Criteria
- [ ] Admin dashboard displays key platform metrics (users, investments, volume, etc.)
- [ ] Admins can search, view, edit, suspend, and delete user accounts
- [ ] KYC submissions can be reviewed, approved, or rejected with reasons
- [ ] Farm listings can be reviewed, approved, suspended, or deactivated
- [ ] Admins can view all investments and their statuses
- [ ] Transaction monitoring allows viewing and filtering all financial transactions
- [ ] Dispute handling interface allows admins to manage and resolve issues
- [ ] System health metrics are displayed (uptime, error rates, queue depths)
- [ ] Platform-level reports can be generated and exported
- [ ] Audit logs are searchable and filterable
- [ ] Admin panel is optimized for desktop use
- [ ] Admin actions are logged in the audit trail
- [ ] Reference data (fruit types, variants) can be managed by admins

## Dependencies
- **Prerequisite EPICs:** EPIC-001 (User Auth), EPIC-003 (RBAC - Admin role), EPIC-004 (Farm Management - farm data), EPIC-006 (Investments - investment data)
- **External Dependencies:** None (consumes internal platform data)
- **Technical Prerequisites:**
  - All core data models and APIs from upstream EPICs
  - Admin routes protected by custom RoleMiddleware (`role:admin`)
  - Admin pages use a dedicated AdminLayout React component (separate from investor layout)
  - Inertia::render() pages for all admin CRUD interfaces
  - Eloquent query scopes and pagination for data listing/filtering
  - FormRequest classes for admin data validation
  - Admin dashboard metrics via Eloquent aggregations cached with database cache driver

## Complexity Assessment
- **Size:** L
- **Technical Complexity:** Medium (CRUD interfaces, data aggregation, search)
- **Integration Complexity:** Low (internal APIs only)
- **Estimated Story Count:** 12-18

## Risks & Assumptions
**Assumptions:**
- Admin panel is a web application (not mobile)
- Admin panel is integrated within the same Laravel monolith — not a separate application
- Admin pages rendered via Inertia::render() with a dedicated AdminLayout React component
- Admin routes use `RoleMiddleware('role:admin')` in Laravel route groups
- Initial admin users seeded via Laravel database seeders or `php artisan` commands
- Dashboard metrics aggregated via Eloquent and cached using Laravel's database cache driver
- System health monitoring displays basic application metrics (not full infrastructure monitoring)

**Risks:**
- Admin panel scope grows as each EPIC adds admin-specific requirements
- Admin panel can become a bottleneck if not designed for extensibility
- Sensitive data visibility in admin panel requires strict access controls
- Admin panel development can be parallelized but integration testing requires all upstream EPICs

## Related EPICs
- **Depends On:** EPIC-001 (User Auth), EPIC-003 (RBAC), EPIC-004 (Farm Management), EPIC-006 (Investments)
- **Blocks:** None
- **Related:** EPIC-002 (KYC review), EPIC-009 (Harvest oversight), EPIC-010 (Transaction monitoring), EPIC-012 (Content management), EPIC-013 (Notification templates)
