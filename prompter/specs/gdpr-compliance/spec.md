# gdpr-compliance Specification

## Purpose
TBD - created by archiving change add-security-compliance-infrastructure. Update Purpose after archive.
## Requirements
### Requirement: User Data Export (Right to Data Portability)
The system SHALL provide a mechanism for users to request and receive a complete export of all their personal data stored in the platform in a structured, machine-readable format (JSON) within 30 days of request, in compliance with GDPR Article 20.

#### Scenario: User requests data export
- **WHEN** a user clicks "Download My Data" in their account settings
- **THEN** an `ExportUserData` job is dispatched to the queue
- **AND** the user receives a confirmation message: "Your data export has been requested. You will receive an email with a download link within 24 hours."

#### Scenario: Data export job generates JSON file
- **WHEN** the `ExportUserData` job processes
- **THEN** the `GdprExportService` aggregates all user data from tables: `users`, `investments`, `transactions`, `audit_logs`, `user_document_acceptances`
- **AND** the data is serialized to a JSON file with structure: `{ "user": {...}, "investments": [...], "transactions": [...], "audit_logs": [...], "legal_acceptances": [...] }`
- **AND** the file is stored in `storage/app/exports/user-{user_id}-data-{date}.json`

#### Scenario: User receives download link via email
- **WHEN** the data export file is generated
- **THEN** an email is sent to the user with a secure download link
- **AND** the link is valid for 7 days and requires authentication to access

#### Scenario: User downloads exported data
- **WHEN** a user clicks the download link from the email
- **THEN** the system verifies the user's identity (must be logged in as the same user)
- **AND** the JSON file is streamed for download
- **AND** an audit log entry is created with event type `gdpr_data_export_downloaded`

#### Scenario: Export file expires after 7 days
- **WHEN** 7 days have passed since the export file was generated
- **THEN** the file is automatically deleted from storage
- **AND** the download link returns HTTP 404 Not Found
- **AND** users must request a new export if needed

### Requirement: User Data Deletion (Right to Be Forgotten)
The system SHALL provide a mechanism for users to request deletion of their personal data, with a process that soft-deletes the user account, anonymizes financial transaction records (for legal retention), and permanently deletes non-essential data, in compliance with GDPR Article 17.

#### Scenario: User requests account deletion
- **WHEN** a user navigates to account settings and clicks "Delete My Account"
- **THEN** a confirmation modal is displayed: "Are you sure you want to delete your account? This action cannot be undone. Your financial transaction records will be anonymized but retained for legal compliance."
- **AND** the user must confirm by entering their password

#### Scenario: Account deletion job dispatched
- **WHEN** the user confirms account deletion
- **THEN** a `DeleteUserData` job is dispatched to the queue
- **AND** the user receives a confirmation message: "Your account deletion request has been submitted. You will receive a confirmation email within 24 hours."

#### Scenario: User account soft-deleted
- **WHEN** the `DeleteUserData` job processes
- **THEN** the user's record is soft-deleted (Laravel's `SoftDeletes` trait: `deleted_at` timestamp set)
- **AND** the user cannot log in after deletion
- **AND** the user's email and phone are anonymized: replaced with `deleted_user_{user_id}@example.com` and `null`

#### Scenario: Financial transaction records anonymized
- **WHEN** the user account is deleted
- **THEN** all `Transaction` records for that user have `user_id` preserved but personal data fields (name, email, phone) are replaced with placeholder: `DELETED_USER`
- **AND** transaction amounts and timestamps are retained for financial compliance (7-year retention)

#### Scenario: Non-financial data permanently deleted
- **WHEN** the user account is deleted
- **THEN** the following records are permanently deleted (hard delete): `investments` (if no active payouts), `messages`, `notifications`, `user_document_acceptances`
- **AND** audit logs are retained (immutable, for compliance) but anonymized (user identifiable data replaced)

#### Scenario: Deletion confirmation email sent
- **WHEN** the account deletion process completes
- **THEN** a final confirmation email is sent to the user's email address (before anonymization)
- **AND** the email confirms: "Your account has been deleted. Your personal data has been removed. Financial transaction records have been anonymized and retained for legal compliance."

#### Scenario: Deletion logged in audit trail
- **WHEN** a user account is deleted
- **THEN** an audit log entry is created with event type `gdpr_account_deletion_completed`
- **AND** the log includes the user ID, deletion timestamp, and IP address of the deletion request
- **AND** administrators have a complete record of all deletion requests

### Requirement: GDPR Compliance Configuration
The system SHALL provide a `config/gdpr.php` configuration file defining retention policies, anonymization rules, and export/deletion workflow settings.

#### Scenario: Retention policy configured
- **WHEN** `config('gdpr.transaction_retention_years')` is set to `7`
- **THEN** financial transaction records are retained (anonymized) for 7 years before eligible for purging
- **AND** retention periods can be adjusted to comply with jurisdiction-specific regulations

#### Scenario: Anonymization rules defined
- **WHEN** account deletion is processed
- **THEN** anonymization rules from `config('gdpr.anonymization_rules')` are applied
- **AND** rules specify which fields to replace with placeholders (e.g., `email -> deleted_user_{id}@example.com`, `phone -> null`)

#### Scenario: Export file expiration configurable
- **WHEN** `config('gdpr.export_link_expiry_days')` is set to `14`
- **THEN** data export download links expire after 14 days instead of 7
- **AND** expiration can be adjusted based on business requirements

### Requirement: GDPR Data Export Service
The system SHALL provide a `GdprExportService` that aggregates user data from all relevant tables and serializes it into a structured JSON format for data portability.

#### Scenario: Export includes all user data categories
- **WHEN** `GdprExportService::exportUserData($userId)` is called
- **THEN** the service queries and includes data from: `users` table (profile), `investments` table (investment history), `transactions` table (financial history), `audit_logs` table (activity history), `user_document_acceptances` table (consent records)
- **AND** each data category is serialized under a top-level key in the JSON structure

#### Scenario: Exported data is complete and structured
- **WHEN** the JSON export file is generated
- **THEN** it contains: `{"user": {...}, "investments": [{...}], "transactions": [{...}], "audit_logs": [{...}], "legal_acceptances": [{...}]}`
- **AND** all timestamps are ISO 8601 formatted
- **AND** all monetary amounts include currency code
- **AND** all relationships are fully loaded (e.g., investments include related tree and payout data)

#### Scenario: Export service handles large datasets
- **WHEN** a user has >10,000 transactions or investments
- **THEN** the export service paginates queries internally to avoid memory exhaustion
- **AND** the final JSON file is generated without timeout or memory errors

### Requirement: GDPR Data Deletion Service
The system SHALL provide a `GdprDeletionService` that orchestrates the soft-deletion, anonymization, and hard-deletion of user data according to GDPR requirements and legal retention policies.

#### Scenario: Deletion service orchestrates multi-step process
- **WHEN** `GdprDeletionService::deleteUserData($userId)` is called
- **THEN** the service executes the following steps in order: (1) soft-delete user record, (2) anonymize transaction records, (3) hard-delete non-financial data, (4) log deletion in audit trail, (5) send confirmation email
- **AND** all steps are wrapped in a database transaction for atomicity

#### Scenario: Deletion service respects retention policies
- **WHEN** a user has active investments with pending payouts
- **THEN** the deletion service defers deletion of investment records until payouts are completed
- **AND** the user is notified: "Your account deletion is pending. Investments with active payouts will be anonymized after final payout distribution."

#### Scenario: Deletion service provides rollback capability
- **WHEN** the deletion process encounters an error (e.g., database constraint violation)
- **THEN** the database transaction is rolled back
- **AND** the user account remains intact (not soft-deleted)
- **AND** an error is logged and administrators are notified

### Requirement: GDPR Documentation and User Transparency
The system SHALL provide clear documentation and user-facing explanations of data export and deletion workflows in the privacy policy and account settings pages.

#### Scenario: Privacy policy explains GDPR rights
- **WHEN** a user views the privacy policy page
- **THEN** the policy includes a section titled "Your Data Rights" explaining: right to access (data export), right to erasure (deletion), right to portability, and how to exercise these rights
- **AND** contact information for data protection inquiries is provided

#### Scenario: Account settings page provides GDPR controls
- **WHEN** a user navigates to account settings
- **THEN** the page includes buttons: "Download My Data" and "Delete My Account"
- **AND** each button displays a tooltip explaining what data is included and the process timeline

#### Scenario: Deletion process explains data retention
- **WHEN** a user initiates account deletion
- **THEN** the confirmation modal explains: "Your personal data will be deleted. Financial transaction records will be anonymized and retained for 7 years to comply with financial regulations. Audit logs will be retained for security and compliance purposes."
- **AND** users are fully informed before confirming deletion

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

