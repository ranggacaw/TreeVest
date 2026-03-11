# Proposal: enhance-investor-investment-ux

## Summary

This change introduces three related investor-facing improvements that collectively elevate the Treevest investment experience to the standard of leading retail investment apps (Stockbit, Bibit):

1. **Investor Wishlist** — A new feature allowing investors to save individual trees, farms, and fruit crops to a personal watchlist, with automated availability and price-change notifications.
2. **Quantity-Based Investment Purchases** — The investment purchase flow is refactored so that investors select a **number of trees** (integer quantity) instead of entering a monetary amount. The total cost is derived as `quantity × tree.price_cents`.
3. **Portfolio Redesign (Stockbit/Bibit-inspired)** — The portfolio dashboard is significantly enhanced: a total-return summary header, a holdings list with per-investment P&L and performance sparklines, a three-tab layout (Holdings, Watchlist, Transactions), an asset allocation donut chart, and a full transaction history tab.

## Motivation

- **Wishlist:** Investors browsing the marketplace need a way to track trees or farms they are interested in without immediately committing to a purchase. This reduces decision friction and drives return visits.
- **Quantity-based purchases:** The current monetary-amount input is unintuitive for a per-tree investment model. Asking "how many trees?" is far clearer and aligns with the core business concept of trees as individual investable units.
- **Portfolio redesign:** The current `portfolio-tracking` spec describes a functional but basic dashboard. Users familiar with Stockbit (holdings list with P&L per stock) or Bibit (allocation donut chart, transaction history) expect a richer portfolio view. Adopting these patterns improves clarity and investor confidence.

## Affected Specs

| Spec | Operation | Description |
|------|-----------|-------------|
| `investor-wishlist` | ADDED | New spec for wishlist data model, CRUD, page, state propagation, and notifications |
| `investment-purchase` | MODIFIED | All requirements updated to use quantity-based purchasing; quantity DB schema requirement added |
| `portfolio-tracking` | MODIFIED + ADDED | Existing requirements updated; new Portfolio Transaction History Tab requirement added |

## Scope & Boundaries

**In scope:**
- `WishlistItem` polymorphic model and `wishlist_items` migration
- `WishlistController` (toggle add/remove, index page)
- Wishlist state propagated to tree marketplace and tree detail pages
- `WishlistTreeAvailableNotification` and `WishlistTreePriceChangedNotification`
- `quantity` column added to `investments` table via migration
- `InvestmentService` refactored to accept and validate `quantity`
- Investment purchase wizard UI updated to use a quantity selector with live price preview
- Portfolio dashboard redesigned with summary header, tabs (Holdings / Watchlist / Transactions), donut chart, sparklines

**Out of scope:**
- Changes to payout calculation logic (payouts remain based on `amount_cents` stored at purchase time)
- Secondary market pricing changes (out of scope for this change)
- Native mobile app support
- Gamification features

## Dependencies

- `investor-wishlist` spec is self-contained; it adds new routes and a new model.
- `investment-purchase` changes depend on the DB migration (`add_quantity_to_investments_table`) completing first.
- `portfolio-tracking` Watchlist tab content depends on the wishlist feature being implemented.
- Notification jobs for wishlist depend on Laravel's existing notification infrastructure (already in place per the `notifications` spec).

## Risks

| Risk | Mitigation |
|------|-----------|
| Backfilling `quantity = 1` on existing investment rows may fail on large datasets | Migration should use chunked update; test with a seeded dataset before running on production |
| Polymorphic wishlist queries can be slow if not indexed | Add index on `(user_id, wishlistable_type, wishlistable_id)` and ensure `wishlistable_id` index exists per morphable model |
| Portfolio page performance with sparklines (N+1 on payouts per investment) | Eager-load payouts with the investment collection; limit sparkline data to last 6 payout points |
| Switching from amount_cents input to quantity may break existing pending-payment investments | Migration should be paired with a gate: if `quantity IS NULL` default to 1, keeping historical data intact |
