## MODIFIED Requirements

### Requirement: Lot-Based Investment Purchase
Investors SHALL be able to purchase a **quantity of individual trees** from a lot, with pricing derived from the lot's current dynamic price per tree and availability constrained by the lot's remaining `available_trees` count.

#### Scenario: Investor purchases trees from a lot
- **WHEN** a verified investor submits a purchase request for a lot with `status = active`, an open investment window, and `quantity` trees (integer ≥ 1) where `quantity ≤ lot.available_trees`
- **THEN** the system computes `total_price = lot.current_price_per_tree_cents × quantity`
- **AND** creates an `Investment` record with `lot_id`, `investor_id`, `quantity`, `amount_cents = total_price`, `purchase_month = current_cycle_month`, `status = pending_payment`
- **AND** atomically decrements `lot.available_trees` by `quantity` inside a `DB::transaction()` using `lockForUpdate()`
- **AND** initiates the payment flow (redirects to payment gateway)

#### Scenario: Purchase blocked when requested quantity exceeds available trees
- **WHEN** an investor submits a purchase with `quantity > lot.available_trees`
- **THEN** the system rejects the request
- **AND** shows error: "Only [available_trees] tree(s) are still available in this lot."

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
- **THEN** the `investment.amount_cents` records `lot.current_price_per_tree_cents × quantity` at the time of purchase
- **AND** subsequent monthly price changes do NOT retroactively alter the stored investment amount

#### Scenario: available_trees decremented atomically on purchase
- **WHEN** two concurrent investors simultaneously attempt to purchase from a lot with `available_trees = 1` each requesting `quantity = 1`
- **THEN** exactly one purchase succeeds and `available_trees` is decremented to 0
- **AND** the other request fails with: "Only 0 tree(s) are still available in this lot."

#### Scenario: available_trees restored on payment failure or cancellation
- **WHEN** an investment with `status = pending_payment` is cancelled or its payment fails
- **THEN** the system atomically increments `lot.available_trees` by `investment.quantity` inside a `DB::transaction()`
- **AND** the trees become available for purchase by other investors

#### Scenario: Investor views total cost before confirming
- **WHEN** an investor clicks "Invest Now" on a lot detail page and selects a quantity
- **THEN** the system displays a confirmation modal showing:
  - Lot name
  - Trees selected: N (of [available_trees] available)
  - Price per tree: RM X.XX (current month)
  - **Total cost: RM Y.YY**
  - "Confirm & Pay" button

#### Scenario: KYC required for lot purchase
- **WHEN** an investor without verified KYC attempts to purchase trees from a lot
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

## ADDED Requirements

### Requirement: Available Trees Counter per Lot
Lots SHALL track the number of trees still available for purchase in real time so investors can see remaining capacity before committing.

#### Scenario: Lot created with available_trees equal to total_trees
- **WHEN** a farm owner creates a lot with `total_trees = 50`
- **THEN** the system sets `lot.available_trees = 50`
- **AND** `available_trees` is displayed on the marketplace as "50 of 50 trees available"

#### Scenario: available_trees decreases as investments are made
- **WHEN** investors purchase trees from a lot
- **THEN** `lot.available_trees` reflects the remaining unpurchased trees
- **AND** the marketplace listing updates to show the new available count

#### Scenario: Lot shows sold-out badge when available_trees reaches zero
- **WHEN** `lot.available_trees = 0`
- **THEN** the marketplace listing shows a "Sold Out" badge
- **AND** the "Invest Now" button is disabled with text: "All trees in this lot have been purchased."

#### Scenario: Lot fully sold out still shows in marketplace with sold-out state
- **WHEN** a lot has `available_trees = 0` and `status = active`
- **THEN** the marketplace still displays the lot (for reference and watchlist purposes)
- **AND** the lot is excluded from the default "Available" filter view
