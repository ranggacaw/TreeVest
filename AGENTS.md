# AGENTS — Project Knowledge Base

> **Application:** Fruit Crops Investment
> **DOCS_ROOT_PATH:** `prompter/`
> **Generated:** 2026-02-26
> **Stage:** Pre-implementation (PRD complete, tech stack selected, no codebase yet)

---

## 1. 📍 Project Summary

**Business Purpose:** A digital investment platform that operates similarly to a stock exchange, allowing users to invest in individual fruit trees rather than traditional stocks or shares. Returns are generated based on actual agricultural harvest cycles.

**Product Type:** Investment Platform / AgriTech Marketplace

**Core Modules:**

| Module | Description |
|--------|-------------|
| User Management | Registration, authentication, KYC, 2FA, role-based access |
| Investment Marketplace | Farm listings, fruit crop variants, per-tree investment details |
| Investment Tracking Dashboard | Real-time portfolio management, tree health monitoring |
| Harvest & Returns System | Harvest scheduling, yield estimation, profit distribution |
| Financial Features | Payment processing, multi-currency, secondary market, reporting |
| Information & Education Center | Investment education, farm & crop encyclopedia |
| Communication | In-app messaging, push/email notifications, support chat |

**Target Users:**
- **Investors** — Individual users purchasing fruit tree investments
- **Farm Owners/Partners** — Agricultural partners listing farms and crops
- **Administrators** — Platform managers overseeing operations

---

## 2. 🧱 Tech Stack

> **Status:** Decided. The project uses a Laravel + React (Inertia.js) monolith architecture.

### Core Stack

| Layer | Technology | Version / Notes |
|-------|-----------|-----------------|
| **Backend Framework** | Laravel | 12.x (PHP >= 8.2) |
| **Backend Language** | PHP | 8.2+ |
| **Frontend Framework** | React | 18.x (via Inertia.js 2.x) |
| **Frontend Language** | TypeScript | 5.x |
| **SSR Bridge** | Inertia.js | 2.x (`@inertiajs/react`) |
| **Client-side Routing** | Ziggy | 2.x (`tightenco/ziggy`) — exposes Laravel named routes to JS |
| **CSS Framework** | Tailwind CSS | 3.x with `@tailwindcss/forms` plugin |
| **Build Tool** | Vite | 7.x with `laravel-vite-plugin` + `@vitejs/plugin-react` |

### Data & Infrastructure

| Layer | Technology | Version / Notes |
|-------|-----------|-----------------|
| **Database (production)** | MySQL | 8.x |
| **Database (testing)** | SQLite | In-memory (`:memory:`) |
| **Session Driver** | Database | `SESSION_DRIVER=database` |
| **Cache Store** | Database | `CACHE_STORE=database` |
| **Queue Connection** | Database | `QUEUE_CONNECTION=database` |
| **Local Dev Environment** | Laragon | Self-hosted; no cloud CI/CD detected |

### Authentication & Authorization

| Layer | Technology | Version / Notes |
|-------|-----------|-----------------|
| **Auth Scaffolding** | Laravel Breeze | 2.x (React + TypeScript stack) |
| **Authorization** | Custom `RoleMiddleware` | Simple `role:admin` / `role:cashier` enum check |
| **API Auth (optional)** | Laravel Sanctum | 4.x (installed, not actively used for SPA) |

### Testing & Code Quality

| Layer | Technology | Version / Notes |
|-------|-----------|-----------------|
| **Testing Framework** | PHPUnit | 11.x (with `pest-plugin` allowed) |
| **Code Style** | Laravel Pint | 1.x |

### Dev Runner

| Tool | Purpose |
|------|---------|
| **Concurrently** | Runs `php artisan serve`, queue worker, Pail log viewer, and Vite dev server in parallel via `composer dev` |

### Platform Scope (revised from PRD)
- **Web:** Responsive web application (Laravel + Inertia.js + React) — **primary platform**
- **Admin Panel:** Integrated within the same web application (role-based routing)
- **Mobile:** iOS and Android native apps — **deferred / future scope** (API via Sanctum when needed)

### Integration Requirements (from PRD)
- Payment gateways (Stripe, local payment methods)
- Maps API (Google Maps / Mapbox)
- Weather API for farm conditions
- SMS / Email notification services
- Analytics and reporting tools

### Development Tooling
- **Spec Management:** Prompter (spec-driven development framework)
- **CI/CD:** GitHub Actions (`.github/` directory present)
- **Code Formatting:** Laravel Pint (PHP), Prettier (TypeScript/React — to be configured)

---

## 3. 🏗️ Architecture Overview

> **Status:** Monolith architecture decided. Laravel + Inertia.js + React single-application deployment.

**Architecture: Laravel Monolith with Inertia.js SPA Bridge**

```
┌──────────────────────────────────────────────────────┐
│                    Browser (Client)                   │
│  ┌────────────────────────────────────────────────┐  │
│  │  React 18 + TypeScript + Tailwind CSS          │  │
│  │  (Inertia.js client adapter)                   │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────┐   │  │
│  │  │  Pages/  │ │Components│ │  Layouts/     │   │  │
│  │  │ (Inertia)│ │ (React)  │ │  (React)     │   │  │
│  │  └──────────┘ └──────────┘ └──────────────┘   │  │
│  └────────────────────────────────────────────────┘  │
│         │  Inertia Protocol (XHR + JSON props)  │    │
└─────────┼───────────────────────────────────────┼────┘
          │                                       │
┌─────────▼───────────────────────────────────────▼────┐
│                 Laravel 12 Application               │
│  ┌────────────┐ ┌────────────┐ ┌────────────────┐   │
│  │ Controllers│ │ Middleware │ │ Inertia::render│   │
│  │ (HTTP)     │ │ (Auth/RBAC)│ │ (Props → React)│   │
│  └─────┬──────┘ └────────────┘ └────────────────┘   │
│        │                                             │
│  ┌─────▼──────┐ ┌────────────┐ ┌────────────────┐   │
│  │  Services  │ │   Models   │ │    Jobs/       │   │
│  │ (Business  │ │ (Eloquent) │ │  Queues        │   │
│  │  Logic)    │ │            │ │  (DB driver)   │   │
│  └─────┬──────┘ └─────┬──────┘ └────────────────┘   │
│        │               │                             │
│  ┌─────▼───────────────▼─────────────────────────┐   │
│  │              MySQL 8.x Database               │   │
│  │  (sessions, cache, queues, application data)  │   │
│  └───────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────┘

External Services:
  ├── Stripe (payments)
  ├── Google Maps / Mapbox (geolocation)
  ├── Weather API (farm conditions)
  ├── SMS Gateway (OTP, notifications)
  ├── Email Service (transactional email)
  └── OAuth Providers (Google, Facebook, Apple)
```

**Key Architectural Decisions:**
- **Monolith, not microservices:** Single Laravel application serves all roles (investor, farm owner, admin)
- **Inertia.js bridge:** Server-side routing with client-side React rendering — no separate API layer needed for the web app
- **Database for everything:** Sessions, cache, and queues all use the database driver (simplifies infrastructure)
- **Ziggy for routes:** Laravel named routes are available in TypeScript/React via Ziggy
- **Breeze for auth scaffold:** Authentication UI and logic provided by Laravel Breeze (React + TS variant)

**Data Flows:**
1. Investor → Inertia Page → Laravel Controller → Eloquent → MySQL → Inertia Props → React
2. Farm Owner → Form Submission → Controller → Validation → Model → Database
3. System → Scheduled Jobs → Queue Worker → Business Logic → Notifications
4. External → Webhook → Controller → Job → Process → Update State

---

## 4. 📁 Folder Structure & Key Files

```
treevest/
├── AGENTS.md                      # THIS FILE — Project knowledge base
├── .github/
│   └── prompts/                   # GitHub Copilot prompt files
├── .agent/                        # Agent workflows
├── .kilocode/                     # Kilocode AI workflows
├── .opencode/                     # OpenCode config
├── app/                           # Laravel application code
│   ├── Http/
│   │   ├── Controllers/           # Inertia page controllers
│   │   └── Middleware/            # RoleMiddleware, auth middleware
│   ├── Models/                    # Eloquent models
│   ├── Services/                  # Business logic services
│   └── Jobs/                      # Queue jobs
├── database/
│   ├── migrations/                # Database schema migrations
│   ├── seeders/                   # Data seeders
│   └── factories/                 # Model factories for testing
├── resources/
│   ├── js/
│   │   ├── Pages/                 # Inertia page components (React/TSX)
│   │   ├── Components/            # Shared React components
│   │   ├── Layouts/               # Layout components
│   │   ├── types/                 # TypeScript type definitions
│   │   └── app.tsx                # Inertia app entry point
│   ├── css/
│   │   └── app.css                # Tailwind CSS entry
│   └── views/
│       └── app.blade.php          # Root Blade template (Inertia mount)
├── routes/
│   ├── web.php                    # Web routes (Inertia)
│   └── auth.php                   # Breeze auth routes
├── tests/
│   ├── Feature/                   # Feature/integration tests
│   └── Unit/                      # Unit tests
├── config/                        # Laravel configuration files
├── public/                        # Public assets
├── storage/                       # File storage, logs, cache
├── prompter/                      # DOCS_ROOT_PATH — Spec-driven docs
│   ├── AGENTS.md                  # Prompter framework instructions (reference only)
│   ├── prd.md                     # Product Requirements Document ✅
│   ├── project.md                 # Project conventions (template, not filled)
│   ├── epics/                     # EPIC files (DRAFT) ✅
│   └── core/                      # Prompter core templates
├── composer.json                  # PHP dependencies
├── package.json                   # Node.js dependencies
├── vite.config.ts                 # Vite build configuration
├── tailwind.config.js             # Tailwind CSS configuration
├── tsconfig.json                  # TypeScript configuration
└── phpunit.xml                    # PHPUnit test configuration
```

**Key Files:**
- `prompter/prd.md` — Primary source of truth for product requirements
- `prompter/AGENTS.md` — Prompter workflow instructions (reference only, do not modify)
- `prompter/project.md` — Project conventions (needs to be filled in)
- `prompter/epics/` — EPIC files for project planning (DRAFT)
- `routes/web.php` — All web routes (Inertia pages)
- `app/Http/Controllers/` — Controllers returning Inertia responses
- `resources/js/Pages/` — React page components rendered by Inertia
- `app/Models/` — Eloquent ORM models

---

## 5. 🔑 Core Business Logic & Domain Rules

### Primary Workflows

**Investment Purchase Flow:**
```
Browse Marketplace → Select Farm/Tree → Review Details → 
Purchase Investment → Payment Processing → Confirmation → 
Portfolio Updated → Ongoing Monitoring
```

**Harvest & Returns Flow:**
```
Tree Growth Monitoring → Harvest Date Approaching → 
Yield Estimation → Actual Harvest → Market Price Applied → 
Profit Calculated → Distribution to Investors → Payout
```

**Farm Onboarding Flow:**
```
Farm Owner Registration → KYC Verification → 
Farm Profile Creation → Crop Listing → 
Admin Approval → Listed on Marketplace
```

### Key Business Rules (from PRD)
- Each tree is an individual investable unit with its own price, ROI, and risk rating
- Returns are tied to actual agricultural harvest cycles (not speculative)
- Harvest cycles vary: annual, bi-annual, or seasonal depending on crop type
- Trees have an expected productive lifespan (finite investment horizon)
- Minimum and maximum investment limits apply per tree
- Secondary market allows resale of tree investments to other users (optional feature)
- KYC verification is mandatory before investing
- Multiple payout options: bank transfer, digital wallet, reinvestment

### Validation Rules
- KYC must be verified before any investment transaction
- Investment amounts must fall within min/max limits per tree
- Payment must be confirmed before portfolio is updated
- Harvest data must be confirmed by farm owner before profit distribution

### Side Effects
- All transactions must generate audit trail entries
- Investment purchases trigger confirmation notifications
- Harvest events trigger yield and payout notifications
- Weather alerts trigger investor notifications for affected farms

---

## 6. 🗂️ Data Models / Entities

> **Status:** ERD not yet created. Below are entities inferred from the PRD.

### Expected Core Entities

| Entity | Key Attributes | Notes |
|--------|---------------|-------|
| **User** | id, email, phone, role, kyc_status, 2fa_enabled | Polymorphic: Investor, FarmOwner, Admin |
| **Farm** | id, name, location, size, capacity, certifications, owner_id | Geospatial data, images, virtual tours |
| **FruitCrop** | id, fruit_type, variant, farm_id | e.g., Durian → Musang King |
| **Tree** | id, crop_id, farm_id, price, expected_roi, harvest_cycle, age, lifespan, risk_rating, min_investment, max_investment | Investable unit |
| **Investment** | id, investor_id, tree_id, amount, purchase_date, status | Core transaction |
| **Harvest** | id, tree_id, harvest_date, estimated_yield, actual_yield, market_price, status | Tied to payout |
| **Payout** | id, investment_id, harvest_id, amount, method, status | Bank/wallet/reinvest |
| **Transaction** | id, user_id, type, amount, currency, status, reference | Ledger of all financial movements |
| **Notification** | id, user_id, type, message, read_status | Push/email/in-app |
| **Message** | id, sender_id, receiver_id, content, timestamp | In-app messaging |
| **AuditLog** | id, user_id, event_type, ip_address, user_agent, event_data, created_at | Immutable security trail |
| **LegalDocument** | id, type, version, title, content, effective_date, is_active | Terms, Privacy, Risk |
| **UserDocumentAcceptance** | id, user_id, legal_document_id, accepted_at, ip_address | Consent tracking |
| **FraudAlert** | id, user_id, rule_type, severity, notes, detected_at | Suspicious activity flags |

### Expected Relationships
- User (1) → (N) Investment
- User (1) → (N) Farm (as owner)
- Farm (1) → (N) FruitCrop
- FruitCrop (1) → (N) Tree
- Tree (1) → (N) Investment
- Tree (1) → (N) Harvest
- Harvest (1) → (N) Payout
- Investment (1) → (N) Payout
- LegalDocument (1) → (N) UserDocumentAcceptance
- User (1) → (N) UserDocumentAcceptance
- User (1) → (N) AuditLog
- User (1) → (N) FraudAlert

### Fruit Type Reference Data

| Fruit Type | Variants |
|-----------|----------|
| Durian | Musang King, D24, Black Thorn, Red Prawn |
| Mango | Alphonso, Nam Doc Mai, Carabao, Kent |
| Grapes | Thompson Seedless, Concord, Shine Muscat |
| Melon | Honeydew, Cantaloupe, Yubari King |
| Citrus | Valencia Orange, Meyer Lemon, Pomelo |
| Others | Avocado, Longan, Rambutan, Mangosteen |

---

## 7. 🧠 Domain Vocabulary / Glossary

| Term | Definition |
|------|-----------|
| **Tree** | The fundamental investable unit; represents a single fruit-producing tree on a partner farm |
| **Investment** | A financial stake in one or more trees, purchased by an Investor |
| **Harvest Cycle** | The recurring period during which a tree produces fruit (annual, bi-annual, seasonal) |
| **ROI** | Return on Investment — expected percentage return based on historical yield and market pricing |
| **KYC** | Know Your Customer — mandatory identity verification process |
| **Farm Listing** | A comprehensive profile of a partner farm available on the marketplace |
| **Yield** | The quantity/weight of fruit produced by a tree during one harvest cycle |
| **Payout** | Distribution of profit to an investor following a completed harvest |
| **Secondary Market** | Optional feature allowing investors to sell their tree investments to other users |
| **Risk Rating** | Assessment score indicating investment risk level for a specific tree |
| **Productive Lifespan** | The expected number of years a tree will continue producing economically viable yields |
| **Portfolio** | An investor's collection of tree investments across farms and crop types |
| **Reinvestment** | Payout option where returns are automatically used to purchase additional tree investments |
| **2FA** | Two-Factor Authentication — additional security layer for account access |

### Status Enumerations (expected)

| Domain | Statuses |
|--------|----------|
| KYC | pending, submitted, verified, rejected |
| Investment | pending_payment, active, matured, sold, cancelled |
| Harvest | scheduled, in_progress, completed, failed |
| Payout | pending, processing, completed, failed |
| Tree | seedling, growing, productive, declining, retired |
| Farm | pending_approval, active, suspended, deactivated |

---

## 8. 👥 Target Users & Personas

### User Roles

| Role | Description | Key Capabilities |
|------|-------------|-----------------|
| **Investor** | Individual user purchasing fruit tree investments | Browse marketplace, purchase investments, track portfolio, receive payouts, access education content, use secondary market |
| **Farm Owner/Partner** | Agricultural partner listing farms and crops | Create farm profiles, list crops/trees, report harvests, update tree health, upload growth photos |
| **Administrator** | Platform manager overseeing operations | Manage users, approve farms, oversee investments, handle disputes, generate reports, monitor system health |

### Permission Matrix (expected)

| Action | Investor | Farm Owner | Admin |
|--------|----------|------------|-------|
| Browse marketplace | ✅ | ✅ | ✅ |
| Purchase investment | ✅ | ❌ | ❌ |
| Create farm listing | ❌ | ✅ | ✅ |
| Report harvest data | ❌ | ✅ | ✅ |
| Receive payouts | ✅ | ❌ | ❌ |
| Approve farm listings | ❌ | ❌ | ✅ |
| Manage all users | ❌ | ❌ | ✅ |
| View all transactions | ❌ | ❌ | ✅ |
| Access support chat | ✅ | ✅ | ✅ |
| Sell on secondary market | ✅ | ❌ | ❌ |

---

## 9. ✨ UI/UX Principles

> **Status:** UI Wireframes not yet created. Below are principles inferred from the PRD.

### Platform-Specific Requirements
- **Web:** Responsive web application (React + Inertia.js + Tailwind CSS) — primary and only platform at launch
- **Admin Panel:** Integrated within the same web application, role-based route separation
- **Mobile (iOS/Android):** Deferred — future scope via API (Sanctum) + native apps

### Key UX Components (from PRD)
- **Portfolio Dashboard:** Total value, tree count by farm/crop, growth indicators, calendar view for harvest dates, projected vs actual returns, diversification visualization
- **Marketplace:** Farm cards with images, map integration (Google Maps/Mapbox), filtering by fruit type/risk/ROI
- **Health Monitoring:** Live crop condition updates, weather impact alerts, pest/disease notifications, growth progress photos
- **Financial Reports:** P&L statements, analytics charts, downloadable PDF/CSV exports

### Expected UX Patterns
- Map-based farm discovery with geospatial filtering
- Calendar view for harvest schedule management
- Real-time data dashboards with visualization charts
- Photo galleries for farm/tree imagery and virtual tours
- Multi-step investment purchase flow with clear risk disclosure

### Accessibility
- Not explicitly specified in PRD — must be defined in UI Wireframes document

---

## 10. 🔒 Security & Privacy Rules

### Authentication (from PRD)
- Secure sign-up/login via email, phone, social media OAuth
- Two-factor authentication (2FA) mandatory support
- KYC verification process for all investors

### Security Requirements (from PRD)
- End-to-end encryption for all data transmission
- Secure data storage compliant with local regulations
- Regular security audits
- Fraud detection mechanisms

### Privacy & Compliance (from PRD)
- Investment disclaimer and terms of service
- Risk disclosure statements
- Regulatory compliance with securities laws (where applicable)
- Privacy policy compliant with GDPR and local data protection laws

### Implementation Details (Infrastructure)
- **Encryption:** Encryption at rest for PII and financial data using Laravel Encrypted Casting.
- **Audit Logging:** Immutable `audit_logs` table tracking all auth, transaction, and admin events.
- **Fraud Detection:** Automated rule engine scanning for rapid investments, unusual amounts, and multiple failed auths.
- **Security Headers:** HSTS, CSP, and X-Content-Type-Options enforced via middleware.
- **Rate Limiting:** Strict throttling on auth (5/min) and financial endpoints (10/min).
- **GDPR:** Automated data export and deletion workflows (soft-delete + anonymization).

### Audit Requirements (inferred)
- All financial transactions must be logged immutably
- KYC verification events must be auditable
- Administrative actions must be tracked
- Investment purchases and payouts must have full audit trails

---

## 11. 🤖 Coding Conventions & Standards

> **Status:** Not yet established. `prompter/project.md` is an empty template.

### Mandatory Conventions (to be defined)
The following MUST be documented in `prompter/project.md` before implementation begins:
- File and folder naming conventions
- Function and variable naming standards
- Code formatting and linting rules
- Error handling patterns
- Logging conventions and levels
- API response format specification
- Git workflow and branching strategy
- Commit message conventions

### Stack-Specific Conventions (expected)
**PHP / Laravel:**
- Follow PSR-12 coding standards (enforced by Laravel Pint)
- Use Eloquent ORM for database queries
- Controllers return `Inertia::render()` responses (not JSON or Blade views)
- Business logic in Service classes, not Controllers
- Form validation via FormRequest classes
- Database changes via migrations only

**TypeScript / React:**
- Strict TypeScript mode enabled
- React functional components with hooks (no class components)
- Inertia page components in `resources/js/Pages/`
- Shared components in `resources/js/Components/`
- Type definitions in `resources/js/types/`
- Tailwind CSS for all styling (no inline styles or CSS modules)

### Prompter Conventions (active)
- Spec files use `SHALL` / `MUST` for normative requirements
- Change IDs use kebab-case, verb-led naming (e.g., `add-two-factor-auth`)
- Scenarios use `#### Scenario:` format with `WHEN` / `THEN` structure
- Delta operations: `ADDED` / `MODIFIED` / `REMOVED` / `RENAMED`

---

## 12. 🧩 AI Agent Development Rules

### Invention Prohibitions
- ❌ **Never** generate ERD without an existing FSD
- ❌ **Never** generate API Contract without an existing ERD
- ❌ **Never** invent database fields not defined in the ERD
- ❌ **Never** invent user flows not defined in the FSD
- ❌ **Never** invent API endpoints not defined in the API Contract
- ❌ **Never** contradict TDD-Lite architectural decisions
- ❌ **Never** assume tech stack choices not documented in `prompter/project.md`
- ❌ **Never** modify `prompter/AGENTS.md` — it is a reference-only file

### Document Dependency Enforcement
AI agents MUST verify the existence of upstream documents before generating downstream documents:

| To Generate | Required Upstream Documents |
|-------------|---------------------------|
| PRD | Product Brief |
| FSD | PRD |
| ERD | FSD |
| API Contract | FSD + ERD |
| UI Wireframes | FSD + ERD + API Contract |
| TDD-Lite | FSD + ERD + API Contract + UI Wireframes |
| Epics | FSD + TDD-Lite |
| Stories | Epics + FSD |

### Style Matching Requirements
- Match existing code patterns and conventions in the codebase
- Follow naming conventions defined in `prompter/project.md`
- Maintain consistent terminology as defined in Section 7 (Glossary)

### Modification Scope Limits
- Changes must be scoped to the minimum necessary files
- Default to < 100 lines of new code per change
- Single-file implementations until proven insufficient
- No new frameworks or dependencies without justification in a `design.md`

### Risk Acknowledgment Protocols
- All investment-related features must include risk disclosure handling
- Financial calculations must be flagged for human review
- Security-sensitive changes require explicit notation in proposals
- Regulatory compliance implications must be documented

### Output Format Requirements
- Code changes: diffs or patches with clear before/after context
- Documentation changes: full section replacement (not partial deltas)
- Schema changes: complete migration scripts

### Cascade Regeneration Triggers
When an upstream document changes, all downstream documents MUST be flagged for regeneration:
- ✅ If upstream document changes, immediately flag all downstream documents
- ✅ Document the cascade in the change proposal's impact section
- ✅ Validate downstream documents remain consistent after upstream changes

### Prompter Workflow Compliance
- Always follow the three-stage workflow: Create → Implement → Archive
- Run `prompter validate [change-id] --strict --no-interactive` before requesting approval
- Never start implementation until a proposal is approved
- Reference `prompter/AGENTS.md` for detailed Prompter workflow instructions

---

## 13. 🗺️ Integration Map

### External Service Integrations (from PRD)

| Service | Purpose | Priority |
|---------|---------|----------|
| **Stripe** | Payment gateway — investment purchases and payouts | Critical |
| **Local Payment Methods** | Region-specific payment processing | High |
| **Google Maps / Mapbox** | Farm location display, map-based discovery | High |
| **Weather API** | Farm condition monitoring, weather impact alerts | Medium |
| **SMS Service** | OTP delivery, notification fallback | High |
| **Email Service** | Notifications, KYC communications, reports | High |
| **Analytics Platform** | User behavior tracking, business metrics | Medium |
| **OAuth Providers** | Social media login (Google, Facebook, Apple, etc.) | High |

### Internal Service Communication
- Not yet defined — pending architecture decisions in TDD-Lite

### Webhook Configurations
- Not yet defined — expected for: payment status updates, harvest event triggers

### Async Job Dependencies (expected)
- Harvest date reminder notifications (scheduled)
- Yield estimation recalculations (periodic)
- Market price updates (real-time or periodic)
- Payout processing (batch or event-driven)
- Report generation (on-demand and scheduled)

---

## 14. 🗺️ Roadmap & Future Plans

### Planned Features (from PRD — required)
1. User Management System (registration, auth, KYC, 2FA, roles)
2. Investment Marketplace (farm profiles, crop listings, tree investments)
3. Investment Tracking Dashboard (portfolio, health monitoring)
4. Harvest & Returns System (scheduling, profit distribution)
5. Financial Features (payments, multi-currency, reporting)
6. Information & Education Center (guides, encyclopedia)
7. Communication Features (messaging, notifications, support)

### Optional / Deferred Scope (from PRD)
- **Secondary Market:** Allow users to sell tree investments to other users
- **Gamification:** Investment badges/achievements, referral rewards, leaderboards
- **Virtual Tours:** 360° farm tour experiences

### Scalability Goals (from PRD)
- Multi-region / multi-country expansion
- Multi-language support
- Currency localization

### Expected Deliverables (from PRD)
1. Technical Architecture Document
2. UI/UX Design Mockups
3. Database Schema Design
4. API Documentation
5. Development Roadmap with Milestones
6. Testing Strategy

---

## 15. ⚠️ Known Issues & Limitations

### Architectural Constraints
- No codebase exists yet — project is in documentation/planning phase only
- `prompter/project.md` is an empty template — no coding conventions established

### Regulatory Concerns
- Platform may be classified as a securities offering in some jurisdictions — legal review required before launch
- KYC requirements vary by country — compliance strategy not yet defined
- Investment disclaimers and risk disclosures must meet jurisdiction-specific requirements

### Documentation Gaps
- No FSD exists — behavioral specifications are not yet defined
- No ERD exists — data model is inferred only
- No API Contract exists — API surface is undefined
- No UI Wireframes exist — user interface is not designed
- No TDD-Lite exists — detailed technical architecture is undocumented (tech stack is selected)

### Performance Considerations
- Real-time portfolio tracking may require WebSocket or SSE infrastructure
- Map-based farm discovery with large datasets may need geospatial indexing
- Market price tracking requires efficient real-time or near-real-time data ingestion

---

## 16. 🧪 Testing Strategy

> **Status:** Not yet defined. Must be established before implementation.

### Testing Stack
- **Framework:** PHPUnit 11.x (Pest plugin allowed)
- **Test Database:** SQLite in-memory (`:memory:`)
- **Code Style:** Laravel Pint 1.x

### Expected Testing Approach (from PRD deliverables)

**Unit Tests:**
- Business logic validation (investment calculations, payout computations)
- Data model integrity checks
- Authentication and authorization logic

**Integration Tests:**
- Payment gateway integration flows
- External API integrations (maps, weather, notifications)
- Database transaction integrity

**E2E Tests:**
- Complete investment purchase flow
- Harvest-to-payout lifecycle
- User registration through KYC verification
- Farm listing through marketplace availability

**Data Consistency Validations:**
- Investment ledger balances
- Payout totals match harvest profit calculations
- Portfolio values match sum of active investments

### Success Metrics (from PRD)
- User acquisition and retention rates
- Total investment volume
- Average investment per user
- User satisfaction scores
- Platform uptime and performance
- Successful harvest-to-payout completion rate

---

## 17. 🧯 Troubleshooting Guide

> **Status:** Not applicable — no codebase exists yet.

### Prompter Troubleshooting (active)

**"Change must have at least one delta"**
- Verify `changes/[name]/specs/` exists with `.md` files
- Verify files contain operation prefixes (`## ADDED Requirements`)

**"Requirement must have at least one scenario"**
- Ensure scenarios use `#### Scenario:` format (4 hashtags)
- Do not use bullet points or bold for scenario headers

**Validation Command:**
```bash
prompter validate [change-id] --strict --no-interactive
```

**Debug Delta Parsing:**
```bash
prompter show [change] --json --deltas-only
```

---

## 18. 📞 Ownership & Responsibility Map

> **Status:** Team structure not yet defined.

### Document Ownership

| Document | Maintainer | Location |
|----------|-----------|----------|
| AGENTS.md (root) | Project Lead / AI Agents | `AGENTS.md` |
| PRD | Product Owner | `prompter/prd.md` |
| Project Conventions | Tech Lead | `prompter/project.md` |
| FSD | Product Owner + Tech Lead | `prompter/fsd.md` (not yet created) |
| ERD | Tech Lead | `prompter/erd.md` (not yet created) |
| API Contract | Backend Lead | `prompter/api_contract.md` (not yet created) |
| UI Wireframes | Design Lead | `prompter/ui_wireframes.md` (not yet created) |
| TDD-Lite | Tech Lead | `prompter/tdd_lite.md` (not yet created) |
| Epics | Product Owner | `prompter/epics/` (DRAFT - PRD-based) |
| Stories | Product Owner + Dev Team | `prompter/stories.md` (not yet created) |

### Module Ownership (to be assigned)
- User Management — TBD
- Investment Marketplace — TBD
- Harvest & Returns — TBD
- Financial Features — TBD
- Communication — TBD
- Admin Panel — TBD

---

## 19. 📚 Canonical Documentation Flow

```
Product Brief
    ↓
   PRD              ← ✅ EXISTS (prompter/prd.md)
    ↓
   FSD              ← ⏳ NOT YET CREATED
    ↓
   ERD              ← ⏳ NOT YET CREATED
    ↓
API Contract        ← ⏳ NOT YET CREATED
    ↓
UI Wireframes       ← ⏳ NOT YET CREATED
    ↓
 TDD-Lite           ← ⏳ NOT YET CREATED
    ↓
  Epics             ← ⚠️ DRAFT (PRD-based, in prompter/epics/)
    ↓
 Stories            ← ⏳ NOT YET CREATED
```

**Current State:** Only the PRD exists. The next required document in the chain is the **Product Brief** (upstream of PRD) or **FSD** (downstream of PRD).

**Rule:** Documents MUST be created in order. No document may be created without its upstream dependencies.

---

## 20. 🧩 Document Dependency Rules

| Document | Requires (upstream) |
|----------|-------------------|
| PRD | Product Brief |
| FSD | PRD |
| ERD | FSD |
| API Contract | FSD + ERD |
| UI Wireframes | FSD + ERD + API Contract |
| TDD-Lite | FSD + ERD + API Contract + UI Wireframes |
| Epics | FSD + TDD-Lite |
| Stories | Epics + FSD |

### Enforcement
- AI agents MUST check for upstream document existence before generating any downstream document
- If an upstream document is missing, the agent MUST refuse generation and report the missing dependency
- The only exception is the PRD, which currently exists without a formal Product Brief — this is acceptable for bootstrapping

---

## 21. 📐 Source-of-Truth Matrix

| Domain | Authoritative Document | Status |
|--------|----------------------|--------|
| Vision & Scope | PRD (`prompter/prd.md`) | ✅ Available |
| Behavior & Rules | FSD | ❌ Not created |
| Data Model | ERD | ❌ Not created |
| API Surface | API Contract | ❌ Not created |
| UX & Screens | UI Wireframes | ❌ Not created |
| Architecture | TDD-Lite | ❌ Not created |
| Work Breakdown | Epics / Stories | ⚠️ DRAFT (EPICs from PRD, pending FSD/TDD) |
| Project Conventions | `prompter/project.md` | ⚠️ Empty template |
| Agent Governance | `AGENTS.md` (this file) | ✅ Available |
| Prompter Workflow | `prompter/AGENTS.md` | ✅ Available (reference only) |

### Conflict Resolution
- DOCS_ROOT_PATH documentation **always** supersedes codebase inferences
- If codebase and documentation conflict, trust documentation and note the conflict in Section 15
- PRD is the current authoritative source for all product decisions until FSD is created

---

## 22. 🔁 Regeneration Rules

When an upstream document changes, the following downstream documents MUST be flagged for review and potential regeneration:

| When This Changes | Regenerate These |
|-------------------|-----------------|
| **Product Brief** | PRD, FSD, ERD, API, UI, TDD, Epics, Stories |
| **PRD** | FSD, ERD, API, UI, TDD, Epics, Stories |
| **FSD** | ERD, API, UI, TDD, Epics, Stories |
| **ERD** | API, UI, TDD, Epics, Stories |
| **API Contract** | UI, TDD, Epics, Stories |
| **UI Wireframes** | TDD, Epics, Stories |
| **TDD-Lite** | Epics, Stories |

### Cascade Process
1. Identify which upstream document changed
2. List all downstream documents from the table above
3. Review each downstream document for consistency with the change
4. Regenerate or update each affected downstream document
5. Validate all updated documents with `prompter validate --strict --no-interactive`
6. Update this `AGENTS.md` if the change affects any of the 23 sections

### Current Implication
Since only the PRD exists, any change to the PRD will affect **all** future documents when they are created. The PRD should be considered stable before proceeding with FSD creation.

---

## 23. ⏳ Missing Information

### Critical Missing Documents

| Document | Impact | Next Action |
|----------|--------|-------------|
| **Product Brief** | PRD exists without formal upstream brief; acceptable for bootstrapping but should be retroactively created | Create `prompter/product_brief.md` |
| **FSD** | Cannot define ERD, API, or any technical documents without functional specifications | Create `prompter/fsd.md` — **highest priority** |
| **ERD** | Data model is inferred only; no authoritative schema exists | Blocked by FSD |
| **API Contract** | No API surface defined; cannot begin backend implementation | Blocked by FSD + ERD |
| **UI Wireframes** | No visual designs; cannot begin frontend implementation | Blocked by FSD + ERD + API |
| **TDD-Lite** | No architecture decisions; tech stack undefined | Blocked by FSD + ERD + API + UI |
| **Epics** | No work breakdown; cannot plan sprints | Blocked by FSD + TDD |
| **Stories** | No implementable tasks exist | Blocked by Epics + FSD |

### Missing Project Configuration

| Item | Impact | Next Action |
|------|--------|-------------|
| **`prompter/project.md`** content | No coding conventions or architecture patterns defined | Fill in template before any implementation |
| **Team structure** | Cannot assign module ownership | Define roles and responsibilities |
| **Git workflow** | No branching or deployment strategy | Document in `prompter/project.md` |

### Missing Business Details

| Item | Impact |
|------|--------|
| **Specific jurisdictions** | Cannot finalize regulatory compliance approach |
| **Revenue model / platform fees** | PRD describes investor returns but not platform monetization |
| **Initial farm partners** | No onboarding pipeline defined |
| **Launch market / geography** | Multi-region mentioned but primary market not specified |
| **Pricing strategy** | How tree prices are set and updated is not specified |
| **Insurance / guarantees** | What happens if a harvest fails — risk distribution unclear |
| **KYC provider** | Specific identity verification service not chosen |

### Recommended Next Steps (Priority Order)
1. **Fill in `prompter/project.md`** — Establish coding conventions and patterns
2. **Create Product Brief** — Formalize vision and business context
3. **Create FSD** — Define functional specifications (unlocks ERD, API, and all downstream docs)
4. **Create ERD** — Define authoritative data model
5. **Create API Contract** — Define backend API surface
6. **Create UI Wireframes** — Define user interface
7. **Create TDD-Lite** — Document architecture decisions
8. **Create Epics and Stories** — Break work into implementable tasks
