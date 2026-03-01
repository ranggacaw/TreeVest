# harvest-schedule Specification

## Purpose
TBD - created by archiving change add-harvest-returns-system. Update Purpose after archive.
## Requirements
### Requirement: Harvest Schedule Creation
Farm owners SHALL be able to create harvest schedules for trees within their approved farms, specifying the expected harvest date. Each tree may have at most one non-failed harvest in `scheduled` or `in_progress` status at a time.

#### Scenario: Farm owner creates harvest schedule
- **WHEN** a farm owner submits a harvest creation form with `tree_id` and `scheduled_date`
- **THEN** the system creates a new `Harvest` record with `status = scheduled` and the provided date
- **AND** the system dispatches a `HarvestScheduled` event
- **AND** the system creates an audit log entry with event type `harvest_scheduled`, `tree_id`, `scheduled_date`, `farm_owner_id`

#### Scenario: Farm owner cannot schedule harvest for another owner's tree
- **WHEN** a farm owner attempts to create a harvest for a tree that belongs to a different farm owner
- **THEN** the system rejects the request with HTTP 403 Forbidden
- **AND** the system logs an audit event `unauthorized_harvest_access_attempt`

#### Scenario: Duplicate active harvest rejected
- **WHEN** a farm owner attempts to schedule a harvest for a tree that already has a harvest with `status = scheduled` or `status = in_progress`
- **THEN** the system rejects the request with validation error: "This tree already has an active harvest in progress. Complete or cancel the existing harvest before scheduling a new one."

#### Scenario: Harvest scheduled date must be in the future
- **WHEN** a farm owner submits a harvest creation form with `scheduled_date` in the past
- **THEN** the system rejects the request with validation error: "Scheduled date must be today or in the future."

---

### Requirement: Harvest Status Lifecycle Management
The system SHALL enforce valid harvest status transitions and provide farm owners and admins with actions to advance or fail harvests.

#### Scenario: Farm owner marks harvest as in progress
- **WHEN** a farm owner clicks "Start Harvest" on a harvest with `status = scheduled`
- **THEN** the system transitions the harvest to `status = in_progress`
- **AND** the system creates an audit log entry with event type `harvest_started`

#### Scenario: Farm owner marks harvest as failed
- **WHEN** a farm owner marks a harvest as failed (from `scheduled` or `in_progress`) with a required notes field
- **THEN** the system transitions the harvest to `status = failed`
- **AND** the system sets `failed_at` timestamp
- **AND** the system dispatches a `HarvestFailed` event
- **AND** the system creates an audit log entry with event type `harvest_failed`, `tree_id`, `notes`, `user_id`

#### Scenario: Invalid status transition rejected
- **WHEN** code or UI attempts to transition a harvest from `completed` to any other status
- **THEN** the system throws an `InvalidHarvestTransitionException`
- **AND** the harvest record remains unchanged

#### Scenario: Admin can override harvest status
- **WHEN** an admin transitions a harvest status via the admin panel
- **THEN** the same state machine rules apply as for farm owners
- **AND** the audit log records the admin's user ID as the actor

---

### Requirement: Harvest Schedule Visibility
The system SHALL provide harvest schedule views for farm owners (their crops) and admins (all crops). Investors see upcoming harvests for their invested trees on the portfolio dashboard (covered by the `portfolio-tracking` spec).

#### Scenario: Farm owner views harvest list
- **WHEN** a farm owner navigates to `/farm-owner/harvests`
- **THEN** the system displays all harvests for trees belonging to the farm owner's farms
- **AND** harvests are paginated (20 per page) and ordered by `scheduled_date` ASC
- **AND** each row shows: tree identifier, fruit type, variant, scheduled date, status, estimated yield (if set), action buttons

#### Scenario: Admin views all harvests
- **WHEN** an admin navigates to `/admin/harvests`
- **THEN** the system displays all harvests with filters: status, farm, fruit type, date range
- **AND** the system paginates results (25 per page)

#### Scenario: Farm owner views single harvest detail
- **WHEN** a farm owner navigates to `/farm-owner/harvests/{harvest_id}`
- **THEN** the system displays full harvest details: tree info, scheduled date, status, yield data (if recorded), confirmation status, audit history

---

### Requirement: Harvest Approaching Notifications
The system SHALL send automated notifications to investors with active investments in a tree when that tree's harvest date is approaching.

#### Scenario: 7-day harvest reminder dispatched
- **WHEN** the daily `app:send-harvest-reminders` command runs
- **AND** a harvest record has `status = scheduled` and `scheduled_date = today + 7 days`
- **THEN** the system dispatches `SendHarvestReminderNotification` jobs for all investors with `active` investments in the harvest's tree
- **AND** the notification type is `harvest` with message: "Your [Fruit Type] tree on [Farm Name] is expected to harvest in 7 days."

#### Scenario: 1-day harvest reminder dispatched
- **WHEN** the daily `app:send-harvest-reminders` command runs
- **AND** a harvest record has `status = scheduled` and `scheduled_date = today + 1 day`
- **THEN** the system dispatches reminder notifications for all affected investors
- **AND** the notification message is: "Your [Fruit Type] tree on [Farm Name] is expected to harvest tomorrow."

#### Scenario: No duplicate reminders
- **WHEN** a reminder notification has already been dispatched for a harvest + reminder_type combination
- **THEN** the command does NOT dispatch a second notification for the same investor + harvest + type
- **AND** reminder dispatch is tracked on the `harvest` record via a `reminders_sent` JSON field or a separate `harvest_reminders` lookup

---

### Requirement: Harvest Data Integrity
The system SHALL ensure harvest data integrity through database constraints and soft deletion.

#### Scenario: Harvest record soft-deleted on removal
- **WHEN** a harvest is removed from active management (e.g., scheduling error)
- **THEN** the system uses soft delete (`deleted_at` timestamp)
- **AND** the harvest record remains in the database for audit purposes

#### Scenario: Harvest tree relationship is immutable
- **WHEN** a harvest has been created
- **THEN** `harvest.tree_id` and `harvest.fruit_crop_id` cannot be changed
- **AND** any attempt to change them is rejected with a validation error

