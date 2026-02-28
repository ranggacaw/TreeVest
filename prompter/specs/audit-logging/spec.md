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

### Requirement: Authentication Event Type Enumeration
The system SHALL support comprehensive authentication event types for phone auth, OAuth, 2FA, and profile management.

#### Scenario: Phone authentication events logged
- **WHEN** a user registers or logs in with phone
- **THEN** the system logs events with types `user.registered.phone`, `user.login.phone`, `user.phone.added`, `user.phone.changed`, `user.phone.verified`

#### Scenario: OAuth authentication events logged
- **WHEN** a user registers or logs in with OAuth (Google, Facebook, Apple)
- **THEN** the system logs events with types `user.registered.oauth.{provider}`, `user.login.oauth.{provider}`, `user.oauth.linked.{provider}`, `user.oauth.unlinked.{provider}`

#### Scenario: Two-factor authentication events logged
- **WHEN** a user enables, disables, or uses 2FA
- **THEN** the system logs events with types `user.2fa.enabled.totp`, `user.2fa.enabled.sms`, `user.2fa.disabled`, `user.2fa.failed`, `user.2fa.recovery_code_used`, `user.2fa.recovery_codes_regenerated`, `user.login.2fa.totp`, `user.login.2fa.sms`

#### Scenario: Profile update events logged
- **WHEN** a user updates profile information
- **THEN** the system logs events with types `user.profile.updated`, `user.email.changed`, `user.avatar.uploaded`, `user.avatar.deleted`

#### Scenario: Session management events logged
- **WHEN** a user manages their sessions
- **THEN** the system logs events with types `user.session.revoked`, `user.session.revoked_all`, `user.logout`

#### Scenario: Account management events logged
- **WHEN** a user deactivates or requests deletion
- **THEN** the system logs events with types `user.account.deactivated`, `user.account.deletion_requested`, `user.account.restored`

### Requirement: Authentication Audit Event Data Payloads
The system SHALL capture comprehensive context in audit log event_data for authentication events.

#### Scenario: Login event captures authentication method
- **WHEN** a user logs in via any method
- **THEN** the audit log `event_data` includes: `{"method": "email|phone|oauth.{provider}", "success": true|false, "ip_address": "...", "user_agent": "..."}`

#### Scenario: OAuth event captures provider details
- **WHEN** a user links or unlinks an OAuth provider
- **THEN** the audit log `event_data` includes: `{"provider": "google|facebook|apple", "provider_user_id": "...", "action": "linked|unlinked"}`

#### Scenario: 2FA event captures 2FA type
- **WHEN** a user enables or uses 2FA
- **THEN** the audit log `event_data` includes: `{"type": "totp|sms", "action": "enabled|disabled|verified|failed"}`

#### Scenario: Phone change event captures old and new values
- **WHEN** a user changes their phone number
- **THEN** the audit log `event_data` includes: `{"old_phone": "...", "new_phone": "...", "country_code": "..."}`
- **AND** phone numbers are encrypted in the payload

#### Scenario: Email change event captures old and new values
- **WHEN** a user changes their email address
- **THEN** the audit log `event_data` includes: `{"old_email": "...", "new_email": "..."}`

#### Scenario: Recovery code usage event captures warning flag
- **WHEN** a user logs in with a recovery code
- **THEN** the audit log `event_data` includes: `{"recovery_code_used": true, "remaining_codes": 7, "warning": "User should regenerate recovery codes"}`

### Requirement: Audit Log Event Type Enum Extension

The system SHALL extend the event type enum to include all new authentication event types **and farm management event types**.

#### Scenario: Event type enum includes phone events
- **WHEN** the system defines the event type enum
- **THEN** it includes: `user_registered_phone`, `user_login_phone`, `user_phone_added`, `user_phone_changed`, `user_phone_verified`

#### Scenario: Event type enum includes OAuth events
- **WHEN** the system defines the event type enum
- **THEN** it includes: `user_registered_oauth_google`, `user_registered_oauth_facebook`, `user_registered_oauth_apple`, `user_login_oauth_google`, `user_login_oauth_facebook`, `user_login_oauth_apple`, `user_oauth_linked_google`, `user_oauth_linked_facebook`, `user_oauth_linked_apple`, `user_oauth_unlinked_google`, `user_oauth_unlinked_facebook`, `user_oauth_unlinked_apple`

#### Scenario: Event type enum includes 2FA events
- **WHEN** the system defines the event type enum
- **THEN** it includes: `user_2fa_enabled_totp`, `user_2fa_enabled_sms`, `user_2fa_disabled`, `user_2fa_failed`, `user_2fa_recovery_code_used`, `user_2fa_recovery_codes_regenerated`, `user_login_2fa_totp`, `user_login_2fa_sms`

#### Scenario: Event type enum includes profile events
- **WHEN** the system defines the event type enum
- **THEN** it includes: `user_profile_updated`, `user_email_changed`, `user_avatar_uploaded`, `user_avatar_deleted`

#### Scenario: Event type enum includes session events
- **WHEN** the system defines the event type enum
- **THEN** it includes: `user_session_revoked`, `user_session_revoked_all`, `user_logout`

#### Scenario: Event type enum includes account events
- **WHEN** the system defines the event type enum
- **THEN** it includes: `user_account_deactivated`, `user_account_deletion_requested`, `user_account_restored`

#### Scenario: Event type enum includes farm management events
- **WHEN** the system defines the event type enum
- **THEN** it includes: `farm_created`, `farm_updated`, `farm_approved`, `farm_suspended`, `farm_deactivated`, `farm_activated`, `farm_image_uploaded`, `farm_image_deleted`, `farm_status_changed`

### Requirement: AuditLogService Authentication Helper Extensions
The system SHALL extend the AuditLogService with helper methods for authentication events.

#### Scenario: Log phone authentication event
- **WHEN** `AuditLogService::logPhoneAuth()` is called with user ID, action (registered/login/verified), and phone
- **THEN** an audit log entry is created with event type `user.{action}.phone` and phone in event_data

#### Scenario: Log OAuth authentication event
- **WHEN** `AuditLogService::logOAuthAuth()` is called with user ID, provider, action (registered/login/linked/unlinked)
- **THEN** an audit log entry is created with event type `user.{action}.oauth.{provider}` and provider details in event_data

#### Scenario: Log 2FA event
- **WHEN** `AuditLogService::logTwoFactorAuth()` is called with user ID, type (totp/sms), action (enabled/disabled/verified/failed)
- **THEN** an audit log entry is created with event type `user.2fa.{action}.{type}` and 2FA context in event_data

#### Scenario: Log profile update event
- **WHEN** `AuditLogService::logProfileUpdate()` is called with user ID, field name, old value, new value
- **THEN** an audit log entry is created with event type `user.profile.updated` or field-specific type and change details in event_data

#### Scenario: Log session management event
- **WHEN** `AuditLogService::logSessionEvent()` is called with user ID, session ID, action (revoked/revoked_all/logout)
- **THEN** an audit log entry is created with event type `user.session.{action}` and session details in event_data

#### Scenario: Log account management event
- **WHEN** `AuditLogService::logAccountEvent()` is called with user ID, action (deactivated/deletion_requested/restored)
- **THEN** an audit log entry is created with event type `user.account.{action}` and reason/timestamp in event_data

### Requirement: Failed Authentication Attempt Context
The system SHALL capture detailed failure reasons for authentication attempts.

#### Scenario: Failed login captures failure reason
- **WHEN** a user fails to log in
- **THEN** the audit log `event_data` includes: `{"failure_reason": "invalid_password|invalid_otp|expired_otp|account_locked|2fa_required", "attempted_credential": "email@example.com or +60123456789"}`

#### Scenario: Failed 2FA captures attempt count
- **WHEN** a user fails 2FA verification
- **THEN** the audit log `event_data` includes: `{"failure_reason": "invalid_code", "attempt_count": 3, "max_attempts": 5}`

#### Scenario: Rate limit violation logged
- **WHEN** a user triggers rate limiting on authentication
- **THEN** the audit log `event_data` includes: `{"failure_reason": "rate_limit_exceeded", "rate_limiter": "phone-otp-send|2fa-verify", "retry_after": 60}`

