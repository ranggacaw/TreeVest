# Audit Logging Specification Delta

## MODIFIED Requirements

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
