# Change: Add Harvest & Returns System

## Why
Treevest's core promise is returns tied to actual agricultural production. Without a harvest lifecycle and profit distribution system, the investment platform cannot complete any investment cycle — investors have no returns and the platform has no proof of its value proposition. This change delivers the full harvest-to-payout pipeline.

## What Changes

### New Capabilities (5 new specs)
- **harvest-schedule** — Harvest record creation and lifecycle management (`scheduled → in_progress → completed / failed`), linked to trees and crops. Farm owners manage harvest schedules; admins can override. Automated Laravel scheduled commands send approaching-harvest reminders.
- **harvest-yield-recording** — Farm owners record yield estimates (before harvest) and actual yield (after harvest). Includes quality grade recording. Actual yield is gated: required before profit calculation can run.
- **market-price-tracking** — Admins manually enter and update market prices per fruit type (MYR per kg). Prices are versioned (effective-date based) so historical harvests are settled at the price valid at harvest completion time.
- **profit-calculation** — Transparent, proportional profit calculation: `investor_payout = (investor_amount / total_invested_in_tree) × (actual_yield_kg × market_price_per_kg) × (1 − platform_fee_rate)`. Runs as a Laravel queued job. Triggered by farm owner confirming harvest completion. Atomic DB transaction creates all Payout records for all investors in the harvested tree.
- **payout-distribution** — Payout records created with status `pending`, tracking investor, harvest, investment, amount, and currency. Payout status lifecycle (`pending → processing → completed / failed`). Investors view payout history. Payout status transitions are driven by EPIC-010 (Payment Gateway) — this spec models data and visibility only. Audit trail for every payout event.

### Modified Capabilities (3 existing specs)
- **notifications** — Add `harvest` notification scenarios: approaching harvest reminder (7-day and 1-day warnings), harvest completed alert (to all investors in the tree), payout created alert.
- **portfolio-tracking** — Add actual returns display sourced from completed payouts; update harvest calendar to source from real `harvests` table data; update payout history table to reflect new payout record structure.
- **payment-processing** — Add `payout` transaction type to the Transaction Ledger requirement to confirm the type is defined for EPIC-010 to consume.

## Impact

- **Affected specs (new):** `harvest-schedule`, `harvest-yield-recording`, `market-price-tracking`, `profit-calculation`, `payout-distribution`
- **Affected specs (modified):** `notifications`, `portfolio-tracking`, `payment-processing`
- **Affected code (implementation):**
  - Models: `Harvest`, `MarketPrice`, `Payout`
  - Services: `HarvestService`, `MarketPriceService`, `ProfitCalculationService`, `PayoutService`
  - Jobs: `CalculateProfitAndCreatePayouts`, `SendHarvestReminderNotifications`
  - Events: `HarvestCompleted`, `PayoutsCreated`
  - Listeners: `NotifyInvestorsOfHarvestCompletion`, `NotifyInvestorsOfPayoutCreated`
  - Enums: `HarvestStatus`, `PayoutStatus`
  - Controllers: `FarmOwner/HarvestController`, `Investor/PayoutController`, `Admin/MarketPriceController`
  - FormRequests: `StoreHarvestRequest`, `UpdateHarvestRequest`, `RecordYieldRequest`, `StoreMarketPriceRequest`
  - Pages: `FarmOwner/Harvests/`, `Investor/Payouts/`, `Admin/MarketPrices/`
  - Migrations: `create_harvests_table`, `create_market_prices_table`, `create_payouts_table`
  - Scheduled command: `app:send-harvest-reminders` (daily, dispatches jobs)

## Scope Boundaries

| In Scope | Out of Scope |
|----------|--------------|
| Harvest schedule CRUD | Payment gateway (bank/wallet transfers) — EPIC-010 |
| Yield estimation and actual yield recording | Reinvestment auto-purchase — future change |
| Market price admin entry | Tax documentation / reports — EPIC-011 |
| Profit calculation (proportional share) | Secondary market impact on payouts — future |
| Payout record creation (status: pending) | Multi-currency beyond MYR — future |
| Payout visibility for investors | Portfolio dashboard chart rebuilding — minor modification only |
| Harvest/payout notifications | Financial reporting exports — EPIC-011 |
| Audit trail for all events | |

## Dependencies

- `investment-purchase` spec — `Investment` model must exist with `user_id`, `tree_id`, `amount_cents`, `status=active`
- `fruit-crop-catalog` spec — `Tree` and `FruitCrop` models must exist
- `payment-processing` spec — `Transaction` model type list extended with `payout`
- `notifications` spec — notification channel infrastructure must exist
- `portfolio-tracking` spec — payout history tables sourced from new `payouts` table

## Deferred Decisions

- **Reinvestment option** — Investor preference to reinvest payouts is deferred to a separate `add-reinvestment-option` change (dependency loop with EPIC-006).
- **Platform fee rate** — `platform_fee_rate` is a configurable admin setting; the exact default value is a business decision. Spec defines the mechanism, not the value.
- **Failed harvest handling (crop failure)** — When `HarvestStatus=failed`, payouts are NOT created and investors are notified. Insurance/guarantee obligations are a legal/business decision outside this spec.
