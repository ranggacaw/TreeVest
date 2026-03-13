# lot-investment Spec Delta

## Change: implement-farm-owner-core-platform

## ADDED Requirements

### Requirement: Lot-Based Investment Purchase
Investors SHALL be able to purchase a full lot as a package investment, with pricing derived from the lot's current dynamic price.

#### Scenario: Investor purchases a lot
- **WHEN** a verified investor submits a purchase request for a lot with `status = active` and an open investment window
- **THEN** the system computes `total_price = lot.current_price_per_tree_cents × lot.total_trees`
- **AND** creates an `Investment` record with `lot_id`, `investor_id`, `amount_cents = total_price`, `purchase_month = current_cycle_month`, `status = pending_payment`
- **AND** initiates the payment flow (redirects to EPIC-010 payment gateway)

#### Scenario: Purchase blocked when investment window is closed
- **WHEN** an investor attempts to purchase a lot whose `current_cycle_month >= last_investment_month`
- **THEN** the system rejects the request
- **AND** shows error: "Investment window for this lot has closed. The crop is in the growing phase."

#### Scenario: Purchase blocked when lot is not active
- **WHEN** an investor attempts to purchase a lot with status `in_progress`, `harvest`, `selling`, or `completed`
- **THEN** the system rejects the request
- **AND** shows error: "This lot is not currently accepting investments. Current status: [status]."

#### Scenario: Purchase price locked at time of purchase
- **WHEN** an investor initiates a lot purchase at Month 3 price
- **THEN** the `investment.amount_cents` records the price at Month 3
- **AND** subsequent monthly price changes do NOT retroactively alter the stored investment amount

#### Scenario: Investor views total cost before confirming
- **WHEN** an investor clicks "Invest Now" on a lot detail page
- **THEN** the system displays a confirmation modal showing:
  - Lot name
  - Total trees: N
  - Price per tree: RM X.XX (current month)
  - **Total cost: RM Y.YY**
  - "Confirm & Pay" button

#### Scenario: KYC required for lot purchase
- **WHEN** an investor without verified KYC attempts to purchase a lot
- **THEN** the system redirects to the KYC verification page
- **AND** displays: "Complete identity verification to start investing."

---

### Requirement: Investment Cycle Display
Investors SHALL be able to see which cycle month they are investing in and understand the implications.

#### Scenario: Lot detail shows current cycle month
- **WHEN** an investor views a lot detail page for a lot with `cycle_started_at` set
- **THEN** the system displays: "Cycle Month: 3 of 6" 
- **AND** shows a progress bar indicating position in the cycle
- **AND** shows: "Investment closes after Month [last_investment_month]"

#### Scenario: Lot detail shows all monthly prices in a table
- **WHEN** an investor views the lot detail page
- **THEN** the system renders a table or chart showing all monthly prices from Month 1 to Month [cycle_months]
- **AND** the current month's row is highlighted
- **AND** the harvest month row is marked "Closed – Harvest"
