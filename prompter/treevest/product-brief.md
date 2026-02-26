# Treevest - Fruit Crops Investment
## Executive Summary

**A digital investment platform where users invest in individual fruit trees and earn returns based on real agricultural harvest cycles.**

---

## At a Glance

|                   |                                                                 |
| ----------------- | --------------------------------------------------------------- |
| **Product Type**  | Investment Platform / AgriTech Marketplace                      |
| **Target Market** | Individual investors seeking alternative agricultural assets    |
| **Platform**      | Responsive Web Application (mobile apps deferred)               |
| **Technology**    | Laravel 12 + React 18 + Inertia.js + MySQL (monolith)          |
| **Status**        | Pre-implementation (PRD complete, tech stack decided, no code)  |

---

## What is Treevest?

Treevest is a digital investment platform that operates like a stock exchange for agriculture. Instead of buying shares in companies, users purchase stakes in individual fruit trees on partner farms. Returns are generated from actual harvest yields and market pricing, creating a tangible, transparent investment vehicle tied to real agricultural output.

### The Problem We Solve

| Challenge                                       | Impact                                                                         |
| ----------------------------------------------- | ------------------------------------------------------------------------------ |
| Agricultural investment is inaccessible         | Small investors are locked out of farmland opportunities requiring large capital |
| Traditional investments lack tangible backing   | Investors have no visibility into what their money supports                     |
| Farm owners lack access to growth capital        | Smallholder farmers cannot fund expansion or modernization                      |
| Agricultural returns are opaque                 | Investors cannot track performance or understand yield-based returns            |

### Our Solution

Treevest fractionalizes agricultural assets into individual tree-level investments, connecting investors directly to farms with full transparency into growth, harvest, and profit distribution cycles.

```
Investor Browses       Selects Farm       Purchases Tree       Monitors Growth
  Marketplace      -->   & Crop Type  -->  Investment      -->   & Health
       |                                        |                    |
       v                                        v                    v
  Farm Discovery         Risk & ROI         Payment via          Portfolio
  (Map + Filters)        Disclosure         Stripe/Local         Dashboard
                                                |                    |
                                                v                    v
                                           Portfolio             Harvest &
                                           Updated               Returns
                                                                     |
                                                                     v
                                                                  Payout
                                                             (Bank/Wallet/
                                                              Reinvest)
```

---

## Core Capabilities

### 1. User Management & Security
- Secure registration via email, phone, and social OAuth (Google, Facebook, Apple)
- KYC (Know Your Customer) verification mandatory before investing
- Two-factor authentication (2FA) for account security
- Role-based access control: Investor, Farm Owner, Administrator
- Investment history and profile management

### 2. Investment Marketplace
- Comprehensive farm profiles with map integration, images, and virtual tours
- Detailed fruit crop listings across 20+ varieties (Durian, Mango, Grapes, Citrus, etc.)
- Per-tree investment details: price, expected ROI, harvest cycle, risk rating, lifespan
- Filtering by fruit type, risk level, ROI, location, and certification status
- Historical performance data and farm owner credentials

### 3. Portfolio Tracking Dashboard
- Real-time total investment value and tree count by farm and crop type
- Growth stage indicators and expected harvest date calendar
- Projected vs. actual returns visualization
- Portfolio diversification breakdown
- Live tree health monitoring with weather alerts and pest/disease notifications

### 4. Harvest & Returns System
- Automated harvest date notifications and yield estimation updates
- Market price tracking for each fruit type
- Transparent profit calculation methodology
- Multiple payout options: bank transfer, digital wallet, reinvestment
- Tax documentation and detailed transaction history

### 5. Financial Features
- Secure payment gateway integration (Stripe + local payment methods)
- Multi-currency support with currency localization
- Investment top-up functionality
- Secondary market for peer-to-peer tree investment trading (optional)
- Downloadable financial reports (PDF, CSV) with year-end tax summaries

### 6. Information & Education Center
- Guides on how fruit tree investing works
- Risk factors and mitigation strategies
- Harvest cycle education and market trend analysis
- Farm and crop encyclopedia with growing conditions and seasonality charts

### 7. Communication & Notifications
- In-app messaging system between investors, farm owners, and support
- Push notifications for investment opportunities, harvest updates, and payment confirmations
- Email notifications for all critical events
- Customer support chat

---

## Key Benefits

| Benefit                            | Description                                                                                  |
| ---------------------------------- | -------------------------------------------------------------------------------------------- |
| **🌱 Tangible Asset Backing**       | Every investment is tied to a real, physical fruit tree on a verified partner farm            |
| **📊 Full Transparency**            | Real-time monitoring of tree health, growth stages, and harvest progress                     |
| **💰 Harvest-Based Returns**        | Profits derived from actual agricultural yields, not speculation                             |
| **🔐 Regulatory Compliance**        | KYC verification, audit trails, and risk disclosures built into every transaction            |
| **🌍 Portfolio Diversification**    | Invest across multiple farms, fruit types, and geographic regions                            |
| **🔄 Flexible Payout Options**      | Choose bank transfer, digital wallet, or automatic reinvestment for compounding returns      |

---

## User Roles Supported

| Role                     | Primary Functions                                                                                          |
| ------------------------ | ---------------------------------------------------------------------------------------------------------- |
| **Investor**             | Browse marketplace, purchase tree investments, track portfolio, receive payouts, trade on secondary market  |
| **Farm Owner / Partner** | Create farm profiles, list crops and trees, report harvest data, update tree health, upload growth photos   |
| **Administrator**        | Manage users, approve farm listings, oversee investments, handle disputes, generate reports, monitor health |

---

## System Architecture / Modules

```
┌──────────────────────────────────────────────────────────────────────────┐
│                              TREEVEST                                    │
├──────────────┬──────────────┬────────────────┬──────────────────────────┤
│    User      │  Investment  │   Portfolio    │   Harvest & Returns     │
│  Management  │  Marketplace │   Dashboard    │      System             │
│  (Auth/KYC)  │  (Discovery) │  (Tracking)    │  (Yield/Payout)        │
├──────────────┼──────────────┼────────────────┼──────────────────────────┤
│  Financial   │  Education   │ Communication  │   Admin Panel           │
│  Features    │    Center    │  & Notifications│  (Operations)          │
│  (Payments)  │  (Guides)    │  (Messaging)   │  (Oversight)           │
└──────────────┴──────────────┴────────────────┴──────────────────────────┘

External Services:
  ├── Stripe (payment processing)
  ├── Google Maps / Mapbox (farm geolocation)
  ├── Weather API (farm condition monitoring)
  ├── SMS Gateway (OTP, notifications)
  ├── Email Service (transactional email)
  └── OAuth Providers (Google, Facebook, Apple)
```

**7 core modules** + **1 integrated admin panel** working together within a single Laravel monolith application.

---

## Infrastructure Highlights

- **Monolith Architecture** -- Single Laravel 12 application serving all roles via Inertia.js, simplifying deployment and operations
- **Server-Side Routing with Client-Side Rendering** -- Inertia.js bridges Laravel routing with React 18 components for SPA-like experience
- **Database-Driven Infrastructure** -- Sessions, cache, and queues all use MySQL, eliminating need for Redis or external queue services
- **Auth Scaffolding** -- Laravel Breeze provides production-ready authentication with React + TypeScript out of the box
- **Named Route Sharing** -- Ziggy exposes Laravel routes to TypeScript/React, ensuring frontend and backend stay in sync

---

## Investment & Agricultural Features

### Supported Fruit Crop Categories

| Fruit Type | Investable Variants                                |
| ---------- | -------------------------------------------------- |
| Durian     | Musang King, D24, Black Thorn, Red Prawn           |
| Mango      | Alphonso, Nam Doc Mai, Carabao, Kent               |
| Grapes     | Thompson Seedless, Concord, Shine Muscat           |
| Melon      | Honeydew, Cantaloupe, Yubari King                  |
| Citrus     | Valencia Orange, Meyer Lemon, Pomelo               |
| Others     | Avocado, Longan, Rambutan, Mangosteen              |

### Investment Purchase Workflow
```
Browse Marketplace --> Select Farm/Tree --> Review Details & Risk Disclosure
        --> Purchase Investment --> Payment Processing --> Confirmation
                --> Portfolio Updated --> Ongoing Monitoring
```

### Harvest & Payout Lifecycle
```
Tree Growth Monitoring --> Harvest Date Approaching --> Yield Estimation
        --> Actual Harvest --> Market Price Applied --> Profit Calculated
                --> Distribution to Investors --> Payout (Bank/Wallet/Reinvest)
```

### Tree Lifecycle States
- **Seedling** --> **Growing** --> **Productive** --> **Declining** --> **Retired**

---

## Dashboard / Analytics

| Widget                          | Purpose                                                          |
| ------------------------------- | ---------------------------------------------------------------- |
| Portfolio Value                 | Total current investment value across all trees and farms         |
| Tree Count by Farm/Crop         | Breakdown of holdings by geographic and crop diversification     |
| Growth Stage Indicators         | Visual status of each tree's lifecycle stage                     |
| Harvest Calendar                | Upcoming harvest dates with yield estimation                     |
| Projected vs. Actual Returns    | Performance comparison of expected ROI against realized returns  |
| Diversification Chart           | Portfolio allocation visualization across risk ratings and crops |
| Weather & Health Alerts         | Active alerts for weather events, pest/disease, and farm issues  |

---

## Competitive Advantages

| Feature                     | Treevest                                          | Traditional Agricultural Investment |
| --------------------------- | ------------------------------------------------- | ----------------------------------- |
| Minimum Investment          | ✅ Per-tree fractional (accessible)                | ❌ Large land parcels required       |
| Transparency                | ✅ Real-time tree health and growth monitoring     | ❌ Limited visibility into operations |
| Liquidity                   | ✅ Secondary market for peer-to-peer trading       | ❌ Illiquid, long lock-up periods    |
| Diversification             | ✅ Invest across farms, crops, and regions         | ❌ Concentrated single-farm exposure |
| Return Mechanism            | ✅ Harvest-cycle based, tied to real yields        | ❌ Opaque profit sharing agreements  |
| Risk Assessment             | ✅ Per-tree risk ratings with historical data      | ❌ Blanket risk assessment           |
| Digital Experience           | ✅ Full web platform with dashboards and alerts    | ❌ Paper-based or broker-mediated    |

---

## Roadmap Considerations

### Current State
- Product Requirements Document (PRD) is complete and stable
- Tech stack is decided: Laravel 12 + React 18 + Inertia.js + MySQL
- Project is in pre-implementation phase with no codebase yet
- Draft EPICs exist based on PRD; downstream documents (FSD, ERD, API) are pending

### Planned Implementation (Required)

| Priority | Feature                                                              |
| -------- | -------------------------------------------------------------------- |
| High     | User Management System (registration, auth, KYC, 2FA, roles)        |
| High     | Investment Marketplace (farm profiles, crop listings, tree details)  |
| High     | Investment Tracking Dashboard (portfolio, health monitoring)         |
| High     | Harvest & Returns System (scheduling, yield, profit distribution)   |
| High     | Financial Features (payments, multi-currency, reporting)            |
| Medium   | Information & Education Center (guides, encyclopedia)               |
| Medium   | Communication Features (messaging, notifications, support)          |

### Deferred / Optional Enhancements

| Priority | Enhancement                                                |
| -------- | ---------------------------------------------------------- |
| Medium   | Secondary Market (peer-to-peer tree investment trading)    |
| Low      | Gamification (badges, referral rewards, leaderboards)      |
| Low      | Virtual Tours (360-degree farm tour experiences)            |
| Low      | Mobile Apps (iOS/Android via API + Sanctum)                |
| Low      | Multi-language support and multi-region expansion          |

---

## Technical Foundation

| Component          | Choice                    | Why                                                              |
| ------------------ | ------------------------- | ---------------------------------------------------------------- |
| Backend Framework  | Laravel 12 (PHP 8.2+)    | Mature ecosystem, Inertia.js integration, strong ORM and auth    |
| Frontend Framework | React 18 + TypeScript 5   | Component-based UI with type safety, large community             |
| SSR Bridge         | Inertia.js 2.x           | Eliminates need for separate API layer; server-side routing      |
| Database           | MySQL 8.x                | Proven relational database for financial and transactional data  |
| CSS Framework      | Tailwind CSS 3.x         | Utility-first styling, rapid UI development, consistent design   |
| Build Tool         | Vite 7.x                 | Fast development builds, native ESM, Laravel plugin support      |
| Auth Scaffold      | Laravel Breeze 2.x       | Pre-built React + TypeScript auth UI, minimal overhead           |
| Code Quality       | Laravel Pint + PHPUnit   | PSR-12 enforcement, comprehensive testing with SQLite in-memory  |
| Payments           | Stripe + Local Methods   | Global reach with local payment support                          |
| Maps               | Google Maps / Mapbox      | Farm geolocation, map-based discovery                            |

---

## Security & Compliance

### Authentication & Access
- ✅ Multi-method registration (email, phone, OAuth)
- ✅ Two-factor authentication (2FA)
- ✅ Mandatory KYC verification before investing
- ✅ Role-based access control (Investor / Farm Owner / Admin)

### Data Protection
- ✅ End-to-end encryption for data transmission
- ✅ Secure data storage compliant with local regulations
- ✅ GDPR and local data protection law compliance
- ✅ Regular security audits and fraud detection mechanisms

### Financial Compliance
- ✅ Immutable audit trails for all financial transactions
- ✅ Investment disclaimers and risk disclosure statements
- ✅ Terms of service and regulatory compliance documentation
- ✅ [TBD] Jurisdiction-specific securities law compliance (legal review required)

---

## Getting Started

### For New Implementations
1. Complete the Functional Specification Document (FSD) based on the PRD
2. Generate ERD (data model) from the FSD
3. Define the API Contract from FSD + ERD
4. Create UI Wireframes based on FSD + ERD + API Contract
5. Write TDD-Lite (architecture decisions) based on all upstream documents
6. Break work into Epics and Stories for sprint planning
7. Fill in `prompter/project.md` with coding conventions before first code commit

### For Stakeholders
- Review the PRD at `prompter/prd.md` for full product requirements
- Review AGENTS.md at project root for comprehensive technical knowledge base
- Draft EPICs are available in `prompter/epics/` for work breakdown context
- Document dependency chain must be followed: PRD --> FSD --> ERD --> API --> UI --> TDD

---

## Success Metrics

| Metric                              | Description                                                    |
| ----------------------------------- | -------------------------------------------------------------- |
| User Acquisition & Retention        | Growth rate and churn of registered investors                  |
| Total Investment Volume             | Aggregate capital invested across all trees and farms          |
| Average Investment Per User         | Portfolio size indicator for user engagement                   |
| User Satisfaction Scores            | NPS and in-app satisfaction surveys                            |
| Platform Uptime & Performance       | Availability SLA and response time benchmarks                  |
| Harvest-to-Payout Completion Rate   | End-to-end success rate of the core investment lifecycle       |

---

## Summary

**Treevest** transforms agricultural investment by:

1. **Fractionalizing** farmland assets into individual tree-level investments accessible to any investor
2. **Connecting** investors directly to verified partner farms with full operational transparency
3. **Automating** the harvest-to-payout lifecycle with real-time tracking and multiple payout options
4. **Reducing** entry barriers to agricultural investment through low minimum per-tree pricing
5. **Providing** data-driven decision tools with risk ratings, yield history, and portfolio analytics

---

## Document Information

|                        |                                                  |
| ---------------------- | ------------------------------------------------ |
| **Version**            | 1.0                                              |
| **Date**               | 2026-02-27                                       |
| **Classification**     | Internal - Executive Summary                     |
| **Source Documents**    | `prompter/prd.md`, `AGENTS.md`                   |
| **Full Specification** | See `prompter/prd.md` for complete requirements  |

---

*For technical architecture details, data models, and implementation specifications, refer to AGENTS.md and the downstream documents (FSD, ERD, API Contract) as they are created.*
