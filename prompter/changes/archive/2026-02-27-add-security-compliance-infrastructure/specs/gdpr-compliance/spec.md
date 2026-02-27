# Capability: GDPR Compliance

## ADDED Requirements

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
