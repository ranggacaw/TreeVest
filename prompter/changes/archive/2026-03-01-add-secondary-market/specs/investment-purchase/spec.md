## MODIFIED Requirements

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
- **THEN** the system displays: investment ID, tree details (name, variant, farm), amount invested, purchase date, current status, expected ROI, transaction history, cancellation button (if status is pending_payment), "List for Sale" button (if status is active), "Cancel Listing" button (if status is listed)

#### Scenario: Investment status transitions tracked
- **WHEN** an investment status changes
- **THEN** the system validates the transition is allowed:
  - `pending_payment → active`
  - `active → listed` (secondary market listing created)
  - `listed → active` (listing cancelled)
  - `listed → sold` (secondary market purchase confirmed)
  - `active → matured`
  - `pending_payment → cancelled`
- **AND** rejects invalid transitions with an error

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

#### Scenario: Cancellation of listed investment rejected
- **WHEN** a user attempts to cancel an investment with status 'listed' (i.e., it has an open secondary market listing)
- **THEN** the system rejects the cancellation
- **AND** displays an error: "This investment has an active listing on the secondary market. Cancel the listing first."

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

#### Scenario: Top-up on listed investment rejected
- **WHEN** a user attempts to top up an investment with status 'listed'
- **THEN** the system rejects the top-up
- **AND** displays an error: "You cannot top up an investment that is currently listed for sale on the secondary market."

#### Scenario: Top-up on matured investment rejected
- **WHEN** a user attempts to top up an investment with status 'matured' or 'sold'
- **THEN** the system rejects the top-up
- **AND** displays an error: "This investment has been finalized and cannot be topped up."
