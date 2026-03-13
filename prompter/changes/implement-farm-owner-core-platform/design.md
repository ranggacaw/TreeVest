# Design: implement-farm-owner-core-platform

## Data Model

### Entity Relationship Overview

```
Farm
 └─► Warehouse (many)
      └─► Rack (many)
           └─► Lot (many)
                ├─► Tree (many)       -- physical trees in this lot
                ├─► LotPriceSnapshot (many)  -- monthly price history
                └─► Investment (many) -- investor ownership records

FruitCrop
 └─► InvestmentCycle  -- cycle_months, last_investment_month, monthly_increase_rate

User
 └─► Wallet (one)
      └─► WalletTransaction (many)
```

### New Tables

#### `warehouses`
| Column | Type | Notes |
|--------|------|-------|
| id | BIGINT PK | |
| farm_id | FK → farms | |
| name | VARCHAR(100) | e.g., "Warehouse A" |
| description | TEXT nullable | |
| timestamps | | |
| deleted_at | TIMESTAMP nullable | soft delete |

#### `racks`
| Column | Type | Notes |
|--------|------|-------|
| id | BIGINT PK | |
| warehouse_id | FK → warehouses | |
| name | VARCHAR(100) | e.g., "R1" |
| description | TEXT nullable | |
| timestamps | | |

#### `lots`
| Column | Type | Notes |
|--------|------|-------|
| id | BIGINT PK | |
| rack_id | FK → racks | |
| fruit_crop_id | FK → fruit_crops | determines pricing config & cycle |
| name | VARCHAR(100) | e.g., "L001" |
| total_trees | SMALLINT UNSIGNED | number of physical trees |
| base_price_per_tree_cents | INT UNSIGNED | base price at cycle start |
| monthly_increase_rate | DECIMAL(5,4) | e.g., 0.0500 for 5% |
| current_price_per_tree_cents | INT UNSIGNED | pre-computed, updated monthly |
| cycle_started_at | DATE nullable | when this lot's cycle began |
| cycle_months | TINYINT UNSIGNED | total cycle length |
| last_investment_month | TINYINT UNSIGNED | last open month for investment |
| status | ENUM(active, in_progress, harvest, selling, completed) | |
| timestamps | | |
| deleted_at | TIMESTAMP nullable | soft delete |

#### `lot_price_snapshots`
| Column | Type | Notes |
|--------|------|-------|
| id | BIGINT PK | |
| lot_id | FK → lots | |
| cycle_month | TINYINT UNSIGNED | 1-based month number |
| price_per_tree_cents | INT UNSIGNED | price at this month |
| recorded_at | TIMESTAMP | when snapshot was taken |

#### `wallets`
| Column | Type | Notes |
|--------|------|-------|
| id | BIGINT PK | |
| user_id | FK → users | unique |
| balance_cents | BIGINT | signed; never negative in normal flow |
| currency | CHAR(3) DEFAULT 'MYR' | |
| timestamps | | |

#### `wallet_transactions`
| Column | Type | Notes |
|--------|------|-------|
| id | BIGINT PK | |
| wallet_id | FK → wallets | |
| type | ENUM(credit, debit) | |
| transaction_type | ENUM(payout_credit, reinvestment, withdrawal, platform_fee) | |
| amount_cents | BIGINT UNSIGNED | always positive |
| balance_after_cents | BIGINT | snapshot of balance post-transaction |
| reference_type | VARCHAR(100) nullable | polymorphic: e.g., "Payout", "Investment" |
| reference_id | BIGINT nullable | |
| notes | TEXT nullable | |
| timestamps | | |

### Modified Tables

#### `trees` — Add `lot_id`
```sql
ALTER TABLE trees ADD COLUMN lot_id BIGINT UNSIGNED NULL REFERENCES lots(id);
```
Initially nullable for backwards compatibility.

#### `harvests` — Add selling fields
```sql
ALTER TABLE harvests 
  ADD COLUMN selling_revenue_cents BIGINT UNSIGNED NULL,
  ADD COLUMN selling_proof_photo VARCHAR(500) NULL,
  ADD COLUMN selling_submitted_at TIMESTAMP NULL;
```

#### `investments` — Add `lot_id` FK (alongside or replacing `tree_id`)
`lot_id BIGINT UNSIGNED NULL` — references the lot purchased. `tree_id` becomes a computed/joined field via the lot relationship.

#### `agrotourism_registrations` — Add `participants_count`
```sql
ALTER TABLE agrotourism_registrations ADD COLUMN participants_count TINYINT UNSIGNED DEFAULT 1;
```

---

## Service Layer Design

### `DynamicPricingService`

Responsible for computing and storing monthly price escalation.

```php
class DynamicPricingService
{
    public function currentCycleMonth(Lot $lot): int
    // Returns 1-based current month within the lot's cycle

    public function priceForMonth(Lot $lot, int $month): int
    // Returns: base_price × (1 + rate)^(month - 1), rounded to int (cents)

    public function isInvestmentOpen(Lot $lot): bool
    // Returns true if currentCycleMonth() <= last_investment_month AND status = active

    public function recalculateCurrentPrice(Lot $lot): void
    // Computes current month price, updates lots.current_price_per_tree_cents, creates snapshot
}
```

**Scheduled Command:** `app:recalculate-lot-prices`
- Runs daily at 00:01
- Finds all lots with `status IN (active, in_progress)` and `cycle_started_at IS NOT NULL`
- Calls `DynamicPricingService::recalculateCurrentPrice()` for each
- If `currentCycleMonth() > last_investment_month` and status = `active` → transitions to `in_progress`

### `LotInvestmentService`

Handles investment purchase against a Lot (replaces direct tree investment for new lots).

```php
class LotInvestmentService
{
    public function purchase(User $investor, Lot $lot): Investment
    // Validates: KYC verified, cycle open, lot active
    // Calculates total: lot.current_price_per_tree_cents × lot.total_trees
    // Creates investment record, dispatches payment initiation

    public function validateCycleOpen(Lot $lot): void
    // Throws InvestmentCycleClosedException if !isInvestmentOpen($lot)
}
```

### `LotSellingService`

Handles the Harvest → Selling transition and profit distribution trigger.

```php
class LotSellingService
{
    public function submitSellingRevenue(Lot $lot, int $revenueCents, string $proofPhotoPath): void
    // Validates: lot.status = harvest
    // Stores selling_revenue_cents, photo, sets selling_submitted_at
    // Transitions lot.status → selling
    // Dispatches CalculateLotProfits job

    public function distributeProfits(Lot $lot): void
    // Called by job; wraps in DB::transaction()
    // Computes: platform_fee = 10%, remaining = 90%, investor_share = 70%, farm_owner_share = 30%
    // Credits wallets for all active investments proportionally
    // Transitions lot.status → completed
}
```

### `WalletService`

```php
class WalletService
{
    public function credit(User $user, int $amountCents, string $transactionType, Model $reference): WalletTransaction

    public function debit(User $user, int $amountCents, string $transactionType, Model $reference): WalletTransaction
    // Throws InsufficientWalletBalanceException if balance_cents < amount

    public function getOrCreateWallet(User $user): Wallet

    public function initiateWithdrawal(User $user, int $amountCents): void
    // Debits wallet, creates pending bank transfer transaction via EPIC-010

    public function reinvest(User $user, int $amountCents, Lot $lot): void
    // Debits wallet, calls LotInvestmentService::purchase() with wallet_payment source
}
```

---

## Status Transition Machines

### Lot Status

```
active ──→ in_progress (auto: cycle cutoff month reached OR last investment month exceeded)
in_progress ──→ harvest (farm owner: clicks "Record Harvest")
harvest ──→ selling (farm owner: submits sales revenue + proof photo)
selling ──→ completed (system: after profit distribution job completes)

active ──→ cancelled (admin: lot cancelled before any investment)
```

### Agrotourism Registration Status (amended)

```
pending ──→ confirmed (farm owner approves offline registration OR auto for online)
pending ──→ rejected (farm owner rejects offline registration)
confirmed ──→ cancelled (investor or farm owner cancels)
```

---

## Profit Distribution Algorithm

Given a completed Lot with `selling_revenue_cents = R`:

1. `platform_fee_cents = floor(R × 0.10)`
2. `remaining_cents = R − platform_fee_cents`
3. `investor_pool_cents = floor(remaining_cents × 0.70)`
4. `farm_owner_payout_cents = remaining_cents − investor_pool_cents`
5. Per investor: `investor_payout_cents = floor(investor_pool_cents × (investment.amount_cents / sum_of_all_investment_amounts))`
6. Rounding residual (if any) credited to the largest investor.

All arithmetic uses **integer cents** — no floating-point at any step.

Platform fee is credited to the **platform wallet** (a system-owned `Wallet` record with `user_id = null` and type = `platform`).

---

## Dynamic Pricing Example

Lot created with:
- `base_price_per_tree_cents = 10000` (RM 100.00)
- `monthly_increase_rate = 0.05` (5%)
- `cycle_months = 6`
- `last_investment_month = 5`

| Month | Formula | Price (cents) | Price (RM) | Investment Open? |
|-------|---------|--------------|------------|-----------------|
| 1 | 10000 × 1.05^0 | 10000 | RM 100.00 | ✅ |
| 2 | 10000 × 1.05^1 | 10500 | RM 105.00 | ✅ |
| 3 | 10000 × 1.05^2 | 11025 | RM 110.25 | ✅ |
| 4 | 10000 × 1.05^3 | 11576 | RM 115.76 | ✅ |
| 5 | 10000 × 1.05^4 | 12155 | RM 121.55 | ✅ |
| 6 | 10000 × 1.05^5 | 12763 | RM 127.63 | ❌ (harvest month) |

---

## Frontend Page Map

| Route | Component | Role |
|-------|-----------|------|
| `/farm-owner/warehouses` | `FarmOwner/Warehouses/Index.tsx` | Farm Owner |
| `/farm-owner/warehouses/{id}/racks` | `FarmOwner/Warehouses/Racks/Index.tsx` | Farm Owner |
| `/farm-owner/lots` | `FarmOwner/Lots/Index.tsx` | Farm Owner |
| `/farm-owner/lots/create` | `FarmOwner/Lots/Create.tsx` | Farm Owner |
| `/farm-owner/lots/{id}` | `FarmOwner/Lots/Show.tsx` | Farm Owner |
| `/farm-owner/lots/{id}/harvest` | `FarmOwner/Lots/Harvest.tsx` | Farm Owner |
| `/farm-owner/lots/{id}/selling` | `FarmOwner/Lots/Selling.tsx` | Farm Owner |
| `/investor/wallet` | `Investor/Wallet/Index.tsx` | Investor |
| `/investor/farm-visits` | `Investor/FarmVisits/Index.tsx` | Investor |
| `/investor/lots/{id}` | `Investor/Lots/Show.tsx` | Investor (lot detail) |

---

## Migration Sequencing

1. `create_warehouses_table`
2. `create_racks_table`
3. `create_lots_table`
4. `create_lot_price_snapshots_table`
5. `add_lot_id_to_trees_table`
6. `add_lot_id_to_investments_table`
7. `add_selling_fields_to_harvests_table`
8. `create_wallets_table`
9. `create_wallet_transactions_table`
10. `add_participants_count_to_agrotourism_registrations_table`

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Existing investments linked to trees directly (no lot) | Add nullable `lot_id`; run migration to create synthetic lots for legacy data |
| Integer rounding in profit distribution leaves unaccounted cents | Assign residual to largest investor; log all rounding events |
| Monthly price job fails silently | Use `app:recalculate-lot-prices` with retry logic; alert via log critical |
| Wallet balance goes negative on concurrent withdrawals | Use `lockForUpdate()` on wallet row inside DB::transaction() |
| Agrotourism capacity counting with participants | Count `SUM(participants_count)` for capacity, not registration rows |
