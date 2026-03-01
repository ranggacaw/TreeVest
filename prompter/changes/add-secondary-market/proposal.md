# Change: Add Secondary Market for Investment Resale

## Why
Agricultural investments are inherently illiquid — investors are locked in until harvest cycles complete or trees mature. A secondary market lets investors exit positions early by listing them for sale to other investors, improving platform attractiveness and investor confidence without requiring a full exchange-style order book.

## What Changes
- **NEW capability** `secondary-market-listings`: `MarketListing` model, `SecondaryMarketService`, migration, routes, and Inertia pages for listing creation, browse, purchase, and cancellation.
- **MODIFIED** `investment-purchase` spec: adds the `sold` status transition rule (active → sold) and a guard preventing top-up or cancellation of listed investments.
- **MODIFIED** `notifications` spec: adds `secondary_sale` notification type and default preferences for buyer and seller confirmation notifications.
- **MODIFIED** `audit-logging` spec: adds audit event types for secondary market lifecycle (`listing_created`, `listing_cancelled`, `listing_purchased`, `ownership_transferred`).

## Scope
- Simple listing-and-purchase model (not an order book / exchange).
- Seller sets ask price; buyer pays that price (no negotiation, no bidding).
- First-come, first-served: only one buyer can purchase a listing.
- KYC-verified investors only (both buyer and seller).
- Platform transaction fee deducted from sale proceeds (configurable, default 2%).
- Harvest payouts continue accruing to the **current owner at time of harvest** — ownership changes are effective immediately on payment confirmation.
- Ongoing harvest/payout schedules are not affected by a transfer.

## Impact
- **Affected specs:** `secondary-market-listings` (new), `investment-purchase` (modified), `notifications` (modified), `audit-logging` (modified)
- **Affected code (at implementation):**
  - New: `app/Models/MarketListing.php`, `app/Services/SecondaryMarketService.php`, `app/Http/Controllers/SecondaryMarket/` (3 controllers), `app/Http/Requests/` (2 FormRequests), `app/Enums/ListingStatus.php`, migration `create_market_listings_table`, `app/Events/ListingPurchased.php`, `app/Listeners/`
  - Modified: `app/Enums/InvestmentStatus.php` (add `listed` case), `resources/js/types/index.d.ts`, `routes/web.php`
  - New pages: `resources/js/Pages/SecondaryMarket/{Index,Show,Create}.tsx`
- **Prerequisite EPICs:** EPIC-006 (investment-purchase), EPIC-010 (payment-processing) — both are already in `specs/`
- **No breaking schema changes** to existing tables; new `market_listings` table only.
