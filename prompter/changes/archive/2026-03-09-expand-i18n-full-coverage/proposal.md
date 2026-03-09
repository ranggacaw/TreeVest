# Change: Expand i18n to Full EN↔ID Translation Coverage

## Why

The existing `i18n-localization` spec established the translation infrastructure (middleware, `react-i18next`, `LanguageSwitcher`, `lang/` files) but only 1 out of 102 page components currently uses `useTranslation()`. All other pages and most shared components still render hardcoded English strings. Switching to Bahasa Indonesia via the `LanguageSwitcher` has no visible effect on 99% of the application.

In addition to filling the gap in static string translation, the platform needs:

1. **Config-driven multi-locale architecture** — the current `LanguageSwitcher` and `i18n.ts` are softcoded for EN/ID but the infrastructure isn't designed for easy addition of new languages.
2. **User-generated content (UGC) translation** — farm descriptions and article content are entered by admins/owners and need to be translatable so Bahasa Indonesia users see localized content.
3. **Machine translation pipeline** — given the volume of UGC and 100+ pages of static strings, a machine translation draft + human review workflow is needed to make the translation effort practical.

This change delivers on Epic "Full English ↔ Bahasa Indonesia Translation Coverage" (sections 1–10).

## What Changes

### New capabilities

- **`i18n-full-string-coverage`** — New spec covering the systematic replacement of all hardcoded English strings across 101 untranslated page components, 57 shared/layout components, and server-side PHP strings with `t()` / `__()` calls, plus expansion of both EN and ID translation files with domain-specific namespaces.

- **`i18n-config-driven-architecture`** — New spec covering the refactoring of i18n infrastructure to be fully config-driven: dynamic `LanguageSwitcher` rendering from config, `config/locales.php` centralized config, Artisan `locale:scaffold` command, and developer documentation for adding new languages.

- **`i18n-ugc-translation`** — New spec covering the `Translatable` trait for Eloquent models, `content_translations` database table, admin translation management UI (side-by-side editor, translation status dashboard), and frontend locale-aware content display with fallback.

- **`i18n-machine-translation-pipeline`** — New spec covering machine translation API integration (Google Cloud Translation / DeepL), translation review workflow (`draft` → `machine_translated` → `under_review` → `approved`), admin review queue UI, Artisan `translate:generate` command for static strings, provenance tracking, and rate limiting.

### Modified capabilities

- **`i18n-localization`** (existing) — MODIFIED:
    - "Language Switcher UI" requirement updated: add flag icons/badges (🇬🇧 EN / 🇮🇩 ID), dynamic rendering from `supportedLocales` config instead of hardcoded options.
    - "React UI Translation via react-i18next" requirement updated: expand namespace list from `['translation', 'health']` to include domain-specific namespaces (`admin`, `investments`, `farms`, `auth`).

- **`content-management`** (existing) — MODIFIED:
    - Article CRUD requirements updated to support multi-language content storage and display.

- **`farm-management`** (existing) — MODIFIED:
    - Farm description field updated to support multi-language content storage and display.

## Impact

- **Affected specs:** `i18n-full-string-coverage` (new), `i18n-config-driven-architecture` (new), `i18n-ugc-translation` (new), `i18n-machine-translation-pipeline` (new), `i18n-localization` (modified), `content-management` (modified), `farm-management` (modified)
- **Affected code:**
    - **101 TSX page components** in `resources/js/Pages/` — add `useTranslation()` hook and replace all hardcoded strings
    - **~20 TSX shared components** in `resources/js/Components/` (Navbar, status badges, pagination, modals, etc.) — add `t()` calls
    - **3 layout components** in `resources/js/Layouts/` — add translated strings
    - **`resources/js/i18n.ts`** — add new namespaces, make config-driven
    - **`public/locales/en/*.json`** — expand with ~500+ new translation keys across 6-8 namespace files
    - **`public/locales/id/*.json`** — complete Bahasa Indonesia translations for all new keys
    - **`lang/en/*.php`** and **`lang/id/*.php`** — add domain-specific server-side translation files (`investments.php`, `farms.php`, `admin.php`)
    - **`resources/js/Components/LanguageSwitcher.tsx`** — add flag icons, dynamic locale rendering
    - **`resources/js/Components/Navbar.tsx`** — translate all menu labels
    - **New `config/locales.php`** — centralized locale configuration
    - **New Artisan command `locale:scaffold`** — generates empty translation file stubs for new locales
    - **New `Translatable` trait** — `app/Concerns/Translatable.php` for Eloquent models
    - **New migration** — `content_translations` table (or JSON columns on `farms`, `articles`)
    - **New `ContentTranslation` model** — polymorphic translations storage
    - **New admin translation management pages** — `resources/js/Pages/Admin/Translations/`
    - **New machine translation service** — `app/Services/TranslationService.php`
    - **New Artisan command `translate:generate`** — batch machine-translate static string files
    - **New `docs/adding-new-locale.md`** — developer guide
- **New Composer packages:** `spatie/laravel-translatable` (or custom trait), machine translation SDK (e.g., `google/cloud-translate` or `deeplcom/deepl-php`)
- **New npm packages:** none (react-i18next already installed)
- **No breaking changes** — existing English UI remains unchanged; translations are additive

## Out of Scope (this change)

- RTL (right-to-left) layout support (already prepared structurally in the existing spec)
- Locale-based currency display changes (MYR format is consistent)
- Mobile app localization (no native apps in current phase)
- Translating PDF/report exports
- Translating third-party content (weather data, map labels)
