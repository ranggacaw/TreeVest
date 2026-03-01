# admin-audit-log-viewer Specification

## Purpose
TBD - created by archiving change add-admin-panel-core. Update Purpose after archive.
## Requirements
### Requirement: Admin Audit Log List
The system SHALL provide an admin-only searchable, filterable, paginated audit log viewer.

#### Scenario: Admin views audit log list
- **WHEN** an admin navigates to `/admin/audit-logs`
- **THEN** the system returns a paginated list of audit log entries (50 per page) ordered by created_at descending
- **AND** each row shows: event_type, user (name/email if available), IP address, and created_at timestamp

#### Scenario: Admin filters audit logs by event type
- **WHEN** an admin selects an event type filter from a dropdown
- **THEN** the list shows only entries with that event_type value
- **AND** pagination resets to page 1

#### Scenario: Admin filters audit logs by user
- **WHEN** an admin enters a user ID or email in the user filter field
- **THEN** the list shows only entries for that user
- **AND** pagination resets to page 1

#### Scenario: Admin filters audit logs by date range
- **WHEN** an admin selects a date range (from/to) filter
- **THEN** the list shows only entries created within that date range

#### Scenario: Admin views audit log detail
- **WHEN** an admin clicks on an audit log entry
- **THEN** the system renders the full entry including the `event_data` JSON payload in a human-readable format

### Requirement: Audit Log Access Control
Only users with the `admin` role SHALL be able to access the audit log viewer; all access is itself logged.

#### Scenario: Non-admin cannot access audit logs
- **WHEN** an authenticated user with role `investor` or `farm_owner` attempts to access `/admin/audit-logs`
- **THEN** the system returns HTTP 403 Forbidden

#### Scenario: Admin access to audit log viewer is itself logged
- **WHEN** an admin views the audit log list or a detail entry
- **THEN** an audit log entry is created with event_type `admin_audit_log_accessed` and admin user ID

