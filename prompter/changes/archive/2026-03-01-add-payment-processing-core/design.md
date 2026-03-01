# Design Document: Core Payment Processing Infrastructure

## Context
The platform requires secure payment processing for investment purchases (EPIC-006) and future payout distributions (EPIC-009). This design covers Phase 1: establishing the foundational payment infrastructure with Stripe integration, transaction ledger, payment method management, and webhook processing.

**Constraints:**
- PCI DSS compliance is mandatory — no raw card data can touch the Laravel backend
- Monolith architecture — no separate payment microservice
- Database queue driver — no Redis or external queue services
- Must support future multi-currency expansion (Phase 3)
- Must integrate with existing fraud detection and audit logging systems

**Stakeholders:**
- Investors (primary users of payment system)
- Platform administrators (monitoring failed payments, reconciliation)
- Compliance team (audit trail, PCI DSS, financial regulations)
- Farm owners (future Phase 2: receiving payouts)

## Goals / Non-Goals

### Goals
- ✅ Enable secure payment processing for investment purchases
- ✅ Maintain PCI DSS compliance (no raw card data in backend)
- ✅ Provide immutable transaction ledger for financial accountability
- ✅ Support saving and reusing payment methods
- ✅ Handle webhook processing reliably with idempotency
- ✅ Integrate with existing fraud detection before payment processing
- ✅ Log all payment events in audit trail
- ✅ Graceful handling of payment failures with user notifications

### Non-Goals (Future Phases)
- ❌ Digital wallet balance management (Phase 2)
- ❌ Outbound payout processing (Phase 2)
- ❌ Multi-currency support and conversion (Phase 3)
- ❌ Refund processing (Phase 3)
- ❌ Local payment methods (FPX, GrabPay) — Phase 3
- ❌ Recurring subscription payments (not applicable to investment model)

## Decisions

### Decision 1: Stripe PHP SDK (not Laravel Cashier)
**Choice:** Use `stripe/stripe-php` SDK directly instead of Laravel Cashier.

**Rationale:**
- **Control:** Cashier is optimized for subscription billing (recurring payments), but Treevest needs one-time investment transactions with custom flows
- **Flexibility:** Direct SDK allows fine-grained control over payment intents, metadata, and custom workflows
- **Transparency:** Explicit API calls make payment flows easier to understand and debug
- **Future-proofing:** Easier to integrate local payment methods and payout flows (Phase 2/3) without Cashier abstractions

**Alternatives considered:**
- **Laravel Cashier:** Rejected — optimized for subscriptions, adds unnecessary abstraction for one-time payments
- **Omnipay:** Rejected — lower adoption, less Laravel-native than direct Stripe SDK

### Decision 2: Transaction Ledger as Append-Only Immutable Log
**Choice:** Transaction records are immutable; status changes create new audit entries, never update existing records.

**Rationale:**
- **Auditability:** Full history of every financial event is preserved
- **Compliance:** Regulatory requirements (7-year retention) demand immutable financial records
- **Forensics:** Ability to reconstruct exact state at any point in time
- **Conflict resolution:** No race conditions on transaction updates

**Implementation:**
- Transaction record created with initial status (`pending`, `processing`, `completed`, `failed`)
- Status transitions logged via separate `transaction_status_histories` table or audit_logs
- Transaction record itself remains immutable after creation
- Soft deletes forbidden on transactions table

**Alternatives considered:**
- **Update transaction status in place:** Rejected — loses audit trail, violates financial record-keeping best practices
- **Event sourcing:** Overkill for initial scope; immutable log achieves similar auditability with simpler implementation

### Decision 3: PCI DSS Compliance via Stripe.js/Elements (Frontend)
**Choice:** Use Stripe.js and React Stripe.js (`@stripe/react-stripe-js`) for all card input; backend never sees raw card data.

**Rationale:**
- **PCI DSS compliance:** Stripe handles tokenization; backend only receives payment method IDs or payment intent client secrets
- **Security:** Eliminates PCI compliance burden from backend infrastructure
- **User trust:** Industry-standard secure payment UX

**Implementation:**
- Frontend: `@stripe/stripe-js` + `@stripe/react-stripe-js` wraps Stripe Elements
- Backend: `/api/payment-intents` creates payment intent with Stripe API, returns `client_secret`
- Frontend: Stripe Elements confirms payment with `client_secret`
- Backend: Webhook receives payment confirmation, updates investment status

**Alternatives considered:**
- **Collect card data on backend:** Rejected — massive PCI compliance burden, security risk
- **Hosted payment page (Stripe Checkout):** Rejected — less control over UX, harder to integrate with investment flow

### Decision 4: Webhook Processing via Laravel Queue Jobs
**Choice:** Stripe webhooks trigger Laravel queue jobs (database driver) for async processing with retry logic.

**Rationale:**
- **Reliability:** Queue jobs automatically retry on failure (configurable attempts)
- **Idempotency:** Job can check if webhook event already processed before executing
- **Performance:** Webhook controller responds quickly (202 Accepted) without blocking
- **Consistency:** Aligns with existing project queue infrastructure (database driver)

**Implementation:**
```php
// StripeWebhookController
public function handle(Request $request) {
    $signature = $request->header('Stripe-Signature');
    $event = Webhook::constructEvent($request->getContent(), $signature, config('services.stripe.webhook_secret'));
    
    ProcessStripeWebhook::dispatch($event->id, $event->type, $event->data);
    
    return response()->json(['status' => 'accepted'], 202);
}

// ProcessStripeWebhook Job
public function handle() {
    // Check if event already processed (idempotency)
    if (AuditLog::where('event_data->stripe_event_id', $this->eventId)->exists()) {
        return; // Already processed
    }
    
    // Process event, update transaction status, trigger notifications
    // Log to audit trail with stripe_event_id for idempotency
}
```

**Alternatives considered:**
- **Synchronous webhook processing:** Rejected — long-running operations risk webhook timeout
- **Redis queue:** Rejected — project uses database queue driver for simplicity

### Decision 5: Monetary Values as Integers (Cents)
**Choice:** Store all monetary amounts as integers (smallest currency unit: cents for USD/MYR).

**Rationale:**
- **Precision:** Avoids floating-point rounding errors in financial calculations
- **Industry standard:** Stripe, PayPal, and all major payment processors use integer representation
- **Future multi-currency support:** Consistent representation across currencies

**Implementation:**
- Database: `amount BIGINT UNSIGNED` (supports up to ~92 trillion cents = ~$920 billion)
- Display: Backend returns integer; frontend divides by 100 and formats with `Intl.NumberFormat`
- Currency code stored alongside amount: `amount: 150000, currency: 'MYR'` = RM 1,500.00

**Alternatives considered:**
- **DECIMAL(15,2):** Rejected — still risks floating-point issues in application logic, less standard than integer approach

### Decision 6: Payment Method Storage
**Choice:** Store Stripe payment method IDs (not raw card data) in `payment_methods` table; fetch details from Stripe API when needed.

**Rationale:**
- **Security:** No sensitive card data in database
- **Compliance:** PCI DSS compliant storage
- **Flexibility:** Stripe handles card updates (e.g., expiration date changes)
- **Simplicity:** Stripe payment method objects are the source of truth

**Implementation:**
- `payment_methods` table stores: `user_id`, `stripe_payment_method_id`, `type` (card/bank_account), `last4`, `brand`, `is_default`
- Display data (`last4`, `brand`) cached for UX; full details fetched from Stripe API on demand
- Payment method deletion removes from database AND calls Stripe API to detach

**Alternatives considered:**
- **Store full card details encrypted:** Rejected — PCI DSS compliance nightmare, unnecessary complexity
- **No payment method storage (one-time only):** Rejected — poor UX, requires re-entering card for every investment

### Decision 7: Fraud Detection Integration Point
**Choice:** Fraud detection evaluation happens BEFORE payment intent creation, not after payment confirmation.

**Rationale:**
- **Prevention:** Block suspicious transactions before payment processing (avoid refunds/chargebacks)
- **User experience:** Immediate feedback if transaction flagged
- **Cost:** Avoid Stripe API calls for flagged transactions

**Implementation:**
```php
// In PaymentService::initiatePayment()
$fraudAlert = FraudDetectionService::evaluateTransaction($transaction);

if ($fraudAlert && $fraudAlert->severity === 'high' && config('fraud.blocking_enabled')) {
    throw new FraudDetectedException('Transaction blocked by fraud detection');
}

// If monitoring mode or low severity, proceed with payment intent creation
$paymentIntent = StripeService::createPaymentIntent($amount, $currency, $metadata);
```

**Alternatives considered:**
- **Fraud detection after payment:** Rejected — requires refunds, poor user experience
- **No fraud detection integration:** Rejected — violates EPIC-015 security requirements

## Database Schema

### `transactions` Table (Redesigned)
```php
Schema::create('transactions', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->enum('type', ['investment_purchase', 'payout', 'refund', 'top_up', 'withdrawal']); // TransactionType enum
    $table->enum('status', ['pending', 'processing', 'completed', 'failed', 'cancelled']); // TransactionStatus enum
    $table->unsignedBigInteger('amount'); // Integer (cents)
    $table->char('currency', 3)->default('MYR'); // ISO 4217 currency code
    $table->string('stripe_payment_intent_id')->nullable()->unique();
    $table->foreignId('payment_method_id')->nullable()->constrained('payment_methods')->nullOnDelete();
    $table->foreignId('related_investment_id')->nullable()->constrained('investments')->nullOnDelete(); // For investment_purchase type
    $table->foreignId('related_payout_id')->nullable()->constrained('payouts')->nullOnDelete(); // For payout type (Phase 2)
    $table->text('metadata')->nullable(); // JSON metadata (fraud alert ID, IP address, etc.)
    $table->text('stripe_metadata')->nullable(); // Stripe-specific metadata
    $table->text('failure_reason')->nullable(); // Encrypted - reason for failed transactions
    $table->timestamp('completed_at')->nullable();
    $table->timestamp('failed_at')->nullable();
    $table->timestamps(); // created_at, updated_at
    
    $table->index(['user_id', 'type', 'status']);
    $table->index(['status', 'created_at']);
    $table->index('stripe_payment_intent_id');
});
```

### `payment_methods` Table (New)
```php
Schema::create('payment_methods', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->string('stripe_payment_method_id')->unique();
    $table->enum('type', ['card', 'bank_account']); // Extensible for future local methods
    $table->string('last4', 4)->nullable(); // Cached from Stripe
    $table->string('brand')->nullable(); // Cached: visa, mastercard, etc.
    $table->string('exp_month', 2)->nullable(); // Cached
    $table->string('exp_year', 4)->nullable(); // Cached
    $table->boolean('is_default')->default(false);
    $table->timestamps();
    
    $table->index(['user_id', 'is_default']);
    $table->unique(['user_id', 'stripe_payment_method_id']);
});
```

### Relationships
- **Transaction** `belongsTo` User
- **Transaction** `belongsTo` PaymentMethod (optional)
- **Transaction** `belongsTo` Investment (optional, for `investment_purchase` type)
- **Transaction** `belongsTo` Payout (optional, for `payout` type - Phase 2)
- **PaymentMethod** `belongsTo` User
- **PaymentMethod** `hasMany` Transaction
- **User** `hasMany` Transaction
- **User** `hasMany` PaymentMethod

## Risks / Trade-offs

### Risk 1: Stripe Downtime
**Risk:** Stripe API unavailability blocks all payment processing.
**Mitigation:**
- Stripe has 99.99% SLA with redundant infrastructure
- Queue jobs retry webhook processing automatically
- Display clear error messages to users during Stripe outages
- Monitor Stripe status page: https://status.stripe.com
- Consider future failover to secondary payment gateway (Phase 3)

### Risk 2: Webhook Delivery Failures
**Risk:** Stripe webhooks may fail to deliver (network issues, downtime during deployment).
**Mitigation:**
- Stripe automatically retries webhooks for 3 days
- Idempotency checks prevent duplicate processing
- Manual reconciliation script: fetch recent payment intents from Stripe API, compare with local transaction records
- Monitoring: Alert if no webhooks received for >1 hour during business hours

### Risk 3: Concurrent Transaction Creation
**Risk:** User initiates multiple payment intents for same investment simultaneously.
**Mitigation:**
- Database unique constraint on `(user_id, related_investment_id, status='pending')`
- Frontend disables "Pay Now" button after click
- Idempotency keys for Stripe API calls (payment intent creation)

### Risk 4: Migration Complexity (Breaking Change)
**Risk:** Redesigning `transactions` table breaks existing code (if any).
**Mitigation:**
- Current `transactions` table is a placeholder with minimal usage (only encrypted `amount` and `account_number` fields, no foreign keys to other tables)
- Migration strategy: 
  1. Backup existing transactions data (if any exists in production)
  2. Drop and recreate table with new schema
  3. No data migration needed (no production data exists yet)
  4. Update all references to Transaction model

### Risk 5: PCI DSS Compliance Drift
**Risk:** Future developer accidentally logs or stores raw card data.
**Mitigation:**
- Code review checklist: "Does this PR handle card data? If yes, is it via Stripe.js/Elements only?"
- Automated log scanning: grep for patterns like `card_number`, `cvv` in logs
- Developer documentation emphasizing PCI compliance rules
- Regular security audits

## Migration Plan

### Step 1: Install Dependencies
```bash
composer require stripe/stripe-php:^15.0
npm install @stripe/stripe-js @stripe/react-stripe-js
```

### Step 2: Configuration
1. Add Stripe API keys to `.env`:
   ```
   STRIPE_KEY=pk_test_...
   STRIPE_SECRET=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```
2. Update `config/services.php`:
   ```php
   'stripe' => [
       'key' => env('STRIPE_KEY'),
       'secret' => env('STRIPE_SECRET'),
       'webhook_secret' => env('STRIPE_WEBHOOK_SECRET'),
   ],
   ```

### Step 3: Database Migration (Breaking Change)
1. Create migration to redesign `transactions` table
2. Create migration for `payment_methods` table
3. Run migrations: `php artisan migrate`

### Step 4: Backend Implementation
1. Create Eloquent models: `Transaction`, `PaymentMethod`
2. Create enums: `TransactionType`, `TransactionStatus`
3. Create services: `PaymentService`, `StripeService`
4. Create controllers: `PaymentMethodController`, `StripeWebhookController`
5. Create queue job: `ProcessStripeWebhook`
6. Add routes for payment methods and webhook endpoint

### Step 5: Frontend Implementation
1. Create Stripe Elements wrapper component: `PaymentForm.tsx`
2. Create payment method management page: `PaymentMethods/Index.tsx`
3. Integrate Stripe publishable key in app initialization

### Step 6: Testing
1. Unit tests for `PaymentService`, `StripeService`
2. Feature tests for payment method CRUD
3. Webhook simulation tests (Stripe CLI: `stripe listen --forward-to localhost/stripe/webhook`)
4. End-to-end test: create payment intent, confirm payment, verify webhook processing

### Step 7: Deployment
1. Deploy code to staging
2. Configure Stripe webhook endpoint in Stripe Dashboard (staging)
3. Test with Stripe test cards: https://stripe.com/docs/testing
4. Deploy to production
5. Configure production webhook endpoint
6. Monitor initial transactions closely

### Rollback Plan
If critical issues arise:
1. Revert code deployment
2. Database rollback NOT possible (breaking migration); keep new schema
3. Temporary workaround: manually process payments via Stripe Dashboard, update transaction records via Tinker/SQL

## Open Questions
1. **Platform fee/commission structure:** How does the platform earn revenue on investment transactions? (Fixed fee, percentage, or hybrid?)
   - **Resolution needed before:** Investment purchase flow implementation (EPIC-006)
   - **Proposed answer:** Deferred to business/product team; implement as configurable fee structure in Transaction metadata

2. **Investment capacity limits:** Can multiple users invest in the same tree? Is there a maximum capacity per tree?
   - **Resolution needed before:** Investment purchase flow (EPIC-006)
   - **Impacts:** Concurrent transaction handling, inventory management

3. **Payment method limits:** Should there be a maximum number of saved payment methods per user?
   - **Proposed answer:** Start with no limit; monitor usage patterns and add limit if abuse detected

4. **Failed payment retry strategy:** Should users be prompted to retry failed payments automatically?
   - **Proposed answer:** Phase 1 - manual retry (user must re-initiate payment); Phase 2 - automated retry with notification

5. **Currency for initial launch:** Confirm default currency is MYR (Malaysian Ringgit)?
   - **Resolution needed before:** Schema finalization
   - **Assumption:** MYR based on project context; multi-currency in Phase 3
