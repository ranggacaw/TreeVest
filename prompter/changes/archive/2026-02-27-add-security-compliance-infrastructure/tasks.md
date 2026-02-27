# Implementation Tasks

## 1. Database Schema & Models

- [x] 1.1 Create migration: `create_audit_logs_table` (id, user_id, event_type, ip_address, user_agent, event_data JSON, created_at)
- [x] 1.2 Create migration: `create_legal_documents_table` (id, type enum, version, title, content text, effective_date, is_active, created_at, updated_at)
- [x] 1.3 Create migration: `create_user_document_acceptances_table` (id, user_id, legal_document_id, accepted_at, ip_address, user_agent)
- [x] 1.4 Create Eloquent model: `AuditLog` with relationships and accessors
- [x] 1.5 Create Eloquent model: `LegalDocument` with version management logic
- [x] 1.6 Create Eloquent model: `UserDocumentAcceptance` with relationships
- [x] 1.7 Create enum: `AuditEventType` (login, logout, investment_purchased, payout_processed, kyc_submitted, admin_action, etc.)
- [x] 1.8 Create enum: `FraudRuleType` (rapid_investments, unusual_amount, multiple_failed_auth, etc.)
- [x] 1.9 Create enum: `LegalDocumentType` (terms_of_service, privacy_policy, investment_disclaimer, risk_disclosure)

## 2. Encryption at Rest

- [x] 2.1 Add encrypted casting to User model for sensitive fields (e.g., `phone`, `kyc_document_url`)
- [x] 2.2 Add encrypted casting to Transaction model for financial data (amount, account_number if stored)
- [x] 2.3 Create EncryptionService helper for manual encrypt/decrypt operations
- [x] 2.4 Document APP_KEY backup and rotation procedures in `docs/security.md`
- [x] 2.5 Write unit tests for encryption/decryption logic

## 3. Audit Logging Framework

- [x] 3.1 Create `AuditLogService` with methods: `logEvent($eventType, $userId, $data)`, `logAuthentication($userId, $success)`, `logTransaction($transactionId, $details)`
- [x] 3.2 Create AuditLog observer to prevent updates/deletes (immutability enforcement)
- [x] 3.3 Integrate audit logging in authentication flow (login, logout, failed attempts)
- [x] 3.4 Create `LogAuditEvent` job for async audit logging (non-blocking)
- [x] 3.5 Add database index on `audit_logs.created_at` for performance
- [x] 3.6 Add database index on `audit_logs.user_id` for user-specific queries
- [x] 3.7 Write feature tests for audit log creation and immutability

## 4. Security Headers Middleware

- [x] 4.1 Create `SecurityHeadersMiddleware` to add CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy
- [x] 4.2 Create configuration file `config/security.php` for header policy definitions
- [x] 4.3 Register middleware in `app/Http/Kernel.php` global middleware stack
- [x] 4.4 Configure CSP policy to allow Vite dev server, Google Maps, Stripe (from config)
- [x] 4.5 Write feature tests to verify headers are present in HTTP responses

## 5. Rate Limiting

- [x] 5.1 Configure rate limiter in `app/Providers/RouteServiceProvider.php` with custom limits: `auth-throttle`, `financial-throttle`
- [x] 5.2 Apply `auth-throttle` (5 requests/min) to login, register, password reset routes
- [x] 5.3 Apply `financial-throttle` (10 requests/min) to investment purchase, payout routes
- [x] 5.4 Create custom rate limiter response (JSON for API, Inertia for web)
- [x] 5.5 Write feature tests for rate limit enforcement (verify 429 response after threshold)

## 6. Input Validation Framework

- [x] 6.1 Create base FormRequest class with common validation rules (e.g., `sanitizeInput()` method)
- [x] 6.2 Create custom validation rules: `NoSqlInjection`, `NoXss`, `SafeFilename`
- [x] 6.3 Document validation patterns in `prompter/project.md` Section "Architecture Patterns"
- [x] 6.4 Apply validation rules to all existing FormRequest classes
- [x] 6.5 Write unit tests for custom validation rules

## 7. Fraud Detection System

- [x] 7.1 Create `FraudDetectionService` with rule engine: `evaluateTransaction($transaction)`, `flagSuspiciousActivity($userId, $ruleType)`
- [x] 7.2 Create configuration file `config/fraud-detection.php` with rule thresholds (rapid investments, unusual amounts)
- [x] 7.3 Define fraud detection rules: `RapidInvestmentRule`, `UnusualAmountRule`, `MultipleFailedAuthRule`
- [x] 7.4 Create `FraudAlert` model and migration (id, user_id, rule_type, severity, detected_at, resolved_at, notes)
- [x] 7.5 Integrate fraud detection in investment purchase flow (log but don't block initially)
- [x] 7.6 Create admin dashboard page for reviewing fraud alerts (`resources/js/Pages/Admin/FraudAlerts.tsx`)
- [x] 7.7 Write unit tests for fraud rule evaluation logic

## 8. GDPR Compliance Tooling

- [x] 8.1 Create `GdprExportService` with method: `exportUserData($userId)` → JSON file with all user data
- [x] 8.2 Create `ExportUserData` queued job to generate export file asynchronously
- [x] 8.3 Create controller endpoint: `GET /account/data-export` (triggers job, sends download link via email)
- [x] 8.4 Create `GdprDeletionService` with method: `deleteUserData($userId)` (soft-delete user, anonymize transactions)
- [x] 8.5 Create `DeleteUserData` queued job to process deletion asynchronously
- [x] 8.6 Create controller endpoint: `POST /account/delete-request` (requires confirmation, triggers job)
- [x] 8.7 Add retention policy configuration in `config/gdpr.php` (retention periods, anonymization rules)
- [x] 8.8 Write feature tests for data export and deletion workflows

## 9. Legal Documents Management

- [x] 9.1 Create `LegalDocumentService` with methods: `getActiveDocument($type)`, `trackAcceptance($userId, $documentId)`
- [x] 9.2 Create Inertia page: `resources/js/Pages/Legal/PrivacyPolicy.tsx` (displays active privacy policy)
- [x] 9.3 Create Inertia page: `resources/js/Pages/Legal/TermsOfService.tsx` (displays active terms)
- [x] 9.4 Create Inertia page: `resources/js/Pages/Legal/RiskDisclosure.tsx` (modal before investment purchase)
- [x] 9.5 Create `LegalDocumentController` with routes: `/legal/privacy`, `/legal/terms`, `POST /legal/accept/{type}`
- [x] 9.6 Integrate risk disclosure modal in investment purchase flow
- [x] 9.7 Create database seeder for initial legal documents (sample privacy policy, terms, disclaimers)
- [x] 9.8 Write feature tests for document display and acceptance tracking

## 10. Security Monitoring & Alerting

- [x] 10.1 Create `SecurityMonitoringService` with methods: `detectAnomalies()`, `sendAlert($alertType, $details)`
- [x] 10.2 Create `ScanForSuspiciousActivity` scheduled job (runs every 5 minutes)
- [x] 10.3 Configure Laravel logging to separate security events into `storage/logs/security.log`
- [x] 10.4 Create notification: `SecurityAlertNotification` (email to admins for critical events)
- [x] 10.5 Integrate monitoring with fraud detection alerts
- [x] 10.6 Write feature tests for anomaly detection logic

## 11. CI/CD Security Scanning

- [x] 11.1 Add `composer audit` step to GitHub Actions workflow (`.github/workflows/tests.yml`)
- [x] 11.2 Add `npm audit` step to GitHub Actions workflow
- [x] 11.3 Configure CI to fail builds on high-severity vulnerabilities
- [x] 11.4 Add Laravel Pint code style check to CI pipeline
- [x] 11.5 Document security scanning process in `README.md`

## 12. Configuration & Documentation

- [x] 12.1 Create `config/security.php` (security headers, encryption settings)
- [x] 12.2 Create `config/fraud-detection.php` (rule thresholds, alert settings)
- [x] 12.3 Create `config/legal.php` (document versions, acceptance tracking)
- [x] 12.4 Create `config/gdpr.php` (retention policies, anonymization rules)
- [x] 12.5 Create `docs/security.md` (encryption key management, security protocols, incident response)
- [x] 12.6 Update `.env.example` with security-related environment variables
- [x] 12.7 Document GDPR workflows in `docs/gdpr-compliance.md`

## 13. Testing & Validation

- [x] 13.1 Write unit tests for `AuditLogService` (event logging, immutability)
- [x] 13.2 Write unit tests for `FraudDetectionService` (rule evaluation, alert generation)
- [x] 13.3 Write unit tests for `GdprExportService` (data extraction, JSON formatting)
- [x] 13.4 Write unit tests for `GdprDeletionService` (soft delete, anonymization)
- [x] 13.5 Write feature tests for security headers (verify all headers present)
- [x] 13.6 Write feature tests for rate limiting (verify 429 response after threshold)
- [x] 13.7 Write feature tests for legal document acceptance flow
- [x] 13.8 Write feature tests for GDPR export and deletion endpoints
- [x] 13.9 Run `php artisan test --coverage` and ensure >80% coverage for security services
- [x] 13.10 Manual security testing: attempt SQL injection, XSS, CSRF attacks (verify protection)

## Post-Implementation

- [x] Update AGENTS.md Section 10 (Security & Privacy Rules) with new infrastructure details
- [x] Update AGENTS.md Section 8 (Data Models) with new entities: AuditLog, LegalDocument, UserDocumentAcceptance, FraudAlert
- [x] Update `prompter/project.md` Section "Architecture Patterns" with security service integration patterns
- [x] Document security incident response procedures in `docs/security.md`
- [ ] Schedule security audit with external auditor (post-launch)

## Dependencies

- **Prerequisite**: Laravel application scaffold must exist (`app/`, `database/`, `routes/` directories)
- **Prerequisite**: Laravel Breeze authentication scaffold must be installed
- **Prerequisite**: Inertia.js setup with React must be complete

## Validation Checklist

- [x] Run `prompter validate add-security-compliance-infrastructure --strict --no-interactive` (must pass)
- [x] Run `php artisan test` (all tests pass)
- [x] Run `./vendor/bin/pint` (code style check passes)
- [x] Run `composer audit` (no high-severity vulnerabilities)
- [x] Run `npm audit` (no high-severity vulnerabilities)
- [x] Verify security headers in browser DevTools Network tab
- [x] Verify rate limiting with Postman/curl (trigger 429 response)
- [x] Test GDPR data export flow end-to-end
- [x] Test GDPR data deletion flow end-to-end
- [x] Verify audit logs are immutable (attempt UPDATE/DELETE should fail)
- [x] Test fraud detection with simulated suspicious activity
