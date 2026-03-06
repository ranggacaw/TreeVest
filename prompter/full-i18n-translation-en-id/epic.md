# 🧠 Epic: Full English ↔ Bahasa Indonesia Translation Coverage

## 🎯 Epic Goal

We need to **achieve full i18n translation coverage across all pages and components** in order for **all users (investors, farm owners, and admins)** to **use the platform entirely in either English or Bahasa Indonesia with seamless language switching**.

## 🚀 Definition of Done

- All hardcoded English strings across 100+ page components and shared components are replaced with `useTranslation()` / `t()` calls
- All translation keys are present in both `en` and `id` client-side JSON files (`public/locales/{en,id}/*.json`)
- All server-side translation keys are present in both `lang/en/` and `lang/id/` PHP files
- The `LanguageSwitcher` component works correctly on both `GuestLayout` and `AuthenticatedLayout`
- Language preference persists for authenticated users (via `PATCH /profile/locale`) and guests (via session)
- The application renders correctly in both locales with no visible English strings when `id` is selected
- The `Navbar.tsx` menu labels (Home, Farms, Education, Dashboard, Log in, Start Investing) are translated
- Date and number formatting respects the active locale where applicable
- No regressions in existing functionality — all existing tests pass
- New translation coverage tests verify key pages render correctly in both locales
- The i18n architecture supports adding new languages beyond `en` and `id` with minimal effort (config-driven)
- User-generated content (farm descriptions, article content) can be stored and displayed in multiple languages
- A machine translation pipeline is in place to generate draft translations, with a human-review workflow before publishing

## 📌 High-Level Scope (Included)

### 1. Client-Side Translation Files (react-i18next)

- Audit all 100+ TSX page components in `resources/js/Pages/` for hardcoded strings
- Expand `public/locales/en/translation.json` with all missing keys (organized by namespace/domain)
- Create complete `public/locales/id/translation.json` translations for all new keys
- Add new namespace JSON files as needed (e.g., `admin.json`, `investments.json`, `farms.json`, `auth.json`)
- Update `i18n.ts` config to include new namespaces

### 2. Component Translation Integration

- Integrate `useTranslation()` hook into all page components that have hardcoded English text
- Translate `Navbar.tsx` menu items (Home, Farms, Education, Dashboard, Log in, Start Investing)
- Translate layout-level strings in `AuthenticatedLayout.tsx`, `GuestLayout.tsx`, and `AppLayout.tsx`
- Translate all form labels, buttons, status labels, table headers, and placeholder text
- Translate error messages and success notifications displayed to users
- Translate empty states, loading states, and confirmation dialogs

### 3. Server-Side Translation Files (Laravel `lang/`)

- Expand `lang/en/messages.php` and `lang/id/messages.php` with additional keys
- Add domain-specific translation files: `lang/{en,id}/investments.php`, `lang/{en,id}/farms.php`, `lang/{en,id}/admin.php`, etc.
- Ensure server-rendered flash messages and validation errors use `__()` / `trans()` helper with correct keys
- Update `lang/{en,id}/validation.php` with any custom validation messages

### 4. LanguageSwitcher UX Enhancement

- Ensure `LanguageSwitcher` visually indicates the currently active language
- Add flag icons or locale abbreviation badges (🇬🇧 EN / 🇮🇩 ID) for quicker visual identification
- Ensure language switching works for both authenticated and guest users
- Preserve current page state/scroll position after language switch (already implemented via Inertia `preserveState`)

### 5. Admin & Role-Specific Pages

- Translate all Admin panel pages (Dashboard, Users, Farms, Investments, KYC, Harvests, Reports, etc.)
- Translate all Farm Owner pages (Dashboard, Crops, Harvests, Health Updates, Trees, etc.)
- Translate all Investor pages (Dashboard, Portfolio, Investments, Payouts, etc.)
- Translate education and encyclopedia content pages

### 6. Shared Components Translation

- Translate pagination controls, search bars, filter dropdowns
- Translate modal dialogs, confirmation prompts, tooltips
- Translate status badges (e.g., InvestmentStatus, HarvestStatus, KycStatus, etc.)
- Translate breadcrumbs and page headers

### 7. Testing & Validation

- Add feature tests verifying key pages render correctly with `locale=id`
- Update existing `SetLocaleMiddlewareTest`, `ProfileLocaleTest`, and `LocaleMiddlewareTest` if needed
- Manual QA pass through all major user flows in both `en` and `id`
- Verify no missing translation keys (i18next missing key handler / warnings)

### 8. Multi-Language Architecture (Beyond EN/ID)

- Refactor the i18n config (`i18n.ts`) to be fully config-driven, making additional locales a simple configuration addition
- Add a `supportedLocales` configuration array in the backend (`config/app.php` or dedicated `config/locales.php`) that drives all locale-related logic
- Update `LanguageSwitcher` component to dynamically render all configured languages (not hardcoded to EN/ID)
- Update `SetLocale` middleware and `UpdateLocaleRequest` validation to reference the config-driven locale list
- Ensure translation file structure (`public/locales/{locale}/`, `lang/{locale}/`) is documented and scaffoldable for new locales
- Create a CLI Artisan command (`php artisan locale:scaffold {locale}`) to generate empty translation file stubs for a new language
- Update `users.locale` column validation to accept any configured locale
- Document the process for adding a new language in a developer guide (`docs/adding-new-locale.md`)

### 9. User-Generated Content (UGC) Translation

- Add a `translatable` trait/concern for Eloquent models that have user-generated text content
- Implement a `translations` JSON column (or a polymorphic `content_translations` table) for translatable fields:
    - `farms.description` — farm listing descriptions
    - `articles.title`, `articles.content` — education/news articles entered by admins
    - `fruit_crops.description` — crop descriptions (if user-editable)
- Build an admin UI for managing content translations:
    - Side-by-side editor showing original content and translation for each supported locale
    - Visual indicator for content that has not yet been translated
    - Bulk translation status overview (% translated per locale per content type)
- Update frontend display logic to serve the correct translation based on the user's active locale, falling back to the default language if a translation is missing
- Update API/controller responses to include the appropriate translated content

### 10. Machine Translation with Human Review Workflow

- Integrate a machine translation API (e.g., Google Cloud Translation, DeepL, or LibreTranslate) as a **draft generation** tool
- Implement a translation workflow with the following statuses: `draft` → `machine_translated` → `under_review` → `approved`
- Admin UI for the translation review pipeline:
    - Queue of machine-translated content awaiting human review
    - Side-by-side view: original → machine draft → editable final translation
    - Approve / edit / reject actions per translation entry
    - Batch approve capability for high-confidence translations
- Add a "Generate Draft Translation" button in the UGC translation admin UI (Section 9) that calls the machine translation API
- For static UI strings: provide a CLI/script (`php artisan translate:generate {source_locale} {target_locale}`) to machine-translate missing keys and output them as draft JSON/PHP files for human review
- **All machine-translated content must be flagged as `needs_review`** and must not be displayed to end users until approved by a human reviewer
- Track translation provenance (machine vs. human) for quality auditing
- Rate-limit API calls to the translation service to control costs

## ❌ Out of Scope

- RTL (right-to-left) layout support
- Locale-based currency display (MYR format is consistent across locales)
- Mobile app localization (no native apps in current phase)
- Translating PDF/report exports

## 📁 Deliverables

- Updated `public/locales/en/*.json` — complete English translation files (client-side)
- Updated `public/locales/id/*.json` — complete Bahasa Indonesia translation files (client-side)
- Updated `lang/en/*.php` — complete English translation files (server-side)
- Updated `lang/id/*.php` — complete Bahasa Indonesia translation files (server-side)
- Updated `resources/js/i18n.ts` — config-driven, with all namespaces registered and dynamic locale support
- Updated 100+ TSX components with `useTranslation()` integration
- Updated `Navbar.tsx` with translated menu labels
- Updated `LanguageSwitcher.tsx` — dynamic, supporting any number of configured locales with UX improvements (flags/badges)
- Updated layouts (`GuestLayout`, `AuthenticatedLayout`, `AppLayout`) with translated strings
- New/updated tests for locale-specific rendering
- New `config/locales.php` — centralized locale configuration
- New Artisan command `locale:scaffold` — generates translation file stubs for new languages
- New `Translatable` trait — for Eloquent models with multi-language content
- New `content_translations` database migration and model — storing UGC translations
- New admin translation management UI — side-by-side editor, translation status dashboard
- New machine translation service integration — draft generation via API
- New Artisan command `translate:generate` — batch machine-translate static string files for human review
- New `docs/adding-new-locale.md` — developer guide for adding languages
- New translation review workflow — admin queue with approve/edit/reject actions

## 🧩 Dependencies

- **react-i18next** — already installed and configured in `resources/js/i18n.ts`
- **i18next-resources-to-backend** — already configured for lazy-loading translation JSONs
- **Laravel `SetLocale` middleware** — already implemented in `app/Http/Middleware/SetLocale.php`
- **`HandleInertiaRequests` middleware** — already shares `locale` and `availableLocales` to frontend
- **User `locale` column** — already exists on `users` table (used for persistent preference)
- **`UpdateLocaleRequest` FormRequest** — already validates locale input
- **`ProfileLocaleTest`, `SetLocaleMiddlewareTest`, `LocaleMiddlewareTest`** — existing test coverage to maintain
- **Machine Translation API** (new) — Google Cloud Translation API, DeepL API, or LibreTranslate (self-hosted) — requires API key and billing setup
- **`spatie/laravel-translatable`** (recommended, new) — or custom `Translatable` trait for Eloquent model content translations
- **Database migration** (new) — for `content_translations` table or JSON columns on translatable models

## ⚠️ Risks / Assumptions

- **Translation volume**: With 100+ page components, the translation effort is significant — phased rollout (critical user flows first, admin pages second) is recommended
- **Translation quality**: Bahasa Indonesia translations must be natural and context-appropriate — machine translations are only drafts and must be human-reviewed before publishing
- **Namespace explosion**: Too many JSON namespace files can increase network requests — group related translations to keep the namespace count manageable (recommended: max 6-8 namespaces)
- **Dynamic content**: Some page titles and labels may be computed from database values (e.g., farm names, tree species) — UGC translation covers explicitly listed fields only
- **Performance**: Lazy-loading translation files (already configured with `i18next-resources-to-backend`) mitigates bundle size impact
- **Concurrent development**: Other features being actively developed must also follow the i18n pattern going forward to avoid regression
- **Machine translation API costs**: Translation API usage incurs per-character costs — rate limiting and caching are required to control expenses
- **Machine translation accuracy**: Automated translations may miss domain-specific terminology (agriculture, investment terms) — a glossary/term-base should be maintained for consistent translations
- **UGC translation maintenance**: When original content is updated, the corresponding translations must be flagged as stale and re-reviewed
- **Multi-language scaling**: Adding many languages increases the translation maintenance burden — recommend starting with a 3rd language pilot (e.g., Malay or Chinese) before scaling further
- **Review bottleneck**: Human review of machine translations requires dedicated reviewer capacity — consider assigning translation review roles to specific admin users

## 🎯 Success Metrics

- **100% translation coverage**: Zero hardcoded English strings visible when `id` locale is active on all implemented pages
- **Language switcher adoption**: Tracked via locale distribution in user preferences (target: measurable `id` locale usage)
- **Zero missing key warnings**: No `i18next::translator missingKey` console warnings in production
- **Test coverage**: All critical user flows (auth, investment, farm management, admin) have locale-aware tests
- **Page load performance**: No measurable increase in page load time due to translation file loading (< 50ms overhead)
- **User satisfaction**: Bahasa Indonesia users can complete all key workflows without encountering untranslated content
- **New locale onboarding time**: A new language can be scaffolded and have draft translations generated within 1 hour
- **UGC translation coverage**: ≥80% of farm descriptions and articles have approved translations within 2 weeks of content creation
- **Machine translation draft quality**: ≥70% of machine-generated drafts require only minor edits before approval
- **Review turnaround**: Machine-translated content is reviewed and approved/edited within 48 hours of generation
- **Translation freshness**: ≤5% of translated UGC entries are flagged as stale (original updated, translation not re-reviewed)
