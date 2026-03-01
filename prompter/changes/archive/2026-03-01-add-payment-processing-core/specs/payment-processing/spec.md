# Payment Processing Specification

## ADDED Requirements

### Requirement: Stripe Payment Gateway Integration
The system SHALL integrate with Stripe for secure payment processing, supporting payment intent creation, payment method management, and webhook event handling, with PCI DSS compliance achieved via Stripe.js/Elements on the frontend.

#### Scenario: Stripe SDK initialization
- **WHEN** the application bootstraps
- **THEN** the Stripe PHP SDK is initialized with the API secret key from `config('services.stripe.secret')`
- **AND** the Stripe API version is set to the latest stable version

#### Scenario: Payment intent creation
- **WHEN** a user initiates a payment for an investment purchase
- **THEN** the `StripeService` creates a Stripe payment intent with the investment amount, currency, and metadata
- **AND** returns the `client_secret` to the frontend for payment confirmation
- **AND** a transaction record is created with status 'pending'

#### Scenario: Frontend payment confirmation via Stripe Elements
- **WHEN** the frontend receives a payment intent `client_secret`
- **THEN** Stripe.js CardElement collects card details securely (PCI compliant)
- **AND** the payment is confirmed via Stripe API without the backend touching raw card data
- **AND** the backend never receives or stores raw card numbers, CVV, or expiration dates

#### Scenario: Payment intent idempotency
- **WHEN** the same payment request is submitted multiple times (duplicate API call)
- **THEN** Stripe's idempotency key ensures only one payment intent is created
- **AND** subsequent requests return the existing payment intent

### Requirement: Transaction Ledger System
The system SHALL maintain an immutable, append-only transaction ledger that records all financial events (investment purchases, payouts, refunds, top-ups) with status tracking, currency information, and audit metadata.

#### Scenario: Transaction record creation
- **WHEN** a payment is initiated
- **THEN** a transaction record is created with type 'investment_purchase', status 'pending', amount (integer cents), currency code, and related investment ID
- **AND** the transaction is immutable (no updates after creation, only status transitions via new audit entries)

#### Scenario: Transaction status transition
- **WHEN** a payment is completed successfully
- **THEN** the transaction status transitions from 'pending' to 'completed'
- **AND** the `completed_at` timestamp is set
- **AND** the status change is logged in the audit trail with full context

#### Scenario: Failed transaction handling
- **WHEN** a payment fails due to card decline or insufficient funds
- **THEN** the transaction status transitions to 'failed'
- **AND** the `failed_at` timestamp is set
- **AND** the `failure_reason` field is populated with the error message (encrypted)
- **AND** the failure event is logged in the audit trail

#### Scenario: Transaction immutability enforcement
- **WHEN** code attempts to update an existing transaction record (e.g., change amount or type)
- **THEN** the update is rejected or ignored
- **AND** status transitions are the only allowed modifications

#### Scenario: Transaction types support
- **WHEN** querying transactions
- **THEN** the system supports filtering by type: `investment_purchase`, `payout`, `refund`, `top_up`, `withdrawal`
- **AND** each type has appropriate related entity foreign keys (investment_id for purchases, payout_id for payouts)

### Requirement: Payment Method Management
The system SHALL allow users to save, retrieve, and delete payment methods (cards, bank accounts) securely, storing only Stripe payment method IDs and cached display data (last4, brand) without raw card information.

#### Scenario: Add payment method
- **WHEN** a user adds a new payment method via Stripe CardElement
- **THEN** a Stripe payment method object is created via Stripe API
- **AND** the payment method ID is stored in the `payment_methods` table with cached metadata (last4, brand, expiration)
- **AND** if this is the user's first payment method, it is automatically set as default
- **AND** the event is logged in the audit trail

#### Scenario: List saved payment methods
- **WHEN** a user views their payment methods page
- **THEN** all saved payment methods are displayed with last4, brand, expiration date, and default indicator
- **AND** no raw card data is retrieved or displayed

#### Scenario: Set default payment method
- **WHEN** a user sets a payment method as default
- **THEN** the selected payment method's `is_default` flag is set to true
- **AND** all other payment methods for that user have `is_default` set to false
- **AND** the change is logged in the audit trail

#### Scenario: Delete payment method
- **WHEN** a user deletes a payment method
- **THEN** the payment method is detached from the user's Stripe customer via Stripe API
- **AND** the payment method record is soft-deleted from the database
- **AND** if the deleted payment method was the default and other methods exist, another method is automatically set as default

#### Scenario: Payment method authorization
- **WHEN** a user attempts to delete or modify a payment method
- **THEN** the system verifies the payment method belongs to the authenticated user
- **AND** unauthorized access is denied with a 403 response

### Requirement: Webhook Processing Infrastructure
The system SHALL process Stripe webhook events reliably via Laravel queue jobs with signature verification, idempotency handling, and automatic retry logic to ensure payment status updates are not missed.

#### Scenario: Webhook signature verification
- **WHEN** a Stripe webhook request is received at `/stripe/webhook`
- **THEN** the `StripeWebhookController` verifies the webhook signature using the `STRIPE_WEBHOOK_SECRET`
- **AND** requests with invalid signatures are rejected with a 403 response
- **AND** valid requests dispatch a `ProcessStripeWebhook` job and return 202 Accepted immediately

#### Scenario: Webhook event processing via queue job
- **WHEN** a `ProcessStripeWebhook` job is executed
- **THEN** the job checks if the event ID has already been processed (idempotency check via audit log)
- **AND** if already processed, the job exits without re-processing
- **AND** if not processed, the event is handled based on event type

#### Scenario: Payment intent succeeded event
- **WHEN** a `payment_intent.succeeded` webhook event is received
- **THEN** the transaction associated with the payment intent is updated to status 'completed'
- **AND** the `completed_at` timestamp is set
- **AND** a notification job is dispatched to send payment confirmation email
- **AND** the event is logged in the audit trail with stripe_event_id for idempotency

#### Scenario: Payment intent failed event
- **WHEN** a `payment_intent.payment_failed` webhook event is received
- **THEN** the transaction status is updated to 'failed'
- **AND** the `failure_reason` field is populated with the Stripe error message
- **AND** the user is notified of the payment failure
- **AND** the failure is logged in the audit trail

#### Scenario: Webhook retry handling
- **WHEN** a webhook processing job fails (e.g., database connection error)
- **THEN** the Laravel queue automatically retries the job up to 3 times with exponential backoff
- **AND** if all retries fail, the job is moved to the failed jobs table
- **AND** an alert is triggered for manual investigation

#### Scenario: Idempotency check for duplicate webhook events
- **WHEN** Stripe sends duplicate webhook events (e.g., due to retry)
- **THEN** the idempotency check in the job detects the duplicate via stripe_event_id in audit logs
- **AND** the duplicate event is ignored without side effects
- **AND** the job completes successfully

### Requirement: Monetary Value Handling
The system SHALL store all monetary values as integers (smallest currency unit: cents for USD/MYR) to avoid floating-point precision errors, with currency codes stored alongside amounts for future multi-currency support.

#### Scenario: Amount storage
- **WHEN** a transaction amount is stored in the database
- **THEN** the amount is stored as an unsigned big integer representing cents (e.g., 150000 = RM 1,500.00)
- **AND** the currency code is stored as a 3-character ISO 4217 code (e.g., 'MYR')

#### Scenario: Amount display formatting
- **WHEN** a transaction amount is displayed to the user
- **THEN** the backend returns the integer amount and currency code
- **AND** the frontend divides the amount by 100 and formats it using `Intl.NumberFormat` for locale-aware display

#### Scenario: Amount precision for large values
- **WHEN** a transaction amount exceeds RM 1 million (100,000,000 cents)
- **THEN** the system correctly stores and processes the amount using BIGINT column type (supports up to ~92 trillion cents)

### Requirement: Fraud Detection Integration
The system SHALL integrate fraud detection evaluation at the payment initiation stage, blocking or flagging suspicious transactions before payment processing to prevent fraudulent investments and chargebacks.

#### Scenario: Fraud detection before payment intent creation
- **WHEN** a user initiates a payment for an investment
- **THEN** the `FraudDetectionService` evaluates the transaction against all active fraud rules
- **AND** if a high-severity fraud alert is triggered and blocking mode is enabled, the payment is rejected before Stripe API is called
- **AND** if monitoring mode is enabled, the payment proceeds but the fraud alert is logged for admin review

#### Scenario: Fraud alert metadata in transaction
- **WHEN** a fraud alert is generated during payment initiation
- **THEN** the fraud alert ID is stored in the transaction's `metadata` JSON field
- **AND** the audit log records the fraud detection result with full context

#### Scenario: Fraud detection failure handling
- **WHEN** the fraud detection service is unavailable or throws an exception
- **THEN** the payment is allowed to proceed (fail-open strategy to prevent false declines)
- **AND** the fraud detection failure is logged as a warning in the audit trail

### Requirement: Payment Audit Trail
The system SHALL log all payment lifecycle events (payment initiated, completed, failed, refunded) in the audit log with full context including user ID, amount, currency, payment method, fraud detection result, and IP address.

#### Scenario: Payment initiated event logged
- **WHEN** a payment intent is created
- **THEN** an audit log entry is created with event type 'payment_initiated'
- **AND** the entry includes: user_id, transaction_id, amount, currency, payment_method_id, ip_address, user_agent

#### Scenario: Payment completed event logged
- **WHEN** a payment is successfully completed
- **THEN** an audit log entry is created with event type 'payment_completed'
- **AND** the entry includes: stripe_payment_intent_id, completed_at timestamp, transaction status transition

#### Scenario: Payment failed event logged
- **WHEN** a payment fails
- **THEN** an audit log entry is created with event type 'payment_failed'
- **AND** the entry includes: failure_reason, stripe_error_code, failed_at timestamp

### Requirement: Payment Method Security
The system SHALL ensure payment method storage complies with PCI DSS standards by never storing raw card data, using Stripe payment method IDs as references, and enforcing proper authorization for payment method access.

#### Scenario: No raw card data in backend
- **WHEN** code attempts to log or store raw card numbers, CVV, or full expiration dates
- **THEN** the system prevents such storage (enforced via code review and automated log scanning)
- **AND** only Stripe payment method IDs and cached display data (last4, brand) are stored

#### Scenario: Payment method encryption (display data)
- **WHEN** payment method cached data (last4, brand, expiration) is stored
- **THEN** sensitive fields are encrypted at rest using Laravel's Encrypted casting
- **AND** decryption happens only when data is accessed for display

#### Scenario: Payment method authorization check
- **WHEN** a user attempts to delete or modify a payment method
- **THEN** the controller verifies the payment method belongs to the authenticated user via Eloquent policy or middleware
- **AND** unauthorized access attempts are logged in the audit trail

### Requirement: Rate Limiting for Financial Endpoints
The system SHALL apply rate limiting to payment-related endpoints (payment intent creation, payment method management) to prevent rapid-fire abuse, fraud attempts, and system overload.

#### Scenario: Rate limit on payment intent creation
- **WHEN** a user attempts to create more than 10 payment intents within 1 minute
- **THEN** subsequent requests are throttled with HTTP 429 (Too Many Requests)
- **AND** the user is notified: "You are creating payments too quickly. Please wait a moment and try again."

#### Scenario: Rate limit on payment method addition
- **WHEN** a user attempts to add more than 5 payment methods within 1 minute
- **THEN** subsequent requests are throttled
- **AND** the throttling event is logged in the audit trail

#### Scenario: Rate limiting does not block webhook processing
- **WHEN** Stripe sends webhook events to `/stripe/webhook`
- **THEN** rate limiting is NOT applied to the webhook endpoint (signature verification is the security mechanism)

### Requirement: Payment Confirmation Notifications
The system SHALL send payment confirmation notifications to users via email after successful payment completion, triggered by webhook processing.

#### Scenario: Payment confirmation email sent
- **WHEN** a `payment_intent.succeeded` webhook is processed
- **THEN** a `SendPaymentConfirmationEmail` job is dispatched to the queue
- **AND** the email includes: transaction ID, amount, currency, investment details, receipt link

#### Scenario: Failed payment notification
- **WHEN** a `payment_intent.payment_failed` webhook is processed
- **THEN** a notification is sent to the user informing them of the payment failure
- **AND** the notification includes: failure reason, retry instructions, support contact link

### Requirement: Transaction Query and Reporting
The system SHALL provide efficient querying of transaction records for user portfolio displays, admin financial reporting, and reconciliation with Stripe API data.

#### Scenario: User transaction history
- **WHEN** a user views their transaction history
- **THEN** the system returns all transactions for that user, paginated, ordered by `created_at` DESC
- **AND** each transaction includes: type, status, amount, currency, related investment details, created timestamp

#### Scenario: Admin transaction filtering
- **WHEN** an admin filters transactions by status, type, or date range
- **THEN** the system returns matching transactions with proper indexing for performance (indexed on status, type, created_at)

#### Scenario: Reconciliation with Stripe
- **WHEN** an admin runs a reconciliation script
- **THEN** the system fetches recent payment intents from Stripe API and compares with local transaction records
- **AND** any discrepancies (missing webhooks, status mismatches) are flagged for investigation

### Requirement: Payment Cancellation
The system SHALL allow users to cancel pending payment transactions before payment confirmation, preventing investment from being activated.

#### Scenario: Cancel pending payment
- **WHEN** a user cancels an investment purchase before payment confirmation
- **THEN** the transaction status transitions to 'cancelled'
- **AND** if a Stripe payment intent exists, it is cancelled via Stripe API
- **AND** the cancellation is logged in the audit trail

#### Scenario: Cannot cancel completed payment
- **WHEN** a user attempts to cancel a payment with status 'completed'
- **THEN** the cancellation request is rejected with an error message: "This payment has already been completed and cannot be cancelled."

#### Scenario: Cancellation window enforcement
- **WHEN** a payment is in 'processing' status (Stripe confirmation in progress)
- **THEN** cancellation is NOT allowed (transaction is locked)
- **AND** the user is notified: "This payment is being processed and cannot be cancelled at this time."
