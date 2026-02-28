# Design Document: KYC Verification System

## Context
KYC (Know Your Customer) verification is a regulatory requirement for investment platforms. Users must verify their identity before making any investment transactions. The system must handle document uploads, verification workflows, status tracking, and integration with third-party verification providers while maintaining security and compliance.

**Stakeholders:**
- Investors: Need simple, secure identity verification process
- Admins: Need review tools and manual override capabilities
- Regulatory bodies: Require audit trails and compliance evidence
- Platform: Must integrate with external KYC providers flexibly

**Constraints:**
- Third-party KYC provider not yet selected
- Must support multiple jurisdictions (different document requirements per country)
- Documents must be encrypted at rest (GDPR, data protection laws)
- Audit trail required for all KYC events
- System must work with manual admin review initially, but support automated provider integration later

## Goals / Non-Goals

**Goals:**
- Provider-agnostic architecture: can swap KYC providers without changing business logic
- Secure document storage with encryption at rest and temporary signed URLs
- Support multiple jurisdictions with configurable document requirements
- KYC expiry tracking with automated reminders (annual re-verification)
- Block unverified users from investment actions via middleware
- Comprehensive audit logging for regulatory compliance
- Manual admin review workflow as default, with API provider support
- User-friendly upload interface with real-time status updates

**Non-Goals:**
- Admin dashboard for KYC review (part of EPIC-014, not this change)
- Investment transaction blocking logic (part of EPIC-006, this change only provides the middleware)
- AML (Anti-Money Laundering) screening (future scope)
- Farm owner credential verification (separate process)
- Mobile app KYC flow (web-only at launch)
- Real-time video verification (may be added with specific providers later)

## Decisions

### Decision 1: Provider Abstraction Layer
**Choice:** Create `KycProviderInterface` with multiple implementations (Manual, Stripe Identity, Jumio, etc.)

**Rationale:**
- KYC provider selection is pending - need flexibility
- Different jurisdictions may require different providers
- Allows testing with manual review, production with automated provider
- Clean separation of concerns: business logic vs provider API details

**Alternatives considered:**
- Hard-code Stripe Identity: Too early to commit, lock-in risk
- No abstraction, integrate provider directly: Cannot test or use manual review, hard to swap providers

**Implementation:**
```php
interface KycProviderInterface {
    public function submitForVerification(KycVerification $verification): string; // returns provider_reference_id
    public function checkVerificationStatus(string $referenceId): array; // returns [status, details]
    public function cancelVerification(string $referenceId): bool;
}

class ManualKycProvider implements KycProviderInterface {
    public function submitForVerification(KycVerification $verification): string {
        // Create admin review task, return internal task ID
        return 'manual-' . $verification->id;
    }
    // ... status always 'submitted' until admin manually approves
}

class StripeIdentityProvider implements KycProviderInterface {
    // Future implementation - calls Stripe Identity API
}
```

### Decision 2: Database Schema - Separate KYC Verification Records
**Choice:** Create dedicated `kyc_verifications` and `kyc_documents` tables, not just add fields to `users` table

**Rationale:**
- One user may have multiple verification attempts (rejection and re-submission)
- Full audit history preserved (who verified, when, with which documents)
- Different jurisdictions may have different document requirements
- Supports annual re-verification (multiple verification records over user lifetime)
- Clean separation: users table = identity, kyc_verifications = compliance records

**Schema:**
```
kyc_verifications:
  - id, user_id, jurisdiction_code, status (enum)
  - submitted_at, verified_at, rejected_at, expires_at
  - rejection_reason, verified_by_admin_id
  - provider (string: 'manual', 'stripe_identity', etc.)
  - provider_reference_id

kyc_documents:
  - id, kyc_verification_id, document_type (enum)
  - file_path (encrypted), original_filename, mime_type, file_size
  - uploaded_at

users table additions:
  - kyc_status (enum: pending, submitted, verified, rejected)
  - kyc_verified_at, kyc_expires_at
  (Denormalized for quick checks; source of truth is kyc_verifications)
```

**Alternatives considered:**
- Add kyc_* fields directly to users table: Loses audit history, cannot track re-submissions
- Single documents JSON field: Cannot query by document type, poor relational integrity

### Decision 3: Document Storage Strategy
**Choice:** Laravel filesystem abstraction with `private` disk, encrypted casting

**Configuration:**
```php
// config/filesystems.php
'disks' => [
    'kyc_documents' => [
        'driver' => env('KYC_STORAGE_DRIVER', 's3'), // S3 in prod, local in dev
        'root' => storage_path('app/kyc_documents'), // local fallback
        'visibility' => 'private',
        'throw' => true,
    ],
],
```

**Access control:**
- Documents stored with UUID filenames (no guessable paths)
- Access via signed temporary URLs (1-hour expiry): `Storage::disk('kyc_documents')->temporaryUrl($path, now()->addHour())`
- Middleware checks: only document owner or admin can view
- File paths encrypted in database (Laravel encrypted casting)

**Rationale:**
- Laravel filesystem abstraction allows swapping storage backends
- Private disk prevents direct URL access
- Signed URLs provide time-limited access without permanent exposure
- Encryption at rest satisfies GDPR requirements

**Alternatives considered:**
- Public S3 with long random URLs: Risk of URL leakage, no expiry
- Database blob storage: Poor performance, large database size
- Dedicated service (Filestack, Uploadcare): Additional cost, complexity

### Decision 4: KYC Expiry and Re-verification
**Choice:** Annual expiry with 30-day advance reminder, scheduled job checks daily

**Implementation:**
- When KYC verified: set `kyc_expires_at = verified_at + 365 days`
- Daily scheduled job: `CheckKycExpiry` finds verifications expiring in 30 days, dispatches `SendKycExpiryReminder` jobs
- When expires: `kyc_status` remains 'verified' but `needsKycReverification()` returns true based on `kyc_expires_at`
- Investment middleware blocks if `needsKycReverification()` is true

**Rationale:**
- Many jurisdictions require periodic re-verification (annual is common)
- Proactive reminders improve user experience vs hard cutoff
- Expired users blocked from new investments but don't lose existing investments
- Configurable per jurisdiction: `config('treevest.kyc.expiry_period_days', 365)`

**Alternatives considered:**
- No expiry: May not meet regulatory requirements in some jurisdictions
- Automatic status change to 'pending': Confusing UX, loses verified history

### Decision 5: Multi-Jurisdiction Support
**Choice:** Add `jurisdiction_code` field (ISO 3166-1 alpha-2) to `kyc_verifications`, configurable document requirements

**Configuration structure:**
```php
// config/treevest.php
'kyc' => [
    'jurisdictions' => [
        'MY' => [ // Malaysia
            'required_documents' => ['passport', 'proof_of_address'],
            'optional_documents' => ['national_id'],
            'expiry_period_days' => 365,
        ],
        'SG' => [ // Singapore
            'required_documents' => ['national_id', 'proof_of_address'],
            'optional_documents' => ['passport'],
            'expiry_period_days' => 730, // 2 years
        ],
    ],
    'default_jurisdiction' => 'MY',
],
```

**Rationale:**
- Supports future multi-region expansion without schema changes
- Different jurisdictions have different document and expiry requirements
- Can enforce jurisdiction-specific validation rules
- Audit trail includes jurisdiction context

**Alternatives considered:**
- Single jurisdiction hardcoded: Requires refactor for expansion
- User-level jurisdiction (on users table): KYC jurisdiction may differ from user's location

### Decision 6: Middleware for Investment Blocking
**Choice:** Create `EnsureKycIsVerified` middleware, apply to investment routes (in EPIC-006)

**Implementation:**
```php
class EnsureKycIsVerified {
    public function handle(Request $request, Closure $next): Response {
        if (!$request->user()->hasVerifiedKyc()) {
            return redirect()->route('kyc.index')
                ->with('error', 'You must complete KYC verification before investing.');
        }
        
        if ($request->user()->needsKycReverification()) {
            return redirect()->route('kyc.index')
                ->with('error', 'Your KYC verification has expired. Please re-verify your identity.');
        }
        
        return $next($request);
    }
}
```

**Rationale:**
- Declarative: apply middleware to routes that need KYC
- Centralized logic: all KYC checks in one place
- Clear user feedback: redirects to KYC page with error message
- Testable: easy to write feature tests for blocking behavior

**Alternatives considered:**
- Controller-level checks: Duplicated logic, easy to forget
- Service-level exceptions: Poor UX, generic error pages

### Decision 7: Notification Strategy
**Choice:** Multi-channel notifications (email + database), user preference for channels in future

**Events and notifications:**
- KYC submitted → `KycSubmittedNotification` (confirmation)
- KYC verified → `KycVerifiedNotification` (celebration)
- KYC rejected → `KycRejectedNotification` (reason + re-upload link)
- KYC expiring soon → `KycExpiryReminderNotification` (30 days before)

**Channels:**
- Email: Always sent (critical account events)
- Database: For in-app notification center (Laravel notifications table)
- SMS: Future enhancement (via Twilio, for critical events only)

**Rationale:**
- Users need awareness of KYC status changes
- Email for immediate attention, database for persistent history
- Regulatory: email trail is compliance evidence

## Risks / Trade-offs

### Risk 1: Provider integration delays
**Impact:** Cannot use automated verification if provider not selected
**Mitigation:** Manual provider works independently, can launch with manual review

### Risk 2: Document storage costs (S3)
**Impact:** Large documents (PDFs) may incur high S3 costs at scale
**Mitigation:** 
- Enforce 10MB file size limit
- Use S3 Intelligent-Tiering (automatically moves old docs to cheaper storage)
- Delete documents after verification expires + retention period (e.g., 7 years for compliance)

### Risk 3: Jurisdiction requirements complexity
**Impact:** Each jurisdiction may have unique requirements beyond document types
**Mitigation:** 
- Start with simple config (document types, expiry)
- Extend config structure as needs arise (specific field validations, custom rules)

### Risk 4: Manual review bottleneck
**Impact:** Admin team overwhelmed by KYC review volume
**Mitigation:** 
- Integrate automated provider as soon as volume justifies
- Prioritize provider selection in backlog

### Risk 5: Expired KYC handling
**Impact:** Users with expired KYC blocked from investments, friction
**Mitigation:** 
- 30-day advance warning (3 reminders: 30d, 14d, 7d before expiry)
- Soft block: can view portfolio, just cannot purchase new investments

## Migration Plan

### Phase 1: Database schema
1. Run migrations to create `kyc_verifications` and `kyc_documents` tables
2. Add KYC fields to `users` table
3. No data migration needed (fresh feature)

### Phase 2: Service layer
1. Implement `KycVerificationService` with manual provider
2. Add middleware (no routes use it yet)
3. No breaking changes to existing code

### Phase 3: Frontend
1. Add KYC pages to profile section
2. Add KYC prompt to dashboard (soft prompt, not blocking)
3. No impact on existing features

### Phase 4: Enforcement
1. Apply middleware to test investment routes
2. Validate blocking behavior
3. Deploy to staging, test end-to-end
4. **Breaking change:** Unverified users cannot invest (but this is expected behavior per EPIC-002)

### Rollback plan
- Remove middleware from routes (users can invest again)
- Feature flag: `config('features.require_kyc', true)` - can disable enforcement quickly
- Database tables remain (no rollback needed, just stop enforcing)

## Open Questions

~~1. Which KYC provider should we integrate first?~~
- **Resolved:** Start with manual provider, add automated provider in future change when selected

~~2. What is the KYC expiry period?~~
- **Resolved:** 365 days default, configurable per jurisdiction

~~3. Should we support multiple jurisdictions from the start?~~
- **Resolved:** Yes, schema supports it, default to Malaysia (MY)

~~4. What document types are required?~~
- **Resolved:** Passport OR National ID OR Driver's License (identity) + Proof of Address (utility bill, bank statement)

~~5. How should documents be stored?~~
- **Resolved:** Laravel filesystem with S3 in prod, local in dev, encrypted file paths
