# Technical Design: Investment Purchase Flow

## Context
Investment purchase is the core revenue-generating transaction on Treevest. The flow must be:
- **Secure:** KYC-gated, payment-verified, audit-logged
- **Compliant:** Risk disclosure mandatory, terms acceptance required
- **Atomic:** No partial investments or inconsistent states between payment and portfolio
- **User-friendly:** Multi-step wizard with clear progress and validation feedback

Constraints:
- Laravel + Inertia.js monolith (no separate API)
- Database-backed sessions, cache, queues (no Redis)
- Stripe for payment processing
- Existing payment-processing infrastructure (Transactions table, StripeService)
- Existing KYC verification system

## Goals / Non-Goals

**Goals:**
- Enable investors to purchase tree investments via secure multi-step flow
- Enforce KYC verification gate before investment
- Integrate with existing payment processing infrastructure
- Support investment top-up (additional investment in same tree)
- Allow cancellation before payment confirmation
- Maintain complete audit trail

**Non-Goals:**
- Bulk investment (multiple trees in one transaction) — deferred to future scope
- Secondary market selling — separate EPIC-016
- Fractional ownership (multiple investors per tree) — requires separate design
- Mobile app support — web-only for Phase 1
- Automated portfolio rebalancing — future feature

## Decisions

### Decision 1: Investment-Transaction Relationship
**Choice:** Many-to-one (Investment → Transaction) with nullable transaction_id

**Rationale:**
- Investment record is created immediately when user initiates purchase (status: pending_payment)
- Transaction is created when payment intent is initiated
- Investment.transaction_id is set once payment is confirmed
- Investment top-ups create new transactions, but we track the relationship via transaction metadata (investment_id), not multiple foreign keys on Investment

**Alternatives Considered:**
- One-to-many (Investment → Transactions): More complex, requires aggregation to get total invested amount
- Polymorphic relationship: Over-engineering for this use case

### Decision 2: Status Transition Flow
**Status Enum:** `pending_payment` → `active` → `matured` → (optionally) `sold` (secondary market)
**Cancellable:** Only in `pending_payment` status

**Rationale:**
- Simple linear flow for Phase 1
- `pending_payment`: Investment initiated but payment not confirmed
- `active`: Payment confirmed, investment is live
- `matured`: Productive lifespan ended (tree is `retired`)
- `sold`: User sold investment on secondary market (future EPIC)
- `cancelled`: User cancelled before payment confirmation

**Validation Rules:**
- `pending_payment` → `active` (payment confirmation)
- `pending_payment` → `cancelled` (user action)
- `active` → `matured` (tree lifecycle transition)
- `active` → `sold` (secondary market sale)
- No other transitions allowed

### Decision 3: Investment Amount Storage
**Choice:** Store amount as integer (cents) with currency code

**Rationale:**
- Consistent with Transaction model (amount_cents)
- Avoids floating-point precision errors
- Currency code stored for future multi-currency support
- Default currency: MYR (Malaysian Ringgit)

### Decision 4: Investment Top-Up Strategy
**Choice:** Create new Transaction for top-up, update Investment.amount_cents directly (not a new Investment record)

**Rationale:**
- One Investment record per (user, tree) pair keeps portfolio queries simple
- Top-up transactions are linked via metadata (investment_id)
- Transaction history provides full audit trail of top-ups
- Investment.amount_cents is the cumulative amount invested in that tree

**Alternatives Considered:**
- Multiple Investment records per (user, tree): Complicates portfolio aggregation and ROI calculation
- Separate TopUp model: Over-engineering; transactions already track this

### Decision 5: KYC Verification Gate Implementation
**Choice:** Middleware-based gate on investment routes + service-level validation

**Rationale:**
- Middleware (`KycVerifiedMiddleware`) prevents route access for unverified users
- Service-level check in `InvestmentService.validateInvestmentEligibility()` provides double-check before transaction
- Redirect to KYC flow with flash message for better UX

**Validation:**
- User.kyc_status must be 'verified'
- User.kyc_expires_at must be in the future (not expired)

### Decision 6: Risk Disclosure and Terms Acceptance
**Choice:** Store acceptance flags in Investment metadata JSON field (not separate boolean columns)

**Rationale:**
- Keeps schema flexible for future compliance additions
- Metadata JSON: `{"risk_disclosure_accepted_at": "2026-03-01T10:00:00Z", "terms_accepted_at": "2026-03-01T10:00:00Z", "terms_version": "1.0"}`
- StoreInvestmentRequest validates both are true before allowing submission
- Audit log provides immutable record

### Decision 7: Multi-Step Purchase Wizard Structure
**Choice:** React state machine with Inertia page navigation

**Approach:**
- Step 1: Tree Selection (can skip if coming from marketplace tree detail page with `?tree_id=X`)
- Step 2: Configure Amount (amount input, display min/max, tree summary)
- Step 3: Review & Accept (risk disclosure modal, terms checkbox, payment method selection)
- Step 4: Payment Confirmation (Stripe payment intent, redirect to Stripe or use Elements)
- Step 5: Confirmation Receipt (investment summary, next steps)

**State Management:**
- Inertia form with wizard progress state
- Validation errors displayed per step
- Back navigation preserves entered data

### Decision 8: Concurrent Investment Handling
**Choice:** Database transaction wrapper + optimistic locking (if tree capacity limits exist)

**Implementation:**
```php
DB::transaction(function () use ($userId, $treeId, $amount) {
    // 1. Lock tree row (SELECT FOR UPDATE) if capacity limits apply
    $tree = Tree::lockForUpdate()->findOrFail($treeId);
    
    // 2. Validate tree is still investable
    if (!$tree->isInvestable()) {
        throw new TreeNotInvestableException();
    }
    
    // 3. Check if total investments exceed tree capacity (if applicable)
    // $totalInvested = Investment::where('tree_id', $treeId)->sum('amount_cents');
    // if ($totalInvested + $amount > $tree->max_capacity_cents) {
    //     throw new InvestmentCapacityExceededException();
    // }
    
    // 4. Create investment and payment transaction atomically
    $investment = Investment::create([...]);
    $transaction = Transaction::create([...]);
});
```

**Risks:**
- Deadlocks if multiple users invest in same tree simultaneously: Mitigated by short transaction scope
- Performance: SELECT FOR UPDATE only if tree capacity limits are implemented (not in EPIC-006 scope)

**Decision:** Do NOT implement tree capacity limits in Phase 1 (not mentioned in EPIC-006). If needed later, add in separate change.

### Decision 9: Investment-to-Payment Webhook Flow
**Sequence:**
1. User submits investment purchase → `InvestmentController.store()`
2. `InvestmentService.initiateInvestment()` creates Investment (pending_payment) + Transaction (pending)
3. `PaymentService.initiatePayment()` creates Stripe payment intent
4. Frontend redirects to Stripe checkout or uses Elements to confirm payment
5. Stripe sends `payment_intent.succeeded` webhook
6. `ProcessStripeWebhook` job processes event
7. Job calls `InvestmentService.confirmInvestment(transaction_id)`
8. Investment status → active, notification dispatched

**Idempotency:**
- Webhook job checks if stripe_event_id already processed in audit log
- Investment status transition is idempotent (no-op if already active)

### Decision 10: Investment Cancellation
**Rule:** Only pending_payment investments can be cancelled

**Flow:**
1. User clicks "Cancel Investment" on pending investment detail page
2. `InvestmentController.cancel(investment_id)` validates ownership and status
3. `InvestmentService.cancelInvestment()` transitions status to cancelled
4. If Stripe payment intent exists, cancel it via Stripe API
5. Audit log records cancellation
6. User receives cancellation confirmation notification

**Edge Case:** If payment webhook arrives after user cancellation attempt, payment confirmation takes precedence (investment becomes active, cancellation fails).

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| User's KYC expires mid-purchase | Service-level check validates KYC is current before payment initiation; webhook handler checks KYC again before confirming investment |
| Payment succeeds but webhook not received | Manual reconciliation script (admin tool) to match Stripe payment intents with local transactions; webhook retry mechanism in Stripe dashboard |
| User initiates investment, then tree status changes to non-investable | Tree.isInvestable() checked atomically in DB transaction before creating investment |
| Investment top-up exceeds tree max_investment_cents | Validation in UpdateInvestmentAmountRequest checks current Investment.amount_cents + top_up <= Tree.max_investment_cents |
| Race condition: user cancels while payment confirming | Cancellation only allowed if status is pending_payment; webhook handler sets status to active atomically; DB transaction prevents conflict |
| Fraudulent investment attempts | FraudDetectionService evaluation called before payment initiation (integrated in payment-processing spec) |

## Migration Plan

**Phase 1: Schema Creation**
1. Run migration to create `investments` table
2. Seed test data: Investment factory for testing

**Phase 2: Service and Controller Implementation**
3. Implement InvestmentService with KYC gate validation
4. Implement InvestmentController with Inertia responses
5. Add routes to web.php

**Phase 3: Frontend (Inertia/React)**
6. Build multi-step purchase wizard pages
7. Integrate with payment processing frontend (Stripe Elements)

**Phase 4: Integration**
8. Update webhook handler to call InvestmentService.confirmInvestment()
9. Add notification templates and job dispatching

**Phase 5: Testing**
10. Unit tests for InvestmentService
11. Feature tests for HTTP flow
12. Integration test for end-to-end purchase + webhook
13. Manual E2E test in browser

**Rollback Plan:**
- If critical bugs found post-deployment, disable investment routes via feature flag
- No data loss: investments table retains all records for manual reconciliation

## Open Questions

1. **Tree Capacity Limits:** Does each tree have a maximum total investment capacity (e.g., only RM 10,000 total across all investors)? Or is each investor limited only by tree.max_investment_cents per investor?
   - **Resolution Needed:** Clarify with product owner before implementing concurrent investment locking
   - **Assumption for Phase 1:** No global capacity limit; each investor can invest up to max_investment_cents independently

2. **Investment Top-Up UI Location:** Where should the "Top Up Investment" button be located?
   - **Options:** (a) Investment detail page, (b) Portfolio dashboard, (c) Tree detail page (if user already owns investment)
   - **Recommendation:** Investment detail page + Portfolio dashboard

3. **ROI Calculation:** When does ROI get calculated and displayed?
   - **Assumption:** ROI is calculated based on historical harvests and displayed on tree detail page; actual returns calculated when harvest completes (EPIC-009)
   - **Not in scope for this change**

4. **Currency Support:** Phase 1 supports MYR only. Multi-currency requires:
   - Currency conversion service
   - User-selected currency preference
   - Display amounts in user's preferred currency
   - **Decision:** Defer to future EPIC

5. **Investment Receipt Generation:** Should the system generate a PDF receipt?
   - **Recommendation:** HTML receipt page for Phase 1; PDF generation in future enhancement
