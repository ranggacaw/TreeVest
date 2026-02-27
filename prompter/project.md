# Project Context

## Purpose

**Treevest** is a digital investment platform where users invest in individual fruit trees on partner farms and earn returns based on real agricultural harvest cycles. It operates like a stock exchange for agriculture — fractionalizing farmland assets into tree-level investments with full transparency into growth, harvest, and profit distribution.

### Goals
- Enable individual investors to purchase stakes in fruit trees with low minimum investment
- Connect investors to verified partner farms with real-time operational transparency
- Automate the harvest-to-payout lifecycle with multiple distribution options
- Provide data-driven investment tools: risk ratings, yield history, portfolio analytics
- Support farm owners in accessing growth capital through the platform

### Non-Goals (Current Phase)
- Native mobile apps (iOS/Android) — deferred to future scope
- Gamification features (badges, leaderboards) — optional / deferred
- Virtual 360-degree farm tours — deferred
- Multi-language / multi-region expansion — deferred

---

## Tech Stack

### Core Application

| Layer | Technology | Version |
|-------|-----------|---------|
| Backend Framework | Laravel | 12.x |
| Backend Language | PHP | >= 8.2 |
| Frontend Framework | React | 18.x |
| Frontend Language | TypeScript | 5.x (strict mode) |
| SSR Bridge | Inertia.js | 2.x (`@inertiajs/react`) |
| Client-side Routes | Ziggy | 2.x (`tightenco/ziggy`) |
| CSS Framework | Tailwind CSS | 3.x with `@tailwindcss/forms` |
| Build Tool | Vite | 7.x (`laravel-vite-plugin` + `@vitejs/plugin-react`) |

### Data & Infrastructure

| Layer | Technology | Notes |
|-------|-----------|-------|
| Database (production) | MySQL | 8.x |
| Database (testing) | SQLite | In-memory (`:memory:`) |
| Session Driver | Database | `SESSION_DRIVER=database` |
| Cache Store | Database | `CACHE_STORE=database` |
| Queue Connection | Database | `QUEUE_CONNECTION=database` |
| Local Dev | Laragon | Self-hosted, Windows |

### Auth & Security

| Layer | Technology | Notes |
|-------|-----------|-------|
| Auth Scaffolding | Laravel Breeze | 2.x (React + TypeScript stack) |
| Authorization | Custom RoleMiddleware | `role:admin`, `role:investor`, `role:farm_owner` |
| API Auth | Laravel Sanctum | 4.x (available for future mobile API) |

### Code Quality

| Tool | Purpose |
|------|---------|
| Laravel Pint | PHP code style (PSR-12) |
| PHPUnit | Testing framework (11.x, Pest plugin allowed) |
| Concurrently | Dev runner (`composer dev`) — serves app, queue, logs, Vite |

---

## Project Conventions

### Code Style

#### PHP (Laravel)

**Formatting:** Laravel Pint enforces PSR-12. Run `./vendor/bin/pint` before committing.

**Naming:**

| Element | Convention | Example |
|---------|-----------|---------|
| Classes | PascalCase | `InvestmentService`, `TreeHealthMonitor` |
| Methods | camelCase | `calculatePayout()`, `getHarvestSchedule()` |
| Variables | camelCase | `$investmentAmount`, `$harvestCycle` |
| Constants | UPPER_SNAKE_CASE | `MAX_INVESTMENT_LIMIT`, `HARVEST_STATUS_COMPLETED` |
| Database tables | snake_case, plural | `fruit_crops`, `harvest_cycles`, `investments` |
| Database columns | snake_case | `expected_roi`, `harvest_date`, `risk_rating` |
| Migration files | Laravel default | `2026_02_27_000000_create_investments_table.php` |
| Model files | PascalCase, singular | `Investment.php`, `FruitCrop.php`, `Tree.php` |
| Controller files | PascalCase + `Controller` | `InvestmentController.php`, `FarmController.php` |
| FormRequest files | PascalCase + `Request` | `StoreInvestmentRequest.php`, `UpdateFarmRequest.php` |
| Service files | PascalCase + `Service` | `PayoutService.php`, `HarvestService.php` |
| Job files | PascalCase, verb-led | `ProcessPayout.php`, `SendHarvestNotification.php` |
| Event files | PascalCase, past tense | `InvestmentPurchased.php`, `HarvestCompleted.php` |
| Listener files | PascalCase, verb-led | `SendPayoutConfirmation.php`, `UpdatePortfolioValue.php` |
| Enum files | PascalCase | `InvestmentStatus.php`, `TreeLifecycleStage.php` |
| Config keys | snake_case | `config('treevest.max_investment_limit')` |
| Route names | dot-separated, lowercase | `investments.show`, `farms.trees.index` |
| Middleware aliases | kebab-case | `role`, `kyc-verified` |

**PHP Patterns:**
- Use PHP 8.2+ features: enums, readonly properties, typed properties, named arguments, match expressions
- Use constructor property promotion where appropriate
- Prefer enum classes over string/integer constants for status values
- Return types are mandatory on all methods
- Use null coalescing (`??`) and nullsafe operator (`?->`) over verbose null checks
- PHPDoc blocks only when they add information beyond the type signature

#### TypeScript / React

**Formatting:** Prettier (to be configured). Consistent with Tailwind CSS plugin ordering.

**Naming:**

| Element | Convention | Example |
|---------|-----------|---------|
| Components | PascalCase | `InvestmentCard.tsx`, `HarvestCalendar.tsx` |
| Hooks | camelCase with `use` prefix | `usePortfolio.ts`, `useHarvestSchedule.ts` |
| Utility functions | camelCase | `formatCurrency()`, `calculateROI()` |
| Type/Interface | PascalCase | `Investment`, `FarmListing`, `HarvestCycle` |
| Constants | UPPER_SNAKE_CASE | `MAX_TREES_PER_PAGE`, `DEFAULT_CURRENCY` |
| Page components | PascalCase, match route | `resources/js/Pages/Investments/Show.tsx` |
| Shared components | PascalCase | `resources/js/Components/TreeHealthBadge.tsx` |
| Layout components | PascalCase + `Layout` | `AuthenticatedLayout.tsx`, `GuestLayout.tsx` |
| Type definition files | PascalCase or `index.d.ts` | `resources/js/types/index.d.ts` |
| CSS class names | Tailwind utilities only | No custom CSS classes; use Tailwind |

**TypeScript Patterns:**
- Strict mode enabled (`strict: true` in `tsconfig.json`)
- Prefer `interface` over `type` for object shapes (use `type` for unions/intersections)
- No `any` — use `unknown` and narrow with type guards when type is uncertain
- Props interfaces named `{ComponentName}Props`
- Inertia page props typed via `PageProps` extending the global type
- Use `route()` from Ziggy for all URL generation (never hardcode URLs)
- Destructure Inertia `usePage().props` for accessing shared data

**React Patterns:**
- Functional components only (no class components)
- Custom hooks for reusable logic (`resources/js/Hooks/`)
- Prefer `useForm()` from Inertia for form handling
- Prefer `router.visit()` / `router.post()` from Inertia for navigation (not `fetch` or `axios`)
- Co-locate small helper components with their parent; extract to `Components/` when reused
- No inline styles — Tailwind CSS utilities exclusively
- Avoid `useEffect` for derived state — compute directly or use `useMemo`

---

### Architecture Patterns

#### Request Lifecycle (Inertia.js)

```
Browser Request
    --> Laravel Router (routes/web.php)
        --> Middleware (auth, role, kyc)
            --> Controller
                --> Service (business logic)
                    --> Eloquent Model (data access)
                --> Inertia::render('Page/Name', $props)
    --> React Page Component receives props
        --> Renders UI with Tailwind CSS
```

#### Layer Responsibilities

| Layer | Location | Responsibility | Rules |
|-------|----------|---------------|-------|
| **Routes** | `routes/web.php`, `routes/auth.php` | URL-to-controller mapping | No business logic. Use route groups and middleware. |
| **Middleware** | `app/Http/Middleware/` | Cross-cutting concerns (auth, roles, KYC) | Thin. Delegate complex checks to services. |
| **Controllers** | `app/Http/Controllers/` | HTTP request handling | Thin. Validate input (via FormRequest), call services, return Inertia response. Max ~20 lines per method. |
| **FormRequests** | `app/Http/Requests/` | Input validation and authorization | One per create/update action. Use `authorize()` for permission checks. |
| **Services** | `app/Services/` | Business logic and orchestration | Stateless. Inject via constructor. One service per domain concept. |
| **Models** | `app/Models/` | Data access, relationships, scopes, accessors | No business logic beyond data shape. Use scopes for query encapsulation. |
| **Jobs** | `app/Jobs/` | Async/queued work | Self-contained. Idempotent where possible. |
| **Events/Listeners** | `app/Events/`, `app/Listeners/` | Side effects (notifications, audit logs) | Decouple side effects from primary flow. |
| **Enums** | `app/Enums/` | Status values, type constants | PHP 8.1+ backed enums. |
| **Pages** | `resources/js/Pages/` | Inertia page components | One TSX file per route. Receives props from controller. |
| **Components** | `resources/js/Components/` | Reusable React UI components | Pure/presentational where possible. |
| **Layouts** | `resources/js/Layouts/` | Page layout wrappers | `AuthenticatedLayout`, `GuestLayout`, `AdminLayout` |
| **Hooks** | `resources/js/Hooks/` | Reusable React hooks | Custom logic extraction. Prefix with `use`. |
| **Types** | `resources/js/types/` | TypeScript type definitions | Shared types, Inertia page props, API response shapes. |

#### Key Architectural Rules

1. **Controllers return `Inertia::render()` only** — never return JSON, Blade views, or redirects with data (use `redirect()->route()` for redirects after mutations).
2. **Business logic lives in Services** — controllers must not contain conditional business logic, calculations, or multi-model orchestration.
3. **One Service per domain concept** — `InvestmentService`, `HarvestService`, `PayoutService`. Do not create god-services.
4. **FormRequests for all input validation** — never validate in controllers directly.
5. **Eloquent for all database queries** — no raw SQL unless performance-critical and documented.
6. **Events for side effects** — when an investment is purchased, dispatch `InvestmentPurchased` event; listeners handle notifications, audit logs, etc.
7. **Queued jobs for expensive operations** — payout processing, report generation, email sending.
8. **Enums for all status fields** — `InvestmentStatus`, `TreeLifecycleStage`, `HarvestStatus`, `KycStatus`, `PayoutStatus`.
9. **Ziggy `route()` in all frontend code** — no hardcoded URLs.
10. **Tailwind CSS only** — no custom CSS files, no CSS modules, no inline styles.

#### File Organization Within Pages

```
resources/js/Pages/
├── Auth/                   # Breeze auth pages (Login, Register, etc.)
├── Dashboard.tsx           # Main investor dashboard
├── Investments/
│   ├── Index.tsx           # Investment marketplace / listing
│   ├── Show.tsx            # Single investment detail
│   └── Portfolio.tsx       # Investor portfolio view
├── Farms/
│   ├── Index.tsx           # Farm listings
│   ├── Show.tsx            # Single farm profile
│   └── Manage/             # Farm owner management pages
├── Harvests/
│   ├── Index.tsx           # Harvest schedule overview
│   └── Show.tsx            # Single harvest detail
├── Admin/
│   ├── Dashboard.tsx       # Admin overview
│   ├── Users/              # User management
│   ├── Farms/              # Farm approval & management
│   └── Reports/            # Financial reports
└── Education/
    ├── Index.tsx           # Education center landing
    └── Articles/           # Individual articles/guides
```

#### Error Handling

**PHP:**
- Use custom exception classes in `app/Exceptions/` for domain-specific errors
- `InsufficientFundsException`, `KycNotVerifiedException`, `InvestmentLimitExceededException`
- Controller exception handling via Laravel's exception handler — return appropriate Inertia error pages
- Log all exceptions with context using structured logging: `Log::error('Payout failed', ['investment_id' => $id, 'reason' => $e->getMessage()])`
- Financial operations must use database transactions (`DB::transaction()`)

**TypeScript/React:**
- Use Inertia's error handling for form validation errors (`usePage().props.errors`)
- Display errors inline near form fields using consistent error component
- Use error boundaries for unexpected React rendering errors
- Toast/flash notifications for success/error feedback after actions

#### Logging

| Level | Use For | Example |
|-------|---------|---------|
| `emergency` | System unusable | Database connection lost |
| `error` | Failed operations that need attention | Payment processing failure, payout distribution error |
| `warning` | Abnormal but handled conditions | Investment limit approached, KYC verification retry |
| `info` | Significant business events | Investment purchased, harvest completed, payout distributed |
| `debug` | Development diagnostics | Service method entry/exit, API call details |

Always include contextual data: user ID, investment ID, amounts, status transitions.

---

### Testing Strategy

#### Framework & Configuration
- **PHPUnit 11.x** with Pest plugin allowed
- **Test database:** SQLite in-memory (`:memory:`) for speed
- **Parallel testing:** Supported via `php artisan test --parallel`
- **Run tests:** `php artisan test` or `./vendor/bin/phpunit`

#### Test Categories

| Category | Location | Purpose | Naming |
|----------|----------|---------|--------|
| Unit | `tests/Unit/` | Service logic, calculations, model methods | `{Class}Test.php` |
| Feature | `tests/Feature/` | HTTP requests, full request lifecycle | `{Feature}Test.php` |

#### What to Test

**Always test:**
- Investment purchase flow (happy path + edge cases: limits, insufficient funds, KYC not verified)
- Payout calculation logic (yield * price - fees, rounding, multi-currency)
- Harvest lifecycle transitions (scheduled -> in_progress -> completed -> payout)
- Authorization (role-based access: investor vs farm owner vs admin)
- Input validation (FormRequest rules)

**Test patterns:**
- Use model factories for test data setup
- Use `RefreshDatabase` trait in feature tests
- Assert Inertia responses with `$response->assertInertia()`
- Financial calculations: test with known inputs and expected outputs, cover edge cases (zero yields, negative scenarios)
- Status transitions: test valid transitions succeed and invalid transitions are rejected

#### Naming Conventions

```php
// Test class
class InvestmentServiceTest extends TestCase

// Test methods: describe what behavior is being tested
public function test_investor_can_purchase_tree_within_limits(): void
public function test_purchase_fails_when_kyc_not_verified(): void
public function test_payout_is_calculated_correctly_for_single_harvest(): void
```

#### Testing Financial Logic
- All monetary values stored as integers (cents/smallest currency unit) to avoid floating point issues
- Test boundary conditions: minimum investment, maximum investment, exactly at limit
- Test multi-currency scenarios where applicable
- Payout calculations must have deterministic test cases with expected results

---

### Git Workflow

#### Branching Strategy

```
main (production-ready)
  └── develop (integration branch)
       ├── feature/EPIC-001-user-registration
       ├── feature/EPIC-006-investment-purchase
       ├── fix/payout-calculation-rounding
       └── chore/update-dependencies
```

| Branch | Purpose | Merges Into |
|--------|---------|-------------|
| `main` | Production-ready code | — |
| `develop` | Integration and testing | `main` (via PR) |
| `feature/*` | New features | `develop` (via PR) |
| `fix/*` | Bug fixes | `develop` (via PR) |
| `chore/*` | Maintenance, deps, docs | `develop` (via PR) |
| `hotfix/*` | Urgent production fixes | `main` + `develop` |

#### Commit Message Convention

Format: `type(scope): description`

**Types:**

| Type | When |
|------|------|
| `feat` | New feature or capability |
| `fix` | Bug fix |
| `refactor` | Code restructuring without behavior change |
| `test` | Adding or updating tests |
| `docs` | Documentation changes |
| `style` | Code formatting (no logic change) |
| `chore` | Build, deps, config changes |
| `perf` | Performance improvement |

**Scope:** Module or area affected — `auth`, `investments`, `harvest`, `farms`, `admin`, `payments`, `ui`.

**Examples:**
```
feat(investments): add tree purchase flow with payment integration
fix(harvest): correct payout calculation for partial yields
refactor(auth): extract KYC verification into dedicated service
test(investments): add edge case tests for investment limit validation
docs(epics): update EPIC-013 push notification scope
chore(deps): update laravel/framework to 12.1
```

**Rules:**
- Subject line: imperative mood, lowercase, no period, max 72 characters
- Body (optional): explain _why_, not _what_; wrap at 80 characters
- Reference EPICs/issues in footer: `Refs: EPIC-006`

#### Pull Request Process
1. Create branch from `develop`
2. Implement changes with passing tests
3. Run `./vendor/bin/pint` for PHP formatting
4. Create PR with description referencing the EPIC/story
5. At least one review approval required
6. Squash merge into `develop`

---

## Domain Context

### Core Business Concept
Treevest treats individual fruit trees as investable securities. Each tree has a price, expected ROI, harvest cycle, risk rating, and productive lifespan. Investors purchase stakes in trees; returns come from actual harvest yields sold at market prices.

### Key Domain Terms
See AGENTS.md Section 7 for the full glossary. Critical terms for code:

| Term | Meaning in Code |
|------|----------------|
| **Tree** | The investable unit. `Tree` model — belongs to a `FruitCrop` on a `Farm` |
| **Investment** | A financial stake. `Investment` model — links `User` (investor) to `Tree` |
| **Harvest** | A production event. `Harvest` model — records yield from a `Tree` for a cycle |
| **Payout** | Profit distribution. `Payout` model — links `Investment` to `Harvest` with calculated amount |
| **KYC** | Identity verification. Status field on `User` — must be `verified` before investing |
| **ROI** | Expected return percentage. Stored on `Tree` — used for marketplace display and projections |
| **Harvest Cycle** | Production frequency: annual, bi-annual, seasonal. Stored on `FruitCrop` or `Tree` |

### Status Enumerations (use PHP Enums)

| Domain | Values |
|--------|--------|
| `KycStatus` | `pending`, `submitted`, `verified`, `rejected` |
| `InvestmentStatus` | `pending_payment`, `active`, `matured`, `sold`, `cancelled` |
| `HarvestStatus` | `scheduled`, `in_progress`, `completed`, `failed` |
| `PayoutStatus` | `pending`, `processing`, `completed`, `failed` |
| `TreeLifecycleStage` | `seedling`, `growing`, `productive`, `declining`, `retired` |
| `FarmStatus` | `pending_approval`, `active`, `suspended`, `deactivated` |
| `UserRole` | `investor`, `farm_owner`, `admin` |

### Monetary Values
- **Store all monetary values as integers** (cents / smallest currency unit)
- **Display formatting happens in the frontend only** — backend never returns formatted currency strings
- Currency code stored alongside amount (e.g., `amount: 150000`, `currency: 'MYR'` = RM 1,500.00)
- Default currency: MYR (Malaysian Ringgit) — multi-currency support planned for later

---

## Important Constraints

### Regulatory & Legal
- KYC verification is mandatory before any investment transaction
- All financial transactions must generate immutable audit trail entries
- Risk disclosure must be presented before every investment purchase
- The platform may be classified as a securities offering in some jurisdictions — legal review is required before launch
- GDPR and local data protection law compliance is required
- Investment disclaimers and terms of service must be accepted

### Technical
- **Monolith only** — no microservices, no separate API layer for web (Inertia handles it)
- **Database for sessions, cache, queues** — no Redis or external queue services at launch
- **No mobile apps at launch** — web-only responsive application
- **SQLite for tests only** — production uses MySQL 8.x; be aware of SQLite limitations (no `JSON_CONTAINS`, different datetime handling)
- **Financial operations must use DB transactions** — wrap multi-table mutations in `DB::transaction()`
- **Idempotent payment processing** — guard against duplicate charges via transaction references

### Business Rules
- Each tree is an individual investable unit with its own price, ROI, and risk rating
- Minimum and maximum investment limits apply per tree
- Returns are tied to actual agricultural harvest cycles (not speculative)
- Harvest cycles vary: annual, bi-annual, or seasonal depending on crop type
- Trees have a finite productive lifespan (investment horizon)
- KYC must be verified before portfolio is updated with new investments
- Payment must be confirmed before portfolio is updated
- Harvest data must be confirmed by farm owner before profit distribution

### Performance
- Target < 200ms server response time for page loads
- Dashboard data may use cached/denormalized values for display performance
- Map-based farm discovery may need geospatial indexing for large datasets

---

## External Dependencies

| Service | Purpose | Integration Method | Priority |
|---------|---------|-------------------|----------|
| **Stripe** | Payment processing (investments, payouts) | Stripe PHP SDK + Webhooks | Critical |
| **Local Payment Methods** | Region-specific payment (FPX, GrabPay, etc.) | Via Stripe or dedicated gateway | High |
| **Google Maps / Mapbox** | Farm location display, map-based discovery | JavaScript SDK (frontend) | High |
| **Weather API** | Farm condition monitoring, weather alerts | REST API (backend, scheduled jobs) | Medium |
| **SMS Gateway** | OTP delivery, notification fallback | REST API (backend) | High |
| **Email Service** | Transactional email (confirmations, reports) | Laravel Mail (SMTP or API driver) | High |
| **OAuth Providers** | Social login (Google, Facebook, Apple) | Laravel Socialite | High |

### Webhook Handling
- Stripe webhooks for payment status updates (success, failure, refund)
- All webhooks must be verified (signature validation) and processed idempotently
- Webhook handlers should dispatch jobs for processing (not process inline)

### API Key Management
- All API keys and secrets in `.env` — never in code or version control
- Use Laravel's `config()` helper to access environment values — never `env()` directly outside config files

## Architecture Patterns

### Validation & Sanitization
- All incoming HTTP requests must be validated via FormRequest classes.
- BaseRequest (App\Http\Requests\BaseRequest) should be used as the parent class for all FormRequests to ensure common sanitization rules are applied.
- Custom validation rules (App\Rules) are preferred over closure-based validation for reusability.
- Use `NoXss` rule for all text inputs to prevent cross-site scripting.
- Use `NoSqlInjection` rule for search queries and filter parameters.
- Use `SafeFilename` rule for any file upload names or paths.
