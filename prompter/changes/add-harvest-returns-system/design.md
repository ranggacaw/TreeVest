# Design: Harvest & Returns System

## Context

This change introduces the financial backbone of Treevest: the harvest-to-payout pipeline. It spans five new capabilities and touches three existing ones. The key architectural concerns are:

1. **Financial atomicity** — profit calculation and payout record creation must be an all-or-nothing operation across potentially dozens of investor records.
2. **State machine integrity** — `HarvestStatus` and `PayoutStatus` transitions must be strictly controlled to prevent illegal state jumps (e.g., distributing payouts on a failed harvest).
3. **Idempotency** — the profit calculation job must be safe to retry without creating duplicate payout records.
4. **Audit trail completeness** — every state transition for both `Harvest` and `Payout` models must produce an immutable audit log entry.
5. **Decoupled payment execution** — payout record creation is the responsibility of this system; actual fund disbursement is EPIC-010's responsibility.

---

## Goals / Non-Goals

**Goals:**
- Model the complete harvest lifecycle from scheduling through profit calculation and payout record creation
- Provide farm owners with forms to record yield data and confirm completion
- Provide investors with visibility into upcoming harvests and pending/completed payouts
- Provide admins with market price management
- Keep financial calculations transparent and deterministic

**Non-Goals:**
- Bank/wallet fund transfers (EPIC-010)
- Reinvestment auto-purchase (future change)
- Tax document generation (EPIC-011)
- Multi-currency support (future change)
- Market price sourced from an external API (future change — manual entry only now)

---

## Data Model Decisions

### `harvests` table

| Column | Type | Notes |
|--------|------|-------|
| `id` | BIGINT UNSIGNED PK | |
| `tree_id` | BIGINT UNSIGNED FK | Trees are the investable unit |
| `fruit_crop_id` | BIGINT UNSIGNED FK | Denormalized for querying crop-level harvest history |
| `scheduled_date` | DATE | Expected harvest date |
| `status` | ENUM | `scheduled`, `in_progress`, `completed`, `failed` |
| `estimated_yield_kg` | DECIMAL(10,2) NULL | Submitted before harvest |
| `actual_yield_kg` | DECIMAL(10,2) NULL | Set when harvest is recorded |
| `quality_grade` | ENUM NULL | `A`, `B`, `C` — affects market price tier (future) |
| `market_price_id` | BIGINT UNSIGNED FK NULL | Locked price at completion time |
| `platform_fee_rate` | DECIMAL(5,4) | Snapshot of the fee at calculation time (e.g., 0.0500 = 5%) |
| `notes` | TEXT NULL | Farm owner notes |
| `confirmed_by` | BIGINT UNSIGNED FK NULL | User who confirmed completion |
| `confirmed_at` | TIMESTAMP NULL | |
| `completed_at` | TIMESTAMP NULL | |
| `failed_at` | TIMESTAMP NULL | |
| `created_at`, `updated_at` | TIMESTAMP | |
| `deleted_at` | TIMESTAMP NULL | Soft delete |

**Rationale:** `market_price_id` is locked at harvest completion time (not at payout creation time) to ensure settlement uses the correct price even if prices change later. `platform_fee_rate` is a snapshot — admin can change the platform fee for future harvests without retroactively altering completed ones.

### `market_prices` table

| Column | Type | Notes |
|--------|------|-------|
| `id` | BIGINT UNSIGNED PK | |
| `fruit_type_id` | BIGINT UNSIGNED FK | |
| `price_per_kg_cents` | BIGINT UNSIGNED | e.g., 8000 = RM 80.00/kg |
| `currency` | CHAR(3) | `MYR` |
| `effective_date` | DATE | Price valid from this date |
| `created_by` | BIGINT UNSIGNED FK | Admin user who set the price |
| `notes` | TEXT NULL | Admin notes on price rationale |
| `created_at`, `updated_at` | TIMESTAMP | |

**Rationale:** Version history by `effective_date`. When a harvest completes, the system selects the `market_prices` record for the correct `fruit_type_id` where `effective_date <= harvest.completed_at` ORDER BY `effective_date DESC LIMIT 1`. This ensures auditable historical settlement.

### `payouts` table

| Column | Type | Notes |
|--------|------|-------|
| `id` | BIGINT UNSIGNED PK | |
| `investment_id` | BIGINT UNSIGNED FK | Which investment this payout is for |
| `harvest_id` | BIGINT UNSIGNED FK | Which harvest triggered this payout |
| `investor_id` | BIGINT UNSIGNED FK | Denormalized for direct querying |
| `gross_amount_cents` | BIGINT UNSIGNED | Before platform fee |
| `platform_fee_cents` | BIGINT UNSIGNED | Fee deducted |
| `net_amount_cents` | BIGINT UNSIGNED | Amount owed to investor |
| `currency` | CHAR(3) | `MYR` |
| `status` | ENUM | `pending`, `processing`, `completed`, `failed` |
| `payout_method` | ENUM NULL | `bank_transfer`, `digital_wallet` — set by EPIC-010 |
| `transaction_id` | BIGINT UNSIGNED FK NULL | Set by EPIC-010 when payment is processed |
| `notes` | TEXT NULL | |
| `processing_started_at` | TIMESTAMP NULL | |
| `completed_at` | TIMESTAMP NULL | |
| `failed_at` | TIMESTAMP NULL | |
| `failed_reason` | TEXT NULL | |
| `created_at`, `updated_at` | TIMESTAMP | |

**Rationale:** Storing `gross_amount_cents`, `platform_fee_cents`, and `net_amount_cents` separately provides full audit transparency. `transaction_id` is left NULL at creation; EPIC-010 fills it when a bank/wallet transfer is initiated.

---

## State Machines

### HarvestStatus

```
                   [Farm Owner or Admin]
scheduled ─────────────────────────────► in_progress
    │                                         │
    │                                         │ [Farm Owner confirms actual yield]
    │                                         ▼
    │                                     completed ──► [CalculateProfitAndCreatePayouts job]
    │
    └─────────────────────────────────────► failed
                   [Admin or Farm Owner]
```

**Valid transitions only:**
- `scheduled` → `in_progress` (farm owner marks work started)
- `scheduled` → `failed` (crop failure before harvest begins)
- `in_progress` → `completed` (actual yield recorded and confirmed)
- `in_progress` → `failed` (crop failure during harvest)

Reversals are NOT permitted (no `completed → in_progress`).

### PayoutStatus

```
pending ──► processing ──► completed
   │             │
   └─────────────┴──────────► failed
```

`pending` records are created by this system. Transitions to `processing`, `completed`, and `failed` are driven by EPIC-010.

---

## Profit Calculation Formula

```
investor_payout_gross = (investment.amount_cents / total_invested_cents_for_tree)
                        × (harvest.actual_yield_kg × market_price.price_per_kg_cents)

platform_fee = ROUND(investor_payout_gross × harvest.platform_fee_rate)

investor_payout_net = investor_payout_gross - platform_fee
```

Where `total_invested_cents_for_tree` = sum of `amount_cents` for all `active` investments in the tree at the time of calculation.

**Edge case — rounding:** Integer division may leave a remainder of 1 cent across investors. The remainder is absorbed into the platform fee (round down for investors, round up for platform). This is logged explicitly.

**Edge case — zero yield:** If `actual_yield_kg = 0` (total crop failure), `investor_payout_gross = 0` and payout records are created with `net_amount_cents = 0`. This is distinct from `HarvestStatus=failed` (which creates no payouts at all).

---

## Idempotency for CalculateProfitAndCreatePayouts Job

Before creating any `Payout` records, the job checks:
```php
$alreadyCalculated = Payout::where('harvest_id', $harvest->id)->exists();
if ($alreadyCalculated) { return; } // Already processed — exit safely
```

This ensures the job is safe to retry (Laravel queue auto-retries on failure) without creating duplicate payouts.

---

## Atomicity

The `ProfitCalculationService::calculate(Harvest $harvest)` method wraps all payout record inserts in a single `DB::transaction()`. If any payout insert fails, all are rolled back. The harvest `status` is NOT updated to `completed` until the transaction commits successfully.

---

## Scheduling

The `app:send-harvest-reminders` Artisan command runs daily (via `Schedule::command(...)->daily()` in `routes/console.php`). It queries `Harvest` records where:
- `status = scheduled`
- `scheduled_date IN [today + 7 days, today + 1 day]`

For each, it dispatches a `SendHarvestReminderNotification` job for all investors with active investments in that tree.

---

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| Duplicate payout records from job retry | Idempotency check (`harvest_id` existence check before insert) |
| Stale market price used | Price locked at `harvest.completed_at` via `market_price_id` FK |
| Platform fee rate change breaks historical payouts | `platform_fee_rate` snapshot stored on `harvest` record |
| Large harvest with many investors blocks HTTP | `CalculateProfitAndCreatePayouts` is a queued job — not HTTP-synchronous |
| Failed payout job leaves harvest in inconsistent state | DB transaction: harvest status only updates after all payouts committed |
| Zero-yield harvest (not a failure) vs crop failure | `HarvestStatus=completed` with `actual_yield_kg=0` vs `HarvestStatus=failed` — distinct paths |
| SQLite test compatibility | Use `DECIMAL` columns carefully; SQLite stores as REAL — tests must assert with tolerance or use integer-only columns |

---

## Open Questions

1. **Quality grade pricing tiers** — does grade A yield a higher `price_per_kg_cents` than grade B/C? Spec currently treats all grades at the same market price. If tiered pricing is required, `market_prices` needs a `quality_grade` column. **Decision needed before implementation.**
2. **Failed harvest investor communication** — what is the exact notification message and next-steps process when a harvest fails? This change specs the notification trigger; copy/content is TBD.
3. **Platform fee default value** — what is the initial fee rate (e.g., 5%)? This is a business decision. Default value should be documented in `.env` documentation before implementation.
