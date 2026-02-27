# Change: Add Security & Compliance Infrastructure

## Why

Treevest is an investment platform handling real money, sensitive personal data (KYC documents), and financial transactions. Without a robust security foundation, the platform is vulnerable to:
- Data breaches exposing investor PII and financial information
- Fraud and malicious actors exploiting transaction vulnerabilities
- Non-compliance with GDPR and data protection regulations leading to legal liability
- Inability to audit security-relevant events for forensics and compliance
- Injection attacks (SQL, XSS, CSRF) compromising user data and system integrity

This foundational security infrastructure must be in place before any investment transactions can be processed safely and legally.

## What Changes

This change implements the complete security and compliance infrastructure layer from EPIC-015:

**Encryption & Data Protection:**
- TLS/HTTPS enforcement for all communications (server configuration + middleware)
- Encryption at rest for sensitive data (PII, financial records) using Laravel's built-in encryption
- Secure storage configuration for encrypted fields in database models

**Audit & Monitoring:**
- Immutable audit log framework capturing all security-relevant events (auth, transactions, admin actions)
- Security monitoring and alerting for suspicious activity patterns
- Structured logging with contextual data for forensics

**Access Control & Rate Limiting:**
- Security headers middleware (CSP, HSTS, X-Frame-Options, X-Content-Type-Options)
- Rate limiting on authentication endpoints and financial transaction routes
- CORS configuration for API security

**Input Validation & Fraud Detection:**
- Input validation and sanitization framework (leveraging Laravel's validation + custom rules)
- Fraud detection rules engine for suspicious transaction patterns
- Automated dependency vulnerability scanning in CI/CD

**Compliance Tooling:**
- GDPR compliance tooling: data export capability (download all user data)
- GDPR data deletion workflow (right to be forgotten)
- Investment disclaimer and terms of service management (versioned, tracked acceptance)
- Risk disclosure statement framework (presented before investment actions)
- Privacy policy management (versioned, accessible)

**Expected Deliverables:**
- Database migrations for `audit_logs`, `legal_documents`, `user_document_acceptances` tables
- Eloquent models: `AuditLog`, `LegalDocument`, `UserDocumentAcceptance`
- Middleware: `SecurityHeaders`, `RateLimitSensitiveRoutes`
- Services: `AuditLogService`, `FraudDetectionService`, `GdprExportService`, `GdprDeletionService`
- Jobs: `ExportUserData`, `DeleteUserData`, `ScanForSuspiciousActivity`
- Enums: `AuditEventType`, `FraudRuleType`, `LegalDocumentType`
- Configuration files for security headers, rate limits, fraud rules
- Inertia pages for privacy policy, terms of service, risk disclosures
- PHPUnit tests for all services and critical flows
- CI/CD integration: `composer audit`, `npm audit` in GitHub Actions

## Impact

**Affected Capabilities:**
- **NEW**: `audit-logging` — Immutable audit trail for security events
- **NEW**: `security-headers` — HTTP security headers on all responses
- **NEW**: `rate-limiting` — Throttling for sensitive endpoints
- **NEW**: `encryption-at-rest` — Sensitive data encryption in database
- **NEW**: `fraud-detection` — Rule-based suspicious activity detection
- **NEW**: `gdpr-compliance` — Data export and deletion tooling
- **NEW**: `legal-documents` — Investment disclaimers, terms, privacy policy management

**Affected Code/Systems:**
- `app/Http/Kernel.php` — Add security middleware to global middleware stack
- `routes/web.php` — Apply rate limiting to auth and financial routes
- `config/` — New config files: `security.php`, `fraud-detection.php`, `legal.php`
- `database/migrations/` — New tables for audit logs and legal documents
- `app/Services/` — New security and compliance services
- `resources/js/Pages/Legal/` — New Inertia pages for legal documents
- `.github/workflows/` — Add security scanning steps to CI/CD

**Dependencies:**
- This is a foundational change — no prerequisites
- **Blocks**: EPIC-010 (Payments), EPIC-006 (Investments), EPIC-002 (KYC) — all depend on audit logging and encryption

**Breaking Changes:**
- None (net new functionality)

**Migration Path:**
- N/A (fresh implementation, no existing security infrastructure to migrate from)

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| **Encryption key loss** — Laravel APP_KEY rotation requires re-encryption | Critical data loss | Document key backup procedures; use encrypted key storage; test key rotation flow in staging |
| **Audit log storage costs** — Immutable logs grow indefinitely | Medium operational cost | Implement log archival strategy (e.g., archive logs > 2 years to cold storage); add database index on `created_at` |
| **Fraud detection false positives** — Legitimate users flagged incorrectly | High user friction | Start with monitoring-only mode (log, don't block); tune rules based on real data; provide admin override capability |
| **GDPR deletion complexity** — User data spans many tables with foreign keys | Medium compliance risk | Soft-delete pattern for user records; cascade deletion logic in `GdprDeletionService`; retention policy for transaction records |
| **Performance impact of encryption** — Encrypt/decrypt adds latency | Low performance degradation | Encrypt only sensitive fields (not entire records); cache decrypted values where appropriate; benchmark performance |
| **Incomplete vulnerability scanning** — CI/CD scans miss runtime threats | Medium security gap | Combine static scans with runtime monitoring; schedule periodic full security audits post-launch |

## Open Questions

1. **Fraud detection threshold tuning**: What transaction patterns should trigger fraud alerts? (e.g., >X investments in Y minutes, amount >Z% of average)
   - **Proposed**: Start with conservative rules based on industry standards; iterate post-launch with real data
   
2. **Audit log retention policy**: How long should audit logs be retained? (GDPR allows storage for compliance purposes)
   - **Proposed**: 7 years retention (aligns with financial record-keeping requirements); archive to cold storage after 2 years
   
3. **GDPR deletion scope**: Should transaction records be deleted, or anonymized? (Financial regulations may require retention)
   - **Proposed**: Anonymize transaction records (replace PII with placeholder); delete non-financial user data entirely
   
4. **Security header CSP policy**: What external domains should be whitelisted? (Google Maps, Stripe, analytics)
   - **Proposed**: Start with permissive policy; tighten iteratively as integrations are defined

5. **Rate limit thresholds**: What are acceptable limits for auth endpoints? (e.g., 5 login attempts per minute per IP)
   - **Proposed**: 5 attempts/min for login; 10 attempts/min for registration; 100 requests/min for general API calls

## Success Criteria

- [ ] All HTTP responses include security headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options)
- [ ] Rate limiting is enforced on authentication routes (login, register, password reset)
- [ ] Sensitive database fields (e.g., `User.phone`, `Transaction.amount`) are encrypted at rest
- [ ] Audit logs capture all financial transactions with immutable records (no updates/deletes)
- [ ] Fraud detection rules flag suspicious patterns and generate alerts
- [ ] Users can export their personal data via a GDPR-compliant data export endpoint
- [ ] Users can request account deletion, triggering the GDPR deletion workflow
- [ ] Investment disclaimers and risk disclosures are presented before investment purchases
- [ ] Privacy policy and terms of service are versioned and user acceptance is tracked
- [ ] CI/CD pipeline includes `composer audit` and `npm audit` steps
- [ ] All security services have >80% test coverage
- [ ] Security monitoring alerts are configured for critical events (failed login attempts, fraud flags)

## Related Documents

- **Source EPIC**: `prompter/epics/EPIC-015-security-compliance-infrastructure.md`
- **PRD Reference**: Section "Technical Specifications - Security" and "Additional - Legal & Compliance"
- **AGENTS.md**: Section 10 (Security & Privacy Rules)
- **Project Conventions**: `prompter/project.md` Section "Architecture Patterns - Error Handling" and "Important Constraints - Regulatory & Legal"
