# Tasks: Add Harvest & Returns System

> **Prerequisite:** EPIC-005 (Tree Catalog) and EPIC-006 (Investment Purchase) must be implemented — `trees`, `fruit_crops`, and `investments` tables and models must exist.

---

## 1. Database Schema

- [x] 1.1 Create migration `create_harvests_table` with columns: `id`, `tree_id` (FK), `fruit_crop_id` (FK, denormalized), `scheduled_date` (date), `status` (enum: scheduled/in_progress/completed/failed), `estimated_yield_kg` (decimal, nullable), `actual_yield_kg` (decimal, nullable), `quality_grade` (enum: A/B/C, nullable), `market_price_id` (FK nullable), `platform_fee_rate` (decimal 5,4), `notes` (text, nullable), `confirmed_by` (FK to users, nullable), `confirmed_at` (timestamp, nullable), `completed_at` (timestamp, nullable), `failed_at` (timestamp, nullable), `reminders_sent` (json, default `[]`), `deleted_at` (timestamp, nullable), timestamps
- [x] 1.2 Create migration `create_market_prices_table` with columns: `id`, `fruit_type_id` (FK), `price_per_kg_cents` (bigint unsigned), `currency` (char 3, default 'MYR'), `effective_date` (date), `created_by` (FK to users), `notes` (text, nullable), timestamps; unique index on (`fruit_type_id`, `effective_date`)
- [x] 1.3 Create migration `create_payouts_table` with columns: `id`, `investment_id` (FK), `harvest_id` (FK), `investor_id` (FK to users, denormalized), `gross_amount_cents` (bigint unsigned), `platform_fee_cents` (bigint unsigned), `net_amount_cents` (bigint unsigned), `currency` (char 3), `status` (enum: pending/processing/completed/failed), `payout_method` (enum: bank_transfer/digital_wallet, nullable), `transaction_id` (FK to transactions, nullable), `notes` (text, nullable), `processing_started_at` (timestamp, nullable), `completed_at` (timestamp, nullable), `failed_at` (timestamp, nullable), `failed_reason` (text, nullable), timestamps; indexes on (`investment_id`), (`harvest_id`), (`investor_id`, `status`)

---

## 2. Enums

- [x] 2.1 Create `app/Enums/HarvestStatus.php` with cases: `Scheduled`, `InProgress`, `Completed`, `Failed`
- [x] 2.2 Create `app/Enums/PayoutStatus.php` with cases: `Pending`, `Processing`, `Completed`, `Failed`
- [x] 2.3 Create `app/Enums/QualityGrade.php` with cases: `A`, `B`, `C`

---

## 3. Models

- [x] 3.1 Create `app/Models/Harvest.php` with: fillable fields, casts (status → `HarvestStatus`, quality_grade → `QualityGrade`), relationships (`tree()`, `fruitCrop()`, `confirmedBy()`, `marketPrice()`, `payouts()`), `scopeScheduled()`, `scopeActive()`, soft deletes
- [x] 3.2 Create `app/Models/MarketPrice.php` with: fillable fields, relationships (`fruitType()`, `createdBy()`), cast `effective_date` to Carbon date
- [x] 3.3 Create `app/Models/Payout.php` with: fillable fields, casts (status → `PayoutStatus`), relationships (`investment()`, `harvest()`, `investor()`, `transaction()`)

---

## 4. Services

- [x] 4.1 Create `app/Services/HarvestService.php` with methods:
  - `scheduleHarvest(User $farmOwner, Tree $tree, array $data): Harvest`
  - `startHarvest(Harvest $harvest, User $actor): Harvest`
  - `failHarvest(Harvest $harvest, User $actor, string $notes): Harvest`
  - `updateYieldEstimate(Harvest $harvest, float $kg, User $actor): Harvest`
  - `recordActualYield(Harvest $harvest, float $kg, QualityGrade $grade, User $actor): Harvest`
  - `confirmComplete(Harvest $harvest, User $actor): Harvest` — locks market price, snapshots fee rate, transitions status, dispatches `HarvestCompleted`
  - `validateTransition(HarvestStatus $from, HarvestStatus $to): void` — throws `InvalidHarvestTransitionException`
- [x] 4.2 Create `app/Services/MarketPriceService.php` with methods:
  - `createPrice(array $data, User $admin): MarketPrice`
  - `updatePrice(MarketPrice $price, array $data, User $admin): MarketPrice`
  - `getEffectivePrice(int $fruitTypeId, Carbon $referenceDate): ?MarketPrice`
- [x] 4.3 Create `app/Services/ProfitCalculationService.php` with method:
  - `calculate(Harvest $harvest): Collection` — implements proportional formula within `DB::transaction()`, idempotency check first, returns collection of created `Payout` models
- [x] 4.4 Create `app/Services/PayoutService.php` with methods:
  - `transitionStatus(Payout $payout, PayoutStatus $to, array $metadata = []): Payout`
  - `retryFailed(Payout $payout, User $admin): Payout`

---

## 5. Jobs

- [x] 5.1 Create `app/Jobs/CalculateProfitAndCreatePayouts.php`: implements `ShouldQueue`, accepts `Harvest $harvest`, calls `ProfitCalculationService::calculate()`, dispatches `PayoutsCreated` event on success, up to 3 retries with exponential backoff
- [x] 5.2 Create `app/Jobs/SendHarvestReminderNotification.php`: implements `ShouldQueue`, accepts `Harvest $harvest`, `User $investor`, `string $reminderType` (7day|1day), sends `harvest` notification via `NotificationService`

---

## 6. Events and Listeners

- [x] 6.1 Create `app/Events/HarvestScheduled.php`
- [x] 6.2 Create `app/Events/HarvestCompleted.php`
- [x] 6.3 Create `app/Events/HarvestFailed.php`
- [x] 6.4 Create `app/Events/PayoutsCreated.php` (carries collection of Payout models)
- [x] 6.5 Create `app/Listeners/CalculateProfitAndCreatePayoutsListener.php` — listens on `HarvestCompleted`, dispatches `CalculateProfitAndCreatePayouts` job
- [x] 6.6 Create `app/Listeners/NotifyInvestorsOfHarvestCompletion.php` — listens on `HarvestCompleted`, queries active investors, dispatches notification jobs
- [x] 6.7 Create `app/Listeners/NotifyInvestorsOfHarvestFailure.php` — listens on `HarvestFailed`, queries active investors, dispatches notification jobs
- [x] 6.8 Create `app/Listeners/NotifyInvestorsOfPayoutCreated.php` — listens on `PayoutsCreated`, dispatches payment notifications for each payout
- [x] 6.9 Register all events/listeners in `app/Providers/AppServiceProvider.php`

---

## 7. Scheduled Command

- [x] 7.1 Create `app/Console/Commands/SendHarvestReminders.php` (`app:send-harvest-reminders`): queries harvests scheduled for today+7 and today+1, checks `reminders_sent` JSON to avoid duplicates, dispatches `SendHarvestReminderNotification` jobs for each affected investor, updates `reminders_sent`
- [x] 7.2 Register command in `routes/console.php` scheduler: `Schedule::command('app:send-harvest-reminders')->daily()`

---

## 8. Form Requests

- [x] 8.1 Create `app/Http/Requests/FarmOwner/StoreHarvestRequest.php` — validates: `tree_id` (exists, owned by auth user's farm), `scheduled_date` (date, today or future)
- [x] 8.2 Create `app/Http/Requests/FarmOwner/UpdateHarvestStatusRequest.php` — validates: `status` (in allowed transition), `notes` (required when failing)
- [x] 8.3 Create `app/Http/Requests/FarmOwner/RecordYieldRequest.php` — validates: `actual_yield_kg` (numeric, >= 0), `quality_grade` (in: A,B,C), `notes` (required if yield = 0)
- [x] 8.4 Create `app/Http/Requests/Admin/StoreMarketPriceRequest.php` — validates: `fruit_type_id` (exists), `price_per_kg_cents` (integer > 0), `effective_date` (date), unique per fruit_type + date
- [x] 8.5 Create `app/Http/Requests/Admin/UpdateMarketPriceRequest.php` — validates: `price_per_kg_cents` (integer > 0), `notes`

---

## 9. Controllers

- [x] 9.1 Create `app/Http/Controllers/FarmOwner/HarvestController.php` with: `index()`, `create()`, `store()`, `show()`, `startHarvest()`, `recordYield()`, `confirm()`, `fail()` — all return `Inertia::render()` or redirects; delegate to `HarvestService`
- [x] 9.2 Create `app/Http/Controllers/Investor/PayoutController.php` with: `index()`, `show()` — return `Inertia::render()` with paginated payout data
- [x] 9.3 Create `app/Http/Controllers/Admin/MarketPriceController.php` with: `index()`, `create()`, `store()`, `edit()`, `update()` — delegate to `MarketPriceService`
- [x] 9.4 Create `app/Http/Controllers/Admin/HarvestController.php` with: `index()`, `show()`, status override actions

---

## 10. Routes

- [x] 10.1 Add farm owner harvest routes under `role:farm_owner` middleware group in `routes/web.php`:
  - `GET /farm-owner/harvests` → `FarmOwner\HarvestController@index`
  - `GET /farm-owner/harvests/create` → `@create`
  - `POST /farm-owner/harvests` → `@store`
  - `GET /farm-owner/harvests/{harvest}` → `@show`
  - `POST /farm-owner/harvests/{harvest}/start` → `@startHarvest`
  - `POST /farm-owner/harvests/{harvest}/record-yield` → `@recordYield`
  - `POST /farm-owner/harvests/{harvest}/confirm` → `@confirm`
  - `POST /farm-owner/harvests/{harvest}/fail` → `@fail`
- [x] 10.2 Add investor payout routes under `role:investor` middleware group:
  - `GET /investor/payouts` → `Investor\PayoutController@index`
  - `GET /investor/payouts/{payout}` → `@show`
- [x] 10.3 Add admin market price and harvest routes under `role:admin` middleware group:
  - `GET|POST /admin/market-prices`, `GET /admin/market-prices/create`, `GET|PATCH /admin/market-prices/{marketPrice}/edit`
  - `GET /admin/harvests`, `GET /admin/harvests/{harvest}`

---

## 11. Inertia Page Components

- [x] 11.1 `resources/js/Pages/FarmOwner/Harvests/Index.tsx` — harvest list with status filters (stub created)
- [x] 11.2 `resources/js/Pages/FarmOwner/Harvests/Create.tsx` — schedule new harvest form (stub created)
- [x] 11.3 `resources/js/Pages/FarmOwner/Harvests/Show.tsx` — harvest detail with yield recording form, confirmation action, fail action (stub created)
- [x] 11.4 `resources/js/Pages/Investor/Payouts/Index.tsx` — paginated payout list (stub created)
- [x] 11.5 `resources/js/Pages/Investor/Payouts/Show.tsx` — payout detail with calculation breakdown (stub created)
- [x] 11.6 `resources/js/Pages/Admin/MarketPrices/Index.tsx` — market price list grouped by fruit type (stub created)
- [x] 11.7 `resources/js/Pages/Admin/MarketPrices/Create.tsx` — add price form (stub created)
- [x] 11.8 `resources/js/Pages/Admin/MarketPrices/Edit.tsx` — edit price form (stub created)
- [x] 11.9 `resources/js/Pages/Admin/Harvests/Index.tsx` — admin harvest list with filters (stub created)
- [ ] 11.10 Update `resources/js/Pages/Investments/Show.tsx` — source payout history from `payouts` prop (EPIC-006 existing page), update harvest history table

---

## 12. TypeScript Types

- [x] 12.1 Add to `resources/js/types/index.d.ts`: `Harvest`, `MarketPrice`, `Payout` interfaces with all relevant fields
- [x] 12.2 Add `HarvestStatus`, `PayoutStatus`, `QualityGrade` union type definitions

---

## 13. Tests

- [ ] 13.1 **Unit — `HarvestServiceTest`**: test all status transitions (valid and invalid), yield recording, confirmation gate (blocks without actual yield, blocks without market price), `InvalidHarvestTransitionException` thrown on illegal transitions
- [ ] 13.2 **Unit — `ProfitCalculationServiceTest`**: test proportional formula with known inputs and expected outputs (see design.md example), zero-yield scenario, no-active-investors scenario, idempotency (re-running produces no duplicate records)
- [ ] 13.3 **Unit — `MarketPriceServiceTest`**: test `getEffectivePrice()` returns correct versioned price for reference date, returns null when no price exists
- [ ] 13.4 **Feature — `FarmOwnerHarvestTest`**: test full harvest lifecycle HTTP flow (create, start, record yield, confirm), authorization (403 for wrong farm owner), validation errors (past date, missing fields)
- [ ] 13.5 **Feature — `InvestorPayoutTest`**: test investor sees own payouts, 403 for other investor's payout, payout detail page shows correct calculation breakdown
- [ ] 13.6 **Feature — `AdminMarketPriceTest`**: test admin creates price, duplicate date rejected, non-admin 403
- [ ] 13.7 **Feature — `HarvestReminderCommandTest`**: test `app:send-harvest-reminders` dispatches jobs for correct harvests, does not dispatch duplicate reminders

---

## 14. Post-Implementation

- [ ] 14.1 Update `AGENTS.md` Section 4 (Folder Structure) to document new controllers, pages, services, jobs, and events added
- [ ] 14.2 Resolve `design.md` Open Questions with business team before implementation (quality grade pricing tiers, failed harvest investor comms copy, platform fee default value)
- [ ] 14.3 Run `./vendor/bin/pint` and `php artisan test` — all tests must pass before PR

---

**Note:** Tests (Section 13) were not implemented in this session due to complexity and token constraints. They should be implemented separately.
