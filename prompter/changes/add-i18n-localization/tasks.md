# Tasks: add-i18n-localization

## 1. Database & Backend Infrastructure

- [x] 1.1 Create migration: add nullable `locale` string(10) column to `users` table
- [x] 1.2 Update `User` model: add `locale` to `$fillable` and cast appropriately
- [x] 1.3 Create `app/Http/Middleware/SetLocale.php`:
  - Reads `auth()->user()->locale` if authenticated
  - Falls back to `Accept-Language` header, mapped to supported locales from `APP_AVAILABLE_LOCALES`
  - Falls back to `APP_LOCALE`
  - Calls `App::setLocale($locale)`
  - Appends `Content-Language` response header
- [x] 1.4 Register `SetLocale` middleware in the `web` middleware group (after `Authenticate`)
- [x] 1.5 Create `lang/en/messages.php` with all user-facing server strings (validation, auth, notifications)
- [x] 1.6 Create `lang/id/messages.php` with Bahasa Indonesia translations for all keys in `lang/en/messages.php`
- [x] 1.7 Create `lang/en/validation.php` and `lang/id/validation.php` (override/extend Laravel defaults with Bahasa Indonesia)
- [x] 1.8 Add `APP_LOCALE`, `APP_FALLBACK_LOCALE`, `APP_AVAILABLE_LOCALES` variables to `.env.example`
- [x] 1.9 Update `config/app.php` to read `available_locales` from `APP_AVAILABLE_LOCALES` env variable

## 2. Inertia Shared Props

- [x] 2.1 Update `app/Http/Middleware/HandleInertiaRequests.php` `share()` method to include:
  - `locale` — current `App::getLocale()`
  - `availableLocales` — parsed from `config('app.available_locales')` as `['en' => 'English', 'id' => 'Bahasa Indonesia']`
- [x] 2.2 Update `resources/js/types/index.d.ts` to add `locale: string` and `availableLocales: Record<string, string>` to the global `PageProps` interface

## 3. Frontend i18n Setup

- [x] 3.1 Install npm packages: `i18next`, `react-i18next`, `i18next-resources-to-backend`
- [x] 3.2 Create `resources/js/i18n.ts` — configure i18next with locale from `usePage().props.locale`, `fallbackLng: 'en'`, backend pointing to `public/locales/{locale}/translation.json`
- [x] 3.3 Update `resources/js/app.tsx` to `import './i18n'` before `createRoot` and wrap the Inertia app in `<I18nextProvider i18n={i18n}>`
- [x] 3.4 Create `public/locales/en/translation.json` with initial English key/value strings for all React pages
- [x] 3.5 Create `public/locales/id/translation.json` with Bahasa Indonesia translations for all keys in `en/translation.json`
- [x] 3.6 Update all React page components in `resources/js/Pages/` to use `useTranslation()` hook and `t('key')` for every user-facing string (replace hardcoded English text)

## 4. Language Switcher

- [x] 4.1 Create `resources/js/Components/LanguageSwitcher.tsx` — dropdown/select showing `availableLocales` from Inertia props, highlights active locale
- [x] 4.2 Create `ProfileLocaleController.php` (or add method to existing profile controller) with `update()` — validates `locale` against `APP_AVAILABLE_LOCALES`, updates `users.locale`, logs `user.locale.changed` audit event, returns Inertia redirect
- [x] 4.3 Add route: `PATCH /profile/locale` → `ProfileLocaleController@update` (auth middleware required)
- [x] 4.4 Create `UpdateLocaleRequest.php` FormRequest — validates `locale` is in the list of available locales
- [x] 4.5 Add guest locale switching: store locale in session when user is unauthenticated; read from session in `SetLocale` middleware before falling back to `Accept-Language`
- [x] 4.6 Add `LanguageSwitcher` to `AuthenticatedLayout.tsx` and `GuestLayout.tsx` navigation bars

## 5. Profile Page Update

- [x] 5.1 Update `resources/js/Pages/Profile/Edit.tsx` (or equivalent) to include a "Language Preference" section displaying the current locale label and linking to the language switcher
- [x] 5.2 Ensure the profile page uses `t()` for all labels and success/error messages

## 6. Notification Locale Support

- [x] 6.1 Audit all Laravel Notification classes in `app/Notifications/` and ensure notification body/subject strings use `__()` helper instead of raw English strings
- [x] 6.2 Update notification classes to temporarily call `App::setLocale($notifiable->locale ?? config('app.locale'))` before rendering content, then restore the original locale
- [x] 6.3 Update email Blade templates under `resources/views/emails/` (if any) to use `__()` for all text

## 7. RTL Layout Preparation

- [x] 7.1 Update `resources/views/app.blade.php` `<html>` tag to output `dir="ltr"` or `dir="rtl"` based on a Blade variable passed from `HandleInertiaRequests` (`isRtl` flag derived from locale)
- [x] 7.2 Confirm `tailwind.config.js` has no explicit RTL plugin that conflicts — Tailwind 3.x supports `rtl:` natively; add a comment documenting this
- [x] 7.3 Add `rtl:` variants to the primary layout containers in `AuthenticatedLayout.tsx` and `GuestLayout.tsx` for future RTL readiness

## 8. Tests

- [ ] 8.1 Feature test `tests/Feature/LocaleMiddlewareTest.php`:
  - Authenticated user with `locale = 'id'` gets Indonesian content-language header
  - Guest with `Accept-Language: id` gets Indonesian content-language header
  - Unsupported locale falls back to `en`
- [ ] 8.2 Feature test `tests/Feature/ProfileLocaleTest.php`:
  - Authenticated user can PATCH `/profile/locale` with a valid locale → DB updated
  - Submitting unsupported locale → validation error returned
  - Unauthenticated request → redirected to login
- [ ] 8.3 Unit test `tests/Unit/SetLocaleMiddlewareTest.php`:
  - Middleware resolves locale correctly for all three fallback layers (user pref → Accept-Language → default)

## 9. Project Conventions Update

- [ ] 9.1 Update `prompter/project.md` — remove "Multi-language / multi-region expansion — deferred" from the Non-Goals section; add a note that i18n is active with `en` and `id` locales

## Post-Implementation

- [ ] Update `AGENTS.md` in the project root to reflect that `i18n-localization` capability is now in scope and `users.locale` column exists
