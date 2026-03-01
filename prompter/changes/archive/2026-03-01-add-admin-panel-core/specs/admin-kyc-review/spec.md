## ADDED Requirements

### Requirement: Admin KYC Review Queue
The system SHALL provide an admin-only paginated list of KYC verifications pending review, filterable by status.

#### Scenario: Admin views KYC review queue
- **WHEN** an admin navigates to `/admin/kyc`
- **THEN** the system returns a paginated list of KYC verifications (20 per page) ordered by submitted_at ascending (oldest first)
- **AND** by default the list shows only verifications with status `submitted`
- **AND** each row shows: user name/email, jurisdiction code, submitted_at, document count

#### Scenario: Admin filters KYC list by status
- **WHEN** an admin selects a status filter (pending, submitted, verified, rejected)
- **THEN** the list shows only verifications with that status

#### Scenario: KYC queue shows count of pending reviews
- **WHEN** an admin views the KYC list page
- **THEN** the page header shows the count of verifications with status `submitted` awaiting review

### Requirement: Admin KYC Verification Detail
The system SHALL allow admins to view a KYC verification record with document previews before making an approve/reject decision.

#### Scenario: Admin views KYC detail with documents
- **WHEN** an admin navigates to `/admin/kyc/{verification}`
- **THEN** the system renders the verification record details: user info, jurisdiction, submitted_at, provider reference ID, and a list of uploaded documents
- **AND** each document entry shows document_type, original_filename, uploaded_at, and a "Preview" link

#### Scenario: Admin generates temporary document preview URL
- **WHEN** an admin clicks "Preview" for a KYC document
- **THEN** the system generates a signed temporary URL valid for 1 hour
- **AND** logs an audit event `kyc_document_accessed` with admin_id and document_id
- **AND** the document opens in a new browser tab

#### Scenario: Expired temporary URL rejected
- **WHEN** a document preview URL is accessed after its 1-hour expiry
- **THEN** the system returns HTTP 403 Forbidden

### Requirement: Admin KYC Approval
The system SHALL allow admins to approve a submitted KYC verification, updating the user's KYC status.

#### Scenario: Admin approves KYC verification
- **WHEN** an admin submits an approval for a KYC verification with status `submitted`
- **THEN** the system delegates to `KycVerificationService::approve()` which:
  - Changes status to `verified`
  - Sets `verified_at` to current timestamp
  - Sets `verified_by_admin_id` to the admin's user ID
  - Calculates and sets `kyc_expires_at`
  - Updates `user.kyc_status` to `verified`
  - Sends a `KycVerifiedNotification` to the user
  - Logs audit event `kyc_verified` with admin_id in metadata
- **AND** the admin is redirected to the KYC list with a success flash message

#### Scenario: Admin cannot approve already-verified verification
- **WHEN** an admin attempts to approve a KYC verification that is already `verified`
- **THEN** the system returns HTTP 422
- **AND** returns an error: "Verification is already approved"

### Requirement: Admin KYC Rejection
The system SHALL allow admins to reject a submitted KYC verification with a mandatory rejection reason.

#### Scenario: Admin rejects KYC verification with reason
- **WHEN** an admin submits a rejection with a reason for a KYC verification with status `submitted`
- **THEN** the system delegates to `KycVerificationService::reject()` which:
  - Changes status to `rejected`
  - Sets `rejected_at` timestamp
  - Stores the `rejection_reason` text
  - Updates `user.kyc_status` to `rejected`
  - Sends a `KycRejectedNotification` with the rejection reason to the user
  - Logs audit event `kyc_rejected` with reason in metadata
- **AND** the admin is redirected to the KYC list with a success flash message

#### Scenario: Rejection reason is required
- **WHEN** an admin submits a rejection without providing a reason
- **THEN** the system returns HTTP 422 with validation error: "Rejection reason is required"

#### Scenario: Rejection reason has maximum length
- **WHEN** an admin submits a rejection reason longer than 1000 characters
- **THEN** the system returns HTTP 422 with validation error: "Rejection reason must not exceed 1000 characters"
