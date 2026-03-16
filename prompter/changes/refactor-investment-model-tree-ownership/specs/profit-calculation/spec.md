## MODIFIED Requirements

### Requirement: Proportional Profit Calculation
The system SHALL calculate investor payouts proportionally based on each investor's stake relative to the total invested amount in the lot, using the actual selling revenue, applying the canonical platform fee of 10%, and splitting the remainder 70% to the investor pool and 30% to the farm owner.

#### Scenario: Profit calculated with 10% fee and 70/30 split for all active investors in a lot
- **WHEN** `ProfitCalculationService::calculate(Lot $lot)` is called after `selling_revenue_cents` is recorded
- **THEN** the service calculates `platform_fee_cents = FLOOR(selling_revenue_cents × 0.10)`
- **AND** the service calculates `remaining_cents = selling_revenue_cents - platform_fee_cents`
- **AND** the service calculates `investor_pool_cents = FLOOR(remaining_cents × 0.70)`
- **AND** the service calculates `farm_owner_payout_cents = remaining_cents - investor_pool_cents`
- **AND** the service queries all investments with `lot_id = lot.id` and `status = active`
- **AND** calculates `total_invested_cents` = sum of `amount_cents` across all active investments
- **AND** for each investment calculates:
  - `gross_amount_cents = FLOOR((investment.amount_cents / total_invested_cents) × investor_pool_cents)`
  - `net_amount_cents = gross_amount_cents` (platform fee already deducted from pool)
- **AND** credits each investor wallet via `WalletService::credit()`
- **AND** credits the farm owner wallet via `WalletService::credit()` with `farm_owner_payout_cents`
- **AND** credits the platform wallet via `WalletService::credit()` with `platform_fee_cents`
- **AND** all wallet credits and payout record inserts occur within a single `DB::transaction()`
- **AND** the `farm_owner_payout_cents` and `platform_fee_cents` are stored on the lot record for audit

#### Scenario: Calculation with known inputs produces expected output with 10% fee + 70/30 split
- **WHEN** a lot has `selling_revenue_cents = 1000000` (RM 10,000) and `platform_fee_rate = 0.10`
- **AND** two investors: Investor A with `amount_cents = 200000`, Investor B with `amount_cents = 300000` (`total = 500000`)
- **THEN** `platform_fee_cents = FLOOR(1000000 × 0.10) = 100000` (RM 1,000)
- **AND** `remaining_cents = 1000000 - 100000 = 900000` (RM 9,000)
- **AND** `investor_pool_cents = FLOOR(900000 × 0.70) = 630000` (RM 6,300)
- **AND** `farm_owner_payout_cents = 900000 - 630000 = 270000` (RM 2,700)
- **AND** Investor A: `gross = FLOOR(200000/500000 × 630000) = 252000` (RM 2,520)
- **AND** Investor B: `gross = FLOOR(300000/500000 × 630000) = 378000` (RM 3,780)
- **AND** platform wallet receives RM 1,000; farm owner receives RM 2,700

#### Scenario: Zero revenue creates zero-value payout records
- **WHEN** `lot.selling_revenue_cents = 0`
- **THEN** the service creates `Payout` records for all active investors with `gross_amount_cents = 0`, `net_amount_cents = 0`, `status = pending`
- **AND** investors are notified that the lot sold for RM 0 (zero payout)

#### Scenario: No active investors produces no payouts
- **WHEN** a lot is completed with no active investments
- **THEN** the service creates no `Payout` records
- **AND** the service logs an `info` entry: "No active investors for lot_id={id}. No payouts created."

### Requirement: Profit Calculation Trigger
The system SHALL automatically trigger profit calculation as a queued job when a farm owner submits selling revenue for a harvested lot, ensuring the HTTP request is not blocked and the calculation is retried on failure.

#### Scenario: SellingRevenueSubmitted event triggers calculation job
- **WHEN** a farm owner submits `selling_revenue_cents` for a lot with `status = harvest`
- **THEN** the system transitions `lot.status` to `selling`
- **AND** dispatches a `DistributeLotProfits` job to the queue
- **AND** the job is queued on the `default` queue with up to 3 retry attempts and exponential backoff

#### Scenario: Job is idempotent on retry
- **WHEN** the `DistributeLotProfits` job runs for a lot that already has `Payout` records
- **THEN** the job exits immediately without creating duplicate records
- **AND** the job logs a `warning` entry: "Profit distribution already completed for lot_id={id}. Skipping."

### Requirement: Profit Calculation Atomicity
The system SHALL ensure that either all payout and wallet credit operations for a lot complete or none do, preventing partial distributions.

#### Scenario: Database transaction wraps all credits and payout inserts
- **WHEN** `ProfitCalculationService::calculate()` executes
- **THEN** all `WalletService::credit()` calls and `Payout` inserts occur within a single `DB::transaction()` block
- **AND** if any operation fails, the entire transaction is rolled back
- **AND** no wallet or payout records are persisted for that lot

#### Scenario: Transaction failure triggers job retry
- **WHEN** the `DistributeLotProfits` job fails due to a database exception
- **THEN** the Laravel queue retries the job according to the retry policy (up to 3 attempts, exponential backoff: 60s, 120s, 240s)
- **AND** the idempotency check at job start ensures clean retry without duplicate records

### Requirement: Profit Calculation Audit Trail
The system SHALL log profit calculation events for full financial auditability.

#### Scenario: Calculation job start logged
- **WHEN** the `DistributeLotProfits` job begins processing
- **THEN** an audit log entry is created with event type `profit_calculation_started`, `lot_id`, timestamp

#### Scenario: Calculation completion logged
- **WHEN** profit calculation completes successfully
- **THEN** an audit log entry is created with event type `profit_calculation_completed`
- **AND** the entry includes: `lot_id`, `investor_count`, `selling_revenue_cents`, `platform_fee_cents`, `investor_pool_cents`, `farm_owner_payout_cents`, `payout_count`

#### Scenario: Calculation failure logged
- **WHEN** the profit calculation job fails after all retries
- **THEN** an audit log entry is created with event type `profit_calculation_failed`
- **AND** the entry includes: `lot_id`, `error_message`, `attempt_count`
- **AND** the admin team is alerted via system notification

### Requirement: Profit Split Display
The system SHALL display the 10% platform fee and 70/30 investor/farm owner split on all investor-facing payout-related pages to ensure transparency.

#### Scenario: Investment detail page shows profit split label
- **WHEN** an investor views a lot investment detail page
- **THEN** the system displays a "Profit Split" section showing: "Platform Fee: 10% | Your Share (Investor Pool): 70% of remaining | Farm Owner: 30% of remaining"
- **AND** the displayed payout amounts reflect this formula

#### Scenario: Payout detail page shows split breakdown
- **WHEN** an investor views a payout detail page
- **THEN** the system displays: total selling revenue, platform fee (10%), remaining after fee, 70% investor pool total, investor's proportional share, and net payout amount

#### Scenario: Lot detail page shows profit split for prospective investors
- **WHEN** an investor views a lot detail page on the marketplace
- **THEN** the system displays the profit split information (10% fee → 70% investors / 30% farm owner) in the investment terms section
