# i18n-full-string-coverage Specification

## Purpose

Ensure every user-facing string across all 102 page components, 57 shared components, 3 layout components, and server-side PHP responses is externalized to translation files and rendered via `t()` (React) or `__()` (PHP), with complete EN and ID translations.

## ADDED Requirements

### Requirement: Domain-Specific Translation Namespace Files

The system SHALL organize translation keys into domain-specific JSON namespace files under `public/locales/{locale}/`, lazy-loaded by `i18next-resources-to-backend`.

#### Scenario: Namespace files exist for all domains

- **WHEN** developer inspects `public/locales/en/`
- **THEN** the following namespace JSON files exist: `translation.json`, `health.json`, `admin.json`, `farms.json`, `investments.json`, `harvests.json`, `education.json`, `auth.json`
- **AND** corresponding files exist under `public/locales/id/`
- **AND** all key sets are identical between EN and ID files for each namespace

#### Scenario: i18n config registers all namespaces

- **WHEN** developer inspects `resources/js/i18n.ts`
- **THEN** the `ns` array includes all 8 namespaces
- **AND** `defaultNS` is set to `'translation'`
- **AND** only the `translation` namespace is pre-loaded; all others are lazy-loaded on demand

#### Scenario: Namespace key count is manageable

- **WHEN** developer inspects any single namespace JSON file
- **THEN** it contains no more than ~150 keys (to keep file size reasonable for lazy-loading)
- **AND** keys follow the flat dot-separated convention: `"section.label": "value"`

---

### Requirement: Navbar and Layout Translation

The system SHALL translate all navigation labels, layout-level strings, and common UI chrome in `Navbar.tsx`, `GuestLayout.tsx`, `AuthenticatedLayout.tsx`, and `AppLayout.tsx`.

#### Scenario: Navbar labels are translated

- **WHEN** a user views any page with the Navbar in `id` locale
- **THEN** "Home" renders as the Indonesian translation
- **AND** "Farms" renders as the Indonesian translation
- **AND** "Education" renders as the Indonesian translation
- **AND** "Dashboard" renders as the Indonesian translation
- **AND** "Log in" renders as the Indonesian translation
- **AND** "Start Investing" renders as the Indonesian translation

#### Scenario: Navbar uses useTranslation hook

- **WHEN** developer inspects `resources/js/Components/Navbar.tsx`
- **THEN** the component imports and uses the `useTranslation()` hook
- **AND** every user-visible text string uses `t('key')` instead of a hardcoded English string

#### Scenario: Layout components use translation

- **WHEN** developer inspects `AuthenticatedLayout.tsx` and `GuestLayout.tsx`
- **THEN** any user-facing strings use `t()` calls from the `useTranslation()` hook

---

### Requirement: Auth Page Translation

The system SHALL translate all authentication pages (Login, Register, ForgotPassword, ResetPassword, ConfirmPassword, VerifyEmail, TwoFactorAuthentication) with the `auth` namespace.

#### Scenario: Login page renders in Bahasa Indonesia

- **WHEN** a user visits the login page with `locale = 'id'`
- **THEN** all form labels, buttons, links, and informational text are rendered in Bahasa Indonesia
- **AND** validation error messages from the server are also in Bahasa Indonesia

#### Scenario: Registration page renders in Bahasa Indonesia

- **WHEN** a user visits the registration page with `locale = 'id'`
- **THEN** all form fields, terms acceptance text, and CTAs are rendered in Bahasa Indonesia

#### Scenario: Auth pages use auth namespace

- **WHEN** developer inspects any auth page component
- **THEN** the component uses `useTranslation(['auth', 'translation'])` to load the auth-specific and common namespaces

---

### Requirement: Admin Page Translation

The system SHALL translate all Admin panel pages (Dashboard, Users, Farms, Investments, KYC, Harvests, Reports, Articles, AuditLogs, FraudAlerts) with the `admin` namespace.

#### Scenario: Admin dashboard renders in Bahasa Indonesia

- **WHEN** an admin user views the admin dashboard with `locale = 'id'`
- **THEN** all metric cards, labels, headings, and action buttons are rendered in Bahasa Indonesia

#### Scenario: Admin table pages render in Bahasa Indonesia

- **WHEN** an admin views any admin list page (Users, Farms, Investments) with `locale = 'id'`
- **THEN** table headers, status badges, filter labels, pagination controls, and action buttons are all in Bahasa Indonesia

#### Scenario: Admin pages use admin namespace

- **WHEN** developer inspects any Admin page component
- **THEN** the component uses `useTranslation(['admin', 'translation'])`

---

### Requirement: Farm Owner Page Translation

The system SHALL translate all Farm Owner pages (Dashboard, Crops, Harvests, Health Updates, Trees, Farm Management) across `farms` and `harvests` namespaces.

#### Scenario: Farm owner dashboard renders in Bahasa Indonesia

- **WHEN** a farm owner views their dashboard with `locale = 'id'`
- **THEN** all dashboard widgets, labels, and navigation are in Bahasa Indonesia

#### Scenario: Farm management pages render in Bahasa Indonesia

- **WHEN** a farm owner views farm creation, editing, or crop management pages with `locale = 'id'`
- **THEN** all form labels, buttons, help text, and status indicators are in Bahasa Indonesia

---

### Requirement: Investor Page Translation

The system SHALL translate all Investor pages (Dashboard, Portfolio, Investments, Payouts, Tree Marketplace) with the `investments` namespace.

#### Scenario: Investor dashboard renders in Bahasa Indonesia

- **WHEN** an investor views their dashboard with `locale = 'id'`
- **THEN** all portfolio summaries, recent activity, and performance metrics are in Bahasa Indonesia

#### Scenario: Investment purchase flow renders in Bahasa Indonesia

- **WHEN** an investor navigates the tree marketplace, views tree details, and initiates a purchase with `locale = 'id'`
- **THEN** every step (listing, detail, confirmation, success) is fully in Bahasa Indonesia

---

### Requirement: Education and Content Page Translation

The system SHALL translate all Education/Encyclopedia pages with the `education` namespace.

#### Scenario: Education center renders in Bahasa Indonesia

- **WHEN** a user visits the education center landing page with `locale = 'id'`
- **THEN** all section headings, article summaries, CTAs, and navigation are in Bahasa Indonesia

---

### Requirement: Shared Component Translation

The system SHALL translate all reusable shared components that display user-facing text, including status badges, pagination, modal dialogs, search bars, filter dropdowns, tooltips, and breadcrumbs.

#### Scenario: Status badges render in Bahasa Indonesia

- **WHEN** any status badge component (InvestmentStatus, HarvestStatus, KycStatus, etc.) renders with `locale = 'id'`
- **THEN** the status label text is in Bahasa Indonesia (e.g., "active" → "aktif", "pending" → "menunggu")

#### Scenario: Pagination controls render in Bahasa Indonesia

- **WHEN** any paginated list renders with `locale = 'id'`
- **THEN** "Previous", "Next", "Page X of Y", and "Showing X to Y of Z results" are in Bahasa Indonesia

#### Scenario: Confirmation dialogs render in Bahasa Indonesia

- **WHEN** a confirmation dialog appears with `locale = 'id'`
- **THEN** the dialog title, message, confirm button, and cancel button are all in Bahasa Indonesia

---

### Requirement: Server-Side Domain Translation Files

The system SHALL expand PHP `lang/` files with domain-specific translation files to cover all server-rendered strings.

#### Scenario: Domain-specific PHP lang files exist

- **WHEN** developer inspects `lang/en/`
- **THEN** the following files exist: `messages.php`, `validation.php`, `notifications.php`, `investments.php`, `farms.php`, `admin.php`, `harvests.php`
- **AND** corresponding files exist under `lang/id/` with matching keys

#### Scenario: Flash messages are translated

- **WHEN** a server action (e.g., investment purchase, farm approval) triggers a flash/toast message with `locale = 'id'`
- **THEN** the flash message text is in Bahasa Indonesia

#### Scenario: Validation error messages are translated per domain

- **WHEN** a form submission fails validation with `locale = 'id'`
- **THEN** all validation error messages including custom domain-specific messages (e.g., "Investment amount exceeds limit") are in Bahasa Indonesia

---

### Requirement: Translation Coverage Testing

The system SHALL include automated tests that verify critical pages render correctly in both locales and that no missing translation keys exist.

#### Scenario: Critical pages render with id locale

- **WHEN** feature tests request key pages (Login, Register, Dashboard, Farms Index, Investment Show) with `locale = 'id'` via `SetLocale` middleware
- **THEN** each page returns a 200 response
- **AND** the response does not contain known English-only marker strings (configurable list)

#### Scenario: Translation key parity check

- **WHEN** a CI script compares keys in `public/locales/en/*.json` against `public/locales/id/*.json`
- **THEN** every key present in `en` is also present in `id` for each namespace file
- **AND** no `id` file has keys absent from the `en` file

#### Scenario: No missing key warnings in production

- **WHEN** navigation through all major user flows with `locale = 'id'`
- **THEN** no `i18next::translator missingKey` warnings appear in the console
