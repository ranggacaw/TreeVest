# dynamic-tree-pricing Spec Delta

## Change: implement-farm-owner-core-platform

## ADDED Requirements

### Requirement: Monthly Compound Price Escalation
The system SHALL automatically escalate lot investment prices on a monthly basis using a compound formula as harvest approaches, to reflect increasing value.

#### Scenario: Price calculated for each month in cycle
- **WHEN** a lot has `base_price_per_tree_cents = 10000`, `monthly_increase_rate = 0.05`, and the current cycle month is 3
- **THEN** the system computes price as: `10000 × (1 + 0.05)^(3-1)` = `11025` cents (RM 110.25)

#### Scenario: Month 1 price equals base price
- **WHEN** a lot has just started its cycle (`cycle_started_at = today`) 
- **THEN** the system computes `price = base_price_per_tree_cents × (1 + rate)^0 = base_price_per_tree_cents`

#### Scenario: Daily command updates current price
- **WHEN** the daily `app:recalculate-lot-prices` command runs
- **THEN** the system finds all lots with `status IN (active, in_progress)` and non-null `cycle_started_at`
- **AND** computes the current cycle month from `DATEDIFF(today, cycle_started_at) / 30` (integer division)
- **AND** updates `lots.current_price_per_tree_cents` with the formula result
- **AND** creates a `LotPriceSnapshot` record for each updated lot

#### Scenario: Lot auto-transitions to in_progress when investment window closes
- **WHEN** the daily command runs and determines `current_cycle_month > last_investment_month` for an `active` lot
- **THEN** the system transitions `lot.status` to `in_progress`
- **AND** creates an audit log entry: "Lot [ID] investment window closed at month [N]"

#### Scenario: Price snapshots provide audit trail
- **WHEN** a lot's price is updated by the daily command
- **THEN** a `LotPriceSnapshot` record is created with: `lot_id`, `cycle_month`, `price_per_tree_cents`, `recorded_at`
- **AND** the full price history is accessible on the lot detail page as a chart

#### Scenario: Price formula breakdown shown to investors
- **WHEN** an investor views a lot detail page
- **THEN** the system displays a "Price Timeline" section showing price for each month of the cycle
- **AND** clearly labels the current month's price as "Current Price"
- **AND** marks months beyond `last_investment_month` as "Closed"

---

### Requirement: Lot Pricing Configuration Validation
The system SHALL validate lot pricing configuration inputs to prevent nonsensical pricing setups.

#### Scenario: Base price must be positive
- **WHEN** a farm owner submits a lot with `base_price_per_tree_cents <= 0`
- **THEN** the system returns validation error: "Base price per tree must be greater than zero."

#### Scenario: Monthly increase rate must be non-negative
- **WHEN** a farm owner submits a lot with `monthly_increase_rate < 0`
- **THEN** the system returns validation error: "Monthly increase rate must be zero or greater."

#### Scenario: Cycle months must be at least 1
- **WHEN** a farm owner submits a lot with `cycle_months < 1`
- **THEN** the system returns validation error: "Cycle duration must be at least 1 month."
