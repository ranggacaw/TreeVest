## MODIFIED Requirements

### Requirement: Proportional Profit Calculation
The system SHALL calculate investor payouts proportionally based on each investor's stake relative to the total invested amount in the tree, using the actual yield, locked market price, snapshotted platform fee rate, and the platform's fixed 60/40 profit split (60% Farm Owner / 40% Investor).

#### Scenario: Profit calculated with 60/40 split for all active investors in a tree
- **WHEN** `ProfitCalculationService::calculate(Harvest $harvest)` is called
- **THEN** the service calculates `total_yield_cents = harvest.actual_yield_kg × market_price.price_per_kg_cents`
- **AND** the service calculates `investor_pool_cents = ROUND(total_yield_cents × 0.40)` (investor's 40% share)
- **AND** the service calculates `farm_owner_share_cents = total_yield_cents - investor_pool_cents` (farm owner's 60% share, tracked only — not disbursed)
- **AND** the service queries all investments with `tree_id = harvest.tree_id` and `status = active`
- **AND** calculates `total_invested_cents` = sum of `amount_cents` across all active investments
- **AND** for each investment, calculates:
  - `gross_amount_cents = ROUND((investment.amount_cents / total_invested_cents) × investor_pool_cents)`
  - `platform_fee_cents = ROUND(gross_amount_cents × harvest.platform_fee_rate)`
  - `net_amount_cents = gross_amount_cents - platform_fee_cents`
- **AND** all `Payout` records are inserted within a single `DB::transaction()`
- **AND** the `farm_owner_share_cents` is stored on the harvest record for financial audit purposes

#### Scenario: Calculation with known inputs produces expected output with 60/40 split
- **WHEN** a harvest has `actual_yield_kg = 100`, market price = 8000 cents/kg (RM 80/kg), `platform_fee_rate = 0.05`
- **AND** two investors: Investor A with `amount_cents = 200000`, Investor B with `amount_cents = 300000` (`total = 500000`)
- **THEN** total gross revenue = 100 × 8000 = 800,000 cents (RM 8,000)
- **AND** investor pool = ROUND(800,000 × 0.40) = 320,000 cents (RM 3,200)
- **AND** farm owner share = 800,000 - 320,000 = 480,000 cents (RM 4,800) — tracked, not disbursed
- **AND** Investor A: `gross = ROUND(200000/500000 × 320000) = 128,000`, `fee = ROUND(128000 × 0.05) = 6,400`, `net = 121,600` cents (RM 1,216)
- **AND** Investor B: `gross = ROUND(300000/500000 × 320000) = 192,000`, `fee = ROUND(192000 × 0.05) = 9,600`, `net = 182,400` cents (RM 1,824)
- **AND** total platform fee collected = 16,000 cents (RM 160)

#### Scenario: Zero yield creates zero-value payout records
- **WHEN** `harvest.actual_yield_kg = 0`
- **THEN** the service creates `Payout` records for all active investors with `gross_amount_cents = 0`, `platform_fee_cents = 0`, `net_amount_cents = 0`, `status = pending`
- **AND** investors are notified that the harvest produced no yield (zero payout)

#### Scenario: No active investors produces no payouts
- **WHEN** a harvest completes for a tree with no active investments (e.g., all investments were cancelled)
- **THEN** the service creates no `Payout` records
- **AND** the service logs an `info` entry: "No active investors for harvest_id={id}. No payouts created."

## ADDED Requirements

### Requirement: Profit Split Display
The system SHALL display the 60/40 profit split ratio on all investor-facing payout-related pages to ensure transparency.

#### Scenario: Investment detail page shows profit split label
- **WHEN** an investor views an investment detail page (`/investor/investments/{investment}`)
- **THEN** the system displays a "Profit Split" section showing: "Farm Owner: 60% | Your Share (Investor Pool): 40%"
- **AND** the displayed payout amounts reflect the investor pool calculation

#### Scenario: Payout detail page shows split breakdown
- **WHEN** an investor views a payout detail page (`/investor/payouts/{payout}`)
- **THEN** the system displays the calculation breakdown: total harvest revenue, 40% investor pool, proportional investor share, platform fee, and net payout amount

#### Scenario: Farm profile shows profit split for prospective investors
- **WHEN** an investor views a farm profile or tree listing page
- **THEN** the system displays the profit split information (60/40) in the investment terms section
