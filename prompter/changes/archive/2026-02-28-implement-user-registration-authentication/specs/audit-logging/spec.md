# Audit Logging Extensions

## ADDED Requirements

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
The system SHALL extend the event type enum to include all new authentication event types.

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
