# Design: enhance-investor-investment-ux

## 1. Quantity-Based Investment Model

### Problem
The current `Investment` model stores `amount_cents` as the user-supplied investment value. This is appropriate for fractional-ownership models where users enter a dollar amount. However, Treevest's core concept is **one tree = one investable unit**. Asking users for a monetary amount obscures this and creates confusion about what they own.

### Solution
Introduce a `quantity` (integer) column on `investments`. The investment amount becomes a derived value:

```
amount_cents = quantity × tree.price_cents
```

`amount_cents` is still stored at purchase time (snapshot of the price) for historical accuracy in reporting, audit, and payout calculations — price changes after purchase do not affect past investments.

### Database Change

```sql
ALTER TABLE investments ADD COLUMN quantity UNSIGNED INT NOT NULL DEFAULT 1;
UPDATE investments SET quantity = 1 WHERE quantity IS NULL;
```

Migration file: `add_quantity_to_investments_table`

### Min/Max Validation (Derived from Existing Fields)
Rather than adding new columns, min/max tree counts are computed at validation time:

```
min_trees = CEIL(tree.min_investment_cents / tree.price_cents)
max_trees = FLOOR(tree.max_investment_cents / tree.price_cents)
```

This keeps the Tree model unchanged and avoids data denormalization. The `InvestmentService` performs this derivation inline.

### Top-Up Change
Top-ups now accept `top_up_quantity` (integer). The service:
1. Computes the additional `amount_cents = top_up_quantity × tree.price_cents`
2. Validates `(investment.quantity + top_up_quantity) ≤ max_trees`
3. Atomically increments both `quantity` and `amount_cents`

---

## 2. Wishlist Data Model

### Polymorphic Design
The wishlist supports three entity types (Tree, Farm, FruitCrop) without requiring three separate join tables. A standard Laravel morphable relationship is used:

```
wishlist_items
  id
  user_id          FK → users.id (cascade delete)
  wishlistable_type   string  (App\Models\Tree | App\Models\Farm | App\Models\FruitCrop)
  wishlistable_id     unsignedBigInt
  created_at
  updated_at

UNIQUE (user_id, wishlistable_type, wishlistable_id)
INDEX  (wishlistable_type, wishlistable_id)   -- for reverse lookups during notifications
```

The `WishlistItem` model uses `morphTo('wishlistable')`. Each target model (`Tree`, `Farm`, `FruitCrop`) gets a `wishlistItems(): MorphMany` relationship.

### Toggle Endpoint
A single `POST /investor/wishlist/toggle` endpoint handles add and remove:
- If the item exists → delete it, return `{ wishlisted: false }`
- If it does not exist → create it, return `{ wishlisted: true }`

This allows the UI heart/bookmark icon to use a single Inertia router POST call.

### State Propagation
To avoid extra API calls for wishlist state on every marketplace page:
- The `TreeMarketplaceController` passes `wishlistedTreeIds: int[]` in Inertia props (only the IDs, not full records) for the authenticated investor
- The `TreeController@show` passes `isWishlisted: bool`
- Guests receive empty array / false

This is a `O(1)` DB query (one `SELECT wishlistable_id WHERE user_id = X AND wishlistable_type = Tree`).

---

## 3. Portfolio Dashboard Architecture

### Tab Structure
The portfolio page is reorganized into three client-side tabs (no separate routes per tab):

| Tab | Content | Data Source |
|-----|---------|-------------|
| Holdings | Holdings list with P&L rows + sparklines + donut chart + harvest calendar | `investments` + `payouts` + `harvests` |
| Watchlist | Wishlist items grouped by type | `wishlist_items` morphed with entities |
| Transactions | Full chronological transaction history with filter | `transactions` (user-scoped) |

All three tabs' data is passed in a single Inertia render call to avoid multiple round-trips. Pagination for Transactions is handled via Inertia partial reloads (only reload `transactions` prop when changing page/filter).

### Summary Header Calculations
Computed server-side in `PortfolioService` (or extended `InvestorDashboardService`):

```
total_invested_cents       = SUM(amount_cents) WHERE status IN (active)
total_payouts_cents        = SUM(net_amount_cents) FROM payouts WHERE status = completed AND user = X
current_value_cents        = total_invested_cents + total_payouts_cents
gain_loss_cents            = current_value_cents - total_invested_cents
gain_loss_percent          = gain_loss_cents / total_invested_cents * 100   (null if invested = 0)
pending_payouts_cents      = SUM(net_amount_cents) WHERE status IN (pending, processing)
```

### Sparklines
Each investment row includes a sparkline built from the investment's payout history. To avoid N+1:
- `Investment::with(['payouts' => fn($q) => $q->where('status', 'completed')->select('investment_id', 'net_amount_cents', 'created_at')->orderBy('created_at')->limit(6)])` is used
- The sparkline data is serialized as `[[timestamp, cumulative_amount], ...]` in the investment resource

### Donut Chart
Recharts `PieChart` with `innerRadius` set. Three grouping options are computed server-side and passed as three separate arrays in props:
- `allocationByFruitType: { label, value_cents, percentage }[]`
- `allocationByFarm: { label, value_cents, percentage }[]`
- `allocationByRisk: { label, value_cents, percentage }[]`

Client-side tab switching just swaps the data array reference — no server round-trip.

---

## 4. Notification Architecture for Wishlist

### Availability Notification
Triggered by an Eloquent model observer on `Tree`:
- `TreeObserver@updated`: if `status` changed and new status is investable → dispatch `NotifyWishlistersOfTreeAvailability` job
- The job queries `WishlistItem::where(['wishlistable_type' => Tree::class, 'wishlistable_id' => $treeId])->with('user')` and loops to dispatch per-user notifications

### Price Change Notification
Same observer:
- `TreeObserver@updated`: if `price_cents` changed → dispatch `NotifyWishlistersOfTreePriceChange` job
- Notification respects `NotificationPreference` for type `wishlist_price_change`

### Observer Registration
Registered in `AppServiceProvider::boot()`:
```php
Tree::observe(TreeObserver::class);
```
