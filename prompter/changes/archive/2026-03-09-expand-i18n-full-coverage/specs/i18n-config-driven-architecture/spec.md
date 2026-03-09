# i18n-config-driven-architecture Specification

## Purpose

Refactor the i18n infrastructure to be fully config-driven, enabling the addition of new languages beyond EN/ID through configuration changes and translation file creation alone, without code modifications.

## ADDED Requirements

### Requirement: Centralized Locale Configuration

The system SHALL provide a centralized `config/locales.php` configuration file that is the single source of truth for all locale-related logic across the backend and frontend.

#### Scenario: Config file defines supported locales

- **WHEN** developer inspects `config/locales.php`
- **THEN** the file contains a `supported` array with locale codes as keys and locale metadata (name, native_name, flag, dir) as values
- **AND** it contains `default` and `fallback` keys reading from environment variables

#### Scenario: All locale validation references the config

- **WHEN** `UpdateLocaleRequest`, `SetLocale` middleware, or the `users.locale` validation rule checks a locale value
- **THEN** it validates against `array_keys(config('locales.supported'))`
- **AND** does NOT use a hardcoded list

#### Scenario: Inertia shares full locale metadata

- **WHEN** `HandleInertiaRequests` shares locale data
- **THEN** `usePage().props.availableLocales` contains the full metadata for each locale (code, name, native_name, flag, dir)
- **AND** `usePage().props.locale` contains the active locale code

---

### Requirement: Locale Scaffold Artisan Command

The system SHALL provide an Artisan command `php artisan locale:scaffold {locale}` that generates all required translation file stubs for a new language.

#### Scenario: Scaffolding a new locale

- **WHEN** developer runs `php artisan locale:scaffold ms`
- **THEN** the command creates `public/locales/ms/` directory with empty JSON files matching all namespaces in `public/locales/en/` (same keys, empty string values)
- **AND** creates `lang/ms/` directory with PHP files matching all files in `lang/en/` (same keys, empty string values)
- **AND** outputs a checklist: "✓ Created public/locales/ms/_.json", "✓ Created lang/ms/_.php", "⚠ Add 'ms' to config/locales.php supported array"

#### Scenario: Scaffolding an already-existing locale

- **WHEN** developer runs `php artisan locale:scaffold en`
- **THEN** the command outputs an error: "Locale 'en' already exists in public/locales/en/"
- **AND** does NOT overwrite existing files

#### Scenario: Scaffolding with invalid locale code

- **WHEN** developer runs `php artisan locale:scaffold xyz123`
- **THEN** the command outputs a warning: "Warning: 'xyz123' does not appear to be a valid ISO 639-1 or ISO 639-2 code. Continue anyway? [y/N]"

---

### Requirement: Dynamic LanguageSwitcher Rendering

The system SHALL render the `LanguageSwitcher` component dynamically from the shared locale configuration, supporting any number of locales without code changes.

#### Scenario: Three locales configured

- **WHEN** `config/locales.php` has three locales (`en`, `id`, `ms`) configured
- **THEN** the `LanguageSwitcher` dropdown shows all three locales with their respective flags and native names
- **AND** no code changes to `LanguageSwitcher.tsx` were required

#### Scenario: Single locale configured

- **WHEN** only one locale is configured
- **THEN** the `LanguageSwitcher` component is not rendered (no switcher needed)

---

### Requirement: Developer Documentation for Adding Languages

The system SHALL provide a developer guide at `docs/adding-new-locale.md` documenting the step-by-step process for adding a new language to the platform.

#### Scenario: Documentation covers all steps

- **WHEN** developer reads `docs/adding-new-locale.md`
- **THEN** the document covers: (1) running `locale:scaffold`, (2) adding the locale to `config/locales.php`, (3) translating JSON and PHP files, (4) testing the new locale, (5) using `translate:generate` for machine draft translations

#### Scenario: Documentation is up-to-date

- **WHEN** the locale infrastructure changes
- **THEN** `docs/adding-new-locale.md` is updated in the same PR/commit
