# kyc-verification Specification

## Purpose
TBD - created by archiving change add-kyc-verification-system. Update Purpose after archive.
## Requirements
### Requirement: KYC Verification Record Management
The system SHALL create and track KYC verification records for each user with support for multiple submissions and re-verification cycles.

#### Scenario: First-time KYC verification created
- **WHEN** a user initiates KYC verification for the first time
- **THEN** the system creates a new KycVerification record with status 'pending'
- **AND** sets the jurisdiction_code based on user's location or explicit selection
- **AND** logs an audit event 'kyc_verification_created'

#### Scenario: User can have multiple verification records
- **WHEN** a user with a rejected verification submits again
- **THEN** the system creates a new KycVerification record
- **AND** retains the previous verification record with status 'rejected' for audit history
- **AND** the new verification becomes the active one

#### Scenario: Annual re-verification creates new record
- **WHEN** a user's KYC verification expires after 365 days
- **THEN** the system allows the user to create a new verification record
- **AND** the previous verification record is marked as expired but retained

### Requirement: Document Upload
The system SHALL allow users to upload identity and address proof documents with secure storage and validation.

#### Scenario: User uploads identity document
- **WHEN** a user uploads a passport, national ID, or driver's license image/PDF
- **THEN** the system validates file type (JPEG, PNG, PDF only)
- **AND** validates file size (maximum 10MB)
- **AND** stores the file with UUID filename on private disk
- **AND** encrypts the file_path in the database
- **AND** creates a KycDocument record linked to the active KycVerification
- **AND** logs an audit event 'kyc_document_uploaded'

#### Scenario: User uploads proof of address document
- **WHEN** a user uploads a utility bill or bank statement
- **THEN** the system validates file type and size
- **AND** stores the document with document_type 'proof_of_address'
- **AND** the document is available for admin or provider review

#### Scenario: Invalid document type rejected
- **WHEN** a user attempts to upload a file that is not JPEG, PNG, or PDF
- **THEN** the system rejects the upload
- **AND** displays an error message "Only JPEG, PNG, and PDF files are allowed."

#### Scenario: Oversized document rejected
- **WHEN** a user attempts to upload a file larger than 10MB
- **THEN** the system rejects the upload
- **AND** displays an error message "File size must not exceed 10MB."

#### Scenario: Required documents check before submission
- **WHEN** a user clicks "Submit for Review" without uploading required documents for their jurisdiction
- **THEN** the system prevents submission
- **AND** displays an error listing missing document types

### Requirement: KYC Submission and Review
The system SHALL allow users to submit uploaded documents for verification and track the review process.

#### Scenario: User submits KYC for verification
- **WHEN** a user clicks "Submit for Review" with all required documents uploaded
- **THEN** the system changes KycVerification status to 'submitted'
- **AND** sets submitted_at timestamp
- **AND** calls the configured KycProvider's submitForVerification() method
- **AND** stores the provider_reference_id returned
- **AND** sends a KycSubmittedNotification to the user
- **AND** logs an audit event 'kyc_submitted'

#### Scenario: Manual provider queues admin review
- **WHEN** the ManualKycProvider is used and verification is submitted
- **THEN** the provider returns a reference ID in format 'manual-{verification_id}'
- **AND** the verification remains in 'submitted' status until admin review

#### Scenario: Admin approves KYC verification
- **WHEN** an admin approves a KYC verification in 'submitted' status
- **THEN** the system changes status to 'verified'
- **AND** sets verified_at timestamp to current time
- **AND** sets verified_by_admin_id to the admin's user ID
- **AND** calculates and sets kyc_expires_at (verified_at + expiry_period_days for jurisdiction)
- **AND** updates user.kyc_status to 'verified'
- **AND** updates user.kyc_verified_at and user.kyc_expires_at
- **AND** sends a KycVerifiedNotification to the user
- **AND** logs an audit event 'kyc_verified' with admin_id in metadata

#### Scenario: Admin rejects KYC verification with reason
- **WHEN** an admin rejects a KYC verification with a rejection reason
- **THEN** the system changes status to 'rejected'
- **AND** sets rejected_at timestamp
- **AND** stores the rejection_reason text
- **AND** updates user.kyc_status to 'rejected'
- **AND** sends a KycRejectedNotification with the rejection reason
- **AND** logs an audit event 'kyc_rejected' with reason in metadata

### Requirement: KYC Status Tracking
The system SHALL maintain real-time KYC status on the User model for quick access checks.

#### Scenario: KYC status denormalized to users table
- **WHEN** a KycVerification status changes to 'verified'
- **THEN** the system updates user.kyc_status to 'verified'
- **AND** updates user.kyc_verified_at and user.kyc_expires_at from the verification record

#### Scenario: User checks if KYC is verified
- **WHEN** the system calls user.hasVerifiedKyc()
- **THEN** it returns true if user.kyc_status is 'verified' AND user.kyc_expires_at is in the future
- **AND** returns false otherwise

#### Scenario: User checks if re-verification needed
- **WHEN** the system calls user.needsKycReverification()
- **THEN** it returns true if user.kyc_status is 'verified' AND user.kyc_expires_at is in the past
- **AND** returns false if status is not 'verified' or expiry is in the future

### Requirement: Investment Action Blocking
The system SHALL block unverified users from investment actions via middleware.

#### Scenario: Unverified user attempts to access investment route
- **WHEN** a user with kyc_status 'pending' or 'submitted' accesses a route with kyc.verified middleware
- **THEN** the system redirects to kyc.index
- **AND** displays an error message "You must complete KYC verification before investing."

#### Scenario: Rejected user attempts to access investment route
- **WHEN** a user with kyc_status 'rejected' accesses a route with kyc.verified middleware
- **THEN** the system redirects to kyc.index
- **AND** displays an error message "Your KYC verification was rejected. Please review the feedback and re-submit."

#### Scenario: Expired KYC user attempts to access investment route
- **WHEN** a user with expired KYC (kyc_expires_at in the past) accesses a route with kyc.verified middleware
- **THEN** the system redirects to kyc.index
- **AND** displays an error message "Your KYC verification has expired. Please re-verify your identity."

#### Scenario: Verified user accesses investment route
- **WHEN** a user with kyc_status 'verified' and kyc_expires_at in the future accesses a route with kyc.verified middleware
- **THEN** the request proceeds normally

### Requirement: Document Access Control
The system SHALL restrict document access to the document owner and administrators only using signed temporary URLs.

#### Scenario: User views their own document
- **WHEN** a user requests a preview URL for their own KYC document
- **THEN** the system generates a signed temporary URL valid for 1 hour
- **AND** returns the URL for display in the frontend

#### Scenario: User attempts to view another user's document
- **WHEN** a user requests a preview URL for a document belonging to another user
- **THEN** the system rejects the request with a 403 Forbidden response

#### Scenario: Admin views any user's document
- **WHEN** an admin requests a preview URL for any KYC document
- **THEN** the system generates a signed temporary URL valid for 1 hour
- **AND** logs an audit event 'kyc_document_accessed' with admin_id

#### Scenario: Expired temporary URL rejected
- **WHEN** a signed document URL is accessed after 1 hour
- **THEN** the system rejects the request with a 403 Forbidden response

### Requirement: KYC Expiry and Re-verification
The system SHALL track KYC expiry dates and send reminders to users for re-verification.

#### Scenario: KYC expiry date set on verification
- **WHEN** a KYC verification is approved
- **THEN** the system calculates kyc_expires_at as verified_at + expiry_period_days from jurisdiction config
- **AND** stores kyc_expires_at on both KycVerification and User records

#### Scenario: Daily scheduled job checks for expiring KYC
- **WHEN** the CheckKycExpiry scheduled job runs daily
- **THEN** the system finds all KycVerifications with expires_at between now and 30 days in the future
- **AND** dispatches SendKycExpiryReminder jobs for each user
- **AND** logs an audit event 'kyc_expiry_checked'

#### Scenario: User receives 30-day expiry reminder
- **WHEN** a user's KYC expires in 30 days
- **THEN** the system sends a KycExpiryReminderNotification via email and database channel
- **AND** the notification includes a link to start re-verification

#### Scenario: User with expired KYC cannot invest
- **WHEN** a user's kyc_expires_at is in the past
- **THEN** user.needsKycReverification() returns true
- **AND** the kyc.verified middleware blocks access to investment routes

#### Scenario: Re-verification process same as first verification
- **WHEN** a user with expired KYC starts re-verification
- **THEN** the system creates a new KycVerification record
- **AND** requires document re-upload (or provider re-check)
- **AND** follows the same submission and review workflow

### Requirement: Multi-Jurisdiction Support
The system SHALL support different document requirements and expiry periods per jurisdiction.

#### Scenario: Jurisdiction determines required documents
- **WHEN** a user in Malaysia (MY) initiates KYC verification
- **THEN** the system requires upload of ['passport' OR 'national_id', 'proof_of_address']
- **AND** the jurisdiction_code is set to 'MY' on the KycVerification

#### Scenario: Jurisdiction determines expiry period
- **WHEN** a KYC verification for Malaysia (MY) is approved
- **THEN** the system uses expiry_period_days from config('treevest.kyc.jurisdictions.MY.expiry_period_days')
- **AND** sets kyc_expires_at accordingly

#### Scenario: Different jurisdiction has different requirements
- **WHEN** a user in Singapore (SG) initiates KYC verification
- **THEN** the system requires upload of ['national_id', 'proof_of_address'] per SG config
- **AND** may have a different expiry period (e.g., 730 days for SG vs 365 days for MY)

#### Scenario: Unsupported jurisdiction falls back to default
- **WHEN** a user initiates KYC verification with an unsupported jurisdiction_code
- **THEN** the system uses the default_jurisdiction config value ('MY')
- **AND** applies the default document requirements

### Requirement: Provider Abstraction
The system SHALL support multiple KYC verification providers through a common interface.

#### Scenario: Manual provider used by default
- **WHEN** the system is configured with KYC_PROVIDER=manual in .env
- **THEN** KycVerificationService uses ManualKycProvider
- **AND** all verifications require manual admin review

#### Scenario: Provider interface allows swapping implementations
- **WHEN** a new provider implementation (e.g., StripeIdentityProvider) is created
- **THEN** it implements KycProviderInterface with submitForVerification(), checkVerificationStatus(), cancelVerification()
- **AND** can be bound in AppServiceProvider to replace ManualKycProvider
- **AND** business logic in KycVerificationService remains unchanged

#### Scenario: Provider reference ID stored
- **WHEN** a provider's submitForVerification() returns a reference ID
- **THEN** the system stores it in kyc_verifications.provider_reference_id
- **AND** logs the provider name in kyc_verifications.provider field
- **AND** uses the reference ID for status checks and cancellation

### Requirement: KYC Audit Logging
The system SHALL log all KYC-related events to the audit trail for regulatory compliance.

#### Scenario: Document upload logged
- **WHEN** a user uploads a KYC document
- **THEN** the system logs an audit event with type 'kyc_document_uploaded'
- **AND** includes user_id, document_type, file_size, and kyc_verification_id in metadata

#### Scenario: KYC submission logged
- **WHEN** a user submits KYC for verification
- **THEN** the system logs an audit event with type 'kyc_submitted'
- **AND** includes user_id, jurisdiction_code, and provider in metadata

#### Scenario: KYC verification logged
- **WHEN** an admin approves KYC verification
- **THEN** the system logs an audit event with type 'kyc_verified'
- **AND** includes user_id, verified_by_admin_id, and expires_at in metadata

#### Scenario: KYC rejection logged
- **WHEN** an admin rejects KYC verification
- **THEN** the system logs an audit event with type 'kyc_rejected'
- **AND** includes user_id, rejected_by_admin_id, and rejection_reason in metadata

#### Scenario: Document access logged for admins
- **WHEN** an admin views a user's KYC document
- **THEN** the system logs an audit event with type 'kyc_document_accessed'
- **AND** includes user_id, admin_id, and document_id in metadata

### Requirement: KYC Notifications
The system SHALL notify users of KYC status changes via email and in-app notifications.

#### Scenario: Submission confirmation sent
- **WHEN** a user submits KYC for verification
- **THEN** the system sends a KycSubmittedNotification via email and database channels
- **AND** the notification confirms submission and sets expectation for review time

#### Scenario: Verification success notification sent
- **WHEN** KYC verification is approved
- **THEN** the system sends a KycVerifiedNotification via email and database channels
- **AND** the notification congratulates the user and mentions the expiry date

#### Scenario: Rejection notification sent with reason
- **WHEN** KYC verification is rejected
- **THEN** the system sends a KycRejectedNotification via email and database channels
- **AND** the notification includes the rejection_reason
- **AND** includes a link to re-submit with corrections

#### Scenario: Expiry reminder sent
- **WHEN** a user's KYC expires in 30 days
- **THEN** the system sends a KycExpiryReminderNotification via email and database channels
- **AND** the notification warns of upcoming expiry
- **AND** includes a link to start re-verification

### Requirement: KYC Status Display
The system SHALL display KYC verification status and progress to users in their profile.

#### Scenario: User views KYC status page
- **WHEN** a user navigates to /profile/kyc
- **THEN** the system displays their current kyc_status (pending, submitted, verified, rejected)
- **AND** displays verification progress (documents uploaded, submission status)
- **AND** displays expiry date if verified

#### Scenario: Pending status shows upload prompt
- **WHEN** a user with kyc_status 'pending' views the KYC page
- **THEN** the system displays a call-to-action to upload documents
- **AND** lists the required documents for their jurisdiction

#### Scenario: Submitted status shows waiting message
- **WHEN** a user with kyc_status 'submitted' views the KYC page
- **THEN** the system displays "Your verification is under review."
- **AND** displays submitted_at timestamp

#### Scenario: Verified status shows success message
- **WHEN** a user with kyc_status 'verified' views the KYC page
- **THEN** the system displays "Your identity is verified."
- **AND** displays verified_at and expires_at dates

#### Scenario: Rejected status shows rejection reason and re-upload option
- **WHEN** a user with kyc_status 'rejected' views the KYC page
- **THEN** the system displays the rejection_reason
- **AND** displays a button to start a new verification

### Requirement: Rate Limiting for Document Uploads
The system SHALL rate-limit document uploads to prevent abuse.

#### Scenario: User uploads within rate limit
- **WHEN** a user uploads 4 documents within 1 hour
- **THEN** all uploads succeed

#### Scenario: User exceeds upload rate limit
- **WHEN** a user attempts to upload a 6th document within 1 hour
- **THEN** the system rejects the upload with 429 Too Many Requests
- **AND** displays an error message "You have uploaded too many documents. Please try again later."

### Requirement: Document Security Validation
The system SHALL validate uploaded documents for security risks.

#### Scenario: File extension validation
- **WHEN** a user uploads a file with extension .jpg, .jpeg, .png, or .pdf
- **THEN** the system validates the actual mime type matches the extension
- **AND** rejects files with mismatched mime types

#### Scenario: Filename sanitization
- **WHEN** a user uploads a document with special characters or path traversal attempts in the filename
- **THEN** the system sanitizes the filename using SafeFilename rule
- **AND** stores with a UUID filename to prevent path attacks

#### Scenario: File content validation
- **WHEN** a user uploads an image file
- **THEN** the system verifies it is a valid image (can be opened by image library)
- **AND** rejects corrupted or malicious files

