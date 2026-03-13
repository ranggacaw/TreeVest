# Tasks: enhance-investor-investment-ux

Ordered list of small, verifiable work items. Items within the same numbered group are parallelizable; groups must be completed in order due to dependencies.

---

## Group 1 — Database Migrations (Foundation)

1. ~~**Create `wishlist_items` migration**~~
   - Table: `wishlist_items` with columns `id`, `user_id` (FK cascade), `wishlistable_type`, `wishlistable_id`, `timestamps`
   - Unique index on `(user_id, wishlistable_type, wishlistable_id)`
   - Composite index on `(wishlistable_type, wishlistable_id)` for reverse notification lookups
   - Validation: `php artisan migrate` succeeds; `php artisan migrate:rollback` succeeds

2. ~~**Create `add_quantity_to_investments_table` migration**~~
   - Add `quantity UNSIGNED INT NOT NULL DEFAULT 1` to `investments`
   - Backfill: `UPDATE investments SET quantity = 1`
   - Validation: migration runs clean; existing rows have `quantity = 1`

---

## Group 2 — Backend Models & Relationships

3. ~~**Create `WishlistItem` model** (`app/Models/WishlistItem.php`)~~
   - Fillable: `user_id`, `wishlistable_type`, `wishlistable_id`
   - Relationship: `wishlistable(): MorphTo`
   - Relationship: `user(): BelongsTo`
   - Scope: `scopeForUser($query, int $userId)`
   - Validation: Unit test `WishlistItemTest` — morph resolution returns correct model type

4. ~~**Add `wishlistItems()` morph-many relationship to `Tree`, `Farm`, `FruitCrop` models**~~
   - Each model: `public function wishlistItems(): MorphMany`
   - Validation: Unit test confirms relationship returns `WishlistItem` collection

5. ~~**Update `Investment` model**~~
   - Add `quantity` to `$fillable` and cast as `integer`
   - Add helper: `public function getMaxAdditionalTreesAttribute(int $maxCents, int $pricePerTree): int`
   - Validation: Factory creates investment with `quantity` set; model tests pass

---

## Group 3 — Services

6. ~~**Refactor `InvestmentService::initiateInvestment()`**~~
   - Accept `quantity: int` instead of `amount_cents: int`
   - Compute `amount_cents = quantity * tree.price_cents`
   - Validate `quantity >= 1`
   - Compute `min_trees = ceil(tree.min_investment_cents / tree.price_cents)`; `max_trees = floor(tree.max_investment_cents / tree.price_cents)`
   - Validate `min_trees <= quantity <= max_trees`
   - Persist both `quantity` and `amount_cents` on the investment record
   - Update audit log to include `quantity`
   - Validation: Unit tests cover boundary cases (quantity at min, max, below min, above max, zero)

7. ~~**Refactor `InvestmentService::topUpInvestment()`**~~
   - Accept `top_up_quantity: int`
   - Compute additional `amount_cents = top_up_quantity * tree.price_cents`
   - Validate `(investment.quantity + top_up_quantity) <= max_trees`
   - Atomically increment `quantity` and `amount_cents`
   - Validation: Unit tests for top-up within limits, at limit, exceeding limit

8. ~~**Create `WishlistService`** (`app/Services/WishlistService.php`)~~
   - `toggle(User $user, string $type, int $id): array` — add or remove; returns `['wishlisted' => bool]`
   - `getForUser(User $user): Collection` — returns wishlist items grouped by type with morphed relations loaded
   - `getWishlistedTreeIds(User $user): array` — returns array of tree IDs for state propagation
   - Validation: Unit tests for toggle add, toggle remove, duplicate prevention, getWishlistedTreeIds

9. ~~**Extend `InvestorDashboardService` (or extract `PortfolioService`)**~~
   - `getSummaryHeader(User $user): array` — `total_invested_cents`, `current_value_cents`, `gain_loss_cents`, `gain_loss_percent`, `pending_payouts_cents`, `total_payouts_cents`
   - `getHoldingsWithSparklines(User $user): LengthAwarePaginator` — eager-loads payouts (last 6) and tree relations; maps sparkline data
   - `getAllocationData(User $user): array` — returns `by_fruit_type`, `by_farm`, `by_risk` groupings
   - `getTransactions(User $user, string $filter, int $page): LengthAwarePaginator`
   - Validation: Unit tests for each calculation method with known fixture data

---

## Group 4 — Notifications & Observers

10. ~~**Create `TreeObserver`** (`app/Observers/TreeObserver.php`)~~
    - `updated()`: detect `status` change to investable → dispatch `NotifyWishlistersOfTreeAvailability` job
    - `updated()`: detect `price_cents` change → dispatch `NotifyWishlistersOfTreePriceChange` job
    - Register in `AppServiceProvider::boot()`
    - Validation: Feature test dispatches correct jobs when tree status/price changes

11. ~~**Create `NotifyWishlistersOfTreeAvailability` job**~~
    - Queries wishlisters; loops and sends `WishlistTreeAvailableNotification` per user
    - Validation: Feature test — job sends notification to correct users only

12. ~~**Create `WishlistTreeAvailableNotification`**~~
    - Channels: email + database
    - Includes tree identifier, fruit type, variant, farm name, price, ROI, detail URL
    - Validation: Notification renders correct email content in test

13. ~~**Create `NotifyWishlistersOfTreePriceChange` job and `WishlistTreePriceChangedNotification`**~~
    - Notification respects `NotificationPreference` for type `wishlist_price_change`
    - Includes old price, new price, percentage change
    - Validation: Notification not sent when user preference is disabled

---

## Group 5 — Controllers & Routes

14. ~~**Create `Investor\WishlistController`**~~
    - `index()` → Inertia `Investor/Wishlist` with grouped wishlist items + counts
    - `toggle()` → POST, returns JSON `{ wishlisted: bool }` (used by AJAX from marketplace/tree pages)
    - Apply `auth` + `role:investor` middleware
    - Validation: Feature tests for index (authenticated, non-investor 403), toggle add, toggle remove, duplicate add

15. ~~**Update `TreeMarketplaceController`**~~
    - Inject `WishlistService`; pass `wishlistedTreeIds: int[]` in Inertia props for authenticated investors (empty array for guests)
    - Validation: Feature test confirms prop is present and correct for investor; empty for guest

16. ~~**Update `TreeController@show`**~~
    - Pass `isWishlisted: bool` in Inertia props
    - Validation: Feature test confirms prop is `true` when tree is wishlisted, `false` otherwise

17. ~~**Update `Investor\PortfolioController` (or create if new)**~~
    - Return Inertia `Portfolio/Dashboard` with: summary header, paginated holdings, allocation data, wishlist items, paginated transactions (first page)
    - Handle `?tab=transactions&page=N&filter=X` partial reload for transaction pagination/filtering
    - Validation: Feature test confirms all props present; pagination works for transactions

18. ~~**Add routes** in `routes/web.php`:~~
    ```
    GET  /investor/wishlist          → Investor\WishlistController@index
    POST /investor/wishlist/toggle   → Investor\WishlistController@toggle
    ```
    - Validation: `php artisan route:list` shows new routes

---

## Group 6 — Frontend Components

19. ~~**Create `WishlistToggleButton` component** (`resources/js/Components/WishlistToggleButton.tsx`)~~
    - Props: `isWishlisted: boolean`, `entityType: 'tree' | 'farm' | 'fruitcrop'`, `entityId: number`
    - Heart/bookmark icon, active/inactive states, optimistic toggle via Inertia router POST
    - Validation: Component renders correctly in both states; POST fires on click

20. ~~**Update `TreeCard` component** (marketplace card)~~
    - Accept `isWishlisted: boolean` prop
    - Render `WishlistToggleButton` in the card corner
    - Validation: Card renders toggle button with correct initial state

21. ~~**Update Tree detail page** (`resources/js/Pages/Trees/Show.tsx` or equivalent)~~
    - Add `isWishlisted` prop and render `WishlistToggleButton` as a secondary action button

22. ~~**Create `Investor/Wishlist.tsx` page**~~
    - Grouped sections: Trees, Farms, Fruit Crops
    - Tree wishlist card with: identifier, fruit type/variant, price, ROI, risk badge, lifecycle badge, "Invest Now" / "View Details" buttons, Remove icon
    - Farm wishlist card with: name, location, active crops count, status badge, "View Farm", Remove icon
    - Fruit crop wishlist card with: fruit type, variant, harvest cycle, farm name, "View Crop", Remove icon
    - Empty state
    - Validation: Page renders all three entity types; empty state renders when no items

23. ~~**Update investment purchase wizard UI** (`resources/js/Pages/Investments/Create.tsx` or equivalent)~~
    - Replace monetary amount input with a quantity (number of trees) input
    - Add live price preview below input: "3 trees × RM 1,500 = RM 4,500"
    - Display min/max tree count derived from `min_investment_cents / price_cents`
    - Validation: Live calculation updates correctly; min/max validation shown inline

24. ~~**Redesign `Portfolio/Dashboard.tsx`**~~
    - Summary header card (total invested, current value, gain/loss amount + %, total payouts, pending payouts)
    - Three tabs: Holdings, Watchlist, Transactions
    - Holdings tab: holdings list rows with per-investment P&L, sparkline (Recharts `LineChart`), growth stage badge
    - Watchlist tab: reuse wishlist item cards (subset of Wishlist page)
    - Transactions tab: transaction rows with type label, direction arrow, amount, status badge; filter control; pagination
    - Asset allocation donut chart with "By Fruit Type / By Farm / By Risk" tab switcher
    - Harvest calendar (existing component, updated data)
    - Validation: All tabs render; sparkline renders when payout data present; donut chart group-switches work

25. ~~**Update `InvestorDashboardProps` TypeScript interface** (`resources/js/types/index.d.ts`)~~
    - Add: `summary_header`, `holdings`, `allocation_by_fruit_type`, `allocation_by_farm`, `allocation_by_risk`, `wishlist_items`, `transactions`
    - Update investment props to include `quantity`
    - Validation: TypeScript strict mode compiles with no errors (`npm run build`)

---

## Group 7 — Tests & Validation

26. ~~**Feature tests: WishlistController**~~
    - `test_investor_can_add_tree_to_wishlist`
    - `test_investor_can_remove_tree_from_wishlist`
    - `test_adding_duplicate_wishlist_item_returns_422`
    - `test_non_investor_cannot_access_wishlist`
    - `test_guest_is_redirected_to_login`
    - `test_wishlisted_tree_ids_included_in_marketplace_props`

27. ~~**Feature tests: quantity-based investment**~~
    - `test_investment_purchase_requires_quantity_not_amount`
    - `test_quantity_below_minimum_is_rejected`
    - `test_quantity_above_maximum_is_rejected`
    - `test_quantity_of_zero_is_rejected`
    - `test_top_up_increments_quantity_and_amount`
    - `test_audit_log_includes_quantity`

28. ~~**Feature tests: portfolio dashboard**~~
    - `test_portfolio_summary_header_calculates_correctly`
    - `test_holdings_list_includes_quantity_and_gain_loss`
    - `test_transactions_tab_returns_paginated_results`
    - `test_transactions_tab_filter_by_type`

29. ~~**Run full test suite**~~
    - `php artisan test`
    - Fix any regressions introduced by quantity refactor
    - Validation: All tests green (2 pre-existing `TranslatableTraitTest` failures excluded — confirmed pre-existing on base branch)

30. ~~**Run `./vendor/bin/pint`** and fix any style issues~~
    - Validation: Pint reports no changes needed

---

## Parallelizable Summary

| Can run in parallel | Tasks |
|---------------------|-------|
| After Group 1 | Tasks 3–5 (models) + Task 6–7 (services) can begin |
| After Group 2 | Tasks 8–9 (services) |
| After Group 3 | Tasks 10–13 (observers/notifications) + Tasks 14–18 (controllers/routes) |
| After Group 5 | Tasks 19–25 (frontend) |
| After Group 6 | Tasks 26–30 (tests/lint) |
