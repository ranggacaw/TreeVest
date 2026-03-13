# Proposal: implement-farm-owner-core-platform

## Summary

This proposal introduces the **core farm-owner-side investment platform mechanics** — the foundational layer that transforms Treevest from a basic farm listing tool into a complete agricultural investment engine. It covers 10 tightly-coupled capabilities that must be delivered together to enable the full investment lifecycle.

## Motivation

The current specs define farms, trees, harvest scheduling, payouts, and agrotourism events at a high level, but are missing:

1. **Spatial tree organisation** — no Warehouse → Rack → Lot → Tree hierarchy exists
2. **Lot-based investment model** — investments are currently per-tree; the platform needs a LOT package system
3. **Monthly time-gated pricing** — dynamic price escalation as harvest approaches is unspecified
4. **Investment cycle restrictions** — the concept of a "last investment month" cutoff is absent
5. **Harvest + Selling status workflow** — the Progress → Harvest → Selling three-stage lifecycle is missing from current specs
6. **Revenue-based profit sharing** — today's `profit-calculation` spec covers yield × market price; this adds selling revenue input + split formula (70/30 + 10% platform fee)
7. **Wallet system** — there is no in-platform wallet; payouts currently go directly to bank accounts via EPIC-010
8. **Agrotourism farm visit registration** — the existing `agrotourism-events` spec covers creation/cancellation; investor registration with online/offline modes and participant counts is partially specified but the data capture specified here (number of participants, offline pending flow) needs to be formalised

## Scope

| # | Capability | New Spec | Modifies Existing Spec |
|---|-----------|----------|----------------------|
| 1 | Warehouse / Rack / Lot spatial hierarchy | `warehouse-rack-lot` (NEW) | `farm-management` |
| 2 | Lot-based investment purchase | `lot-investment` (NEW) | `investment-purchase` |
| 3 | Investment cycle definition (cycle months + last month cutoff) | `investment-cycle` (NEW) | `fruit-crop-catalog`, `tree-marketplace` |
| 4 | Dynamic monthly price escalation | `dynamic-tree-pricing` (NEW) | `tree-pricing` |
| 5 | Progress → Harvest → Selling lifecycle | `lot-harvest-selling` (NEW) | `harvest-schedule`, `harvest-yield-recording` |
| 6 | Revenue-based profit sharing (70/30 + 10% fee) | — | `profit-calculation` |
| 7 | Wallet system (balance, transactions, withdraw, reinvest) | `investor-wallet` (NEW) | `payout-distribution` |
| 8 | Agrotourism farm visit registration (participants, pending offline) | — | `agrotourism-events` |

## Key Design Decisions

### 1. Spatial Hierarchy: Farm → Warehouse → Rack → Lot → Trees

Trees are no longer standalone entities associated directly with a farm. They live inside a **Lot**, which belongs to a **Rack**, which belongs to a **Warehouse**, which belongs to a **Farm**. The LOT is the investable unit — investors browse and purchase Lots, not individual trees.

> This is an additive change. Existing `Tree` model gains a nullable `lot_id` FK initially; a migration hard-couples them once data is backfilled.

### 2. LOT as the Investment Unit (not individual trees)

The current `investment-purchase` spec links `Investment → Tree`. This proposal flips the relationship: `Investment → Lot`. Each `Lot` records `total_trees` and `price_per_tree_cents`. Purchase price = `price_per_tree_cents × total_trees`.

> Backwards compatible: existing investments can be migrated with a synthetic lot per tree in the database.

### 3. Investment Cycle = Time-Gated Availability Window

A `FruitCrop` (or tree group) now has:
- `cycle_months` — length of one investment cycle
- `last_investment_month` — last month in which investment is permitted (must be < `cycle_months`)

The system computes the current cycle month from the `cycle_started_at` date on the Lot and blocks purchases when `current_cycle_month >= last_investment_month`.

### 4. Dynamic Pricing — Compound Monthly Escalation

```
price(month) = base_price_cents × (1 + monthly_increase_rate)^(month - 1)
```

Triggered at the start of each calendar month via a scheduled command. Price is **pre-calculated and stored** on the Lot record as `current_price_cents` — not computed on the fly — for performance and auditability.

### 5. Three-Stage Lot Lifecycle: Progress → Harvest → Selling

Each Lot has a status:
- `active` — investments open (subject to cycle cutoff)
- `in_progress` — cycle closed, growing phase
- `harvest` — farm owner uploading harvest evidence
- `selling` — farm owner has submitted sales revenue
- `completed` — profits distributed, wallets credited

### 6. Profit Sharing Formula

```
platform_fee     = 10% × total_revenue
remaining        = total_revenue − platform_fee
investor_share   = 70% × remaining  (distributed pro-rata by lot ownership)
farm_owner_share = 30% × remaining
```

This modifies `profit-calculation` spec (which currently uses yield × market price model) by adding the **selling-revenue input path** alongside the existing market-price path.

### 7. Wallet System

A new in-platform `Wallet` model (`id`, `user_id`, `balance_cents`, `currency`) with a `WalletTransaction` ledger. After profit distribution, investor and farm owner wallets are credited automatically. Investors can then: **Withdraw** (triggers bank transfer via EPIC-010), **Reinvest** (creates a new Lot investment), or **View history**.

### 8. Agrotourism Registration Enhancement

The existing spec already covers online/offline registration types and `status = pending` for offline. This proposal adds:
- `participants_count` field (number of people in the investor's visit party)
- Farm owner confirmation flow for offline registrations (approve/reject individual registrations)
- Investor dashboard section: "Upcoming Farm Visits"

## Out of Scope (Deferred)

- GPS tree tagging / drone photo integration (noted as optional trust-builders)
- Blockchain transaction log
- Native mobile apps

## Affected Files (High-Level — Implementation Phase)

**New migrations:** `create_warehouses_table`, `create_racks_table`, `create_lots_table`, `add_lot_id_to_trees_table`, `create_investment_cycles_table`, `create_investor_wallets_table`, `create_wallet_transactions_table`, `add_selling_fields_to_harvests_table`

**New models:** `Warehouse`, `Rack`, `Lot`, `InvestmentCycle`, `Wallet`, `WalletTransaction`

**New services:** `LotInvestmentService`, `DynamicPricingService`, `LotHarvestService`, `LotSellingService`, `WalletService`

**New jobs:** `RecalculateLotPrices` (monthly scheduled), `DistributeLotProfits`

**New enums:** `LotStatus`, `WalletTransactionType`

**Modified controllers:** `InvestmentController` (lot-based), `FarmOwner/HarvestController` (selling stage)

**New pages (React/TSX):** `FarmOwner/Warehouses/`, `FarmOwner/Lots/`, `Investor/Wallet/`, `Investor/FarmVisits/`

## Clarifications Needed Before Implementation

> The following questions require answers before spec deltas are finalised:

1. **Multi-Lot Ownership**: Can a single investor purchase **multiple lots** in the same crop cycle? Or is it one lot per investor per cycle?
2. **Wallet Currency**: Should the wallet be MYR-only (matching the current default) or multi-currency from day one?
3. **Reinvest Flow**: When an investor chooses to reinvest, should the wallet balance be applied to a specific lot they select, or auto-allocated to the highest-priority available lot?
4. **Platform Wallet**: Is there a single admin/platform wallet entity, or does platform fee revenue flow directly to a designated bank account (not tracked in the in-platform wallet)?
5. **Lot Pricing Override**: Can individual lots have their own `base_price_cents` that differs from the crop's default, or does the crop-level price apply uniformly across all lots?
6. **Agrotourism Participants**: Is the `participants_count` per registration capped by `max_capacity` on the event, or is capacity counted per-investor-slot?

---

*Proposal prepared: 2026-03-13*
*Status: AWAITING REVIEW*
