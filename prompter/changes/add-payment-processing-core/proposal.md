# Change: Implement Core Payment Processing Infrastructure (Phase 1)

## Why
This implements the foundational payment processing infrastructure required for EPIC-010 (Payment Processing & Financial Transactions). Without this capability, the platform cannot accept investments (EPIC-006) or process payouts (EPIC-009). This is Phase 1 of a multi-phase implementation: it establishes Stripe integration, payment method management, transaction ledger, basic webhook processing, and secure payment initiation—the critical financial backbone of the platform.

## What Changes
- **Add Stripe Payment Gateway Integration**: Stripe PHP SDK integration, Stripe.js/Elements on frontend, test/live API key configuration
- **Add Transaction Ledger System**: Comprehensive `transactions` table redesign, immutable financial record-keeping, transaction types (investment_purchase, payout, refund, top_up), currency tracking, status tracking
- **Add Payment Method Management**: Users can save and manage payment methods (cards, bank accounts), `payment_methods` table, Stripe payment method attachment
- **Add Payment Initiation Flow**: Create payment intents via Stripe, secure client-side confirmation via Stripe Elements, payment status tracking
- **Add Webhook Processing Infrastructure**: Stripe webhook signature verification, dedicated webhook controller, Laravel queue jobs for async processing, idempotency handling
- **Add Payment Auditing**: All payment events recorded in audit log, fraud detection integration hooks (evaluation point before payment)
- **Frontend UI Components**: React/Inertia pages for payment method management, Stripe Elements integration components, payment confirmation flows

**Breaking Changes:**
- **BREAKING**: Existing `transactions` table schema will be completely redesigned (current placeholder only has `id`, `user_id`, `amount`, `account_number`)

## Impact
- **Affected specs:** 
  - New capability: `payment-processing` (entire capability is new)
  - Related: `audit-logging` (payment events), `fraud-detection` (transaction evaluation)
- **Affected code:**
  - **New files:**
    - `app/Models/Transaction.php` (complete rewrite from placeholder)
    - `app/Models/PaymentMethod.php` (new)
    - `app/Services/PaymentService.php` (new)
    - `app/Services/StripeService.php` (new)
    - `app/Http/Controllers/PaymentMethodController.php` (new)
    - `app/Http/Controllers/StripeWebhookController.php` (new)
    - `app/Jobs/ProcessStripeWebhook.php` (new)
    - `app/Enums/TransactionType.php` (new)
    - `app/Enums/TransactionStatus.php` (new)
    - `database/migrations/YYYY_MM_DD_redesign_transactions_table.php` (breaking migration)
    - `database/migrations/YYYY_MM_DD_create_payment_methods_table.php`
    - `resources/js/Pages/PaymentMethods/Index.tsx` (new)
    - `resources/js/Components/PaymentForm.tsx` (new - Stripe Elements wrapper)
  - **Modified files:**
    - `config/services.php` (add Stripe configuration)
    - `.env.example` (add Stripe keys)
    - `routes/web.php` (payment method routes)
    - `composer.json` (add `stripe/stripe-php`)
    - `package.json` (add `@stripe/stripe-js`, `@stripe/react-stripe-js`)

- **Dependencies:**
  - Blocks: EPIC-006 (Investment Purchase - needs payment processing)
  - Blocks: EPIC-009 (Harvest & Returns - needs payout processing, covered in Phase 2)
  - Requires: User authentication (EPIC-001 ✅), KYC verification system (EPIC-002, in progress), Audit logging (✅), Fraud detection (✅)

## Out of Scope (Deferred to Future Phases)
- **Phase 2 (Wallets & Payouts):** Digital wallet balance management, payout distribution to bank accounts/wallets, outbound payment processing
- **Phase 3 (Advanced Features):** Multi-currency support and conversion, refund processing, local payment method integrations (FPX, GrabPay)

## Security & Compliance Notes
- PCI DSS compliance achieved via Stripe.js/Elements (no raw card data touches backend)
- All transaction records are immutable (no updates after creation, only status transitions via new records)
- Webhook signature verification mandatory (Stripe webhook secret)
- Payment intents use idempotency keys to prevent duplicate charges
- Monetary values stored as integers (cents) to avoid floating-point precision issues

## Technical Decisions
- Use Stripe PHP SDK (not Laravel Cashier) for fine-grained control over payment flows
- Stripe.js/Elements on React frontend for secure card input (PCI compliance)
- Webhook processing via Laravel queue jobs (database driver) for reliability and retry logic
- Transaction ledger is append-only; status changes create new audit entries, not updates
- Payment method storage uses Stripe's payment method objects (not raw card data)
- Currency support limited to MYR (Malaysian Ringgit) in Phase 1; multi-currency in Phase 3

## Validation Criteria
- [ ] Stripe integration tests pass with test API keys
- [ ] Payment intents can be created and confirmed successfully
- [ ] Webhook signature verification works correctly
- [ ] Payment methods can be saved, retrieved, and deleted
- [ ] Transaction ledger records all financial movements immutably
- [ ] Fraud detection service is called before payment processing
- [ ] All payment events appear in audit logs
- [ ] Failed payment scenarios are handled gracefully (webhook retry, user notification)
- [ ] Frontend payment flow works end-to-end (add payment method, initiate payment, confirm via Stripe Elements)
