# EPIC-001: Implement User Registration & Authentication

> **Status:** DRAFT (PRD-based, pending FSD/TDD-Lite refinement)

## Business Value Statement
Enable users to securely create accounts and authenticate into the Treevest platform, establishing the foundational identity layer that all other platform features depend on. Without reliable authentication, no investment, payment, or communication features can operate.

## Description
This EPIC covers the complete user registration and authentication system, including sign-up via email, phone number, and social media OAuth providers. It includes login functionality, password management (reset/change), two-factor authentication (2FA) setup and enforcement, session management, and basic user profile creation and editing. This EPIC establishes the User entity as the core identity for all platform interactions.

Laravel Breeze 2.x (React + TypeScript variant) provides the authentication scaffold, meaning registration, login, password reset, and email verification flows are largely provided out of the box. The primary implementation effort shifts to extending Breeze with phone-based registration, social OAuth providers, 2FA support, and custom profile fields required by the platform.

## Source Traceability
| Document | Reference | Section/Page |
|----------|-----------|--------------|
| PRD | User Registration & Authentication | Section 1 - User Management System |
| PRD | Two-factor authentication (2FA) | Section 1 - User Management System |
| PRD | User profile management with investment history | Section 1 - User Management System |
| PRD | Secure sign-up/login (email, phone, social media OAuth) | Section 1 - User Management System |
| PRD | End-to-end encryption | Technical Specifications - Security |
| AGENTS.md | User Entity | Section 6 - Data Models |

## Scope Definition
| In Scope | Out of Scope |
|----------|--------------|
| Email-based registration and login | KYC verification (EPIC-002) |
| Phone number registration and login | Role-based permissions enforcement (EPIC-003) |
| Social media OAuth (Google, Facebook, Apple) | Payment methods linked to accounts (EPIC-010) |
| Password creation, reset, and change flows | Admin user management dashboard (EPIC-014) |
| Two-factor authentication (TOTP / SMS OTP) | Investment history display (EPIC-007) |
| Session management and token refresh | Notification preferences (EPIC-013) |
| Basic user profile (name, email, phone, avatar) | |
| Account deactivation / deletion | |
| Email verification flow | |
| Phone number verification flow | |

## High-Level Acceptance Criteria
- [ ] Users can register with email + password, phone number, or social OAuth
- [ ] Email verification is required before account is fully activated
- [ ] Phone number verification via OTP is supported
- [ ] Users can log in with any registered credential method
- [ ] Password reset flow works via email and SMS
- [ ] Two-factor authentication can be enabled/disabled by user
- [ ] 2FA is enforced at login when enabled (TOTP or SMS OTP)
- [ ] User sessions are managed with secure token-based authentication
- [ ] Session tokens expire and can be refreshed
- [ ] Users can view and edit their basic profile information
- [ ] Users can deactivate their account
- [ ] All authentication events are logged for audit purposes
- [ ] Failed login attempts are rate-limited and tracked

## Dependencies
- **Prerequisite EPICs:** None (foundational EPIC)
- **External Dependencies:** OAuth providers (Google, Facebook, Apple), SMS service for OTP delivery, Email service for verification
- **Technical Prerequisites:** Laravel 12.x application with Inertia.js 2.x and React 18.x configured, MySQL 8.x database infrastructure, Laravel Breeze 2.x (React + TS) installed, encryption infrastructure (EPIC-015 should ideally start in parallel)

## Complexity Assessment
- **Size:** M
- **Technical Complexity:** Medium (Laravel Breeze provides base auth scaffold — registration, login, password reset, email verification — reducing effort; remaining complexity is in OAuth providers, 2FA, and phone-based auth)
- **Integration Complexity:** High (OAuth providers, SMS/Email services)
- **Estimated Story Count:** 8-12

## Risks & Assumptions
**Assumptions:**
- Laravel Breeze 2.x (React + TypeScript variant) provides registration, login, password reset, and email verification out of the box
- Session-based authentication uses Laravel's database session driver (not JWT); sessions are managed natively by Breeze
- Inertia.js 2.x handles page navigation between auth screens (no separate SPA routing or API layer needed for the web app)
- Laravel Sanctum 4.x is available for future API authentication (e.g., mobile app) but is not used for the SPA
- OAuth providers will include at minimum Google, Facebook, and Apple
- TOTP (app-based) and SMS OTP are the two supported 2FA methods
- Email verification is mandatory; phone verification is optional but recommended

**Risks:**
- OAuth provider API changes could affect login flows
- SMS OTP delivery reliability varies by region and carrier
- 2FA recovery flow (lost device) needs careful design to avoid lockouts
- Rate limiting and brute-force protection must be robust from day one
- Session management is handled natively by Laravel Breeze and the database session driver; custom token lifecycle logic is unnecessary, but session fixation and hijacking protections must be verified

## Related EPICs
- **Depends On:** None
- **Blocks:** EPIC-002 (KYC), EPIC-003 (RBAC), EPIC-004 (Farm Management), EPIC-006 (Investment), EPIC-010 (Payments), EPIC-013 (Communications), EPIC-014 (Admin)
- **Related:** EPIC-015 (Security Infrastructure)
