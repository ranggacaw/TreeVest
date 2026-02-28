# GDPR Compliance Extensions

## ADDED Requirements

### Requirement: User Data Export Includes Authentication Data
The system SHALL include phone numbers, OAuth provider linkages, 2FA status, and avatar data in GDPR data export.

#### Scenario: Data export includes phone number
- **WHEN** a user requests a GDPR data export
- **THEN** the exported JSON includes the `phone` field (decrypted, E.164 format) and `phone_country_code`
- **AND** the `phone_verified_at` timestamp is included

#### Scenario: Data export includes OAuth provider linkages
- **WHEN** a user requests a GDPR data export
- **THEN** the exported JSON includes an `oauth_providers` array with entries: `{"provider": "google", "provider_user_id": "...", "linked_at": "2026-02-28T12:00:00Z"}`
- **AND** OAuth access/refresh tokens are excluded (not user-facing data)

#### Scenario: Data export includes 2FA status
- **WHEN** a user requests a GDPR data export
- **THEN** the exported JSON includes `two_factor_enabled`: true/false
- **AND** `two_factor_type`: "totp"/"sms"/null
- **AND** `two_factor_enabled_at` timestamp if enabled
- **AND** the TOTP secret and recovery codes are excluded (security-sensitive)

#### Scenario: Data export includes avatar URL
- **WHEN** a user requests a GDPR data export
- **THEN** the exported JSON includes the `avatar_url` field
- **AND** a direct download link to the avatar image file (if avatar exists)

#### Scenario: Data export includes session history
- **WHEN** a user requests a GDPR data export
- **THEN** the exported JSON includes a `recent_sessions` array with last 30 days of session activity: `{"ip_address": "...", "user_agent": "...", "last_activity": "2026-02-28T12:00:00Z"}`

#### Scenario: Data export includes authentication audit logs
- **WHEN** a user requests a GDPR data export
- **THEN** the exported JSON includes an `authentication_history` array with all authentication events: `{"event_type": "user.login.email", "timestamp": "...", "ip_address": "...", "success": true}`

### Requirement: User Data Deletion Includes Authentication Data
The system SHALL delete or anonymize phone numbers, OAuth linkages, 2FA data, and avatars on GDPR deletion requests.

#### Scenario: Phone number deleted on account deletion
- **WHEN** a user's account is permanently deleted via GDPR deletion
- **THEN** the `phone` field is set to null
- **AND** the `phone_country_code` field is set to null
- **AND** the `phone_verified_at` field is set to null
- **AND** all `phone_verifications` records for the user are permanently deleted

#### Scenario: OAuth provider linkages deleted on account deletion
- **WHEN** a user's account is permanently deleted via GDPR deletion
- **THEN** all `oauth_providers` records for the user are permanently deleted
- **AND** stored OAuth tokens are removed

#### Scenario: 2FA data deleted on account deletion
- **WHEN** a user's account is permanently deleted via GDPR deletion
- **THEN** the `two_factor_secrets` record for the user is permanently deleted
- **AND** all `two_factor_recovery_codes` for the user are permanently deleted
- **AND** the `two_factor_enabled_at` field is set to null

#### Scenario: Avatar file deleted on account deletion
- **WHEN** a user's account is permanently deleted via GDPR deletion
- **THEN** the avatar image file is deleted from `storage/app/public/avatars/{user_id}/`
- **AND** the `avatar_url` field is set to null

#### Scenario: Session records deleted on account deletion
- **WHEN** a user's account is permanently deleted via GDPR deletion
- **THEN** all `sessions` records for the user are permanently deleted

#### Scenario: Email and name anonymized on account deletion
- **WHEN** a user's account is permanently deleted via GDPR deletion
- **THEN** the `email` field is set to `deleted_{user_id}@anonymized.local`
- **AND** the `name` field is set to `Deleted User {user_id}`
- **AND** the `password` field is set to a random bcrypt hash (user cannot log in)

### Requirement: Account Deactivation (Soft Delete)
The system SHALL support account deactivation via soft delete while preserving authentication data for potential restoration.

#### Scenario: User initiates account deactivation
- **WHEN** an authenticated user clicks "Deactivate Account" and confirms
- **THEN** the user's `deleted_at` field is set to the current timestamp (soft delete)
- **AND** the user is immediately logged out
- **AND** all sessions are terminated
- **AND** logs the `user.account.deactivated` audit event

#### Scenario: Deactivated user cannot log in
- **WHEN** a user with a non-null `deleted_at` attempts to log in
- **THEN** the login is rejected
- **AND** an error message displays "Your account has been deactivated. Contact support to restore your account."

#### Scenario: Deactivated user profile hidden
- **WHEN** a deactivated user's profile is accessed
- **THEN** the profile is not visible to other users
- **AND** the user's avatar and name are not displayed in public areas

#### Scenario: Admin can restore deactivated account
- **WHEN** an administrator restores a soft-deleted user within 30 days
- **THEN** the `deleted_at` field is set to null
- **AND** the user can log in again
- **AND** all authentication data (phone, OAuth, 2FA, avatar) is restored
- **AND** logs the `user.account.restored` audit event

#### Scenario: Deactivated accounts auto-purged after 30 days
- **WHEN** a deactivated account remains soft-deleted for 30 days
- **THEN** an automated job flags the account for permanent deletion
- **AND** admin review is required before permanent deletion

### Requirement: GDPR Data Deletion Request Workflow
The system SHALL require admin review before permanently deleting user accounts with active investments.

#### Scenario: User requests GDPR deletion
- **WHEN** an authenticated user submits a GDPR deletion request
- **THEN** the system checks if the user has active investments
- **AND** if active investments exist, the request is flagged for admin review
- **AND** an admin notification is sent
- **AND** logs the `user.account.deletion_requested` audit event

#### Scenario: Admin reviews deletion request
- **WHEN** an admin reviews a GDPR deletion request
- **THEN** the admin can see the user's active investments, pending payouts, and transaction history
- **AND** the admin can approve or reject the deletion request
- **AND** if approved, the system executes permanent deletion

#### Scenario: Deletion request auto-approved if no active investments
- **WHEN** a user with no active investments requests GDPR deletion
- **THEN** the system immediately executes permanent deletion without admin review
- **AND** the user receives a confirmation email

### Requirement: Authentication Data Retention Policy
The system SHALL retain authentication audit logs for 7 years even after account deletion for compliance.

#### Scenario: Authentication audit logs retained after deletion
- **WHEN** a user's account is permanently deleted
- **THEN** all `audit_logs` entries for authentication events are retained
- **AND** the `user_id` field remains intact (points to deleted user)
- **AND** audit logs are never deleted as part of GDPR deletion

#### Scenario: Authentication data in audit logs anonymized
- **WHEN** a user's account is permanently deleted
- **THEN** audit log `event_data` payloads containing email/phone are redacted
- **AND** the redacted value is replaced with `<REDACTED>`
- **AND** the audit log event type and timestamp remain intact for compliance

### Requirement: GDPR Deletion Confirmation
The system SHALL send confirmation emails for GDPR data export and deletion operations.

#### Scenario: Deletion confirmation email sent
- **WHEN** a user's account is permanently deleted
- **THEN** a confirmation email is sent to the user's email address (before anonymization)
- **AND** the email confirms the deletion and provides a support contact for any issues
- **AND** logs the `user.account.deletion_confirmed` audit event

#### Scenario: Export confirmation email sent
- **WHEN** a user's data export is ready for download
- **THEN** an email is sent with a secure download link
- **AND** the download link expires after 7 days
- **AND** the email explains what data is included in the export

### Requirement: Account Deactivation Confirmation
The system SHALL require password confirmation before account deactivation.

#### Scenario: Deactivation requires password confirmation
- **WHEN** a user clicks "Deactivate Account"
- **THEN** a confirmation modal is displayed
- **AND** the modal requires the user to enter their current password
- **AND** the deactivation is rejected if the password is incorrect

#### Scenario: Deactivation confirmation modal displays warning
- **WHEN** the deactivation confirmation modal is displayed
- **THEN** it shows a warning: "This will deactivate your account. You can restore it within 30 days by contacting support. After 30 days, your account may be permanently deleted."

### Requirement: GDPR Compliance Documentation
The system SHALL document GDPR rights and processes in the privacy policy.

#### Scenario: Privacy policy explains GDPR rights
- **WHEN** a user views the privacy policy
- **THEN** the policy explains the right to data export (data portability)
- **AND** explains the right to deletion (right to be forgotten)
- **AND** provides instructions for initiating export or deletion requests

#### Scenario: Privacy policy explains data retention
- **WHEN** a user views the privacy policy
- **THEN** the policy explains that authentication audit logs are retained for 7 years
- **AND** explains that financial transaction records are anonymized but retained for regulatory compliance
