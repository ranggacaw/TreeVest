# Implementation Tasks

## 1. Database Schema
- [ ] 1.1 Create migration for `kyc_verifications` table with fields: id, user_id, jurisdiction_code, status, submitted_at, verified_at, rejected_at, rejection_reason, verified_by_admin_id, expires_at, provider, provider_reference_id, timestamps
- [ ] 1.2 Create migration for `kyc_documents` table with fields: id, kyc_verification_id, document_type (enum), file_path (encrypted), original_filename, mime_type, file_size, uploaded_at
- [ ] 1.3 Create migration to add KYC fields to `users` table: kyc_status (enum), kyc_verified_at, kyc_expires_at
- [ ] 1.4 Run migrations and verify schema with `php artisan migrate`

## 2. Enums and Models
- [ ] 2.1 Create `app/Enums/KycStatus.php` enum: pending, submitted, verified, rejected
- [ ] 2.2 Create `app/Enums/KycDocumentType.php` enum: passport, national_id, drivers_license, proof_of_address
- [ ] 2.3 Create `app/Models/KycVerification.php` with relationships to User and KycDocuments
- [ ] 2.4 Create `app/Models/KycDocument.php` with relationship to KycVerification
- [ ] 2.5 Update `app/Models/User.php` to add kycVerifications relationship and helper methods: hasVerifiedKyc(), needsKycReverification()

## 3. Provider Interface and Services
- [ ] 3.1 Create `app/Contracts/KycProviderInterface.php` with methods: submitForVerification(), checkVerificationStatus(), cancelVerification()
- [ ] 3.2 Create `app/Services/KycProviders/ManualKycProvider.php` implementing KycProviderInterface
- [ ] 3.3 Create `app/Services/KycVerificationService.php` with methods: createVerification(), uploadDocument(), submitForReview(), approveVerification(), rejectVerification(), checkExpiry()
- [ ] 3.4 Add provider binding in `app/Providers/AppServiceProvider.php` to bind KycProviderInterface to ManualKycProvider by default

## 4. Middleware
- [ ] 4.1 Create `app/Http/Middleware/EnsureKycIsVerified.php` middleware
- [ ] 4.2 Register middleware in `app/Http/Kernel.php` with alias `kyc.verified`
- [ ] 4.3 Add middleware to route groups that require KYC (to be used by investment routes in EPIC-006)

## 5. Controllers
- [ ] 5.1 Create `app/Http/Controllers/KycController.php` with actions: index (show status), create (upload form), store (upload documents), submit (submit for review), show (view documents)
- [ ] 5.2 Create `app/Http/Requests/StoreKycDocumentRequest.php` for document upload validation (file type, size, required documents)
- [ ] 5.3 Create `app/Http/Requests/SubmitKycVerificationRequest.php` for verification submission

## 6. Frontend Pages
- [ ] 6.1 Create `resources/js/Pages/Profile/KycVerification/Index.tsx` - displays current KYC status, verification history, and call-to-action
- [ ] 6.2 Create `resources/js/Pages/Profile/KycVerification/Upload.tsx` - document upload interface with drag-drop
- [ ] 6.3 Create `resources/js/Components/KycStatusBadge.tsx` - reusable component for displaying KYC status with colors
- [ ] 6.4 Create `resources/js/Components/KycDocumentUploader.tsx` - reusable document upload component with preview
- [ ] 6.5 Add KYC prompt to `resources/js/Pages/Dashboard.tsx` for unverified users
- [ ] 6.6 Add types to `resources/js/types/index.d.ts`: KycVerification, KycDocument, KycStatus enum

## 7. Routes
- [ ] 7.1 Add KYC routes to `routes/web.php` under `/profile/kyc` with auth middleware
- [ ] 7.2 Add route names: `kyc.index`, `kyc.upload`, `kyc.store`, `kyc.submit`, `kyc.show`

## 8. Jobs and Scheduled Tasks
- [ ] 8.1 Create `app/Jobs/CheckKycExpiry.php` job to check for expiring KYC verifications (30-day warning)
- [ ] 8.2 Create `app/Jobs/SendKycExpiryReminder.php` job to send reminder notifications
- [ ] 8.3 Register scheduled task in `app/Console/Kernel.php` to run CheckKycExpiry daily
- [ ] 8.4 Create `app/Jobs/ProcessKycVerification.php` job for async provider API calls (when provider is integrated)

## 9. Notifications
- [ ] 9.1 Create `app/Notifications/KycVerifiedNotification.php` (email + database channel)
- [ ] 9.2 Create `app/Notifications/KycRejectedNotification.php` with rejection reason (email + database channel)
- [ ] 9.3 Create `app/Notifications/KycExpiryReminderNotification.php` (email + database channel)
- [ ] 9.4 Create `app/Notifications/KycSubmittedNotification.php` to confirm submission (email + database channel)

## 10. Audit Logging
- [ ] 10.1 Add KYC audit event types to `app/Enums/AuditEventType.php`: kyc_submitted, kyc_verified, kyc_rejected, kyc_document_uploaded, kyc_expiry_checked
- [ ] 10.2 Add audit logging calls in KycVerificationService for all status changes
- [ ] 10.3 Log admin actions (approve/reject) with admin_id in audit metadata

## 11. Configuration
- [ ] 11.1 Add KYC configuration to `config/treevest.php`: allowed_document_types, max_file_size, expiry_period_days, expiry_reminder_days
- [ ] 11.2 Add jurisdiction configuration structure for future expansion (default to 'MY' - Malaysia)
- [ ] 11.3 Configure filesystem disk for KYC documents in `config/filesystems.php` (use `private` disk with encryption)

## 12. Testing
- [ ] 12.1 Create `tests/Unit/Services/KycVerificationServiceTest.php` - test verification lifecycle
- [ ] 12.2 Create `tests/Unit/Services/ManualKycProviderTest.php` - test manual provider logic
- [ ] 12.3 Create `tests/Feature/KycVerificationTest.php` - test user upload and submission flow
- [ ] 12.4 Create `tests/Feature/KycMiddlewareTest.php` - test middleware blocking unverified users
- [ ] 12.5 Create `tests/Unit/Models/UserTest.php` additions - test hasVerifiedKyc() and needsKycReverification()
- [ ] 12.6 Create `tests/Feature/KycExpiryTest.php` - test expiry checking and reminder jobs
- [ ] 12.7 Create factory `database/factories/KycVerificationFactory.php` for test data
- [ ] 12.8 Create factory `database/factories/KycDocumentFactory.php` for test data
- [ ] 12.9 Run all tests with `php artisan test` and ensure 100% pass rate

## 13. Documentation
- [ ] 13.1 Update root `AGENTS.md` Section 6 (Data Models) to include KycVerification and KycDocument entities
- [ ] 13.2 Update root `AGENTS.md` Section 7 (Domain Vocabulary) with KYC-related terms
- [ ] 13.3 Update root `AGENTS.md` Section 9 (UI/UX) with KYC workflow details
- [ ] 13.4 Add inline PHPDoc comments to all new classes and methods
- [ ] 13.5 Add inline TSDoc comments to all new React components

## 14. Security Hardening
- [ ] 14.1 Add `NoXss` and `SafeFilename` validation rules to document upload requests
- [ ] 14.2 Implement signed temporary URLs for document preview (1-hour expiry)
- [ ] 14.3 Add rate limiting to document upload endpoint (5 uploads per hour per user)
- [ ] 14.4 Add CSRF protection verification on all KYC forms
- [ ] 14.5 Add file mime type validation (not just extension checking)

## 15. Integration Preparation
- [ ] 15.1 Create placeholder methods in KycProviderInterface for future webhook handling
- [ ] 15.2 Document provider integration requirements in `docs/kyc-provider-integration.md`
- [ ] 15.3 Add configuration example for switching providers in `.env.example`: `KYC_PROVIDER=manual`

## Post-Implementation
- [ ] Run `./vendor/bin/pint` to format all PHP code
- [ ] Run `php artisan test` to verify all tests pass
- [ ] Run `prompter validate add-kyc-verification-system --strict --no-interactive` to validate proposal
- [ ] Update root `AGENTS.md` with KYC capability details
- [ ] Create PR with reference to EPIC-002
