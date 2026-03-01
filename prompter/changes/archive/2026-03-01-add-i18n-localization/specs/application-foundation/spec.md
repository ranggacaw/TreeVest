## ADDED Requirements

### Requirement: React i18n Setup

The system SHALL integrate `react-i18next` and `i18next` as the frontend translation framework, initialised in `resources/js/i18n.ts` and bootstrapped before the React application mounts.

#### Scenario: i18next package installed
- **WHEN** developer runs `npm list i18next react-i18next i18next-resources-to-backend`
- **THEN** all three packages are listed as installed dependencies

#### Scenario: i18n bootstrap file exists
- **WHEN** developer inspects `resources/js/i18n.ts`
- **THEN** the file configures `i18next` with:
  - `lng` set from the Inertia shared `locale` prop
  - `fallbackLng: 'en'`
  - `resources` or `backend` pointing to `public/locales/{locale}/translation.json`

#### Scenario: App entry point imports i18n bootstrap
- **WHEN** developer inspects `resources/js/app.tsx`
- **THEN** `import './i18n'` appears before the `createRoot` call
- **AND** the `I18nextProvider` wraps the Inertia app

#### Scenario: Translation JSON files exist for all supported locales
- **WHEN** developer inspects `public/locales/`
- **THEN** subdirectories `en/` and `id/` each contain a `translation.json` file
- **AND** both files contain matching key sets

## MODIFIED Requirements

### Requirement: Environment Configuration

The system SHALL provide an `.env.example` file with all required environment variables for Treevest, including locale configuration variables.

#### Scenario: Environment template exists
- **WHEN** developer inspects `.env.example`
- **THEN** all required variables are documented with example values:
  - `APP_NAME=Treevest`
  - `DB_CONNECTION=mysql`
  - `SESSION_DRIVER=database`
  - `CACHE_STORE=database`
  - `QUEUE_CONNECTION=database`
  - `APP_LOCALE=en`
  - `APP_FALLBACK_LOCALE=en`
  - `APP_AVAILABLE_LOCALES=en,id`

#### Scenario: Environment file copied
- **WHEN** developer copies `.env.example` to `.env`
- **AND** runs `php artisan key:generate`
- **THEN** application can boot successfully with minimal configuration changes
