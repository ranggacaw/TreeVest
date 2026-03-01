# investment-purchase Specification

## Purpose
TBD - created by archiving change add-investment-purchase-flow. Update Purpose after archive.
## Requirements
### Requirement: Investment Record Management
The system SHALL create and track investment records linking users to trees with amount tracking, status management, and transaction history.

#### Scenario: User initiates investment purchase
- **WHEN** a verified user initiates an investment purchase for a tree
- **THEN** the system creates an Investment record with status 'pending_payment'
- **AND** sets user_id, tree_id, amount_cents, currency, and purchase_date
- **AND** creates a Transaction record with type 'investment_purchase' and status 'pending'
- **AND** links the transaction to the investment via investment.transaction_id
- **AND** logs an audit event 'investment_initiated' with tree_id, amount, user_id

#### Scenario: Payment confirmation activates investment
- **WHEN** a Stripe payment_intent.succeeded webhook is received for an investment transaction
- **THEN** the system updates the Investment status to 'active'
- **AND** updates the linked Transaction status to 'completed'
- **AND** logs an audit event 'investment_confirmed' with investment_id, transaction_id
- **AND** dispatches an InvestmentConfirmedNotification to the user

#### Scenario: User views investment detail
- **WHEN** a user accesses their investment detail page
- **THEN** the system displays: investment ID, tree details (name, variant, farm), amount invested, purchase date, current status, expected ROI, transaction history, cancellation button (if status is pending_payment)

#### Scenario: Investment status transitions tracked
- **WHEN** an investment status changes
- **THEN** the system validates the transition is allowed (pending_payment → active, active → matured, active → sold, pending_payment → cancelled)
- **AND** rejects invalid transitions with an error

---

### Requirement: Investment Amount Validation
The system SHALL validate investment amounts against tree-specific minimum and maximum limits to enforce business rules.

#### Scenario: Investment amount within limits accepted
- **WHEN** a user submits an investment amount between tree.min_investment_cents and tree.max_investment_cents
- **THEN** the system accepts the amount and proceeds with investment creation

#### Scenario: Investment amount below minimum rejected
- **WHEN** a user submits an investment amount less than tree.min_investment_cents
- **THEN** the system rejects the investment
- **AND** displays an error message: "Investment amount must be at least [formatted min amount]."

#### Scenario: Investment amount above maximum rejected
- **WHEN** a user submits an investment amount greater than tree.max_investment_cents
- **THEN** the system rejects the investment
- **AND** displays an error message: "Investment amount cannot exceed [formatted max amount]."

#### Scenario: Investment amount at exact limits accepted
- **WHEN** a user submits an amount exactly equal to tree.min_investment_cents or tree.max_investment_cents
- **THEN** the system accepts the amount (boundary condition)

---

### Requirement: KYC Verification Gate
The system SHALL block investment purchases for users without verified KYC to ensure regulatory compliance.

#### Scenario: Verified user can access investment purchase
- **WHEN** a user with kyc_status 'verified' and non-expired kyc_expires_at accesses the investment purchase page
- **THEN** the system allows access and displays the purchase wizard

#### Scenario: Unverified user blocked from investment purchase
- **WHEN** a user with kyc_status 'pending', 'submitted', or 'rejected' attempts to access the investment purchase page
- **THEN** the system redirects to the KYC verification page
- **AND** displays a flash message: "You must complete KYC verification before investing."

#### Scenario: Expired KYC blocks investment
- **WHEN** a user with kyc_status 'verified' but expired kyc_expires_at attempts to invest
- **THEN** the system redirects to KYC re-verification page
- **AND** displays a message: "Your KYC verification has expired. Please complete re-verification to continue investing."

#### Scenario: KYC check before payment initiation
- **WHEN** InvestmentService.initiateInvestment() is called
- **THEN** the service validates user.kyc_status is 'verified' and kyc_expires_at is in the future
- **AND** throws KycNotVerifiedException if validation fails
- **AND** the investment is not created

---

### Requirement: Risk Disclosure and Terms Acceptance
The system SHALL require users to explicitly accept risk disclosure statements and terms of service before investment purchase to ensure informed consent.

#### Scenario: Risk disclosure presented to user
- **WHEN** a user reaches the review step in the investment purchase wizard
- **THEN** the system displays a prominent risk disclosure statement: "Agricultural investments carry inherent risks including crop failure, weather events, and market price fluctuations. Past performance does not guarantee future returns. Invest only what you can afford to lose."
- **AND** displays a checkbox: "I have read and accept the risk disclosure."

#### Scenario: Terms and conditions presented to user
- **WHEN** a user reaches the review step
- **THEN** the system displays a link to the current terms and conditions document
- **AND** displays a checkbox: "I have read and accept the Terms of Service."

#### Scenario: Investment submission without risk disclosure acceptance rejected
- **WHEN** a user submits the investment purchase form without checking the risk disclosure acceptance checkbox
- **THEN** the system rejects the submission
- **AND** displays an error: "You must accept the risk disclosure to proceed."

#### Scenario: Investment submission without terms acceptance rejected
- **WHEN** a user submits the investment purchase form without checking the terms acceptance checkbox
- **THEN** the system rejects the submission
- **AND** displays an error: "You must accept the Terms of Service to proceed."

#### Scenario: Acceptance metadata stored in investment record
- **WHEN** a user successfully submits an investment purchase with both acceptances
- **THEN** the system stores acceptance timestamps in investment.metadata JSON: `{"risk_disclosure_accepted_at": "ISO8601_timestamp", "terms_accepted_at": "ISO8601_timestamp", "terms_version": "1.0"}`

---

### Requirement: Tree Investability Validation
The system SHALL validate that a tree is available for investment before allowing purchase.

#### Scenario: Investable tree allows purchase
- **WHEN** a user attempts to invest in a tree with status 'productive' or 'growing'
- **THEN** the system allows the investment purchase to proceed

#### Scenario: Non-investable tree rejects purchase
- **WHEN** a user attempts to invest in a tree with status 'seedling', 'declining', or 'retired'
- **THEN** the system rejects the investment
- **AND** displays an error: "This tree is not currently available for investment. Status: [tree status]."

#### Scenario: Soft-deleted tree rejects purchase
- **WHEN** a user attempts to invest in a soft-deleted tree (deleted_at is not null)
- **THEN** the system returns a 404 Not Found error

---

### Requirement: Investment Cancellation
The system SHALL allow users to cancel pending investment purchases before payment confirmation.

#### Scenario: User cancels pending investment
- **WHEN** a user with an investment in status 'pending_payment' clicks "Cancel Investment"
- **THEN** the system transitions the investment status to 'cancelled'
- **AND** cancels the associated Stripe payment intent via Stripe API (if payment_intent_id exists)
- **AND** logs an audit event 'investment_cancelled' with investment_id, user_id, reason: 'user_requested'
- **AND** dispatches an InvestmentCancelledNotification to the user

#### Scenario: Cancellation of active investment rejected
- **WHEN** a user attempts to cancel an investment with status 'active'
- **THEN** the system rejects the cancellation
- **AND** displays an error: "This investment has already been activated and cannot be cancelled."

#### Scenario: Cancellation of completed investment rejected
- **WHEN** a user attempts to cancel an investment with status 'matured' or 'sold'
- **THEN** the system rejects the cancellation
- **AND** displays an error: "This investment has been finalized and cannot be cancelled."

#### Scenario: Unauthorized user cannot cancel investment
- **WHEN** a user attempts to cancel an investment they do not own
- **THEN** the system returns a 403 Forbidden error
- **AND** logs an audit event 'unauthorized_investment_access_attempt'

---

### Requirement: Investment Top-Up
The system SHALL allow users to add additional funds to an existing active investment in the same tree.

#### Scenario: User tops up existing investment
- **WHEN** a user with an active investment in a tree submits a top-up amount
- **THEN** the system validates the top-up amount is positive
- **AND** validates (current investment.amount_cents + top_up_amount) does not exceed tree.max_investment_cents
- **AND** creates a new Transaction with type 'top_up' and related_investment_id set
- **AND** increases investment.amount_cents by the top-up amount atomically
- **AND** logs an audit event 'investment_top_up' with original_amount, top_up_amount, new_total
- **AND** dispatches an InvestmentTopUpNotification to the user

#### Scenario: Top-up exceeding tree maximum rejected
- **WHEN** a user submits a top-up that would cause total investment to exceed tree.max_investment_cents
- **THEN** the system rejects the top-up
- **AND** displays an error: "Top-up amount would exceed the maximum investment limit of [formatted max]. You can add up to [formatted remaining amount]."

#### Scenario: Top-up on pending investment rejected
- **WHEN** a user attempts to top up an investment with status 'pending_payment'
- **THEN** the system rejects the top-up
- **AND** displays an error: "You cannot top up a pending investment. Please wait for payment confirmation."

#### Scenario: Top-up on matured investment rejected
- **WHEN** a user attempts to top up an investment with status 'matured' or 'sold'
- **THEN** the system rejects the top-up
- **AND** displays an error: "This investment has been finalized and cannot be topped up."

---

### Requirement: Investment Portfolio Querying
The system SHALL provide efficient querying of user investments for portfolio displays and reporting.

#### Scenario: User views all investments
- **WHEN** a user accesses their investment portfolio page
- **THEN** the system returns all investments for that user, paginated, ordered by purchase_date DESC
- **AND** each investment displays: tree identifier, fruit type, variant, amount invested, current status, purchase date, expected ROI

#### Scenario: User filters investments by status
- **WHEN** a user filters their portfolio by status 'active'
- **THEN** the system returns only investments with status 'active'

#### Scenario: User views single investment detail
- **WHEN** a user accesses an investment detail page
- **THEN** the system returns the investment with eager-loaded relationships: tree, tree.fruitCrop, tree.fruitCrop.fruitType, tree.fruitCrop.farm, transaction history
- **AND** displays comprehensive investment details

#### Scenario: Admin views all investments globally
- **WHEN** an admin accesses the investments admin panel
- **THEN** the system returns all investments across all users with filters by status, date range, tree_id
- **AND** provides CSV export functionality

---

### Requirement: Investment Notification Triggers
The system SHALL send notifications to users at key points in the investment lifecycle.

#### Scenario: Investment confirmed notification sent
- **WHEN** an investment status transitions to 'active' after payment confirmation
- **THEN** the system dispatches an InvestmentConfirmedNotification job
- **AND** the notification is sent via email and database channels
- **AND** the email includes: investment ID, tree name, amount invested, expected ROI, link to investment detail page

#### Scenario: Investment cancelled notification sent
- **WHEN** an investment is cancelled by the user
- **THEN** the system dispatches an InvestmentCancelledNotification job
- **AND** the notification informs the user of the cancellation and any refund processing

#### Scenario: Investment matured notification sent
- **WHEN** an investment status transitions to 'matured' (tree reaches end of productive lifespan)
- **THEN** the system dispatches an InvestmentMaturedNotification job
- **AND** the notification summarizes total returns and next steps

---

### Requirement: Investment Audit Logging
The system SHALL log all investment lifecycle events in the audit log for compliance and traceability.

#### Scenario: Investment initiated audit log
- **WHEN** InvestmentService.initiateInvestment() is called
- **THEN** an audit log entry is created with event_type 'investment_initiated'
- **AND** the entry includes: user_id, tree_id, amount_cents, currency, ip_address, user_agent

#### Scenario: Investment confirmed audit log
- **WHEN** InvestmentService.confirmInvestment() is called after payment webhook
- **THEN** an audit log entry is created with event_type 'investment_confirmed'
- **AND** the entry includes: investment_id, transaction_id, stripe_payment_intent_id, completed_at timestamp

#### Scenario: Investment cancelled audit log
- **WHEN** InvestmentService.cancelInvestment() is called
- **THEN** an audit log entry is created with event_type 'investment_cancelled'
- **AND** the entry includes: investment_id, user_id, cancellation_reason, cancelled_at timestamp

#### Scenario: Investment top-up audit log
- **WHEN** InvestmentService.topUpInvestment() is called
- **THEN** an audit log entry is created with event_type 'investment_top_up'
- **AND** the entry includes: investment_id, original_amount_cents, top_up_amount_cents, new_total_amount_cents

---

### Requirement: Investment Data Integrity
The system SHALL ensure investment data integrity through database constraints and atomic operations.

#### Scenario: Investment creation is atomic
- **WHEN** InvestmentService.initiateInvestment() is called
- **THEN** the investment record and transaction record are created within a single database transaction
- **AND** if either creation fails, both are rolled back

#### Scenario: Investment amount is immutable except via top-up
- **WHEN** code attempts to directly update investment.amount_cents via Eloquent update
- **THEN** the system should use InvestmentService.topUpInvestment() instead to ensure audit trail
- **AND** direct updates should be discouraged via code review (no enforcement at DB level for flexibility)

#### Scenario: Soft-deleted investments retained for audit
- **WHEN** an investment is cancelled or needs to be removed from active portfolio
- **THEN** the system uses soft delete (sets deleted_at timestamp)
- **AND** the investment record remains in the database for audit and reporting

---

### Requirement: Multi-Step Investment Purchase Wizard UI
The system SHALL provide a user-friendly multi-step wizard for investment purchase with clear progress indication and validation feedback.

#### Scenario: User progresses through purchase wizard
- **WHEN** a user initiates an investment purchase
- **THEN** the system displays a wizard with steps: 1. Configure Amount, 2. Review & Accept, 3. Payment, 4. Confirmation
- **AND** the wizard displays progress indicators (e.g., step 2 of 4)
- **AND** the wizard allows back navigation with preserved form data

#### Scenario: Amount input validation feedback
- **WHEN** a user enters an amount in the amount input field
- **THEN** the system displays real-time validation: "Amount must be between [min] and [max]"
- **AND** the "Next" button is disabled until a valid amount is entered

#### Scenario: Payment method selection
- **WHEN** a user reaches the payment step
- **THEN** the system displays saved payment methods with radio button selection
- **AND** provides an "Add New Payment Method" option that opens Stripe Elements
- **AND** validates a payment method is selected before allowing submission

#### Scenario: Confirmation page summary
- **WHEN** a user completes the investment purchase
- **THEN** the system displays a confirmation page with: investment ID, tree details, amount invested, transaction ID, "View Investment" button, "Invest in Another Tree" button

