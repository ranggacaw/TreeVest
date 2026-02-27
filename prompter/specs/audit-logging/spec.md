# audit-logging Specification

## Purpose
TBD - created by archiving change add-security-compliance-infrastructure. Update Purpose after archive.
## Requirements
### Requirement: Immutable Audit Trail
The system SHALL maintain an immutable audit log of all security-relevant events, capturing user authentication, financial transactions, administrative actions, and data access events with sufficient context for forensic analysis and compliance reporting.

#### Scenario: Financial transaction logged
- **WHEN** a user purchases an investment
- **THEN** an audit log entry is created with event type `investment_purchased`, user ID, investment ID, amount, timestamp, IP address, and user agent
- **AND** the audit log record cannot be updated or deleted after creation

#### Scenario: Authentication event logged
- **WHEN** a user logs in successfully
- **THEN** an audit log entry is created with event type `login_success`, user ID, timestamp, IP address, and user agent

#### Scenario: Failed authentication logged
- **WHEN** a user login attempt fails
- **THEN** an audit log entry is created with event type `login_failed`, attempted email/username, timestamp, IP address, and reason for failure

#### Scenario: Administrative action logged
- **WHEN** an administrator approves a farm listing
- **THEN** an audit log entry is created with event type `admin_farm_approved`, admin user ID, farm ID, timestamp, and IP address

#### Scenario: Immutability enforced at model level
- **WHEN** code attempts to update an existing audit log record
- **THEN** a `RuntimeException` is thrown with message "Audit logs are immutable"
- **AND** the database record remains unchanged

#### Scenario: Immutability enforced for deletions
- **WHEN** code attempts to delete an audit log record
- **THEN** a `RuntimeException` is thrown with message "Audit logs cannot be deleted"
- **AND** the database record remains unchanged

### Requirement: Audit Log Service Interface
The system SHALL provide an `AuditLogService` that encapsulates audit logging operations and dispatches logging jobs asynchronously to prevent blocking the main request-response cycle.

#### Scenario: Async audit logging
- **WHEN** `AuditLogService::logEvent()` is called with event type, user ID, and event data
- **THEN** a `LogAuditEvent` job is dispatched to the queue
- **AND** the method returns immediately without waiting for the job to complete

#### Scenario: Authentication logging helper
- **WHEN** `AuditLogService::logAuthentication()` is called with user ID and success boolean
- **THEN** an audit log entry is created with the appropriate event type (`login_success` or `login_failed`)

#### Scenario: Transaction logging helper
- **WHEN** `AuditLogService::logTransaction()` is called with transaction ID and details
- **THEN** an audit log entry is created with event type `transaction_recorded` and full transaction context

### Requirement: Audit Log Retrieval
The system SHALL provide methods to retrieve audit logs filtered by user, time range, and event type for compliance reporting and forensic analysis.

#### Scenario: Retrieve user audit history
- **WHEN** an administrator requests audit logs for a specific user ID within a date range
- **THEN** all audit log entries for that user within the specified time range are returned
- **AND** results are ordered by timestamp descending (most recent first)

#### Scenario: Retrieve logs by event type
- **WHEN** an administrator filters audit logs by event type (e.g., all `investment_purchased` events)
- **THEN** all audit log entries matching that event type are returned
- **AND** results are paginated with 50 entries per page

### Requirement: Audit Log Retention
The system SHALL retain audit logs for a minimum of 7 years to comply with financial record-keeping regulations, with an archival strategy for logs older than 2 years.

#### Scenario: Audit logs retained indefinitely
- **WHEN** audit logs are queried after 5 years
- **THEN** the logs are still accessible in the database

#### Scenario: Archive strategy documented
- **WHEN** audit logs exceed 2 years of age
- **THEN** an archival process (manual or automated) moves logs to cold storage
- **AND** logs remain accessible via retrieval interface (may have higher latency)

### Requirement: Audit Log Data Structure
The system SHALL store audit logs with standardized fields including event type enum, user ID, IP address, user agent, flexible event data payload (JSON), and immutable creation timestamp.

#### Scenario: Complete audit record structure
- **WHEN** an audit log entry is created
- **THEN** it contains fields: `id`, `user_id`, `event_type`, `ip_address`, `user_agent`, `event_data` (JSON), `created_at`
- **AND** it does NOT contain an `updated_at` field (immutability)

#### Scenario: Event data payload flexibility
- **WHEN** logging a complex event (e.g., investment purchase with multiple related entities)
- **THEN** the `event_data` JSON field stores arbitrary structured data specific to that event type
- **AND** the data is retrievable and parseable from the JSON column

### Requirement: Performance Optimization
The system SHALL optimize audit log queries with database indexes on `user_id`, `created_at`, and `event_type` to ensure fast retrieval for compliance reporting.

#### Scenario: Indexed queries perform efficiently
- **WHEN** querying audit logs by user ID and date range
- **THEN** the query uses the `user_id, created_at` composite index
- **AND** query execution time is < 100ms for typical datasets (up to 1M records)

#### Scenario: Event type filtering optimized
- **WHEN** querying audit logs filtered by event type
- **THEN** the query uses the `event_type` index
- **AND** results are returned efficiently even with large datasets

