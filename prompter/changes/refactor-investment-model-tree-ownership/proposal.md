# Change: Refactor Investment Model to Tree-Based Ownership with Tokenization

## Why

The platform currently has two conflicting investment models across specs:

1. `lot-investment` — investors buy the entire lot as a package (`total_trees × price_per_tree`).
2. `investment-purchase` — investors buy a `quantity` of individual trees from a tree/lot.

Additionally, `profit-calculation` uses a 60/40 split (investor/farm owner), while `investor-wallet` uses 10% platform fee → 70% investor / 30% farm owner. These two formulas are mutually inconsistent.

This change resolves both conflicts by:
- Standardizing on the **tree-based ownership model**: investors buy individual trees (by quantity) from a lot.
- Standardizing on the **10% fee → 70/30 split** formula (from `investor-wallet`).
- Adding **tree token IDs** for unique identifiable ownership records.
- Adding an **available trees counter** per lot so investors see how many trees remain purchasable.
- Retiring the lot-as-package purchase model from `lot-investment`.

## What Changes

- **BREAKING** `lot-investment` spec: Lot-based full-package purchase is replaced by tree-quantity purchase from a lot.
- **MODIFIED** `fruit-crop-catalog`: Trees gain a `token_id` field (e.g., `TRX-LOT001-12`) as a unique display identifier.
- **MODIFIED** `tree-marketplace`: Marketplace now shows available trees per lot, not just total trees.
- **MODIFIED** `profit-calculation`: Replace the 60/40 investor/farm owner split with the canonical 10% fee → 70/30 split to match `investor-wallet`.
- **MODIFIED** `portfolio-tracking`: Portfolio displays tree token IDs and per-tree ownership for each investment.

## Impact

- Affected specs: `lot-investment`, `fruit-crop-catalog`, `tree-marketplace`, `profit-calculation`, `portfolio-tracking`, `investor-wallet`
- Affected code (future implementation): `trees` table (add `token_id` column), `lots` table (add `available_trees` computed/stored column), `investments` table, `LotInvestmentService`, `ProfitCalculationService`, marketplace Inertia pages
- The `investor-wallet` Profit Sharing Formula requirement is the canonical formula — no changes needed there.
- Lot-based full-package purchase UI must be updated to a quantity-selector UI on the lot detail page.
