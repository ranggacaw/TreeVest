# admin-fruit-type-management Specification

## Purpose
TBD - created by archiving change add-admin-panel-core. Update Purpose after archive.
## Requirements
### Requirement: Admin Fruit Type List
The system SHALL provide an admin-only paginated list of fruit types as reference data.

#### Scenario: Admin views fruit type list
- **WHEN** an admin navigates to `/admin/fruit-types`
- **THEN** the system returns a paginated list of all fruit types (20 per page) ordered by name
- **AND** each row shows: fruit type ID, name, slug, is_active status, and count of associated crops

#### Scenario: Admin filters fruit types by active status
- **WHEN** an admin selects an active/inactive filter
- **THEN** the list shows only fruit types matching that status

### Requirement: Admin Fruit Type Create
The system SHALL allow admins to create new fruit type records via a validated form.

#### Scenario: Admin creates a new fruit type
- **WHEN** an admin submits a valid fruit type creation form (name, slug, description, is_active)
- **THEN** the system creates a new `FruitType` record
- **AND** logs an audit event `fruit_type.created` with admin_id, fruit_type_id, name, slug
- **AND** redirects the admin to the fruit type list with a success flash message

#### Scenario: Duplicate slug is rejected
- **WHEN** an admin submits a fruit type with a slug that already exists
- **THEN** the system returns HTTP 422 with validation error: "Slug must be unique"

#### Scenario: Name is required
- **WHEN** an admin submits a fruit type creation form without a name
- **THEN** the system returns HTTP 422 with validation error: "Name is required"

### Requirement: Admin Fruit Type Edit
The system SHALL allow admins to edit existing fruit type records.

#### Scenario: Admin edits a fruit type
- **WHEN** an admin submits a valid fruit type edit form
- **THEN** the system updates the `FruitType` record
- **AND** logs an audit event `fruit_type.updated` with admin_id, fruit_type_id, changed fields
- **AND** redirects the admin to the fruit type list with a success flash message

#### Scenario: Admin deactivates a fruit type
- **WHEN** an admin sets `is_active` to false for a fruit type
- **THEN** the system updates the record and the fruit type is excluded from the marketplace new-crop selection dropdown
- **AND** existing crops linked to this fruit type are NOT affected

### Requirement: Admin Fruit Type Delete
The system SHALL allow admins to soft-delete fruit types that have no associated crops.

#### Scenario: Admin deletes fruit type without associated crops
- **WHEN** an admin submits a delete request for a fruit type with zero associated crops
- **THEN** the system soft-deletes the fruit type (sets `deleted_at`)
- **AND** logs an audit event `fruit_type.deleted` with admin_id, fruit_type_id
- **AND** redirects the admin to the fruit type list with a success flash message

#### Scenario: Admin cannot delete fruit type with associated crops
- **WHEN** an admin attempts to delete a fruit type that has one or more associated `FruitCrop` records
- **THEN** the system returns HTTP 422 with error: "Cannot delete fruit type with associated crops. Deactivate it instead."

