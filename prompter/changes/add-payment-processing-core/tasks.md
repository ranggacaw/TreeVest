# Implementation Tasks: Core Payment Processing Infrastructure

## 1. Prerequisites & Setup
- [ ] 1.1 Install Stripe PHP SDK: `composer require stripe/stripe-php:^15.0`
- [ ] 1.2 Install Stripe.js React libraries: `npm install @stripe/stripe-js @stripe/react-stripe-js`
- [ ] 1.3 Add Stripe configuration keys to `config/services.php` (key, secret, webhook_secret)
- [ ] 1.4 Update `.env.example` with Stripe environment variables (STRIPE_KEY, STRIPE_SECRET, STRIPE_WEBHOOK_SECRET)
- [ ] 1.5 Create Stripe account (test mode) and obtain test API keys
- [ ] 1.6 Configure Stripe webhook endpoint in Stripe Dashboard for local testing (use Stripe CLI or ngrok)

## 2. Database Schema
- [ ] 2.1 Create migration: `redesign_transactions_table.php` (drop old columns, add new schema per design.md)
- [ ] 2.2 Create migration: `create_payment_methods_table.php`
- [ ] 2.3 Create enum: `App\Enums\TransactionType` (investment_purchase, payout, refund, top_up, withdrawal)
- [ ] 2.4 Create enum: `App\Enums\TransactionStatus` (pending, processing, completed, failed, cancelled)
- [ ] 2.5 Run migrations: `php artisan migrate`
- [ ] 2.6 Verify schema with `php artisan db:show` and `php artisan db:table transactions payment_methods`

## 3. Eloquent Models
- [ ] 3.1 Rewrite `App\Models\Transaction` (replace placeholder) with relationships (user, paymentMethod, investment)
- [ ] 3.2 Add casts to Transaction model: `type` (TransactionType), `status` (TransactionStatus), `metadata` (array), `amount` (integer)
- [ ] 3.3 Add accessor `getFormattedAmountAttribute()` for currency-formatted display
- [ ] 3.4 Create `App\Models\PaymentMethod` with relationships (user, transactions)
- [ ] 3.5 Add casts to PaymentMethod: `is_default` (boolean)
- [ ] 3.6 Add scopes to Transaction: `scopeCompleted()`, `scopePending()`, `scopeForUser($userId)`, `scopeByType($type)`
- [ ] 3.7 Add model events to PaymentMethod: set `is_default = true` for first payment method, unset others if new default saved

## 4. Services Layer
- [ ] 4.1 Create `App\Services\StripeService` with methods:
  - [ ] 4.1.1 `createPaymentIntent(int $amount, string $currency, array $metadata): PaymentIntent`
  - [ ] 4.1.2 `retrievePaymentIntent(string $paymentIntentId): PaymentIntent`
  - [ ] 4.1.3 `createPaymentMethod(string $stripePaymentMethodId, int $userId): PaymentMethod`
  - [ ] 4.1.4 `attachPaymentMethod(string $paymentMethodId, string $customerId): void`
  - [ ] 4.1.5 `detachPaymentMethod(string $paymentMethodId): void`
  - [ ] 4.1.6 `retrievePaymentMethod(string $paymentMethodId): \Stripe\PaymentMethod`
  - [ ] 4.1.7 Initialize Stripe SDK in constructor with API key from config
- [ ] 4.2 Create `App\Services\PaymentService` with methods:
  - [ ] 4.2.1 `initiatePayment(int $userId, int $amount, string $currency, string $type, ?int $relatedId): Transaction`
  - [ ] 4.2.2 `confirmPayment(string $paymentIntentId): Transaction`
  - [ ] 4.2.3 `handleWebhookEvent(string $eventId, string $eventType, array $eventData): void`
  - [ ] 4.2.4 `cancelPendingTransaction(int $transactionId): Transaction`
- [ ] 4.3 Integrate `FraudDetectionService::evaluateTransaction()` in `PaymentService::initiatePayment()` (before payment intent creation)
- [ ] 4.4 Integrate `AuditLogService::logEvent()` for all payment lifecycle events (created, completed, failed)

## 5. Controllers
- [ ] 5.1 Create `App\Http\Controllers\PaymentMethodController` with methods:
  - [ ] 5.1.1 `index()`: List user's saved payment methods (Inertia::render 'PaymentMethods/Index')
  - [ ] 5.1.2 `store(Request $request)`: Save new payment method (validate, call StripeService, return Inertia redirect)
  - [ ] 5.1.3 `destroy(PaymentMethod $paymentMethod)`: Delete payment method (authorize, detach from Stripe, soft delete)
  - [ ] 5.1.4 `setDefault(PaymentMethod $paymentMethod)`: Set payment method as default
- [ ] 5.2 Create `App\Http\Controllers\PaymentIntentController` (API endpoint for frontend):
  - [ ] 5.2.1 `create(Request $request)`: Create payment intent, return JSON with client_secret
- [ ] 5.3 Create `App\Http\Controllers\StripeWebhookController` with method:
  - [ ] 5.3.1 `handle(Request $request)`: Verify Stripe signature, dispatch ProcessStripeWebhook job, return 202 response
- [ ] 5.4 Create FormRequest: `App\Http\Requests\StorePaymentMethodRequest` (validation for Stripe payment method ID)

## 6. Queue Jobs
- [ ] 6.1 Create `App\Jobs\ProcessStripeWebhook` with properties: `eventId`, `eventType`, `eventData`
- [ ] 6.2 Implement idempotency check in job: query AuditLog for existing stripe_event_id before processing
- [ ] 6.3 Handle `payment_intent.succeeded` event: update transaction status to 'completed', set completed_at timestamp
- [ ] 6.4 Handle `payment_intent.payment_failed` event: update transaction status to 'failed', log failure_reason
- [ ] 6.5 Log all webhook events to AuditLog with stripe_event_id for tracking
- [ ] 6.6 Dispatch notification job on payment completion (e.g., `SendPaymentConfirmationEmail`)
- [ ] 6.7 Configure job retry logic: 3 attempts with exponential backoff

## 7. Routes
- [ ] 7.1 Add payment method routes in `routes/web.php`:
  - `GET /payment-methods` → `PaymentMethodController@index` (middleware: auth)
  - `POST /payment-methods` → `PaymentMethodController@store` (middleware: auth)
  - `DELETE /payment-methods/{paymentMethod}` → `PaymentMethodController@destroy` (middleware: auth)
  - `PATCH /payment-methods/{paymentMethod}/set-default` → `PaymentMethodController@setDefault` (middleware: auth)
- [ ] 7.2 Add payment intent route (API): `POST /api/payment-intents` → `PaymentIntentController@create` (middleware: auth)
- [ ] 7.3 Add webhook route (NO auth middleware, signature verification in controller):
  - `POST /stripe/webhook` → `StripeWebhookController@handle`
- [ ] 7.4 Exclude `/stripe/webhook` from CSRF protection in `VerifyCsrfToken` middleware

## 8. Frontend: Stripe Integration Setup
- [ ] 8.1 Create Stripe context provider in `resources/js/Providers/StripeProvider.tsx` (wrap app with Elements provider)
- [ ] 8.2 Load Stripe publishable key from backend (pass via Inertia shared props or env variable)
- [ ] 8.3 Update `resources/js/app.tsx` to wrap app with StripeProvider

## 9. Frontend: Payment Method Management UI
- [ ] 9.1 Create `resources/js/Pages/PaymentMethods/Index.tsx` (list saved payment methods)
- [ ] 9.2 Display payment method cards with last4, brand, expiration date, default badge
- [ ] 9.3 Add "Add Payment Method" button opening modal with Stripe CardElement
- [ ] 9.4 Create `resources/js/Components/AddPaymentMethodModal.tsx` (Stripe CardElement integration)
- [ ] 9.5 Implement delete payment method functionality with confirmation dialog
- [ ] 9.6 Implement "Set as Default" action with optimistic UI update
- [ ] 9.7 Add empty state when no payment methods exist
- [ ] 9.8 Apply rate limiting UI feedback (throttle API calls to prevent abuse)

## 10. Frontend: Payment Form Component
- [ ] 10.1 Create `resources/js/Components/PaymentForm.tsx` (reusable Stripe payment form)
- [ ] 10.2 Integrate Stripe CardElement for secure card input
- [ ] 10.3 Add "Pay Now" button that creates payment intent and confirms payment
- [ ] 10.4 Display loading state during payment processing
- [ ] 10.5 Display error messages from Stripe (card declined, insufficient funds, etc.)
- [ ] 10.6 Display success confirmation after payment completion
- [ ] 10.7 Disable form submission during processing (prevent double-submit)

## 11. Testing: Unit Tests
- [ ] 11.1 Test `TransactionType` enum values
- [ ] 11.2 Test `TransactionStatus` enum values
- [ ] 11.3 Test `Transaction` model relationships (user, paymentMethod, investment)
- [ ] 11.4 Test `PaymentMethod` model relationships and default logic
- [ ] 11.5 Test `StripeService::createPaymentIntent()` with mocked Stripe API
- [ ] 11.6 Test `PaymentService::initiatePayment()` creates transaction and calls fraud detection
- [ ] 11.7 Test `PaymentService::confirmPayment()` updates transaction status
- [ ] 11.8 Test idempotency in `ProcessStripeWebhook` job (duplicate event handling)

## 12. Testing: Feature Tests
- [ ] 12.1 Test payment method CRUD flow:
  - [ ] 12.1.1 Authenticated user can view payment methods list
  - [ ] 12.1.2 Authenticated user can add payment method (mocked Stripe API)
  - [ ] 12.1.3 Authenticated user can delete payment method
  - [ ] 12.1.4 Authenticated user can set default payment method
  - [ ] 12.1.5 Unauthenticated user cannot access payment method routes
- [ ] 12.2 Test payment intent creation:
  - [ ] 12.2.1 Authenticated user can create payment intent
  - [ ] 12.2.2 Fraud detection is called before payment intent creation
  - [ ] 12.2.3 High-severity fraud alerts block payment intent creation (if blocking enabled)
- [ ] 12.3 Test webhook processing:
  - [ ] 12.3.1 Valid webhook signature is accepted
  - [ ] 12.3.2 Invalid webhook signature is rejected (403 response)
  - [ ] 12.3.3 `payment_intent.succeeded` event updates transaction to completed
  - [ ] 12.3.4 `payment_intent.payment_failed` event updates transaction to failed
  - [ ] 12.3.5 Duplicate webhook events are ignored (idempotency)
- [ ] 12.4 Test transaction ledger immutability:
  - [ ] 12.4.1 Transaction records cannot be updated after creation (only status transitions)
  - [ ] 12.4.2 Soft deletes are forbidden on transactions table

## 13. Testing: Integration Tests
- [ ] 13.1 End-to-end payment flow test (requires Stripe test mode):
  - [ ] 13.1.1 User adds payment method with test card
  - [ ] 13.1.2 User initiates payment (create payment intent)
  - [ ] 13.1.3 Payment is confirmed via Stripe API
  - [ ] 13.1.4 Webhook is received and processed
  - [ ] 13.1.5 Transaction status is updated to completed
  - [ ] 13.1.6 Audit log contains payment events
- [ ] 13.2 Test payment failure scenario:
  - [ ] 13.2.1 Use Stripe test card that triggers decline (e.g., 4000000000000002)
  - [ ] 13.2.2 Verify transaction status is 'failed'
  - [ ] 13.2.3 Verify failure_reason is populated

## 14. Documentation
- [ ] 14.1 Update `prompter/project.md` with payment processing patterns (if any new conventions introduced)
- [ ] 14.2 Add inline code comments for complex payment logic (idempotency, fraud integration)
- [ ] 14.3 Document Stripe webhook setup process in code comments or README
- [ ] 14.4 Document test card numbers for QA testing in testing docs

## 15. Deployment Preparation
- [ ] 15.1 Add Stripe environment variables to production `.env` file (production API keys)
- [ ] 15.2 Configure Stripe webhook endpoint in Stripe Dashboard (production URL)
- [ ] 15.3 Verify webhook signature secret matches production environment
- [ ] 15.4 Test payment flow in staging environment with Stripe test mode
- [ ] 15.5 Monitor queue worker for webhook processing jobs
- [ ] 15.6 Set up monitoring alerts for failed webhook processing jobs

## Post-Implementation
- [ ] 16.1 Update AGENTS.md Section 6 (Data Models) with Transaction and PaymentMethod entities
- [ ] 16.2 Update AGENTS.md Section 13 (Integration Map) with Stripe integration details
- [ ] 16.3 Update AGENTS.md Section 15 (Known Issues) if any payment-specific issues discovered
- [ ] 16.4 Validate with `prompter validate add-payment-processing-core --strict --no-interactive`
- [ ] 16.5 Request approval from product/tech lead before merging
