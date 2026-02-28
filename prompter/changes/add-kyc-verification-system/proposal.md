# Change: Add KYC Verification System

## Why
Regulatory compliance requires identity verification before investors can purchase tree investments. KYC verification is a legal necessity for an investment platform and builds trust with users and regulatory bodies. This proposal implements the complete KYC verification process including document upload, verification status tracking, admin review workflows, and a provider-agnostic integration layer for third-party KYC services.

## What Changes
- Add `kyc_verifications` table to track verification submissions with status (pending, submitted, verified, rejected)
- Add `kyc_documents` table to store uploaded identity and address proof documents
- Create `KycStatus` enum (pending, submitted, verified, rejected) and add to User model
- Implement `KycProviderInterface` abstraction layer for third-party KYC provider integration
- Create `ManualKycProvider` as default implementation for admin manual review
- Add document upload functionality using Laravel filesystem abstraction (S3 in prod, local in dev)
- Implement KYC verification workflow: document upload → provider verification → status tracking
- Add middleware `EnsureKycIsVerified` to block unverified users from investment actions
- Add KYC status display and re-submission flows in user profile
- Implement notification system for KYC status changes (verified, rejected, expiry warnings)
- Add KYC expiry tracking with scheduled job for re-verification reminders
- Support multiple jurisdictions with configurable document requirements per jurisdiction
- Add comprehensive audit logging for all KYC events
- Implement secure document storage with encryption at rest

## Impact
- **Affected specs:** Creates new capability `kyc-verification`, modifies `user-profile-management`, relates to `audit-logging`, `encryption-at-rest`
- **Affected code:**
  - Database: New tables `kyc_verifications`, `kyc_documents`
  - Models: `User.php` (add KYC relationships), new `KycVerification.php`, `KycDocument.php`
  - Enums: New `KycStatus.php`, `KycDocumentType.php`
  - Services: New `KycVerificationService.php`, `KycProviderInterface.php`, `ManualKycProvider.php`
  - Controllers: New `KycController.php` for user-facing KYC flows
  - Middleware: New `EnsureKycIsVerified.php`
  - Frontend: New pages `Profile/KycVerification.tsx`, `Profile/KycDocumentUpload.tsx`
  - Jobs: New `CheckKycExpiry.php`, `SendKycExpiryReminder.php`
  - Notifications: New `KycVerifiedNotification.php`, `KycRejectedNotification.php`, `KycExpiryReminderNotification.php`
  - Routes: Add KYC routes under profile section with auth middleware
  - Migrations: Create KYC tables, add KYC fields to users table
- **Dependencies:** EPIC-001 (User Authentication) must be complete (already is)
- **Blocks:** EPIC-006 (Investment Purchase) - KYC verification must be implemented before investment transactions can proceed
- **External Dependencies:** Laravel filesystem abstraction (already configured), image validation libraries

## User-Visible Changes
- Users will see KYC verification prompt on dashboard until verified
- New "Verify Identity" section in profile with document upload interface
- Upload passport/national ID/driver's license and proof of address documents
- Real-time KYC status display: pending, submitted, verified, or rejected with reason
- Re-submission flow available after rejection
- Email/in-app notifications when KYC status changes
- Expiry reminders 30 days before KYC verification expires (annual re-verification)
- Investment purchase actions blocked with clear message if KYC not verified

## Technical Notes
- **Provider abstraction:** `KycProviderInterface` allows swapping providers (Stripe Identity, Jumio, Onfido) without changing business logic
- **Manual fallback:** `ManualKycProvider` triggers admin review queue, no external API calls
- **Document security:** All documents stored with Laravel encrypted filesystem, access URLs signed and temporary (1-hour expiry)
- **Multi-jurisdiction:** `jurisdiction_code` field on `kyc_verifications` table allows different document requirements per country
- **Expiry handling:** Annual re-verification by default, configurable per jurisdiction
- **Idempotency:** Re-uploading documents creates new verification record, previous records retained for audit
- **File formats:** Accept JPEG, PNG, PDF up to 10MB per document
- **Validation:** Image/PDF mime type validation, malware scanning placeholder (integrate scanner in production)

## Breaking Changes
None - this is a new feature addition.

## Open Questions
None - all decisions made during proposal phase.
