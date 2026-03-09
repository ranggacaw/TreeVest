# i18n-ugc-translation Specification

## Purpose

Enable user-generated content (farm descriptions, article titles and content) to be stored and displayed in multiple languages with a managed translation workflow, including an admin UI for side-by-side editing and translation status tracking.

## ADDED Requirements

### Requirement: Content Translations Data Model

The system SHALL store content translations in a polymorphic `content_translations` table that supports any translatable Eloquent model, with per-field, per-locale translation entries including workflow status.

#### Scenario: Content translations table exists

- **WHEN** developer inspects the database schema
- **THEN** a `content_translations` table exists with columns: `id`, `translatable_type`, `translatable_id`, `locale`, `field`, `value`, `status`, `source`, `reviewed_by`, `reviewed_at`, `created_at`, `updated_at`
- **AND** `status` accepts values: `draft`, `machine_translated`, `under_review`, `approved`
- **AND** `source` accepts values: `human`, `machine`
- **AND** a composite index exists on `(translatable_type, translatable_id, locale, field)`

#### Scenario: Unique constraint prevents duplicate translations

- **WHEN** a translation entry already exists for a model/field/locale combination
- **THEN** attempting to create another entry for the same combination raises a unique constraint violation
- **AND** the existing entry must be updated instead

---

### Requirement: Translatable Eloquent Trait

The system SHALL provide a `Translatable` trait that can be applied to any Eloquent model to enable multi-language content support with automatic locale-aware attribute resolution.

#### Scenario: Model uses Translatable trait

- **WHEN** developer inspects the `Farm` model
- **THEN** the model uses the `Translatable` trait
- **AND** the model has a `$translatable` property listing the fields that support translation (e.g., `['description']`)

#### Scenario: Getting a translated attribute

- **WHEN** `$farm->translatedAttribute('description')` is called with the active locale set to `id`
- **THEN** it returns the `approved` Indonesian translation from `content_translations` for that farm's description
- **AND** if no approved `id` translation exists, it falls back to the original `description` column value

#### Scenario: Setting a translation

- **WHEN** `$farm->setTranslation('description', 'id', 'Deskripsi kebun...', 'human')` is called
- **THEN** a `content_translations` row is created or updated with `status = 'draft'`, `source = 'human'`
- **AND** the original `description` column on the `farms` table is NOT modified

#### Scenario: Translation relationship

- **WHEN** developer calls `$farm->translations()->get()`
- **THEN** it returns all `ContentTranslation` entries associated with that farm via the polymorphic relationship

---

### Requirement: Translatable Model Configuration

The system SHALL apply the `Translatable` trait to the following models with their respective translatable fields:

#### Scenario: Farm model is translatable

- **WHEN** developer inspects the `Farm` model
- **THEN** `$translatable = ['description']` is defined

#### Scenario: Article model is translatable

- **WHEN** developer inspects the `Article` model
- **THEN** `$translatable = ['title', 'content']` is defined

---

### Requirement: Locale-Aware Frontend Content Display

The system SHALL serve the correct translated content to the frontend based on the user's active locale, falling back to the default language when no approved translation exists.

#### Scenario: Farm description shown in active locale

- **WHEN** an investor views a farm detail page with `locale = 'id'`
- **AND** the farm has an approved Indonesian translation for `description`
- **THEN** the Indonesian description is displayed

#### Scenario: Fallback to default locale when translation missing

- **WHEN** an investor views a farm detail page with `locale = 'id'`
- **AND** the farm does NOT have an approved Indonesian translation for `description`
- **THEN** the original English description is displayed
- **AND** no error or warning is shown to the user

#### Scenario: Controller passes translated content

- **WHEN** a controller prepares Inertia props for a page displaying translatable content
- **THEN** it calls `translatedAttribute()` or uses a scope/accessor to resolve the correct locale's content
- **AND** the frontend receives the translated string directly (no locale resolution logic in React)

---

### Requirement: Admin Translation Management Dashboard

The system SHALL provide an admin UI for viewing translation coverage status across all translatable content types and locales.

#### Scenario: Translation dashboard shows coverage metrics

- **WHEN** an admin visits `Admin/Translations/Index`
- **THEN** the page displays a table with rows for each content type (Farms, Articles) and columns for each non-default locale
- **AND** each cell shows the translation coverage percentage (e.g., "45/100 = 45%")
- **AND** coverage counts only `approved` translations

#### Scenario: Dashboard shows untranslated content count

- **WHEN** an admin views the translation dashboard
- **THEN** each content type row shows the count of items with zero translations for each locale
- **AND** a "Missing" badge is shown for content types with <50% coverage

---

### Requirement: Admin Side-by-Side Translation Editor

The system SHALL provide a side-by-side editor where admins can view the original content alongside the translation for each locale, and create or edit translations.

#### Scenario: Side-by-side editing for a translatable field

- **WHEN** an admin opens the translation editor for a specific farm's description in locale `id`
- **THEN** the left panel shows the original English description (read-only)
- **AND** the right panel shows an editable text area pre-filled with the existing translation (or empty if none exists)
- **AND** a "Save" button saves the translation with `status = 'draft'` and `source = 'human'`

#### Scenario: Visual indicator for untranslated fields

- **WHEN** an admin views the translation editor for a model
- **THEN** fields without any translation for the selected locale show a "Not yet translated" indicator
- **AND** fields with a `machine_translated` translation show a "Machine draft — needs review" indicator
- **AND** fields with an `approved` translation show a "✓ Approved" indicator

---

### Requirement: Stale Translation Detection

The system SHALL detect when original content is updated and flag existing translations as potentially stale.

#### Scenario: Original content updated marks translations for re-review

- **WHEN** a farm owner updates the `description` field on a farm
- **AND** approved translations exist for that field
- **THEN** all existing translations for that field are updated to `status = 'under_review'`
- **AND** a `translation.stale` event is dispatched for audit logging

#### Scenario: Stale translations visible in admin UI

- **WHEN** an admin views the translation dashboard
- **THEN** a "Stale" badge appears next to content types that have translations flagged as `under_review` due to original content updates
