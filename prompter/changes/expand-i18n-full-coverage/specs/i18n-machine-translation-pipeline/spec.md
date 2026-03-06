# i18n-machine-translation-pipeline Specification

## Purpose

Integrate a machine translation API to generate draft translations for both static UI strings and user-generated content, with a mandatory human review workflow before any machine-translated content is displayed to end users.

## ADDED Requirements

### Requirement: Machine Translation Service Integration

The system SHALL integrate a machine translation API (e.g., Google Cloud Translation) via a pluggable adapter pattern to generate draft translations.

#### Scenario: Translation service is configured

- **WHEN** developer inspects `config/locales.php`
- **THEN** a `translation_service` section exists with keys: `driver` (e.g., `'google'`), `api_key`, `rate_limit_per_minute`, and `cost_tracking_enabled`
- **AND** the API key reads from an environment variable (`TRANSLATION_API_KEY`)

#### Scenario: Translation service translates text

- **WHEN** the application calls `TranslationService::translate('Hello world', 'en', 'id')`
- **THEN** it returns a `TranslationResult` object with properties: `text` (translated string), `source_locale`, `target_locale`, `provider` (e.g., `'google'`), `character_count`

#### Scenario: Translation service handles errors gracefully

- **WHEN** the translation API returns an error (rate limit, auth failure, network error)
- **THEN** the service throws a `TranslationServiceException` with a descriptive message
- **AND** the error is logged with context (source text length, locales, provider)
- **AND** the calling code can catch and display a user-friendly error message

#### Scenario: Translation service adapter pattern

- **WHEN** developer inspects `app/Services/Translation/`
- **THEN** a `TranslationServiceInterface` defines the contract
- **AND** `GoogleTranslationService` implements the interface
- **AND** the service is bound in a service provider so the driver can be swapped via config

---

### Requirement: Translation Review Workflow

The system SHALL enforce a review workflow for all machine-translated content with statuses: `draft` → `machine_translated` → `under_review` → `approved`.

#### Scenario: Machine translation creates a draft entry

- **WHEN** a machine translation is generated for a UGC field
- **THEN** the `content_translations` entry is created with `status = 'machine_translated'` and `source = 'machine'`
- **AND** the translated content is NOT displayed to end users (only `approved` translations are served)

#### Scenario: Reviewer approves a translation

- **WHEN** an admin clicks "Approve" on a translation entry in the review queue
- **THEN** the entry's `status` is updated to `approved`
- **AND** `reviewed_by` is set to the admin's user ID
- **AND** `reviewed_at` is set to the current timestamp
- **AND** the translation becomes visible to end users on the next page load

#### Scenario: Reviewer edits and approves a translation

- **WHEN** an admin modifies the machine-translated text and clicks "Save & Approve"
- **THEN** the entry's `value` is updated with the edited text
- **AND** `status` is set to `approved`
- **AND** `source` remains `'machine'` (provenance preserved)
- **AND** `reviewed_by` and `reviewed_at` are set

#### Scenario: Reviewer rejects a translation

- **WHEN** an admin clicks "Reject" on a translation entry
- **THEN** the entry's `status` is set to `draft`
- **AND** the translation is not visible to end users
- **AND** the entry remains in the system for re-translation or manual translation

---

### Requirement: Admin Translation Review Queue

The system SHALL provide an admin UI page listing all machine-translated content awaiting human review, with filtering, sorting, and batch actions.

#### Scenario: Review queue lists pending translations

- **WHEN** an admin visits `Admin/Translations/Review`
- **THEN** the page displays a list of `content_translations` entries with `status` in `['machine_translated', 'under_review']`
- **AND** each entry shows: content type, item title/identifier, field name, locale, source text preview, translated text preview, status, created date

#### Scenario: Review queue supports filtering

- **WHEN** an admin uses the filter controls
- **THEN** they can filter by: content type (Farm, Article), locale, status (`machine_translated`, `under_review`), and date range

#### Scenario: Review queue supports batch approval

- **WHEN** an admin selects multiple entries and clicks "Batch Approve"
- **THEN** all selected entries are updated to `status = 'approved'` with `reviewed_by` and `reviewed_at` set
- **AND** a confirmation count is displayed: "Approved X translations"

#### Scenario: Side-by-side review view

- **WHEN** an admin clicks on a translation entry in the review queue
- **THEN** a side-by-side view shows: original content (left, read-only) → machine draft (center, read-only) → editable final translation (right)
- **AND** the admin can approve, edit & approve, or reject from this view

---

### Requirement: UGC Draft Translation Generation

The system SHALL provide a "Generate Draft Translation" action in the admin translation UI that calls the machine translation API for UGC content.

#### Scenario: Generate draft for a single field

- **WHEN** an admin clicks "Generate Draft Translation" for a farm's description in locale `id`
- **THEN** the system calls `TranslationService::translate()` with the farm's description text, `'en'`, and `'id'`
- **AND** creates a `content_translations` entry with `status = 'machine_translated'`, `source = 'machine'`
- **AND** displays a success message: "Draft translation generated — pending review"

#### Scenario: Generate draft skips already-approved translations

- **WHEN** an admin clicks "Generate Draft Translation" for a field that already has an `approved` translation
- **THEN** the system shows a confirmation: "An approved translation already exists. Generate a new machine draft? This will NOT overwrite the approved version."
- **AND** if confirmed, creates a new draft entry (the approved entry remains)

---

### Requirement: Static String Machine Translation CLI

The system SHALL provide an Artisan command `php artisan translate:generate {source_locale} {target_locale}` to machine-translate missing static UI string keys.

#### Scenario: Generate missing translations for a namespace

- **WHEN** developer runs `php artisan translate:generate en id --namespace=farms`
- **THEN** the command reads `public/locales/en/farms.json` and `public/locales/id/farms.json`
- **AND** identifies keys present in `en` but missing or empty in `id`
- **AND** calls `TranslationService::translate()` for each missing key
- **AND** outputs results to `public/locales/id/farms.json.draft` (NOT overwriting the original file)
- **AND** displays a summary: "Translated X keys, skipped Y existing keys"

#### Scenario: Generate for all namespaces

- **WHEN** developer runs `php artisan translate:generate en id` (no `--namespace` flag)
- **THEN** the command processes all namespace JSON files found in `public/locales/en/`
- **AND** creates `.draft` files for each namespace under `public/locales/id/`

#### Scenario: Generate for PHP lang files

- **WHEN** developer runs `php artisan translate:generate en id --php`
- **THEN** the command reads all PHP files in `lang/en/` and `lang/id/`
- **AND** identifies missing keys and generates a `.draft.php` file for each

---

### Requirement: Translation Provenance Tracking

The system SHALL track the origin (human vs. machine) of every translation for quality auditing purposes.

#### Scenario: Machine translation is labeled

- **WHEN** a translation is generated by the machine translation API
- **THEN** `content_translations.source` is set to `'machine'`
- **AND** this value is never changed, even if a human edits the text during review

#### Scenario: Human translation is labeled

- **WHEN** an admin manually enters a translation via the side-by-side editor
- **THEN** `content_translations.source` is set to `'human'`

#### Scenario: Provenance visible in admin UI

- **WHEN** an admin views a translation entry in the review queue or editor
- **THEN** a badge indicates whether the translation was "Machine Generated" or "Human Written"

---

### Requirement: Translation API Rate Limiting and Cost Control

The system SHALL rate-limit calls to the machine translation API and track usage for cost visibility.

#### Scenario: Rate limiting prevents excessive API calls

- **WHEN** the system has made the configured maximum number of API calls within the current minute (e.g., 100)
- **THEN** subsequent translation requests are queued or deferred
- **AND** a log entry is written: "Translation API rate limit reached — deferring requests"

#### Scenario: Character count is logged for cost tracking

- **WHEN** a translation API call is made
- **THEN** the total character count of the source text is logged
- **AND** an aggregate daily/monthly character count is available via `php artisan translate:usage` (or a dashboard metric)

#### Scenario: Cost tracking in admin dashboard

- **WHEN** an admin views the translation dashboard
- **THEN** a "Translation API Usage" section shows: total characters translated this month, estimated cost, number of API calls
