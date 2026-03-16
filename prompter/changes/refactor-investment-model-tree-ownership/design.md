## Context

The platform has two conflicting investment models and two conflicting profit split formulas in existing specs. This design document records the decisions made to resolve both conflicts.

## Goals / Non-Goals

- **Goals:**
  - Single canonical investment model: tree-based, quantity-driven, from a lot
  - Single canonical profit formula: 10% platform fee → 70% investor pool / 30% farm owner
  - Tree ownership traceable to a unique token ID per tree
  - Lot shows remaining available trees so investors know what is purchasable

- **Non-Goals:**
  - Full secondary market re-listing (covered by `secondary-market-listings` spec)
  - Real-time WebSocket push for available tree count (deferred; cache-invalidation on purchase is sufficient)
  - GPS coordinates or QR codes per tree (optional future feature, not in MVP)

## Decisions

### Decision 1: Investment model = tree-quantity purchase from a lot

**What:** An `Investment` record links `investor_id → lot_id → quantity (trees purchased)`. The price is `lot.current_price_per_tree_cents × quantity`.

**Why:** `investment-purchase` spec already has `quantity` on investments. The `lot-investment` spec's full-package model contradicts this and creates a UX problem (forces investors to buy 50 trees at once). Tree-quantity model is more flexible, matches the user's mental model, and matches `investment-purchase`.

**Alternatives considered:** Keep lot-as-package → rejected because it locks investors into buying entire lots and does not match the stated business goal of individual tree ownership.

### Decision 2: Profit formula = 10% fee → 70% investor / 30% farm owner

**What:** `total_revenue → platform_fee = 10% → remaining = 90% → investor_pool = 70% of remaining → farm_owner = 30% of remaining`

**Why:** `investor-wallet` Profit Sharing Formula requirement already defines this formula with concrete example scenarios. The `profit-calculation` spec's 60/40 formula has no concrete business rationale documented and contradicts `investor-wallet`. The 10%/70%/30% formula is also consistent with the user's architecture document.

**Alternatives considered:** 60/40 from `profit-calculation` → rejected; contradicts `investor-wallet` and business document.

### Decision 3: Tree token ID format = `TRX-{lot_id_padded}-{tree_number_padded}`

**What:** Each tree gets a `token_id` like `TRX-00001-012`. This is a display/reference identifier, not a cryptographic token.

**Why:** Enables investors to reference specific trees in support queries, shows up in portfolio, makes ownership transparent. Stored as a unique indexed string on the `trees` table.

**Alternatives considered:** Use existing `tree_identifier` field → insufficient, it is not globally unique (only unique per crop), not formatted for investor display.

### Decision 4: `available_trees` as a stored integer on `lots`

**What:** `lots.available_trees` starts at `total_trees` and is decremented atomically (via `lockForUpdate()`) on each successful investment purchase.

**Why:** Simpler than a computed column; avoids expensive `COUNT(investments WHERE lot_id = X)` on every marketplace page load. Consistent with how the wallet uses `balance_cents`.

**Trade-off:** Requires careful atomic decrement logic; drift is possible if investments are rolled back without restoring the counter. Mitigation: decrement inside same DB transaction as investment creation; add a scheduled integrity check job.

## Risks / Trade-offs

- **Spec migration risk** → `lot-investment` spec will become deprecated/replaced. Any code already built against it must be updated. Impact is limited as implementation is early-stage.
- **`profit-calculation` spec update** → existing profit calculation tests will need updated expected values to reflect the new formula.
- **`available_trees` drift** → mitigated by atomic decrement in DB transaction and integrity check job.

## Migration Plan

1. Add `trees.token_id` column (nullable, then backfill, then NOT NULL).
2. Add `lots.available_trees` column (default = `total_trees`).
3. Update `LotInvestmentService` to use quantity-based purchase with `available_trees` decrement.
4. Update `ProfitCalculationService` formula.
5. Update frontend components.
6. Deprecate `lot-investment` spec (replace with new `lot-investment` requirements).

## Open Questions

- Should `available_trees` be exposed as a real-time value via Echo/Pusher for live marketplace updates, or is a page refresh on purchase sufficient for MVP? (Deferred: page refresh is sufficient for MVP.)
- Should the token ID include the farm ID prefix for global uniqueness? (Decision: `lot_id_padded` is sufficient since lot IDs are globally unique PKs.)
