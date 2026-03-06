# Tasks: expand-i18n-full-coverage

## Phase 1: Translation File Infrastructure (Namespace Expansion)

- [x] 1.1 Create `public/locales/en/admin.json` with all admin panel translation keys organized by page (dashboard, users, farms, investments, kyc, harvests, reports, articles, audit-logs, fraud-alerts)
- [x] 1.2 Create `public/locales/id/admin.json` with Bahasa Indonesia translations for all keys in `en/admin.json`
- [x] 1.3 Create `public/locales/en/farms.json` with farm listing, management, creation, and farm-owner dashboard translation keys
- [x] 1.4 Create `public/locales/id/farms.json` with Bahasa Indonesia translations for all keys in `en/farms.json`
- [x] 1.5 Create `public/locales/en/investments.json` with investment purchase, portfolio, payout, and marketplace translation keys
- [x] 1.6 Create `public/locales/id/investments.json` with Bahasa Indonesia translations for all keys in `en/investments.json`
- [x] 1.7 Create `public/locales/en/harvests.json` with harvest scheduling, yield recording, and harvest management translation keys
- [x] 1.8 Create `public/locales/id/harvests.json` with Bahasa Indonesia translations for all keys in `en/harvests.json`
- [x] 1.9 Create `public/locales/en/education.json` with education center and article page translation keys
- [x] 1.10 Create `public/locales/id/education.json` with Bahasa Indonesia translations for all keys in `en/education.json`
- [x] 1.11 Create `public/locales/en/auth.json` with auth page translation keys (login, register, forgot-password, reset-password, confirm-password, verify-email, 2FA)
- [x] 1.12 Create `public/locales/id/auth.json` with Bahasa Indonesia translations for all keys in `en/auth.json`
- [x] 1.13 Update `resources/js/i18n.ts` to register all 8 namespaces: `['translation', 'health', 'admin', 'farms', 'investments', 'harvests', 'education', 'auth']`
    - **Validate:** Namespace files load on demand when a page using them is visited

## Phase 2: Shared Component & Layout Translation

- [x] 2.1 Add `useTranslation()` to `Navbar.tsx` and replace all 6 hardcoded menu labels (Home, Farms, Education, Dashboard, Log in, Start Investing) with `t()` calls
    - **Validate:** Switch to `id` locale → all Navbar labels render in Bahasa Indonesia
- [x] 2.2 Add `useTranslation()` to `AuthenticatedLayout.tsx` and translate any user-visible strings (nav items, dropdown labels, profile links)
- [x] 2.3 Add `useTranslation()` to `GuestLayout.tsx` and translate any user-visible strings
- [x] 2.4 Translate status badge components — map all enum status values to translation keys (InvestmentStatus, HarvestStatus, KycStatus, FarmStatus, PayoutStatus, TreeLifecycleStage)
- [x] 2.5 Translate pagination components — "Previous", "Next", "Page X of Y", "Showing X to Y of Z results"
- [x] 2.6 Translate modal/dialog components — confirmation prompts, delete confirmations
- [x] 2.7 Translate search bar and filter dropdown placeholder text
    - **Validate:** Navigate through pages with ID locale — all shared components display Bahasa Indonesia text

## Phase 3: Page Component Translation — Auth Pages

- [x] 3.1 Translate `Auth/Login.tsx` — form labels, buttons, links, remember-me checkbox
- [x] 3.2 Translate `Auth/Register.tsx` — all registration form fields and CTAs
- [x] 3.3 Translate `Auth/ForgotPassword.tsx` — instructions and form
- [x] 3.4 Translate `Auth/ResetPassword.tsx` — form labels and buttons
- [x] 3.5 Translate `Auth/ConfirmPassword.tsx` — prompt text and form
- [x] 3.6 Translate `Auth/VerifyEmail.tsx` — verification message and resend button
- [x] 3.7 Translate `Auth/TwoFactorAuthentication.tsx` — 2FA setup and verification strings
    - **Validate:** Complete login/register flow in `id` locale — zero English strings visible

## Phase 4: Page Component Translation — Investor Pages

- [x] 4.1 Translate `Dashboard.tsx` (investor) — all dashboard widgets and labels
- [x] 4.2 Translate `Investments/Index.tsx` — marketplace listing page
- [x] 4.3 Translate `Investments/Show.tsx` — investment detail page
- [x] 4.4 Translate `Investments/Portfolio.tsx` — portfolio summary and holdings
- [x] 4.5 Translate `Investments/Purchase.tsx` — purchase flow
- [x] 4.6 Translate `Trees/Index.tsx` and `Trees/Show.tsx` — tree marketplace
- [x] 4.7 Translate `Farms/Index.tsx` and `Farms/Show.tsx` — farm listing and detail (public)
- [x] 4.8 Translate `Welcome.tsx` — landing page hero, features, CTAs
- [x] 4.9 Translate `Search/Index.tsx` — search results page
- [x] 4.10 Translate `Settings/Notifications.tsx` and profile pages
    - **Validate:** Complete investor flow (browse → purchase → portfolio) in `id` locale

## Phase 5: Page Component Translation — Farm Owner Pages

- [x] 5.1 Translate `FarmOwner/Dashboard.tsx` — farm owner dashboard
- [x] 5.2 Translate `FarmOwner/Farms/` pages — farm CRUD, crop management
- [x] 5.3 Translate `FarmOwner/Harvests/` pages — harvest scheduling, yield recording
- [x] 5.4 Translate `FarmOwner/HealthUpdates/Index.tsx` — verify existing translations, expand coverage
- [x] 5.5 Translate `FarmOwner/Trees/` pages — tree management
    - **Validate:** Complete farm owner flow (dashboard → manage farm → schedule harvest) in `id` locale

## Phase 6: Page Component Translation — Admin Pages

- [ ] 6.1 Translate `Admin/Dashboard.tsx` — admin overview metrics
- [ ] 6.2 Translate `Admin/Users/Index.tsx` and `Admin/Users/Show.tsx` — user management
- [ ] 6.3 Translate `Admin/Farms/Index.tsx` and `Admin/Farms/Show.tsx` — farm oversight
- [ ] 6.4 Translate `Admin/Investments/Index.tsx` — investment oversight
- [ ] 6.5 Translate `Admin/Articles/Index.tsx`, `Create.tsx`, and `Edit.tsx` — article management
- [ ] 6.6 Translate `Admin/AuditLogs/Index.tsx` and `Admin/AuditLogs/Show.tsx` — audit log viewer
- [ ] 6.7 Translate `Admin/FraudAlerts.tsx` — fraud alert page
- [ ] 6.8 Translate remaining admin pages (KYC review, reports, etc.)
    - **Validate:** Navigate all admin pages in `id` locale — zero English strings

## Phase 7: Page Component Translation — Education Pages

- [ ] 7.1 Translate `Education/Index.tsx` — education center landing
- [ ] 7.2 Translate education article pages and encyclopedia components
    - **Validate:** Browse education center in `id` locale — all chrome and navigation in Bahasa Indonesia

## Phase 8: Server-Side Translation Expansion

- [ ] 8.1 Create `lang/en/investments.php` and `lang/id/investments.php` — investment-related server messages (purchase confirmation, limit exceeded, payment status)
- [ ] 8.2 Create `lang/en/farms.php` and `lang/id/farms.php` — farm management server messages (approval, rejection, status changes)
- [ ] 8.3 Create `lang/en/admin.php` and `lang/id/admin.php` — admin action messages
- [ ] 8.4 Create `lang/en/harvests.php` and `lang/id/harvests.php` — harvest-related server messages
- [ ] 8.5 Audit all controllers for hardcoded flash messages → replace with `__('domain.key')` calls
- [ ] 8.6 Expand `lang/{en,id}/validation.php` with custom validation messages for all FormRequests
    - **Validate:** Trigger flash messages and validation errors in `id` locale → all in Bahasa Indonesia

## Phase 9: LanguageSwitcher Enhancement

- [ ] 9.1 Add flag icons/badges (🇬🇧 / 🇮🇩) to `LanguageSwitcher.tsx` dropdown items
- [ ] 9.2 Update `LanguageSwitcher.tsx` to read full locale metadata from shared props (flags, native names)
- [ ] 9.3 Add visual distinction for active locale (checkmark, bold, highlight)
- [ ] 9.4 Hide `LanguageSwitcher` when only one locale is configured
    - **Validate:** LanguageSwitcher shows flags, highlights active locale, and dynamically renders from config

## Phase 10: Config-Driven Multi-Locale Architecture

- [ ] 10.1 Create `config/locales.php` with centralized locale configuration (supported locales with metadata, default, fallback)
- [ ] 10.2 Update `SetLocale` middleware to validate against `config('locales.supported')`
- [ ] 10.3 Update `HandleInertiaRequests` to share full locale metadata (flag, name, native_name, dir) from `config/locales.php`
- [ ] 10.4 Update `UpdateLocaleRequest` to validate locale against `config('locales.supported')` keys
- [ ] 10.5 Create Artisan command `locale:scaffold {locale}`:
    - Creates `public/locales/{locale}/*.json` stubs (matching EN namespace structure with empty values)
    - Creates `lang/{locale}/*.php` stubs (matching EN file structure with empty values)
    - Outputs next-steps checklist
- [ ] 10.6 Create `docs/adding-new-locale.md` developer guide
    - **Validate:** Run `php artisan locale:scaffold ms` → directory structure created correctly
    - **Validate:** Add a test locale to `config/locales.php` → appears in LanguageSwitcher automatically

## Phase 11: UGC Translation Infrastructure

- [ ] 11.1 Create migration for `content_translations` table (polymorphic, with status/source/reviewer columns)
- [ ] 11.2 Create `ContentTranslation` Eloquent model with relationships and scopes
- [ ] 11.3 Create `Translatable` trait (`app/Concerns/Translatable.php`) with methods: `translations()`, `getTranslation()`, `setTranslation()`, `translatedAttribute()`
- [ ] 11.4 Apply `Translatable` trait to `Farm` model with `$translatable = ['description']`
- [ ] 11.5 Apply `Translatable` trait to `Article` model with `$translatable = ['title', 'content']`
- [ ] 11.6 Update `FarmController@show` and `ArticleController@show` to pass translated content to Inertia pages via `translatedAttribute()`
- [ ] 11.7 Add model event listener: when a translatable field is updated on the original model, mark existing translations as `under_review`
    - **Validate:** Create a farm with description → add Indonesian translation → verify it appears when viewing farm in `id` locale

## Phase 12: Admin Translation Management UI

- [ ] 12.1 Create `Admin/Translations/Index.tsx` — translation coverage dashboard showing % complete per content type per locale
- [ ] 12.2 Create `Admin/Translations/Edit.tsx` — side-by-side translation editor (original left, editable translation right)
- [ ] 12.3 Create `TranslationController.php` with `index()`, `edit()`, `update()` methods
- [ ] 12.4 Add "Translations" menu item to admin sidebar navigation
- [ ] 12.5 Add routes: `GET /admin/translations`, `GET /admin/translations/{type}/{id}/edit`, `PATCH /admin/translations/{id}`
    - **Validate:** Admin can view translation coverage → open a farm → edit its Indonesian description → save

## Phase 13: Machine Translation Service

- [ ] 13.1 Create `TranslationServiceInterface` in `app/Services/Translation/`
- [ ] 13.2 Create `GoogleTranslationService` implementing the interface using `google/cloud-translate` SDK
- [ ] 13.3 Add `translation_service` config section to `config/locales.php` (driver, api_key, rate_limit)
- [ ] 13.4 Register service binding in `AppServiceProvider` (interface → implementation based on config driver)
- [ ] 13.5 Implement rate limiting (max requests per minute via config)
- [ ] 13.6 Implement character count logging for cost tracking
    - **Validate:** Call `TranslationService::translate('Hello', 'en', 'id')` → returns Indonesian translation

## Phase 14: Machine Translation CLI & UGC Integration

- [ ] 14.1 Create Artisan command `translate:generate {source} {target}` for static JSON namespace files
    - Reads source locale JSON, identifies missing keys in target, calls translation API, outputs `.draft` file
- [ ] 14.2 Add `--namespace` flag to limit scope to a single namespace
- [ ] 14.3 Add `--php` flag to process `lang/` PHP files
- [ ] 14.4 Add "Generate Draft Translation" button in admin translation editor that calls `TranslationService` for UGC fields
- [ ] 14.5 Create `content_translations` entries with `status = 'machine_translated'`, `source = 'machine'`
    - **Validate:** Run `php artisan translate:generate en id --namespace=farms` → `.draft` file generated with translations

## Phase 15: Translation Review Workflow

- [ ] 15.1 Create `Admin/Translations/Review.tsx` — review queue listing `machine_translated` and `under_review` entries
- [ ] 15.2 Add filtering by content type, locale, status, and date range
- [ ] 15.3 Add side-by-side review view: original → machine draft → editable final
- [ ] 15.4 Implement approve, edit & approve, and reject actions via API endpoints
- [ ] 15.5 Implement batch approve for multiple selected entries
- [ ] 15.6 Add provenance badge ("Machine Generated" / "Human Written") to review UI
- [ ] 15.7 Add translation API usage metrics to translation dashboard (characters/month, estimated cost)
    - **Validate:** Generate machine translation → appears in review queue → admin approves → translation visible to users

## Phase 16: Testing & Validation

- [ ] 16.1 Add feature tests: critical pages (Login, Register, Dashboard, Farms Index, Investments Show) render successfully with `locale = 'id'`
- [ ] 16.2 Add translation key parity CI script: compare EN and ID JSON files for key completeness
- [ ] 16.3 Update existing `SetLocaleMiddlewareTest`, `ProfileLocaleTest`, and `LocaleMiddlewareTest` if needed
- [ ] 16.4 Add unit tests for `Translatable` trait (getTranslation, setTranslation, translatedAttribute, fallback behavior)
- [ ] 16.5 Add unit tests for `TranslationService` (translate, rate limiting, error handling)
- [ ] 16.6 Add feature tests for admin translation UI CRUD operations
- [ ] 16.7 Manual QA: complete investor flow (register → KYC → browse farms → purchase → portfolio → payout history) in `id` locale
- [ ] 16.8 Manual QA: complete farm owner flow (dashboard → manage farm → schedule harvest → record yield) in `id` locale
- [ ] 16.9 Manual QA: complete admin flow (dashboard → users → farms → investments → translations) in `id` locale
    - **Validate:** Zero `i18next::translator missingKey` warnings in console across all QA flows

## Dependencies Between Phases

- Phases 1-8 (static string translation) are **parallelizable** — different developers can work on different domains simultaneously
- Phase 9 (LanguageSwitcher) depends on Phase 10 (config-driven architecture) for full dynamic rendering
- Phase 11 (UGC infrastructure) must complete before Phase 12 (admin UI)
- Phase 13 (translation service) must complete before Phases 14-15 (CLI & review workflow)
- Phase 16 (testing) runs alongside other phases but the full QA pass (16.7-16.9) requires all prior phases
