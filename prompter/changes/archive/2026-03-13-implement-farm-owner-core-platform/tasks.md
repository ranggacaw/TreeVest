# Tasks: implement-farm-owner-core-platform

## Dependencies & Sequencing

```
Phase 1 (Foundation) → Phase 2 (Pricing + Cycle) → Phase 3 (Harvest/Selling) → Phase 4 (Wallet) → Phase 5 (UI) → Phase 6 (Agrotourism Enhancement)
```

Phase 1 and 2 must be complete before Phase 3.  
Phase 3 must be complete before Phase 4.  
Phase 5 can be parallelised with Phase 4 once Phase 3 is complete.  
Phase 6 is independent and can be done any time after Phase 1.

---

## Phase 1: Spatial Hierarchy Foundation

- [x] **1.1** Create migration `create_warehouses_table` with columns: `id`, `farm_id`, `name`, `description`, `timestamps`, `deleted_at`
- [x] **1.2** Create migration `create_racks_table` with columns: `id`, `warehouse_id`, `name`, `description`, `timestamps`
- [x] **1.3** Create migration `create_lots_table` with all columns per design.md (base_price, cycle fields, status enum, etc.)
- [x] **1.4** Create migration `create_lot_price_snapshots_table`
- [x] **1.5** Create migration `add_lot_id_to_trees_table` (nullable FK)
- [x] **1.6** Create migration `add_lot_id_to_investments_table` (nullable FK)
- [x] **1.7** Create Eloquent models: `Warehouse`, `Rack`, `Lot`, `LotPriceSnapshot` with relationships, casts, and fillable
- [x] **1.8** Create `LotStatus` enum with values: `active`, `in_progress`, `harvest`, `selling`, `completed`, `cancelled`
- [x] **1.9** Create model factories for `Warehouse`, `Rack`, `Lot` for testing
- [x] **1.10** Write Feature tests: Farm owner can create warehouse/rack/lot; cannot create for another owner's farm (403)
  - **Validation:** `php artisan test --filter=WarehouseRackLotTest`

---

## Phase 2: Investment Cycle + Dynamic Pricing

- [x] **2.1** Update `lots` model to compute `currentCycleMonth()` from `cycle_started_at`
- [x] **2.2** Create `DynamicPricingService` with `priceForMonth()`, `isInvestmentOpen()`, `recalculateCurrentPrice()`
- [x] **2.3** Create migration for `lot_price_snapshots` (if not in Phase 1 already)
- [x] **2.4** Create `app:recalculate-lot-prices` Artisan command — queries active lots, calls `DynamicPricingService::recalculateCurrentPrice()`, auto-transitions to `in_progress` when cutoff reached
- [x] **2.5** Register command in `console.php` to run daily at 00:01
- [x] **2.6** Write Unit tests for `DynamicPricingService`:
  - Test `priceForMonth(lot, 1)` = base price
  - Test `priceForMonth(lot, 3)` with 5% = `base × 1.05^2`
  - Test `isInvestmentOpen()` returns false when `currentCycleMonth >= last_investment_month`
  - **Validation:** `php artisan test --filter=DynamicPricingServiceTest`
- [x] **2.7** Write Feature test: `RecalculateLotPricesCommandTest` — verifies status transitions and price snapshots

---

## Phase 3: Lot Investment Purchase

- [x] **3.1** Create `LotInvestmentService` with `purchase()` and `validateCycleOpen()` methods
- [x] **3.2** Create `InvestmentCycleClosedException` exception class
- [x] **3.3** Update `InvestmentController` (or create `LotInvestmentController`) to handle lot-based purchase
- [x] **3.4** Create `StoreLotInvestmentRequest` FormRequest with validation rules
- [x] **3.5** Update `investment-purchase` spec delta — add lot-based path alongside existing tree-based path
- [x] **3.6** Write Feature tests:
  - Investor can purchase a lot when cycle is open
  - Purchase blocked when `currentCycleMonth >= last_investment_month`
  - Purchase blocked when lot status is not `active`
  - Purchase blocked when KYC not verified
  - **Validation:** `php artisan test --filter=LotInvestmentTest`

---

## Phase 4: Harvest + Selling Lifecycle

- [x] **4.1** Create migration `add_selling_fields_to_harvests_table` (selling_revenue_cents, proof photo, timestamps)
- [x] **4.2** Update `LotStatus` transitions — add farm owner actions to advance from `in_progress → harvest → selling`
- [x] **4.3** Create `LotHarvestController` (farm owner) with `store` (record harvest data) action
- [x] **4.4** Create `LotSellingController` (farm owner) with `store` (submit sales revenue) action
- [x] **4.5** Create `LotSellingService::submitSellingRevenue()` + `distributeProfits()` per design.md
- [x] **4.6** Create `DistributeLotProfits` queued job (dispatched by `submitSellingRevenue`)
- [x] **4.7** Create `LotProfitsDistributed` event + listener to notify investors
- [x] **4.8** Update `profit-calculation` spec delta to add selling-revenue path
- [x] **4.9** Write Unit tests: `LotSellingServiceTest` — profit distribution algorithm with known inputs
  - 10% fee, 70/30 split
  - Integer rounding residual assigned to largest investor
  - **Validation:** `php artisan test --filter=LotSellingServiceTest`
- [x] **4.10** Write Feature tests: Farm owner submits selling data; wallets are credited; lot status becomes `completed`

---

## Phase 5: Wallet System

- [x] **5.1** Create migrations `create_wallets_table` + `create_wallet_transactions_table`
- [x] **5.2** Create `Wallet` and `WalletTransaction` Eloquent models with relationships
- [x] **5.3** Create `WalletTransactionType` enum: `payout_credit`, `reinvestment`, `withdrawal`, `platform_fee`
- [x] **5.4** Create `WalletService` with `credit()`, `debit()` (with pessimistic locking), `getOrCreateWallet()`, `initiateWithdrawal()`, `reinvest()` methods
- [x] **5.5** Create `InsufficientWalletBalanceException` exception class
- [x] **5.6** Hook `LotSellingService::distributeProfits()` into `WalletService::credit()` calls
- [x] **5.7** Create `Investor/WalletController` — index (balance + transactions), withdraw, reinvest
- [x] **5.8** Create `StoreWithdrawalRequest` + `StoreReinvestmentRequest` FormRequests
- [x] **5.9** Write Feature tests: `WalletServiceTest`
  - Credit increases balance
  - Debit reduces balance
  - Debit throws on insufficient balance
  - Concurrent debits don't produce negative balance (test with locking)
  - **Validation:** `php artisan test --filter=WalletServiceTest`

---

## Phase 6: Agrotourism Registration Enhancement

- [x] **6.1** Create migration `add_participants_count_to_agrotourism_registrations_table`
- [x] **6.2** Update `AgrotourismRegistration` model — add `participants_count` fillable + cast
- [x] **6.3** Update `StoreAgrotourismRegistrationRequest` — add `participants_count` validation (min:1, max:20 reasonable cap)
- [x] **6.4** Update capacity check: count `SUM(participants_count)` instead of registration row count
- [x] **6.5** Add `FarmOwner/AgrotourismController::approve()` and `reject()` actions for offline registrations
- [x] **6.6** Add `AgrotourismRegistrationRejected` notification
- [x] **6.7** Create `Investor/FarmVisitsController::index()` — investor's upcoming farm visits
- [x] **6.8** Update `agrotourism-events` spec delta
- [x] **6.9** Write Feature tests: Registration with participants; capacity correctly uses sum; farm owner approve/reject offline

---

## Phase 7: UI Pages (React/TSX)

- [x] **7.1** `FarmOwner/Warehouses/Index.tsx` — list warehouses, create/edit inline
- [x] **7.2** `FarmOwner/Warehouses/Show.tsx` — racks list within a warehouse
- [x] **7.3** `FarmOwner/Lots/Index.tsx` — all lots with status badges, price, cycle progress
- [x] **7.4** `FarmOwner/Lots/Create.tsx` — form: select rack, crop, set base price, monthly increase, cycle months, last investment month
- [x] **7.5** `FarmOwner/Lots/Show.tsx` — lot detail: price timeline, investor list, action buttons per status
- [x] **7.6** `FarmOwner/Lots/Harvest.tsx` — upload harvest photos, total fruit/weight
- [x] **7.7** `FarmOwner/Lots/Selling.tsx` — input revenue, upload proof photo, "Submit Sales" button
- [x] **7.8** `Investor/Wallet/Index.tsx` — balance card, transaction history table, Withdraw/Reinvest modals
- [x] **7.9** `Investor/Lots/Show.tsx` — investor view of lot: price by month chart (Recharts), cycle progress indicator, investment CTA
- [x] **7.10** `Investor/FarmVisits/Index.tsx` — upcoming visits with status, participants count, cancel option

---

## Validation Gates

| Gate | Command | Must Pass Before |
|------|---------|-----------------|
| Phase 1 schema | `php artisan test --filter=WarehouseRackLot` | Phase 2 |
| Phase 2 pricing logic | `php artisan test --filter=DynamicPricing` | Phase 3 |
| Phase 3 lot purchase | `php artisan test --filter=LotInvestment` | Phase 4 |
| Phase 4 distribution | `php artisan test --filter=LotSelling` | Phase 5 |
| Phase 5 wallet | `php artisan test --filter=Wallet` | Phase 7 |
| Full suite | `php artisan test` | Deployment |
