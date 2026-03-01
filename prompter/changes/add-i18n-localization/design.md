# Design: i18n & Localization

## Context

The platform is expanding to serve both English (en) and Indonesian Bahasa (id) markets. Localization is cross-cutting: it affects the backend (server-rendered notification messages, validation errors, Blade views), the Inertia/React frontend (UI labels, alerts, formatted dates/numbers/currencies), and the database (user locale preference).

The project already uses:
- Laravel 12.x — has built-in `lang/` file support and `__()` / `trans()` helpers
- Inertia.js 2.x — supports shared props, which is the right channel to pass the current locale to React
- Tailwind CSS 3.x — supports the `rtl:` variant via `tailwindcss-rtl` or built-in RTL utilities

## Goals / Non-Goals

**Goals:**
- Support `en` and `id` as the two available locales at launch
- Users can explicitly select their preferred locale; it is stored in the DB and persists across sessions
- All UI strings in React components are externalized to JSON translation files (no hardcoded English text in TSX)
- All PHP-rendered strings (validation errors, notification messages, email subjects) use `__()` from `lang/` files
- Date/time, number, and currency values are formatted per-locale on the frontend using native `Intl` APIs
- Locale is auto-detected from `Accept-Language` header on first visit as a fallback
- RTL layout structure is prepared (Tailwind `rtl:` variants in `<html dir>`) — no full RTL UI validation required

**Non-Goals:**
- Content translation of Article / Encyclopedia body text (managed externally)
- Currency conversion (amounts stay in MYR cents; only display format changes)
- Additional locales beyond `en` and `id` at launch
- Full RTL visual QA pass

## Decisions

### Decision 1: Dual-system i18n (Laravel + react-i18next)
**Choice:** Use Laravel's `lang/` files for server-side strings (notifications, emails, validation), and `react-i18next` for client-side React UI strings. The current locale is passed from Laravel to React via Inertia shared props (`locale`, `availableLocales`).

**Why not a single system?**
- Server-rendered content (emails, SMS, queued notifications) cannot use a JS library — Laravel's `__()` is mandatory here.
- React components need a typed, tree-shakeable translation hook (`useTranslation()`). Passing a flat Laravel translation JSON object via Inertia props does not scale; `react-i18next` provides namespace splitting, lazy loading, and pluralization that the raw prop approach lacks.
- This dual-system is the standard Inertia + Laravel i18n pattern.

**Sync strategy:** A Vite plugin or a simple `php artisan lang:export` command can generate `resources/js/locales/{locale}.json` from `lang/` PHP files for string reuse. Initially, the two translation sets can be maintained separately (PHP for server strings, JSON for client strings).

**Alternatives considered:**
- SSR-only translations (pass all strings as Inertia props): doesn't scale past a few dozen strings; no pluralization support; large prop payload
- i18next only, no Laravel lang files: impossible for queued jobs and emails that run server-side without a JS context

### Decision 2: Locale storage
**Choice:** Add a nullable `locale` string column to the `users` table (e.g., `'en'`, `'id'`). Unauthenticated users fall back to browser `Accept-Language` detection; authenticated users use their stored preference.

**Why nullable / separate from `language_code`?**
- Keeps the schema minimal: a single ISO 639-1 code covers both language and regional formatting at this stage.
- Setting to `null` means "not set — detect from browser", which allows graceful degradation.

**Alternatives considered:**
- Separate `language` and `region` columns: over-engineering for 2 locales
- Laravel session-only: doesn't persist across devices / sessions
- Using the `timezone` column on `users` as a proxy: does not carry locale information

### Decision 3: react-i18next with static JSON resources
**Choice:** `i18next` + `react-i18next` + `i18next-resources-to-backend` for lazy-loading locale JSON files from `public/locales/{locale}/translation.json`.

**Why `i18next-resources-to-backend` over bundling?**
- Translation files are loaded on demand from `public/locales/` — no additional bundle size for a language the user didn't select
- Easy to hot-swap or update JSON without a full build

### Decision 4: RTL preparation strategy
**Choice:** Set `dir` attribute on `<html>` based on locale (`rtl` for future Arabic/Hebrew, `ltr` for `en`/`id`). Add Tailwind `rtl:` variants to layout components only (no content components yet). No RTL-specific visual testing at this stage.

**Why now (even if id is LTR)?**
- Setting `<html dir="ltr|rtl">` is a zero-risk structural change
- Adding `rtl:` variants to layout containers now is cheaper than retrofitting later when an RTL language is added
- Indonesian is LTR — this change has no visible impact at launch

## Data Model Changes

| Table | Column | Type | Notes |
|-------|--------|------|-------|
| `users` | `locale` | `string(10) nullable` | ISO 639-1 code, e.g. `en`, `id`. Default null (auto-detect). |

## Middleware

A new `SetLocale` middleware is added to the `web` group:

```
Request
  → Authenticate (existing)
  → SetLocale (new)
      1. If authenticated user has `locale` set → use it
      2. Else parse `Accept-Language` header → map to supported locale
      3. Fallback to APP_LOCALE (.env)
      → App::setLocale($locale)
      → Response with `Content-Language` header
```

## Frontend Architecture

```
app.tsx
  └── I18nextProvider (i18next configured with detected locale from Inertia shared props)
       └── All page components
            └── useTranslation('common') → t('key')
```

Translation files:
```
public/locales/
  en/
    translation.json
  id/
    translation.json
```

## Environment Variables Added

```env
APP_LOCALE=en
APP_FALLBACK_LOCALE=en
APP_AVAILABLE_LOCALES=en,id
```

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| Translation files diverge between Laravel `lang/` and React `public/locales/` | Accept initially; add a CI lint step that checks both files have identical key coverage in a future chore task |
| Text expansion breaks UI layouts (Indonesian strings ~20% longer than English) | Use `min-w-0 truncate` Tailwind utilities on text containers; review major pages in id locale during QA |
| `react-i18next` adds ~25KB to JS bundle | Loaded once; tree-shaken in production; acceptable trade-off for proper pluralization and namespace support |
| Dual maintenance burden | Both translation files are JSON; the same translator can update both with minimal tool knowledge |

## Migration Plan

1. Add `locale` column migration (non-breaking; nullable, no default impact)
2. Register `SetLocale` middleware in `web` group — defaults to `en` for all existing sessions, no user-visible change
3. Add `lang/en/` and `lang/id/` PHP files
4. Install `react-i18next` and configure `resources/js/i18n.ts`
5. Create `public/locales/en/translation.json` and `public/locales/id/translation.json` with initial strings
6. Wrap existing UI strings in `useTranslation()` calls throughout React pages
7. Add `LanguageSwitcher` component and expose it in the nav bar
8. Update `HandleInertiaRequests` to share `locale` and `availableLocales`
9. Update email/notification templates to use `__()` helpers
10. Enable Tailwind RTL variant; add `dir` attribute to `<html>` in `app.blade.php`
11. Remove "Multi-language / multi-region expansion" from `prompter/project.md` Non-Goals

## Open Questions

- Should the `locale` column also drive the timezone? (Currently separate concern — defer.)
- Should Indonesian locale use `id-ID` (CLDR full locale tag) or just `id`? (`id` maps correctly in all Intl APIs and react-i18next; use `id` for simplicity.)
- Do farm owners and admins need locale support from day one? (Yes — all user roles share the `users` table and the same profile preference flow.)
