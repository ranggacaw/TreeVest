## 1. Schema Changes
- [x] 1.1 Add `token_id` column (string, unique, nullable initially) to `trees` table migration
- [x] 1.2 Add `available_trees` column (unsignedInteger) to `lots` table migration
- [x] 1.3 Backfill `available_trees = total_trees` for existing lots via migration
- [x] 1.4 Generate `token_id` values for existing trees (format: `TRX-{lot_id}-{tree_number}`) via migration
- [x] 1.5 Add unique index on `trees.token_id`

## 2. Model / Service Changes
- [x] 2.1 Update `Tree` model: add `token_id` to fillable and casts
- [x] 2.2 Update `Lot` model: add `available_trees` to fillable and casts; add `is_full` accessor
- [x] 2.3 Create `TreeTokenService::generateTokenId(Lot $lot, int $treeNumber): string` helper
- [x] 2.4 Update `FruitCropService` (or factory) to auto-generate `token_id` on tree creation
- [x] 2.5 Update `LotInvestmentService` (rename/replace lot-package logic): validate `quantity ≤ lot.available_trees`, decrement `available_trees` atomically on purchase
- [x] 2.6 Update `ProfitCalculationService::calculate()`: replace 60/40 split with 10% fee → 70% investor / 30% farm owner formula

## 3. Frontend Changes
- [x] 3.1 Update `LotDetail.tsx` (marketplace): show "Available Trees: X of Y" counter; change "Invest Now" to quantity-input purchase UI
- [x] 3.2 Update `Portfolio/Dashboard.tsx` holdings list: display `tree.token_id` per investment
- [x] 3.3 Update `Investments/Show.tsx` investment detail: show token ID, lot hierarchy breadcrumb

## 4. Tests
- [x] 4.1 Unit test: `TreeTokenService::generateTokenId()` produces correct format
- [x] 4.2 Feature test: purchasing N trees from a lot decrements `available_trees` correctly
- [x] 4.3 Feature test: purchasing more trees than `available_trees` is rejected
- [x] 4.4 Feature test: `ProfitCalculationService` uses 10% fee → 70/30 split (update existing test)
- [x] 4.5 Feature test: investor portfolio displays `token_id` for each owned tree

## Post-Implementation
- [x] Update `AGENTS.md` in project root: correct investment model description (Section 6), update profit split formula in Section 7 Glossary, update `lot-investment` spec purpose note
