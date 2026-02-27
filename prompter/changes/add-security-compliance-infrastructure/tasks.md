# Implementation Tasks

## 1. Database Schema & Models

- [ ] 1.1 Create migration: `create_audit_logs_table` (id, user_id, event_type, ip_address, user_agent, event_data JSON, created_at)
- [ ] 1.2 Create migration: `create_legal_documents_table` (id, type enum, version, title, content text, effective_date, is_active, created_at, updated_at)
- [ ] 1.3 Create migration: `create_user_document_acceptances_table` (id, user_id, legal_document_id, accepted_at, ip_address, user_agent)
- [ ] 1.4 Create Eloquent model: `AuditLog` with relationships and accessors
- [ ] 1.5 Create Eloquent model: `LegalDocument` with version management logic
- [ ] 1.6 Create Eloquent model: `UserDocumentAcceptance` with relationships
- [ ] 1.7 Create enum: `AuditEventType` (login, logout, investment_purchased, payout_processed, kyc_submitted, admin_action, etc.)
- [ ] 1.8 Create enum: `FraudRuleType` (rapid_investments, unusual_amount, multiple_failed_auth, etc.)
- [ ] 1.9 Create enum: `LegalDocumentType` (terms_of_service, privacy_policy, investment_disclaimer, risk_disclosure)

## 2. Encryption at Rest

- [ ] 2.1 Add encrypted casting to User model for sensitive fields (e.g., `phone`, `kyc_document_url`)
- [ ] 2.2 Add encrypted casting to Transaction model for financial data (amount, account_number if stored)
- [ ] 2.3 Create EncryptionService helper for manual encrypt/decrypt operations
- [ ] 2.4 Document APP_KEY backup and rotation procedures in `docs/security.md`
- [ ] 2.5 Write unit tests for encryption/decryption logic

## 3. Audit Logging Framework

- [ ] 3.1 Create `AuditLogService` with methods: `logEvent($eventType, $userId, $data)`, `logAuthentication($userId, $success)`, `logTransaction($transactionId, $details)`
- [ ] 3.2 Create AuditLog observer to prevent updates/deletes (immutability enforcement)
- [ ] 3.3 Integrate audit logging in authentication flow (login, logout, failed attempts)
- [ ] 3.4 Create `LogAuditEvent` job for async audit logging (non-blocking)
- [ ] 3.5 Add database index on `audit_logs.created_at` for performance
- [ ] 3.6 Add database index on `audit_logs.user_id` for user-specific queries
- [ ] 3.7 Write feature tests for audit log creation and immutability

## 4. Security Headers Middleware

- [ ] 4.1 Create `SecurityHeadersMiddleware` to add CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy
- [ ] 4.2 Create configuration file `config/security.php` for header policy definitions
- [ ] 4.3 Register middleware in `app/Http/Kernel.php` global middleware stack
- [ ] 4.4 Configure CSP policy to allow Vite dev server, Google Maps, Stripe (from config)
- [ ] 4.5 Write feature tests to verify headers are present in HTTP responses

## 5. Rate Limiting

- [ ] 5.1 Configure rate limiter in `app/Providers/RouteServiceProvider.php` with custom limits: `auth-throttle`, `financial-throttle`
- [ ] 5.2 Apply `auth-throttle` (5 requests/min) to login, register, password reset routes
- [ ] 5.3 Apply `financial-throttle` (10 requests/min) to investment purchase, payout routes
- [ ] 5.4 Create custom rate limiter response (JSON for API, Inertia for web)
- [ ] 5.5 Write feature tests for rate limit enforcement (verify 429 response after threshold)

## 6. Input Validation Framework

- [ ] 6.1 Create base FormRequest class with common validation rules (e.g., `sanitizeInput()` method)
- [ ] 6.2 Create custom validation rules: `NoSqlInjection`, `NoXss`, `SafeFilename`
- [ ] 6.3 Document validation patterns in `prompter/project.md` Section "Architecture Patterns"
- [ ] 6.4 Apply validation rules to all existing FormRequest classes
- [ ] 6.5 Write unit tests for custom validation rules

## 7. Fraud Detection System

- [ ] 7.1 Create `FraudDetectionService` with rule engine: `evaluateTransaction($transaction)`, `flagSuspiciousActivity($userId, $ruleType)`
- [ ] 7.2 Create configuration file `config/fraud-detection.php` with rule thresholds (rapid investments, unusual amounts)
- [ ] 7.3 Define fraud detection rules: `RapidInvestmentRule`, `UnusualAmountRule`, `MultipleFailedAuthRule`
- [ ] 7.4 Create `FraudAlert` model and migration (id, user_id, rule_type, severity, detected_at, resolved_at, notes)
- [ ] 7.5 Integrate fraud detection in investment purchase flow (log but don't block initially)
- [ ] 7.6 Create admin dashboard page for reviewing fraud alerts (`resources/js/Pages/Admin/FraudAlerts.tsx`)
- [ ] 7.7 Write unit tests for fraud rule evaluation logic

## 8. GDPR Compliance Tooling

- [ ] 8.1 Create `GdprExportService` with method: `exportUserData($userId)` → JSON file with all user data
- [ ] 8.2 Create `ExportUserData` queued job to generate export file asynchronously
- [ ] 8.3 Create controller endpoint: `GET /account/data-export` (triggers job, sends download link via email)
- [ ] 8.4 Create `GdprDeletionService` with method: `deleteUserData($userId)` (soft-delete user, anonymize transactions)
- [ ] 8.5 Create `DeleteUserData` queued job to process deletion asynchronously
- [ ] 8.6 Create controller endpoint: `POST /account/delete-request` (requires confirmation, triggers job)
- [ ] 8.7 Add retention policy configuration in `config/gdpr.php` (retention periods, anonymization rules)
- [ ] 8.8 Write feature tests for data export and deletion workflows

## 9. Legal Documents Management

- [ ] 9.1 Create `LegalDocumentService` with methods: `getActiveDocument($type)`, `trackAcceptance($userId, $documentId)`
- [ ] 9.2 Create Inertia page: `resources/js/Pages/Legal/PrivacyPolicy.tsx` (displays active privacy policy)
- [ ] 9.3 Create Inertia page: `resources/js/Pages/Legal/TermsOfService.tsx` (displays active terms)
- [ ] 9.4 Create Inertia page: `resources/js/Pages/Legal/RiskDisclosure.tsx` (modal before investment purchase)
- [ ] 9.5 Create `LegalDocumentController` with routes: `/legal/privacy`, `/legal/terms`, `POST /legal/accept/{type}`
- [ ] 9.6 Integrate risk disclosure modal in investment purchase flow
- [ ] 9.7 Create database seeder for initial legal documents (sample privacy policy, terms, disclaimers)
- [ ] 9.8 Write feature tests for document display and acceptance tracking

## 10. Security Monitoring & Alerting

- [ ] 10.1 Create `SecurityMonitoringService` with methods: `detectAnomalies()`, `sendAlert($alertType, $details)`
- [ ] 10.2 Create `ScanForSuspiciousActivity` scheduled job (runs every 5 minutes)
- [ ] 10.3 Configure Laravel logging to separate security events into `storage/logs/security.log`
- [ ] 10.4 Create notification: `SecurityAlertNotification` (email to admins for critical events)
- [ ] 10.5 Integrate monitoring with fraud detection alerts
- [ ] 10.6 Write feature tests for anomaly detection logic

## 11. CI/CD Security Scanning

- [ ] 11.1 Add `composer audit` step to GitHub Actions workflow (`.github/workflows/tests.yml`)
- [ ] 11.2 Add `npm audit` step to GitHub Actions workflow
- [ ] 11.3 Configure CI to fail builds on high-severity vulnerabilities
- [ ] 11.4 Add Laravel Pint code style check to CI pipeline
- [ ] 11.5 Document security scanning process in `README.md`

## 12. Configuration & Documentation

- [ ] 12.1 Create `config/security.php` (security headers, encryption settings)
- [ ] 12.2 Create `config/fraud-detection.php` (rule thresholds, alert settings)
- [ ] 12.3 Create `config/legal.php` (document versions, acceptance tracking)
- [ ] 12.4 Create `config/gdpr.php` (retention policies, anonymization rules)
- [ ] 12.5 Create `docs/security.md` (encryption key management, security protocols, incident response)
- [ ] 12.6 Update `.env.example` with security-related environment variables
- [ ] 12.7 Document GDPR workflows in `docs/gdpr-compliance.md`

## 13. Testing & Validation

- [ ] 13.1 Write unit tests for `AuditLogService` (event logging, immutability)
- [ ] 13.2 Write unit tests for `FraudDetectionService` (rule evaluation, alert generation)
- [ ] 13.3 Write unit tests for `GdprExportService` (data extraction, JSON formatting)
- [ ] 13.4 Write unit tests for `GdprDeletionService` (soft delete, anonymization)
- [ ] 13.5 Write feature tests for security headers (verify all headers present)
- [ ] 13.6 Write feature tests for rate limiting (verify 429 after threshold)
- [ ] 13.7 Write feature tests for legal document acceptance flow
- [ ] 13.8 Write feature tests for GDPR export and deletion endpoints
- [ ] 13.9 Run `php artisan test --coverage` and ensure >80% coverage for security services
- [ ] 13.10 Manual security testing: attempt SQL injection, XSS, CSRF attacks (verify protection)

## Post-Implementation

- [ ] Update AGENTS.md Section 10 (Security & Privacy Rules) with new infrastructure details
- [ ] Update AGENTS.md Section 8 (Data Models) with new entities: AuditLog, LegalDocument, UserDocumentAcceptance, FraudAlert
- [ ] Update `prompter/project.md` Section "Architecture Patterns" with security service integration patterns
- [ ] Document security incident response procedures in `docs/security.md`
- [ ] Schedule security audit with external auditor (post-launch)

## Dependencies

- **Prerequisite**: Laravel application scaffold must exist (`app/`, `database/`, `routes/` directories)
- **Prerequisite**: Laravel Breeze authentication scaffold must be installed
- **Prerequisite**: Inertia.js setup with React must be complete

## Validation Checklist

- [ ] Run `prompter validate add-security-compliance-infrastructure --strict --no-interactive` (must pass)
- [ ] Run `php artisan test` (all tests pass)
- [ ] Run `./vendor/bin/pint` (code style check passes)
- [ ] Run `composer audit` (no high-severity vulnerabilities)
- [ ] Run `npm audit` (no high-severity vulnerabilities)
- [ ] Verify security headers in browser DevTools Network tab
- [ ] Verify rate limiting with Postman/curl (trigger 429 response)
- [ ] Test GDPR data export flow end-to-end
- [ ] Test GDPR data deletion flow end-to-end
- [ ] Verify audit logs are immutable (attempt UPDATE/DELETE should fail)
- [ ] Test fraud detection with simulated suspicious activity
