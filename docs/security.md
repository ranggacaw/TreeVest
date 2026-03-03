# Security & Procedures

## Application Key (APP_KEY) Management

The `APP_KEY` is a critical secret used for all symmetric encryption in Laravel, including sessions, signed cookies, and encrypted model attributes (e.g., user PII, transaction amounts).

### Backup Procedures
1. Ensure `APP_KEY` is securely stored in a secrets manager (e.g., AWS Secrets Manager, HashiCorp Vault, 1Password).
2. The key should never be committed to source control.
3. Keep an offline, encrypted backup of the `APP_KEY` accessible only to key stakeholders.

### Key Rotation Procedures
Rotating the `APP_KEY` requires careful coordination to prevent data loss, as previously encrypted data will become unreadable with a new key.

1. Generate a new key using `php artisan key:generate --show` (do not replace the current key yet).
2. For all models with encrypted fields (e.g., `User`, `Transaction`), create a command or job to read every record, decrypt its values using the old key, and re-encrypt them with the new key. (Laravel supports multiple keys in the `APP_PREVIOUS_KEYS` env variable starting in Laravel 11, which makes this easier).
3. If using `APP_PREVIOUS_KEYS`:
   - Add the old `APP_KEY` to `APP_PREVIOUS_KEYS` in the environment.
   - Update `APP_KEY` to the new key.
   - Laravel will automatically use the new key for new encryption and fall back to previous keys for decryption.
4. Schedule a job to systematically touch and re-save all records containing encrypted data to migrate them to the new key over time.

## Security Incident Response
*(To be completed after post-implementation tasks)*

## Security Incident Response

In the event of a suspected or confirmed security breach, the following protocol must be activated immediately:

### 1. Verification & Classification
- **Confirm Incident:** Analyze logs (AuditLog, SecurityLog) to verify anomaly is real (not false positive).
- **Classify Severity:**
  - **Critical:** Data breach (PII/Financial), active exploit, system outage.
  - **High:** Service disruption, potential vulnerability exposure.
  - **Medium:** Suspicious activity without confirmable impact.
  - **Low:** Non-critical anomaly.

### 2. Containment
- **Disconnect Affected Systems:** Take offline or isolate infected components if necessary.
- **Revoke Access:** Reset passwords/sessions () for affected accounts or admins.
- **Block Traffic:** Update firewall rules or AWS WAF to block malicious IPs.
- **Preserve Evidence:** Do not reboot or wipe logs unless absolutely necessary for containment.

### 3. Eradication
- **Patch Vulnerabilities:** Deploy hotfixes for code vulnerabilities (SQLi, XSS, etc.).
- **Remove Backdoors:** Audit for unauthorized SSH keys, cron jobs, or admin accounts.
- **Rotate Credentials:** Rotate database passwords, API keys, and secret tokens.

### 4. Recovery
- **Restore Data:** Restore clean backups if data was corrupted or deleted.
- **Verify Integrity:** Run integrity checks on critical tables (users, transactions).
- **Monitor:** Enhanced monitoring for 24-48 hours post-incident.

### 5. Notification & Post-Mortem
- **Notify Stakeholders:** Inform management, legal team, and affected users (GDPR requirement: typically within 72 hours).
- **Post-Mortem Report:** Document timeline, root cause, impact, and preventive measures.

---

## CSRF Protection Implementation

### Overview
This section documents the CSRF (Cross-Site Request Forgery) protection implementation for the Treevest financial platform, focusing on securing payment-related operations while maintaining API usability.

### Financial Security Priority
As a financial investment platform handling real money transactions, CSRF protection is **critical** for:
- Payment intent creation
- Investment purchases  
- Payout operations
- Fund transfers

### Implementation Strategy

#### 1. Route-Level CSRF Protection

**Financial API Routes (CSRF Required):**
```php
// routes/api.php - Financial operations with CSRF protection
Route::middleware(['auth', 'web'])->group(function () {
    Route::post('/payment-intents', [PaymentIntentController::class, 'create'])
        ->middleware('throttle:financial-throttle');
});
```

**Non-Financial API Routes (CSRF Exempt):**
```php
// routes/api.php - Non-financial operations for API usability
Route::middleware('auth')->group(function () {
    Route::post('/error/report', [ErrorReportController::class, 'reportClientError']);
});
```

#### 2. CSRF Token Exemptions

**Webhook Exemptions (bootstrap/app.php):**
```php
$middleware->validateCsrfTokens(except: [
    '/stripe/webhook',  // Stripe webhooks use signature verification instead
]);
```

### Frontend Integration

#### React/Inertia CSRF Token Handling

**CSRF Token Access:**
```typescript
// Get CSRF token in React components
const csrfToken = document.head.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

// Include in API calls for financial operations
const response = await fetch('/api/payment-intents', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': csrfToken,
    },
    body: JSON.stringify(paymentData)
});
```

**Axios Configuration:**
```typescript
// Configure axios to automatically include CSRF token
axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;
```

### Security Rationale

#### Why CSRF Protection for Financial Operations?

1. **Prevents unauthorized transactions** via malicious websites
2. **Regulatory compliance** for financial platforms
3. **User fund protection** from cross-site attacks
4. **Audit trail integrity** ensuring legitimate user actions

#### Why Some API Routes Are CSRF-Exempt?

1. **Error reporting** - Non-financial, enhances platform stability
2. **Public configuration** - Read-only endpoints
3. **Developer experience** - Maintains API usability for legitimate use cases

### Rate Limiting Integration

Financial CSRF-protected routes also implement rate limiting:
```php
->middleware('throttle:financial-throttle') // 10 requests per minute per user
```

### Monitoring & Alerting

**CSRF Failures Should Be Monitored:**
- Failed CSRF validation on financial endpoints
- Unusual CSRF token patterns
- High volume of CSRF failures (potential attack)

### Testing CSRF Protection

#### Manual Testing
```bash
# Test CSRF protection (should fail without token)
curl -X POST http://localhost:8000/api/payment-intents \
  -H "Content-Type: application/json" \
  -d '{"amount": 10000}'

# Test with valid CSRF token (should succeed)
curl -X POST http://localhost:8000/api/payment-intents \
  -H "Content-Type: application/json" \
  -H "X-CSRF-TOKEN: valid-token-here" \
  -d '{"amount": 10000}'
```

#### Automated Testing
- Unit tests should verify CSRF middleware application
- Integration tests should test both success and failure scenarios
- Security tests should validate protection against CSRF attacks

### Implementation Checklist

- [x] **CSRF middleware applied** to financial API routes (`routes/api.php:7`)  
- [x] **Webhook exemptions configured** (`bootstrap/app.php:15`)
- [x] **Rate limiting integrated** with CSRF protection  
- [x] **Documentation created** for frontend CSRF token handling
- [ ] **Frontend CSRF token integration** (React components)
- [ ] **Automated tests** for CSRF protection
- [ ] **Security monitoring** setup for CSRF failures

### Related Security Measures

This CSRF implementation works together with other security measures:
- **Rate limiting** (`financial-throttle`: 10/min per user)
- **Authentication** (all financial routes require `auth` middleware) 
- **Authorization policies** (Laravel policies for investment operations)
- **Input validation** (server-side validation with audit logging)
- **Database transactions** (atomic financial operations)

---

**Security Contact**: For security concerns related to CSRF or other vulnerabilities, follow responsible disclosure procedures.
