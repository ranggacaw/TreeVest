# i18n-localization Specification Delta

## MODIFIED Requirements

### Requirement: Language Switcher UI (MODIFIED)

The system SHALL provide a language switcher component in the navigation bar that allows users to change their preferred language, displaying flag icons and locale badges for visual identification.

#### Scenario: Language switcher displays flag icons

- **WHEN** any authenticated or guest user views a page
- **THEN** the `LanguageSwitcher` component displays the active locale with its flag icon (e.g., 🇬🇧 EN or 🇮🇩 ID)
- **AND** the dropdown lists all configured locales with their flag icons and native names

#### Scenario: Language switcher dynamically renders from config

- **WHEN** the `LanguageSwitcher` component renders its options
- **THEN** it reads locale data from `usePage().props.availableLocales` which includes `flag`, `name`, and `native_name` for each locale
- **AND** it does NOT hardcode locale options — adding a new locale via `config/locales.php` automatically appears in the switcher

#### Scenario: Active locale is visually distinguished

- **WHEN** the language switcher dropdown is open
- **THEN** the currently active locale has a distinct background color and a checkmark or bold styling
- **AND** non-active locales have hover states

### Requirement: React UI Translation via react-i18next (MODIFIED)

The system SHALL use `react-i18next` to translate all user-facing strings in React components, with translation files organized into domain-specific namespaces stored as JSON under `public/locales/`.

#### Scenario: Multiple namespaces are registered

- **WHEN** developer inspects `resources/js/i18n.ts`
- **THEN** the `ns` array includes: `['translation', 'health', 'admin', 'farms', 'investments', 'harvests', 'education', 'auth']`
- **AND** `defaultNS` is `'translation'`

#### Scenario: Page components declare their namespaces

- **WHEN** a React page component uses translations
- **THEN** it calls `useTranslation(['primary_namespace', 'translation'])` specifying the domain namespace and the common namespace
- **AND** `i18next-resources-to-backend` lazy-loads only the requested namespace files
