# Treevest EPICs - Executive Summary

> **Status:** DRAFT - Generated from PRD only
> **Source:** `prompter/prd.md` (PRD), `prompter/treevest/product-brief.md` (Product Brief), `AGENTS.md` (Knowledge Base)
> **Missing Upstream:** FSD, TDD-Lite (EPICs will require revision when these are created)
> **Generated:** 2026-02-27

---

## Disclaimer

These EPICs were generated **solely from the PRD** without the normally required FSD and TDD-Lite upstream documents. They represent a preliminary work breakdown and MUST be revised once:
1. The FSD is created (functional specifications will refine scope and acceptance criteria)
2. The TDD-Lite is created (architecture decisions will affect technical EPICs and dependencies)

---

## Summary Statistics

- **Total EPICs:** 17
- **Complexity Distribution:**
  - XL: 2 (EPIC-006, EPIC-009)
  - L: 5 (EPIC-004, EPIC-007, EPIC-010, EPIC-014, EPIC-015)
  - M: 7 (EPIC-001, EPIC-002, EPIC-005, EPIC-008, EPIC-011, EPIC-013, EPIC-016)
  - S: 3 (EPIC-003, EPIC-012, EPIC-017)
- **Required EPICs:** 15
- **Optional EPICs:** 2 (EPIC-016: Secondary Market, EPIC-017: Scalability & Localization)
- **Estimated Total Story Count:** 120-195

---

## Tech Stack

> All EPICs are implemented using the following decided tech stack.

| Layer | Technology | Version / Notes |
|-------|-----------|-----------------|
| **Backend** | Laravel | 12.x (PHP 8.2+) |
| **Frontend** | React + TypeScript | 18.x + 5.x via Inertia.js 2.x |
| **Client Routing** | Ziggy | 2.x (Laravel named routes in JS) |
| **CSS** | Tailwind CSS | 3.x with `@tailwindcss/forms` |
| **Build** | Vite | 7.x with `laravel-vite-plugin` + `@vitejs/plugin-react` |
| **Database** | MySQL (prod) / SQLite (test) | 8.x / in-memory |
| **Auth** | Laravel Breeze | 2.x (React + TS stack) + custom RoleMiddleware |
| **Session / Cache / Queue** | Database | All database-backed drivers |
| **Testing** | PHPUnit + Pest | 11.x |
| **Code Style** | Laravel Pint | 1.x (PSR-12) |
| **Dev Runner** | Concurrently | `composer dev` (artisan serve + queue + Pail + Vite) |

**Architecture:** Laravel monolith with Inertia.js SPA bridge. No separate API layer for web. Admin panel integrated via role-based routing. Mobile apps deferred to future scope.

---

## EPIC Index

| EPIC ID | Title | Complexity | Dependencies | PRD Section | File |
|---------|-------|------------|--------------|-------------|------|
| EPIC-001 | Implement User Registration & Authentication | M | None | 1 | [EPIC-001](EPIC-001-user-registration-authentication.md) |
| EPIC-002 | Implement KYC Verification System | M | EPIC-001 | 1 | [EPIC-002](EPIC-002-kyc-verification-system.md) |
| EPIC-003 | Implement Role-Based Access Control | S | EPIC-001 | 1 | [EPIC-003](EPIC-003-role-based-access-control.md) |
| EPIC-004 | Build Farm Listing & Management | L | EPIC-001, EPIC-003 | 2 | [EPIC-004](EPIC-004-farm-listing-management.md) |
| EPIC-005 | Build Fruit Crop & Tree Catalog | M | EPIC-004 | 2 | [EPIC-005](EPIC-005-fruit-crop-tree-catalog.md) |
| EPIC-006 | Implement Investment Purchase Flow | XL | EPIC-002, EPIC-005, EPIC-010 | 2 | [EPIC-006](EPIC-006-investment-purchase-flow.md) |
| EPIC-007 | Build Portfolio Tracking Dashboard | L | EPIC-006 | 3 | [EPIC-007](EPIC-007-portfolio-tracking-dashboard.md) |
| EPIC-008 | Implement Tree Health Monitoring | M | EPIC-005, EPIC-013 | 3 | [EPIC-008](EPIC-008-tree-health-monitoring.md) |
| EPIC-009 | Build Harvest & Returns System | XL | EPIC-005, EPIC-006, EPIC-010 | 4 | [EPIC-009](EPIC-009-harvest-returns-system.md) |
| EPIC-010 | Implement Payment Processing & Financial Transactions | L | EPIC-001, EPIC-015 | 5 | [EPIC-010](EPIC-010-payment-processing-financial-transactions.md) |
| EPIC-011 | Build Financial Reporting & Analytics | M | EPIC-006, EPIC-009, EPIC-010 | 5 | [EPIC-011](EPIC-011-financial-reporting-analytics.md) |
| EPIC-012 | Build Information & Education Center | S | None | 6 | [EPIC-012](EPIC-012-information-education-center.md) |
| EPIC-013 | Implement Communication & Notifications | M | EPIC-001 | 7 | [EPIC-013](EPIC-013-communication-notifications.md) |
| EPIC-014 | Build Admin Panel & Platform Management | L | EPIC-001, EPIC-003, EPIC-004, EPIC-006 | 1-7 | [EPIC-014](EPIC-014-admin-panel-platform-management.md) |
| EPIC-015 | Implement Security & Compliance Infrastructure | L | None | Technical Specs | [EPIC-015](EPIC-015-security-compliance-infrastructure.md) |
| EPIC-016 | Build Secondary Market (Optional) | M | EPIC-006, EPIC-010 | 5 | [EPIC-016](EPIC-016-secondary-market.md) |
| EPIC-017 | Implement Platform Scalability & Localization | S | EPIC-015 | Additional | [EPIC-017](EPIC-017-platform-scalability-localization.md) |

---

## Dependency Map

```
                    ┌──────────┐
                    │ EPIC-015 │ Security & Compliance
                    │ (Found.) │
                    └────┬─────┘
                         │
    ┌────────────────────┼─────────────────────────┐
    │                    │                          │
    ▼                    ▼                          ▼
┌──────────┐      ┌──────────┐              ┌──────────┐
│ EPIC-001 │      │ EPIC-010 │              │ EPIC-017 │
│ User Auth│      │ Payments │              │ Scale/i18n│
└──┬──┬──┬─┘      └────┬─────┘              └──────────┘
   │  │  │              │
   │  │  │    ┌─────────┼──────────┐
   │  │  │    │         │          │
   ▼  │  ▼    │         │          │
┌─────┤┌─────┐│         │          │
│002  ││ 003 ││         │          │
│KYC  ││RBAC ││         │          │
└──┬──┘└──┬──┘│         │          │
   │      │   │         │          │
   │   ┌──▼───▼┐        │          │
   │   │EPIC-004│        │          │
   │   │Farm Mgt│        │          │
   │   └──┬─────┘        │          │
   │      │              │          │
   │   ┌──▼─────┐        │          │
   │   │EPIC-005│        │          │
   │   │Crop Cat.│       │          │
   │   └┬──┬──┬─┘        │          │
   │    │  │  │           │          │
   │    │  │  ▼           │          │
   │    │  │┌──────────┐  │          │
   │    │  ││ EPIC-008 │  │          │
   │    │  ││Health Mon│  │          │
   │    │  │└──────────┘  │          │
   │    │  │              │          │
   ▼    ▼  │              │          │
┌──────────▼──────────────▼┐         │
│      EPIC-006            │         │
│  Investment Purchase     │         │
└──┬──┬────────────────────┘         │
   │  │                              │
   │  ▼                              │
   │ ┌─────────────────────────────┐ │
   │ │        EPIC-009             │◄┘
   │ │   Harvest & Returns         │
   │ └──┬──────────────────────────┘
   │    │
   ▼    ▼
┌──────────┐   ┌──────────┐   ┌──────────┐
│ EPIC-007 │   │ EPIC-011 │   │ EPIC-016 │
│Portfolio │   │Fin Report│   │Sec.Market│
└──────────┘   └──────────┘   └──────────┘

Independent:
┌──────────┐   ┌──────────┐
│ EPIC-012 │   │ EPIC-013 │──► EPIC-008
│Education │   │Comms/Notif│
└──────────┘   └──────────┘

Cross-cutting:
┌──────────┐
│ EPIC-014 │ Admin Panel (depends on EPIC-001, 003, 004, 006)
└──────────┘
```

---

## Suggested Implementation Phases

### Phase 1: Foundation (EPICs 015, 001, 003, 012)
Core infrastructure, authentication, roles, and content that has no dependencies.

### Phase 2: Marketplace Setup (EPICs 002, 004, 005, 010, 013)
KYC, farm management, crop catalog, payments, and notification infrastructure.

### Phase 3: Core Investment (EPICs 006, 007, 008)
The investment purchase flow, portfolio dashboard, and health monitoring.

### Phase 4: Harvest & Finance (EPICs 009, 011)
Harvest cycle management and financial reporting.

### Phase 5: Administration & Polish (EPICs 014, 017)
Admin panel and localization/scalability.

### Phase 6: Optional (EPIC 016)
Secondary market for tree investment trading.

---

## Traceability Matrix

| PRD Requirement Area | PRD Section | EPIC(s) |
|---------------------|-------------|---------|
| User Registration & Authentication | 1 - User Management | EPIC-001 |
| KYC Verification | 1 - User Management | EPIC-002 |
| Two-Factor Authentication | 1 - User Management | EPIC-001 |
| User Roles (Investor, Farm Owner, Admin) | 1 - User Management | EPIC-003 |
| User Profile Management | 1 - User Management | EPIC-001 |
| Farm Profiles & Listings | 2 - Investment Marketplace | EPIC-004 |
| Fruit Crop Variants | 2 - Investment Marketplace | EPIC-005 |
| Investment Details Per Tree | 2 - Investment Marketplace | EPIC-005 |
| Map Integration | 2 - Investment Marketplace | EPIC-004 |
| Real-Time Portfolio Management | 3 - Investment Tracking | EPIC-007 |
| Tree Health Monitoring | 3 - Investment Tracking | EPIC-008 |
| Harvest Schedule Management | 4 - Harvest & Returns | EPIC-009 |
| Profit Distribution | 4 - Harvest & Returns | EPIC-009 |
| Secure Payment Gateway | 5 - Financial Features | EPIC-010 |
| Multiple Currency Support | 5 - Financial Features | EPIC-010 |
| Secondary Market | 5 - Financial Features | EPIC-016 |
| Financial Reporting | 5 - Financial Features | EPIC-011 |
| Investment Education | 6 - Info & Education | EPIC-012 |
| Farm & Crop Encyclopedia | 6 - Info & Education | EPIC-012 |
| In-App Messaging | 7 - Communication | EPIC-013 |
| Push Notifications | 7 - Communication | EPIC-013 |
| Email Notifications | 7 - Communication | EPIC-013 |
| Customer Support Chat | 7 - Communication | EPIC-013 |
| End-to-End Encryption | Technical Specs - Security | EPIC-015 |
| Fraud Detection | Technical Specs - Security | EPIC-015 |
| Multi-Language Support | Additional - Scalability | EPIC-017 |
| Currency Localization | Additional - Scalability | EPIC-017 |
| Admin Panel | Technical Specs - Platform | EPIC-014 |
| Gamification (badges, referrals, leaderboards) | Additional - Gamification (Optional) | Deferred — no EPIC assigned |

---

## Gaps & Recommendations

### Identified Gaps (PRD-level ambiguities that affect EPIC precision)

1. **Revenue model undefined:** The PRD describes investor returns but not how the platform monetizes (fees, commissions, spreads). This affects EPIC-010 (payment flows) and EPIC-009 (profit distribution calculations).
2. **Harvest failure handling undefined:** What happens when a harvest fails or underperforms? Risk distribution between platform, farm owner, and investor is not specified. Affects EPIC-009.
3. **Pricing mechanism unclear:** How tree prices are initially set and updated over time is not specified. Affects EPIC-005 and EPIC-006.
4. **KYC provider not selected:** The specific identity verification service/provider is not chosen. Affects EPIC-002 technical implementation.
5. **Jurisdiction/regulations unspecified:** The primary launch market and applicable securities laws are not defined. Affects EPIC-015 scope significantly.
6. **Insurance/guarantees absent:** No mention of crop insurance or investor protection guarantees. Affects EPIC-009 risk handling.
7. **Gamification deferred:** PRD Section "Gamification (Optional)" describes investment badges/achievements, referral rewards, and leaderboards. No EPIC has been created for this as it is explicitly optional. If needed in the future, an EPIC-018 should be created.

### Conflicts Found
- None between PRD sections (the PRD is internally consistent).

### Recommendations
1. **Create FSD immediately** to resolve the above ambiguities before implementation begins.
2. **Define revenue model** to properly scope payment and distribution EPICs.
3. **Select primary launch jurisdiction** to scope compliance requirements.
4. **Define harvest failure scenarios** to complete EPIC-009 acceptance criteria.
5. **Select KYC provider** to refine EPIC-002 integration scope.
