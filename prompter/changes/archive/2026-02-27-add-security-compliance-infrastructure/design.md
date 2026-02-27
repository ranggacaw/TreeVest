# Technical Design: Security & Compliance Infrastructure

## Context

Treevest is an investment platform that handles:
- Real financial transactions (investment purchases, payouts)
- Sensitive personal information (KYC documents, phone numbers, addresses)
- Regulatory compliance requirements (GDPR, data protection laws, potential securities regulations)

This design document outlines the technical approach for implementing foundational security and compliance infrastructure before any financial features go live.

### Background
- **Project stage**: Pre-implementation (documentation phase, no codebase yet)
- **Tech stack**: Laravel 12 + Inertia.js 2 + React 18 + MySQL 8
- **Architecture**: Monolith (no microservices)
- **Deployment**: Laragon local dev; production infrastructure TBD

### Constraints
- Must use Laravel's built-in security features where available (encryption, CSRF, rate limiting)
- Database-backed sessions, cache, and queues (no Redis at launch)
- No external security services (SIEM, WAF) at launch — rely on application-level controls
- Audit logs must be immutable and retained for 7 years (financial compliance)
- GDPR compliance required (data export, right to be forgotten)

### Stakeholders
- **Investors**: Require confidence that their financial data and PII are protected
- **Farm Owners**: Need audit trail for financial transactions and harvest reporting
- **Administrators**: Need tools to monitor security events and respond to incidents
- **Legal/Compliance Team**: Require GDPR compliance and audit capabilities
- **Regulators**: May require audit trails and financial record retention

---

## Goals / Non-Goals

### Goals
1. **Prevent data breaches**: Encrypt sensitive data at rest and in transit
2. **Enable forensics**: Immutable audit trail for all security-relevant events
3. **Detect fraud**: Rule-based detection for suspicious transaction patterns
4. **Regulatory compliance**: GDPR-compliant data export and deletion workflows
5. **User trust**: Transparent privacy policy, terms of service, risk disclosures
6. **Incident response**: Security monitoring and alerting for critical events

### Non-Goals
- Machine learning-based fraud detection (rule-based only at launch)
- Real-time anomaly detection with external SIEM (basic monitoring only)
- PCI DSS compliance (deferred to payment processor — Stripe handles card data)
- Penetration testing (scheduled post-launch with external auditor)
- Multi-factor authentication (MFA) — deferred to auth EPIC (EPIC-001)
- DDoS protection (relies on infrastructure/CDN layer, not application)

---

## High-Level Design

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Browser (Client)                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  React + Inertia.js                                  │  │
│  │  - Legal document pages (privacy, terms, risk)      │  │
│  │  - GDPR data export/deletion requests               │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTPS (TLS 1.3)
┌────────────────────▼────────────────────────────────────────┐
│               Laravel Application Layer                      │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Global Middleware Stack                                │ │
│  │  - SecurityHeadersMiddleware (CSP, HSTS, etc.)        │ │
│  │  - VerifyCsrfToken (Laravel built-in)                 │ │
│  │  - ThrottleRequests (rate limiting)                   │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Controllers                                            │ │
│  │  - LegalDocumentController                            │ │
│  │  - GdprController (export, delete)                    │ │
│  └───────┬────────────────────────────────────────────────┘ │
│          │                                                   │
│  ┌───────▼────────────────────────────────────────────────┐ │
│  │ Services (Business Logic)                             │ │
│  │  - AuditLogService (immutable event logging)          │ │
│  │  - FraudDetectionService (rule engine)                │ │
│  │  - GdprExportService (data aggregation)               │ │
│  │  - GdprDeletionService (soft delete + anonymize)      │ │
│  │  - LegalDocumentService (versioning, acceptance)      │ │
│  │  - SecurityMonitoringService (anomaly detection)      │ │
│  └───────┬────────────────────────────────────────────────┘ │
│          │                                                   │
│  ┌───────▼────────────────────────────────────────────────┐ │
│  │ Models (Data Access)                                   │ │
│  │  - AuditLog (append-only, indexed on created_at)      │ │
│  │  - LegalDocument (versioned, effective_date)          │ │
│  │  - UserDocumentAcceptance (tracks consent)            │ │
│  │  - FraudAlert (flags suspicious activity)             │ │
│  │  - User, Transaction (with encrypted fields)          │ │
│  └───────┬────────────────────────────────────────────────┘ │
└──────────┼──────────────────────────────────────────────────┘
           │
┌──────────▼──────────────────────────────────────────────────┐
│                   MySQL Database                            │
│  - Encrypted fields: User.phone, Transaction.amount, etc.  │
│  - Immutable audit_logs table (no UPDATEs/DELETEs)         │
│  - Indexed: audit_logs.created_at, .user_id                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  Async Jobs (Queue)                          │
│  - LogAuditEvent (non-blocking audit logging)               │
│  - ExportUserData (GDPR export, email download link)        │
│  - DeleteUserData (GDPR deletion, anonymize transactions)   │
│  - ScanForSuspiciousActivity (scheduled, every 5 min)       │
│  - SendSecurityAlert (email to admins)                      │
└─────────────────────────────────────────────────────────────┘
```

---

## Detailed Design Decisions

### 1. Encryption at Rest

**Decision**: Use Laravel's built-in `Crypt` facade and Eloquent encrypted casting.

**Rationale**:
- Laravel provides AES-256-CBC encryption out-of-the-box using `APP_KEY`
- Encrypted casting is declarative and transparent to application logic
- No need for external KMS or third-party encryption service at launch

**Implementation**:
```php
// app/Models/User.php
protected $casts = [
    'phone' => 'encrypted',
    'kyc_document_url' => 'encrypted',
];

// app/Models/Transaction.php
protected $casts = [
    'amount' => 'encrypted:integer', // Encrypt but cast to int after decrypt
    'account_number' => 'encrypted',
];
```

**Key Management**:
- `APP_KEY` stored in `.env` (never in version control)
- Backup `APP_KEY` to secure storage (encrypted vault, password manager)
- Key rotation procedure documented in `docs/security.md` — requires re-encrypting all encrypted fields

**Trade-offs**:
- ✅ Simple, leverages Laravel conventions
- ✅ Transparent to application logic (auto encrypt/decrypt)
- ❌ Key rotation is complex (requires full re-encryption)
- ❌ Performance overhead on encrypted field access (acceptable for low-frequency fields)

**Alternatives Considered**:
- **Database-level encryption (MySQL TDE)**: Rejected — requires MySQL Enterprise Edition or InnoDB plugin; not available in standard MySQL 8
- **External KMS (AWS KMS, Vault)**: Rejected — adds complexity and external dependency; overkill for launch scale

---

### 2. Audit Logging Framework

**Decision**: Append-only `audit_logs` table with event sourcing pattern.

**Rationale**:
- Immutability is a hard requirement for compliance and forensics
- Event sourcing provides full audit trail of all state changes
- Database-backed (no external logging service needed at launch)

**Schema**:
```php
Schema::create('audit_logs', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
    $table->enum('event_type', AuditEventType::values());
    $table->ipAddress('ip_address');
    $table->string('user_agent', 512);
    $table->json('event_data'); // Flexible payload for event details
    $table->timestamp('created_at'); // No updated_at — immutable
    
    $table->index(['user_id', 'created_at']);
    $table->index('created_at'); // For time-range queries
    $table->index('event_type'); // For filtering by event type
});
```

**Immutability Enforcement**:
```php
// app/Models/AuditLog.php
class AuditLog extends Model
{
    public $timestamps = false; // Only created_at
    protected $guarded = ['id', 'created_at']; // Prevent mass assignment
    
    protected static function booted(): void
    {
        // Prevent updates and deletes
        static::updating(fn() => throw new \RuntimeException('Audit logs are immutable'));
        static::deleting(fn() => throw new \RuntimeException('Audit logs cannot be deleted'));
    }
}
```

**Service Interface**:
```php
// app/Services/AuditLogService.php
class AuditLogService
{
    public function logEvent(
        AuditEventType $eventType,
        ?int $userId,
        array $data
    ): void {
        dispatch(new LogAuditEvent($eventType, $userId, $data));
    }
    
    public function logAuthentication(int $userId, bool $success): void;
    public function logTransaction(int $transactionId, array $details): void;
    public function getEventsForUser(int $userId, Carbon $from, Carbon $to): Collection;
}
```

**Trade-offs**:
- ✅ Immutability guaranteed by model observers
- ✅ Rich event data via JSON column
- ✅ Indexed for fast queries by user/time
- ❌ Storage grows unbounded (mitigation: archival policy after 2 years)
- ❌ JSON queries are less performant (acceptable for admin/compliance queries, not user-facing)

**Alternatives Considered**:
- **External logging service (Loggly, Papertrail)**: Rejected — adds cost and external dependency; database sufficient at launch
- **Blockchain-based audit log**: Rejected — massive overkill; immutability achievable with simpler means

---

### 3. Security Headers Middleware

**Decision**: Custom middleware to inject security headers on every response.

**Rationale**:
- Laravel doesn't provide security headers out-of-the-box
- Middleware pattern is idiomatic for cross-cutting concerns
- Configuration-driven for easy environment-specific tuning

**Implementation**:
```php
// app/Http/Middleware/SecurityHeadersMiddleware.php
class SecurityHeadersMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);
        
        $response->headers->set('X-Frame-Options', config('security.x_frame_options'));
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Content-Security-Policy', $this->buildCsp());
        
        if (config('security.hsts_enabled')) {
            $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        }
        
        return $response;
    }
    
    private function buildCsp(): string
    {
        // Build CSP from config/security.php
        return implode('; ', [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' " . config('security.csp.script_src'),
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: https:",
            "connect-src 'self' " . config('security.csp.connect_src'),
        ]);
    }
}
```

**Configuration**:
```php
// config/security.php
return [
    'x_frame_options' => 'DENY', // Or 'SAMEORIGIN' for embedding
    'hsts_enabled' => env('SECURITY_HSTS_ENABLED', true),
    'csp' => [
        'script_src' => env('CSP_SCRIPT_SRC', 'https://maps.googleapis.com https://js.stripe.com'),
        'connect_src' => env('CSP_CONNECT_SRC', 'https://api.stripe.com'),
    ],
];
```

**Trade-offs**:
- ✅ Centralized security header management
- ✅ Environment-specific configuration
- ✅ Easy to test (assert headers in feature tests)
- ❌ CSP policy may need frequent tuning during development (mitigation: permissive in dev, strict in prod)

---

### 4. Rate Limiting Strategy

**Decision**: Laravel's built-in `RateLimiter` with custom limit definitions.

**Rationale**:
- Laravel provides robust rate limiting out-of-the-box
- Configurable per route group
- Supports both IP-based and user-based limits

**Implementation**:
```php
// app/Providers/RouteServiceProvider.php
protected function configureRateLimiting(): void
{
    RateLimiter::for('auth', function (Request $request) {
        return Limit::perMinute(5)->by($request->ip());
    });
    
    RateLimiter::for('financial', function (Request $request) {
        return Limit::perMinute(10)->by($request->user()?->id ?: $request->ip());
    });
    
    RateLimiter::for('general', function (Request $request) {
        return Limit::perMinute(100)->by($request->user()?->id ?: $request->ip());
    });
}

// routes/web.php
Route::middleware(['auth', 'throttle:financial'])->group(function () {
    Route::post('/investments', [InvestmentController::class, 'store']);
    Route::post('/payouts', [PayoutController::class, 'store']);
});

Route::middleware('throttle:auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
});
```

**Thresholds** (tunable post-launch):
- **Auth endpoints**: 5 requests/minute per IP (prevents brute-force)
- **Financial endpoints**: 10 requests/minute per user (prevents rapid-fire fraud)
- **General endpoints**: 100 requests/minute per user (protects against DDoS)

**Trade-offs**:
- ✅ Built-in, no external dependency
- ✅ IP-based and user-based limits
- ✅ Configurable per route group
- ❌ IP-based limits can be evaded with proxies (acceptable risk for launch)
- ❌ No distributed rate limiting (single-server only) — acceptable for monolith

---

### 5. Fraud Detection System

**Decision**: Rule-based fraud detection with pluggable rule engine.

**Rationale**:
- ML-based fraud detection is overkill for launch (no training data yet)
- Rule-based detection is explainable and tunable
- Start with monitoring mode (log, don't block) to gather false positive data

**Architecture**:
```php
// app/Services/FraudDetectionService.php
class FraudDetectionService
{
    public function evaluateTransaction(Transaction $transaction): ?FraudAlert
    {
        foreach ($this->getRules() as $rule) {
            if ($rule->evaluate($transaction)) {
                return $this->createAlert($transaction, $rule);
            }
        }
        return null;
    }
    
    private function getRules(): array
    {
        return [
            new RapidInvestmentRule(), // >5 investments in 1 hour
            new UnusualAmountRule(),   // Amount >3x user's average
            new MultipleFailedAuthRule(), // >10 failed logins in 5 min
        ];
    }
}

// app/Services/FraudRules/RapidInvestmentRule.php
class RapidInvestmentRule implements FraudRuleInterface
{
    public function evaluate(Transaction $transaction): bool
    {
        $count = Investment::where('user_id', $transaction->user_id)
            ->where('created_at', '>', now()->subHour())
            ->count();
        
        return $count > config('fraud-detection.rapid_investment_threshold', 5);
    }
    
    public function getType(): FraudRuleType
    {
        return FraudRuleType::RAPID_INVESTMENTS;
    }
}
```

**FraudAlert Schema**:
```php
Schema::create('fraud_alerts', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained();
    $table->enum('rule_type', FraudRuleType::values());
    $table->enum('severity', ['low', 'medium', 'high']);
    $table->json('context'); // Transaction details, rule output
    $table->timestamp('detected_at');
    $table->timestamp('resolved_at')->nullable();
    $table->text('resolution_notes')->nullable();
    $table->timestamps();
});
```

**Trade-offs**:
- ✅ Explainable and tunable rules
- ✅ Start in monitoring mode, transition to blocking after tuning
- ✅ Admin dashboard for reviewing alerts
- ❌ No ML-based anomaly detection (acceptable for launch scale)
- ❌ Rules may have false positives (mitigation: admin review + override capability)

---

### 6. GDPR Compliance Tooling

**Decision**: Async job-based data export and deletion with user confirmation.

**Rationale**:
- Data export aggregates data across many tables — can be slow, must be async
- Data deletion requires cascade logic — must be atomic and logged
- Email notification for export download link (file too large for HTTP response)

**Data Export Flow**:
```
User clicks "Download My Data"
  → Controller validates request
    → Dispatch ExportUserData job
      → Job queries all user-related tables
        → Generates JSON file with all data
          → Stores file in storage/exports/
            → Emails download link to user
              → Link expires after 7 days
```

**Implementation**:
```php
// app/Services/GdprExportService.php
class GdprExportService
{
    public function exportUserData(int $userId): array
    {
        $user = User::find($userId);
        
        return [
            'user' => $user->only(['name', 'email', 'phone', 'created_at']),
            'investments' => $user->investments()->with('tree', 'payouts')->get(),
            'transactions' => $user->transactions()->get(),
            'audit_logs' => AuditLog::where('user_id', $userId)->get(),
            'document_acceptances' => $user->documentAcceptances()->with('legalDocument')->get(),
        ];
    }
}

// app/Jobs/ExportUserData.php
class ExportUserData implements ShouldQueue
{
    public function handle(GdprExportService $service): void
    {
        $data = $service->exportUserData($this->userId);
        $filename = "user-{$this->userId}-data-" . now()->format('Y-m-d') . ".json";
        Storage::put("exports/{$filename}", json_encode($data, JSON_PRETTY_PRINT));
        
        Mail::to($this->user->email)->send(new DataExportReady($filename));
    }
}
```

**Data Deletion Flow**:
```
User requests account deletion
  → Controller requires confirmation (2-step)
    → Dispatch DeleteUserData job
      → Job soft-deletes user record
        → Anonymizes transaction records (replace PII with "DELETED_USER")
          → Deletes non-financial data (investments, messages)
            → Logs deletion in audit log
              → Emails confirmation to user
```

**Trade-offs**:
- ✅ Async processing prevents timeout on large datasets
- ✅ Email delivery ensures user gets export even if browser session closes
- ✅ Soft delete + anonymization balances GDPR with financial record retention
- ❌ Export files stored on disk (security risk if server compromised) — mitigation: encrypt files, expire after 7 days

**Alternatives Considered**:
- **Real-time export in HTTP response**: Rejected — too slow for large datasets, risks timeout
- **Delete all user data including transactions**: Rejected — violates financial record retention requirements

---

### 7. Legal Document Management

**Decision**: Versioned legal documents with explicit user acceptance tracking.

**Rationale**:
- Legal compliance requires proof of user consent
- Documents evolve over time (privacy policy updates, terms changes)
- Must track which version user accepted and when

**Schema**:
```php
Schema::create('legal_documents', function (Blueprint $table) {
    $table->id();
    $table->enum('type', LegalDocumentType::values());
    $table->integer('version'); // Auto-increment per type
    $table->string('title');
    $table->text('content'); // HTML or Markdown
    $table->date('effective_date');
    $table->boolean('is_active')->default(true); // Only one active per type
    $table->timestamps();
    
    $table->unique(['type', 'version']);
});

Schema::create('user_document_acceptances', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->onDelete('cascade');
    $table->foreignId('legal_document_id')->constrained();
    $table->timestamp('accepted_at');
    $table->ipAddress('ip_address');
    $table->string('user_agent', 512);
    
    $table->unique(['user_id', 'legal_document_id']); // User can only accept once
});
```

**Versioning Logic**:
```php
// app/Services/LegalDocumentService.php
class LegalDocumentService
{
    public function publishNewVersion(
        LegalDocumentType $type,
        string $title,
        string $content,
        Carbon $effectiveDate
    ): LegalDocument {
        DB::transaction(function () use ($type, $title, $content, $effectiveDate) {
            // Deactivate current version
            LegalDocument::where('type', $type)
                ->where('is_active', true)
                ->update(['is_active' => false]);
            
            // Create new version
            $version = LegalDocument::where('type', $type)->max('version') + 1;
            return LegalDocument::create([
                'type' => $type,
                'version' => $version,
                'title' => $title,
                'content' => $content,
                'effective_date' => $effectiveDate,
                'is_active' => true,
            ]);
        });
    }
    
    public function hasUserAcceptedLatest(int $userId, LegalDocumentType $type): bool
    {
        $latest = $this->getActiveDocument($type);
        return UserDocumentAcceptance::where('user_id', $userId)
            ->where('legal_document_id', $latest->id)
            ->exists();
    }
}
```

**Trade-offs**:
- ✅ Full audit trail of document versions and user acceptances
- ✅ Flexible versioning per document type
- ✅ Can enforce acceptance before critical actions (e.g., investment purchase)
- ❌ Requires re-acceptance when documents update (user friction) — mitigation: notify via email, allow continued use with prompt to re-accept

---

## Data Flow Diagrams

### Audit Logging Flow

```
┌─────────────┐
│  User Action │ (e.g., purchase investment)
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│   Controller     │ (InvestmentController::store)
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  Service         │ (InvestmentService::createInvestment)
│                  │  - Create investment record
│                  │  - Process payment
│                  │  - Call AuditLogService::logEvent(...)
└──────┬──────────┘
       │
       ▼
┌─────────────────────┐
│ AuditLogService      │ (dispatch async job)
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ LogAuditEvent Job    │ (queued)
│  - Insert into       │
│    audit_logs table  │
│  - No updates/deletes│
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  MySQL Database      │ (immutable audit_logs record)
└─────────────────────┘
```

### GDPR Data Export Flow

```
┌─────────────────┐
│ User clicks      │ "Download My Data" button
│ in Account Page  │
└────────┬─────────┘
         │
         ▼
┌───────────────────┐
│ GdprController    │ (POST /account/data-export)
│  - Validate user  │
│  - Dispatch job   │
└────────┬──────────┘
         │
         ▼
┌───────────────────────┐
│ ExportUserData Job     │ (async, queued)
│  - Query all user data │ (GdprExportService)
│  - Generate JSON file  │
│  - Store in storage/   │
└────────┬───────────────┘
         │
         ▼
┌───────────────────────┐
│ DataExportReady Email  │ (with download link)
│  - Link expires 7 days │
└────────┬───────────────┘
         │
         ▼
┌───────────────────────┐
│ User downloads file    │ (GET /exports/{filename})
│  - Verify ownership    │
│  - Stream file         │
└────────────────────────┘
```

### Fraud Detection Flow

```
┌─────────────────────┐
│ Investment Purchase  │ (POST /investments)
└──────────┬───────────┘
           │
           ▼
┌─────────────────────────┐
│ InvestmentController     │
│  - Validate input        │
│  - Call service          │
└──────────┬───────────────┘
           │
           ▼
┌─────────────────────────────┐
│ InvestmentService            │
│  - Create investment         │
│  - Call FraudDetectionService│
└──────────┬───────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│ FraudDetectionService            │
│  - Evaluate against rules        │
│  - RapidInvestmentRule           │
│  - UnusualAmountRule             │
└──────────┬───────────────────────┘
           │
    ┌──────┴───────┐
    │              │
    ▼              ▼
┌─────────┐   ┌───────────┐
│ No Alert│   │ Create    │
│         │   │ FraudAlert│
└─────────┘   └─────┬─────┘
                    │
                    ▼
          ┌─────────────────────┐
          │ SecurityMonitoring   │
          │ Service sends alert  │
          │ email to admins      │
          └─────────────────────┘
```

---

## Performance Considerations

### 1. Audit Log Storage Growth
- **Problem**: Immutable logs grow unbounded (estimated 10K events/day → 3.6M/year)
- **Mitigation**:
  - Index on `created_at` for time-range queries
  - Archive logs > 2 years to cold storage (S3 Glacier, compressed)
  - Partition table by year (MySQL 8 partitioning)

### 2. Encryption Overhead
- **Problem**: Encrypt/decrypt adds latency (estimated ~1-2ms per field)
- **Mitigation**:
  - Encrypt only sensitive fields (not entire records)
  - Cache decrypted values in PHP objects (don't decrypt on every access)
  - Benchmark with realistic data volumes

### 3. GDPR Export Performance
- **Problem**: Aggregating user data across many tables can be slow (>10 seconds for large portfolios)
- **Mitigation**:
  - Async job processing (non-blocking)
  - Paginate queries within job to avoid memory exhaustion
  - Cache export file for 7 days (don't regenerate on every download)

### 4. Fraud Detection Query Performance
- **Problem**: Rule evaluation queries user transaction history (can be slow)
- **Mitigation**:
  - Index on `investments.user_id, investments.created_at`
  - Cache aggregates (e.g., "investments in last hour") in Redis (future enhancement)
  - Limit rule evaluation to recent data (last 30 days)

---

## Security Considerations

### 1. Encryption Key Management
- **Risk**: Loss of `APP_KEY` means all encrypted data is unrecoverable
- **Mitigation**:
  - Backup `APP_KEY` to encrypted vault (e.g., 1Password, AWS Secrets Manager)
  - Document key rotation procedure (requires re-encryption script)
  - Test key rotation in staging before production

### 2. Audit Log Tampering
- **Risk**: Attacker with DB access could modify audit logs
- **Mitigation**:
  - Model observers prevent updates/deletes at application layer
  - Database triggers for additional protection (future enhancement)
  - Append-only log forwarding to external SIEM (future enhancement)

### 3. GDPR Export File Security
- **Risk**: Export files contain full user data (PII, financial records)
- **Mitigation**:
  - Store in `storage/app/exports` (not publicly accessible)
  - Verify ownership before allowing download (check `user_id` matches session)
  - Encrypt files with user-specific password (future enhancement)
  - Auto-delete after 7 days

### 4. Fraud Detection Evasion
- **Risk**: Sophisticated attackers evade rule-based detection
- **Mitigation**:
  - Start with broad rules, tune based on real attack patterns
  - Log all rule evaluations (even non-alerts) for post-hoc analysis
  - Transition to ML-based detection post-launch with training data

---

## Migration Plan

**N/A** — This is a fresh implementation with no existing security infrastructure to migrate from.

**Deployment Checklist**:
1. Run migrations: `php artisan migrate`
2. Seed initial legal documents: `php artisan db:seed --class=LegalDocumentSeeder`
3. Configure environment variables:
   - `SECURITY_HSTS_ENABLED=true`
   - `CSP_SCRIPT_SRC=...` (allowlisted domains)
   - `FRAUD_RAPID_INVESTMENT_THRESHOLD=5`
4. Verify security headers in production (use securityheaders.com)
5. Test rate limiting (trigger 429 response)
6. Test GDPR export/deletion flows end-to-end
7. Configure monitoring alerts (email admins on fraud detection)

---

## Risks / Trade-offs

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|-----------|
| Encryption key loss | Low | Critical | Backup `APP_KEY` to vault; test recovery |
| Audit log storage costs | High | Medium | Archive policy after 2 years; compress old logs |
| Fraud detection false positives | Medium | High | Monitoring mode at launch; admin review capability |
| GDPR deletion violates financial laws | Medium | High | Anonymize (not delete) transaction records |
| CSP policy breaks external integrations | High | Medium | Permissive at launch; tighten iteratively |
| Rate limiting blocks legitimate users | Low | Medium | Tune thresholds based on real usage patterns |

---

## Testing Strategy

### Unit Tests
- `AuditLogService`: Event logging, immutability enforcement
- `FraudDetectionService`: Rule evaluation, alert creation
- `GdprExportService`: Data aggregation, JSON structure
- `GdprDeletionService`: Soft delete, anonymization logic
- Custom validation rules: `NoSqlInjection`, `NoXss`

### Feature Tests
- Security headers: Verify all headers present in HTTP responses
- Rate limiting: Verify 429 response after threshold
- Audit log immutability: Attempt UPDATE/DELETE, expect exception
- GDPR export: Trigger job, verify file created, download link works
- GDPR deletion: Trigger job, verify user soft-deleted, transactions anonymized
- Legal document acceptance: Accept terms, verify tracked in DB

### Manual Testing
- Security scanning: Run `composer audit`, `npm audit`
- Penetration testing: Attempt SQL injection, XSS, CSRF (verify Laravel protections work)
- Browser testing: Verify CSP doesn't block legitimate assets
- Performance testing: Benchmark encryption overhead, audit log writes

---

## Open Questions

1. **Encryption key backup location**: Where should `APP_KEY` be backed up? (AWS Secrets Manager, 1Password, etc.)
   - **Decision needed by**: Before production deployment
   - **Owner**: DevOps team

2. **Fraud detection monitoring period**: How long should we run in monitoring-only mode before blocking transactions?
   - **Decision needed by**: After 2 weeks of production data
   - **Owner**: Security team + Product Owner

3. **GDPR export file format**: JSON or CSV? (CSV is more user-friendly but doesn't handle nested data well)
   - **Decision needed by**: Before implementation
   - **Owner**: Product Owner

4. **Audit log archival storage**: AWS S3 Glacier, local compressed backups, or third-party log service?
   - **Decision needed by**: Before production deployment
   - **Owner**: DevOps team + Finance (cost assessment)

5. **Security monitoring alert recipients**: Who receives fraud detection emails? (All admins, security team only, on-call rotation?)
   - **Decision needed by**: Before production deployment
   - **Owner**: Operations team

---

## Future Enhancements (Out of Scope)

1. **Multi-factor authentication (MFA)**: Deferred to EPIC-001 (Auth)
2. **Blockchain-based audit log**: Overkill for launch; revisit if regulatory requirement emerges
3. **Machine learning fraud detection**: Requires training data (6-12 months post-launch)
4. **External SIEM integration**: Splunk, Datadog APM (evaluate after launch based on scale)
5. **Database-level encryption (TDE)**: MySQL Enterprise feature; evaluate for high-security deployments
6. **Real-time anomaly detection**: Requires streaming infrastructure (Kafka, Flink); defer to scale phase
7. **WAF (Web Application Firewall)**: Infrastructure-layer protection; evaluate CloudFlare, AWS WAF post-launch

---

## References

- **EPIC-015**: `prompter/epics/EPIC-015-security-compliance-infrastructure.md`
- **PRD**: `prompter/prd.md` Section "Technical Specifications - Security"
- **AGENTS.md**: Section 10 (Security & Privacy Rules)
- **Laravel Encryption Docs**: https://laravel.com/docs/12.x/encryption
- **Laravel Rate Limiting Docs**: https://laravel.com/docs/12.x/routing#rate-limiting
- **OWASP Security Headers**: https://owasp.org/www-project-secure-headers/
- **GDPR Compliance Guide**: https://gdpr.eu/compliance/
