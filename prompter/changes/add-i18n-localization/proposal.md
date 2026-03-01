# Change: Add Internationalization (i18n) and Localization

## Why
Treevest is targeting multi-region expansion starting with Southeast Asia. EPIC-017 requires multi-language support and locale-aware formatting (currency, dates, numbers) so the platform can serve English- and Indonesian-speaking markets at launch.

This change moves "Multi-language / multi-region expansion" from the project's Non-Goals list into active scope, establishing the full i18n foundation that all future features will build on.

## What Changes

### New capability
- **`i18n-localization`** — New spec covering the entire i18n/l10n feature set:
  - Laravel backend locale management (middleware, `lang/` files, `__()` helper)
  - React frontend translations via `react-i18next` loaded from Inertia shared props
  - Language switcher UI component persisting preference to the DB
  - Locale-aware date/time formatting using `Intl.DateTimeFormat`
  - Locale-aware number and currency formatting using `Intl.NumberFormat`
  - RTL layout preparation via Tailwind CSS `rtl:` variant (structural only)
  - Browser/device locale auto-detection as default

### Modified specs
- **`user-profile-management`** — MODIFIED: "Update Basic Profile Information" to include locale/language preference as a saveable profile field (`locale` column on `users` table)
- **`application-foundation`** — MODIFIED: "Environment Configuration" to document new i18n-related env variables (`APP_LOCALE`, `APP_FALLBACK_LOCALE`, `APP_AVAILABLE_LOCALES`); ADDED: "React i18n Setup" requirement documenting `react-i18next` integration
- **`notifications`** — MODIFIED: "Multi-Channel Notification Dispatch" to use the user's stored locale when rendering server-side notification content

## Impact

- **Affected specs:** `i18n-localization` (new), `user-profile-management`, `application-foundation`, `notifications`
- **Affected code:**
  - `users` table — add `locale` column (migration)
  - `app/Http/Middleware/SetLocale.php` — new middleware
  - `app/Http/Middleware/HandleInertiaRequests.php` — share `locale`, `availableLocales` props
  - `lang/en/` and `lang/id/` — translation files
  - `resources/js/i18n.ts` — react-i18next bootstrap
  - `resources/js/Components/LanguageSwitcher.tsx` — UI component
  - `tailwind.config.js` — enable RTL variant (no visual change at this stage)
  - `prompter/project.md` — remove "Multi-language / multi-region expansion" from Non-Goals
- **No breaking changes** — existing text and formatting remain unchanged for English users; language defaults to `en` when no preference is set
- **New npm dependency:** `react-i18next`, `i18next`, `i18next-resources-to-backend`
- **No new Composer packages** — Laravel's built-in `Lang` and `__()` helpers are used

## Out of Scope (this change)
- Content translation of Articles / Encyclopedia entries (business responsibility)
- Currency conversion rates (only display formatting; amounts remain stored in MYR cents)
- Region-specific payment gateways (EPIC-010)
- Region-specific KYC rules (EPIC-002)
- Multi-region database deployment
- Full RTL UI testing and validation (structural preparation only)
