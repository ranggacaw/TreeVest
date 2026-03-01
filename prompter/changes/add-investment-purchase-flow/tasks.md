## 1. Database Schema
- [x] 1.1 Create `create_investments_table` migration with columns: id, user_id, tree_id, amount_cents, currency, purchase_date, status, transaction_id, metadata (JSON), timestamps, soft_deletes
- [x] 1.2 Add indexes on investments: user_id, tree_id, status, purchase_date
- [x] 1.3 Add foreign key constraints: investments.user_id → users.id, investments.tree_id → trees.id, investments.transaction_id → transactions.id (nullable)
- [x] 1.4 Run migration and verify schema with `php artisan migrate:status`

## 2. Models and Enums
- [x] 2.1 Create `InvestmentStatus` enum with values: pending_payment, active, matured, sold, cancelled
- [x] 2.2 Implement InvestmentStatus methods: `canTransitionTo()`, `isActive()`, `isFinalized()`
- [x] 2.3 Create `Investment` model with fillable fields, casts, relationships (user, tree, transaction)
- [x] 2.4 Add Investment model scopes: `forUser()`, `active()`, `byTree()`, `byStatus()`
- [x] 2.5 Add Investment model methods: `isActive()`, `canBeCancelled()`, `getFormattedAmountAttribute()`
- [x] 2.6 Create InvestmentFactory for testing with realistic data
- [x] 2.7 Write unit tests for Investment model (relationships, scopes, status checks)

## 3. Service Layer
- [x] 3.1 Create `InvestmentService` with constructor injection: PaymentService, AuditLogService
- [x] 3.2 Implement `initiateInvestment()`: validate KYC, validate tree investability, validate amount min/max, create payment transaction, create investment record with status pending_payment
- [x] 3.3 Implement `confirmInvestment()`: transition status to active, link transaction, update portfolio denormalization (if applicable), dispatch notification job
- [x] 3.4 Implement `cancelInvestment()`: validate status is pending_payment, transition to cancelled, cancel Stripe payment intent, log audit event
- [x] 3.5 Implement `topUpInvestment()`: validate existing investment ownership, create new transaction, add to investment amount, log audit event
- [x] 3.6 Implement `validateInvestmentEligibility()`: check KYC verified, check tree investability, check investment limits, return validation result
- [x] 3.7 Add comprehensive error handling with domain-specific exceptions: `InvestmentLimitExceededException`, `KycNotVerifiedException`, `TreeNotInvestableException`
- [ ] 3.8 Write unit tests for InvestmentService business logic (all methods, edge cases, error conditions)

## 4. HTTP Layer
- [x] 4.1 Create `StoreInvestmentRequest` FormRequest with validation rules: tree_id (exists in trees), amount_cents (integer, min, max based on tree limits), acceptance_risk_disclosure (boolean, required, true), acceptance_terms (boolean, required, true), payment_method_id (nullable, exists)
- [x] 4.2 Create `UpdateInvestmentAmountRequest` FormRequest for top-up validation
- [x] 4.3 Create `InvestmentController` with methods: `index()`, `show()`, `create()`, `store()`, `cancel()`
- [x] 4.4 Implement `create()`: fetch tree details, check user KYC status, return Inertia page with tree data, min/max limits, risk disclosure text
- [x] 4.5 Implement `store()`: validate request, call InvestmentService.initiateInvestment(), return Inertia redirect to payment confirmation page
- [x] 4.6 Implement `show()`: fetch investment with relationships, return Inertia page with investment details
- [x] 4.7 Implement `cancel()`: validate ownership, call InvestmentService.cancelInvestment(), return success response
- [x] 4.8 Add route group with auth and KYC middleware for investment routes
- [ ] 4.9 Write feature tests for investment HTTP flow (create, store, cancel, authorization checks)

## 5. Frontend (Inertia/React)
- [x] 5.1 Create `resources/js/Pages/Investments/Purchase/SelectTree.tsx` — tree selection page (can skip if linking directly from marketplace)
- [x] 5.2 Create `resources/js/Pages/Investments/Purchase/Configure.tsx` — investment amount input, min/max validation display, tree summary
- [x] 5.3 Create `resources/js/Pages/Investments/Purchase/Review.tsx` — risk disclosure, terms acceptance, payment method selection (integrated in Configure.tsx)
- [x] 5.4 Create `resources/js/Pages/Investments/Purchase/Confirmation.tsx` — purchase receipt, investment summary, next steps
- [x] 5.5 Create `resources/js/Components/RiskDisclosureModal.tsx` — modal with full risk disclosure text and acceptance checkbox (integrated in Configure.tsx)
- [x] 5.6 Create `resources/js/Components/InvestmentSummaryCard.tsx` — reusable investment summary display (integrated in Index.tsx and Show.tsx)
- [x] 5.7 Implement form state management with Inertia `useForm()` hook, proper error display
- [x] 5.8 Implement amount input validation (client-side) with real-time feedback on min/max compliance
- [x] 5.9 Implement payment method selection with saved payment methods list (integrate with payment-processing)
- [x] 5.10 Implement cancel investment button with confirmation dialog
- [x] 5.11 Add TypeScript types for Investment, InvestmentStatus, purchase form data
- [ ] 5.12 Write Cypress or manual E2E test for full purchase flow

## 6. Integration with Payment Processing
- [x] 6.1 Update PaymentService to support investment purchase transaction type (already supported via TransactionType enum)
- [x] 6.2 Add investment_id to transaction metadata when initiating payment for investment
- [x] 6.3 Update webhook handler (ProcessStripeWebhook job) to call InvestmentService.confirmInvestment() when payment succeeds
- [x] 6.4 Update webhook handler to log investment_id in audit trail when processing payment events
- [ ] 6.5 Write integration test for end-to-end flow: initiate investment → Stripe webhook → investment confirmed

## 7. KYC Verification Gate
- [x] 7.1 Create `KycVerifiedMiddleware` to block non-verified users from investment routes (already exists)
- [x] 7.2 Apply middleware to all investment purchase routes
- [x] 7.3 Implement redirect to KYC verification page if user is not verified
- [x] 7.4 Add flash message: "You must complete KYC verification before investing."
- [ ] 7.5 Write feature test for KYC gate (unverified user blocked, verified user allowed)

## 8. Notifications
- [ ] 8.1 Create `InvestmentPurchasedNotification` with email/database channels
- [ ] 8.2 Create `InvestmentConfirmedNotification` with investment details, receipt link
- [ ] 8.3 Create `InvestmentCancelledNotification`
- [ ] 8.4 Dispatch notification jobs from InvestmentService methods
- [ ] 8.5 Add notification templates to NotificationTemplateSeeder
- [ ] 8.6 Write notification delivery tests

## 9. Audit Logging
- [x] 9.1 Log 'investment_initiated' event with tree_id, amount, payment_intent_id
- [x] 9.2 Log 'investment_confirmed' event with investment_id, transaction_id
- [x] 9.3 Log 'investment_cancelled' event with cancellation reason
- [x] 9.4 Log 'investment_top_up' event with original_amount, top_up_amount, new_total
- [x] 9.5 Ensure all logs include user_id, ip_address, user_agent

## 10. Investment Top-Up
- [x] 10.1 Create top-up route and controller method
- [x] 10.2 Implement validation: user owns the investment, investment is active, top-up amount respects tree max_investment_cents
- [x] 10.3 Create new transaction for top-up amount
- [x] 10.4 Update investment.amount_cents with top-up (use DB transaction for atomicity)
- [ ] 10.5 Write tests for top-up flow (success, edge cases, concurrent top-ups)

## 11. Investment Limits and Validation
- [x] 11.1 Implement min_investment_cents validation in StoreInvestmentRequest
- [x] 11.2 Implement max_investment_cents validation in StoreInvestmentRequest
- [x] 11.3 Add custom validation error messages for limit violations
- [x] 11.4 Display tree limits prominently on purchase page
- [ ] 11.5 Write tests for boundary conditions (exactly at min, exactly at max, below min, above max)

## 12. Concurrent Investment Handling
- [x] 12.1 Add DB transaction wrapper around investment creation and payment initiation
- [x] 12.2 Consider if tree capacity limits need optimistic locking (e.g., limited slots per tree) - Deferred to Phase 2
- [ ] 12.3 Write concurrent investment test (simulate race condition)

## 13. Portfolio Integration (Optional for Phase 1)
- [x] 13.1 Decide if portfolio denormalization is needed (total_investment_value on users table) - No, using dynamic queries
- [x] 13.2 If yes, add UpdateUserPortfolio job dispatched on investment confirmation - N/A
- [x] 13.3 If no, portfolio value is calculated dynamically via Investment sum queries

## 14. Documentation and Cleanup
- [x] 14.1 Add JSDoc comments to frontend components
- [x] 14.2 Add PHPDoc blocks to service methods
- [x] 14.3 Update AGENTS.md Section 6 (Data Models) with Investment entity
- [x] 14.4 Update AGENTS.md Section 7 (Domain Vocabulary) with Investment terms
- [x] 14.5 Update AGENTS.md Section 5 (Core Business Logic) with investment purchase flow
- [x] 14.6 Run `./vendor/bin/pint` to format PHP code
- [ ] 14.7 Run all tests (`php artisan test`) and ensure 100% pass rate
- [ ] 14.8 Update EPIC-006 status to "Completed"

## Post-Implementation
- [ ] Update AGENTS.md in the project root with new investment purchase capabilities
- [ ] Archive this change using `prompter archive add-investment-purchase-flow`
