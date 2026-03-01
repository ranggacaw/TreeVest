# i18n-localization Specification

## Purpose
TBD - created by archiving change add-i18n-localization. Update Purpose after archive.
## Requirements
### Requirement: Locale Detection and Application

The system SHALL detect and apply the user's locale for every request, using the authenticated user's stored preference, falling back to the browser's `Accept-Language` header, and finally defaulting to `APP_LOCALE` (English).

#### Scenario: Authenticated user with stored locale preference
- **WHEN** an authenticated user with `locale = 'id'` makes any page request
- **THEN** `App::setLocale('id')` is called before the controller executes
- **AND** the `Content-Language: id` header is included in the HTTP response
- **AND** all `__()` calls in that request render Indonesian strings

#### Scenario: Unauthenticated user with browser locale header
- **WHEN** an unauthenticated user makes a request with `Accept-Language: id, en;q=0.9`
- **THEN** the system parses the header and maps `id` to the nearest supported locale (`id`)
- **AND** `App::setLocale('id')` is called for that request
- **AND** the locale is NOT persisted (no DB write for guests)

#### Scenario: Unsupported browser locale falls back to default
- **WHEN** a user makes a request with `Accept-Language: fr-FR` (not a supported locale)
- **THEN** the system falls back to `APP_LOCALE` (English)
- **AND** `App::setLocale('en')` is called

#### Scenario: Locale middleware is in the web middleware group
- **WHEN** developer inspects `app/Http/Kernel.php` (or `bootstrap/app.php` for Laravel 12)
- **THEN** `App\Http\Middleware\SetLocale` is registered in the `web` middleware group
- **AND** it runs after the `Authenticate` middleware so the authenticated user's preference is available

---

### Requirement: Locale Shared via Inertia Props

The system SHALL pass the active locale and list of available locales to all React page components via Inertia shared data.

#### Scenario: Inertia shared data contains locale
- **WHEN** any Inertia page is rendered
- **THEN** `usePage().props.locale` equals the active locale code (e.g., `'en'` or `'id'`)
- **AND** `usePage().props.availableLocales` equals the supported locale map (e.g., `{ en: 'English', id: 'Bahasa Indonesia' }`)

#### Scenario: React i18next initialised with shared locale
- **WHEN** the React application boots in `resources/js/app.tsx`
- **THEN** `i18next` is initialised with `lng` set to `usePage().props.locale`
- **AND** locale JSON is loaded from `public/locales/{locale}/translation.json`

---

### Requirement: React UI Translation via react-i18next

The system SHALL use `react-i18next` to translate all user-facing strings in React components, with translation files stored as JSON under `public/locales/`.

#### Scenario: Component uses translation hook
- **WHEN** a React component renders any user-facing text string
- **THEN** the text is wrapped with `t('key')` from the `useTranslation()` hook
- **AND** no raw English string literals appear in TSX markup

#### Scenario: English translation file exists
- **WHEN** developer inspects `public/locales/en/translation.json`
- **THEN** the file contains all translation keys used in React components
- **AND** all values are correct English strings

#### Scenario: Indonesian translation file exists
- **WHEN** developer inspects `public/locales/id/translation.json`
- **THEN** the file contains all translation keys used in React components
- **AND** all values are correct Bahasa Indonesia strings

#### Scenario: Missing translation key falls back to English
- **WHEN** `t('some.key')` is called and the key does not exist in the active locale's file
- **THEN** `i18next` falls back to the `en` locale file
- **AND** returns the English string without throwing an error

---

### Requirement: PHP Backend Translation via Laravel Lang Files

The system SHALL use Laravel's `lang/` directory and `__()` / `trans()` helpers to translate all server-side strings including validation messages, notification body text, and email subjects.

#### Scenario: Validation error messages are translated
- **WHEN** a form request validation fails with `locale = 'id'` active
- **THEN** validation error messages are returned in Bahasa Indonesia
- **AND** Inertia's `usePage().props.errors` contains Indonesian error strings

#### Scenario: English lang files exist
- **WHEN** developer inspects `lang/en/`
- **THEN** `messages.php`, `validation.php`, and `auth.php` files exist
- **AND** all user-facing server-side strings are covered

#### Scenario: Indonesian lang files exist
- **WHEN** developer inspects `lang/id/`
- **THEN** matching `messages.php`, `validation.php`, and `auth.php` files exist
- **AND** all keys match those in `lang/en/`

---

### Requirement: Language Switcher UI

The system SHALL provide a language switcher component in the navigation bar that allows users to change their preferred language.

#### Scenario: Language switcher visible to all users
- **WHEN** any authenticated or guest user views a page
- **THEN** a `LanguageSwitcher` component is visible in the navigation bar
- **AND** it displays the currently active locale label (e.g., "English" or "Bahasa Indonesia")

#### Scenario: Authenticated user switches language
- **WHEN** an authenticated user selects "Bahasa Indonesia" from the language switcher
- **THEN** the system sends a PATCH request to `/profile/locale` with `{ locale: 'id' }`
- **AND** the `users.locale` column is updated for that user
- **AND** the page reloads with the new locale applied
- **AND** subsequent requests use the stored `id` locale

#### Scenario: Guest user switches language
- **WHEN** an unauthenticated guest selects a different language
- **THEN** the system stores the preference in the session (`locale` key)
- **AND** the page reloads with the new locale applied
- **AND** the preference is not persisted to the database

#### Scenario: Only supported locales are shown
- **WHEN** the language switcher renders its options
- **THEN** only locales listed in `APP_AVAILABLE_LOCALES` are displayed
- **AND** the currently active locale is visually highlighted

---

### Requirement: Locale-Aware Date and Time Formatting

The system SHALL format all displayed dates and times according to the user's active locale using the browser's native `Intl.DateTimeFormat` API.

#### Scenario: Date formatted for English locale
- **WHEN** a date such as `2026-03-02` is rendered in a React component with locale `en`
- **THEN** it is displayed as "March 2, 2026" (en-US / en-GB format)

#### Scenario: Date formatted for Indonesian locale
- **WHEN** the same date is rendered with locale `id`
- **THEN** it is displayed as "2 Maret 2026" (id-ID format)

#### Scenario: Relative time formatted per locale
- **WHEN** a relative timestamp (e.g., "3 hours ago") is rendered
- **THEN** it uses `Intl.RelativeTimeFormat` with the active locale
- **AND** renders in the appropriate language (e.g., "3 jam yang lalu" for `id`)

---

### Requirement: Locale-Aware Number and Currency Formatting

The system SHALL format all displayed numeric values (amounts, percentages, yields) and currency amounts according to the user's active locale using `Intl.NumberFormat`.

#### Scenario: Currency amount formatted for English locale
- **WHEN** an amount of `150000` cents (MYR 1,500.00) is rendered with locale `en`
- **THEN** it is displayed as "MYR 1,500.00" or "RM 1,500.00"

#### Scenario: Currency amount formatted for Indonesian locale
- **WHEN** the same amount is rendered with locale `id`
- **THEN** it is displayed using Indonesian decimal/thousand separator conventions (e.g., "RM 1.500,00")

#### Scenario: Percentage formatted per locale
- **WHEN** an ROI value of `0.0875` is rendered as a percentage
- **THEN** it is displayed as "8.75%" for `en` and "8,75%" for `id`

#### Scenario: Large numbers use locale-appropriate separators
- **WHEN** a number such as `1234567` is rendered
- **THEN** it uses comma as a thousand separator for `en` (e.g., "1,234,567")
- **AND** uses period as a thousand separator for `id` (e.g., "1.234.567")

---

### Requirement: RTL Layout Preparation

The system SHALL prepare the HTML and layout structure to support right-to-left languages by setting the `dir` attribute on the root element and using Tailwind CSS `rtl:` variants on layout containers.

#### Scenario: LTR locale sets dir="ltr"
- **WHEN** the active locale is `en` or `id` (both LTR)
- **THEN** the `<html>` element has `dir="ltr"`

#### Scenario: RTL locale sets dir="rtl"
- **WHEN** a future RTL locale (e.g., `ar`) is active
- **THEN** the `<html>` element has `dir="rtl"`
- **AND** layout containers with `rtl:` Tailwind variants apply mirrored styles

#### Scenario: Tailwind RTL variant enabled
- **WHEN** developer inspects `tailwind.config.js`
- **THEN** `future: { hoverOnlyWhenSupported: true }` is set
- **AND** no additional RTL plugin is required (Tailwind 3.x supports `rtl:` natively)

