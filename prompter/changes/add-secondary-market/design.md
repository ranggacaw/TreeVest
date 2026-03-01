# Design: Secondary Market

## Context
The secondary market allows investors to resell active tree investments to other KYC-verified investors. The feature must slot into the existing Laravel + Inertia.js monolith without modifying the primary investment purchase or payout systems. The two hardest problems are: (1) preventing two buyers from concurrently purchasing the same listing, and (2) atomically transferring ownership while preserving payout history integrity.

## Goals / Non-Goals
- **Goals:**
  - Simple listing-and-purchase flow reusing Stripe payment infrastructure
  - Atomic, race-condition-safe ownership transfer via `DB::transaction()` + `SELECT FOR UPDATE`
  - Harvest payout recipient always resolves to the current `investment.user_id` at harvest time — no retroactive adjustment needed
  - Minimal schema footprint: one new `market_listings` table, one new `investment_transfers` table
  - Investor-only access (KYC-verified); admin oversight via existing admin panel extension
- **Non-Goals:**
  - Order book, bidding, price negotiation
  - Short selling, derivatives, margin
  - Automated pricing or market-making
  - Real-time ticker / price feed

## Data Model

### `market_listings` table

| Column | Type | Notes |
|--------|------|-------|
| `id` | BIGINT PK | |
| `investment_id` | BIGINT FK | `investments.id` — the investment being sold |
| `seller_id` | BIGINT FK | `users.id` — denormalised for query convenience |
| `ask_price_cents` | BIGINT UNSIGNED | Seller's asking price (MYR cents) |
| `currency` | CHAR(3) | Default `MYR` |
| `platform_fee_rate` | DECIMAL(5,4) | e.g. `0.0200` = 2%; snapshot at listing creation |
| `platform_fee_cents` | BIGINT UNSIGNED | Computed: `ask_price_cents * platform_fee_rate`, rounded |
| `net_proceeds_cents` | BIGINT UNSIGNED | `ask_price_cents - platform_fee_cents` |
| `status` | ENUM | `active`, `sold`, `cancelled` — backed PHP enum `ListingStatus` |
| `buyer_id` | BIGINT FK NULL | `users.id`; set on purchase |
| `purchased_at` | TIMESTAMP NULL | |
| `cancelled_at` | TIMESTAMP NULL | |
| `expires_at` | TIMESTAMP NULL | Optional: listings expire after N days (configurable, nullable = no expiry) |
| `notes` | TEXT NULL | Seller-provided description (optional, sanitised with `NoXss` rule) |
| `metadata` | JSON NULL | Extensible: e.g. `{"stripe_payment_intent_id": "..."}` |
| `created_at` / `updated_at` | TIMESTAMP | |

**Indexes:** `investment_id` (UNIQUE on `status=active` via partial index or enforced in service), `seller_id`, `status`, `buyer_id`

### `investment_transfers` table

Immutable record of every ownership change (primary purchase already logged in `audit_logs`; this gives a queryable transfer history per investment).

| Column | Type | Notes |
|--------|------|-------|
| `id` | BIGINT PK | |
| `investment_id` | BIGINT FK | |
| `listing_id` | BIGINT FK | `market_listings.id` |
| `from_user_id` | BIGINT FK | Previous owner |
| `to_user_id` | BIGINT FK | New owner |
| `transfer_price_cents` | BIGINT UNSIGNED | Agreed ask price |
| `platform_fee_cents` | BIGINT UNSIGNED | |
| `transaction_id` | BIGINT FK NULL | `transactions.id` — buyer's payment transaction |
| `transferred_at` | TIMESTAMP | |
| `created_at` / `updated_at` | TIMESTAMP | |

### `InvestmentStatus` enum extension
Add `listed` case: an investment that is `active` and has an open listing. This prevents top-ups and direct cancellations while a listing is open.

Allowed transitions with this change:
- `active → listed` (when a listing is created)
- `listed → active` (when a listing is cancelled)
- `listed → sold` (when a purchase is confirmed)
- Existing: `pending_payment → active`, `active → matured`, `pending_payment → cancelled`

## Decisions

### Concurrency: `SELECT FOR UPDATE` in purchase flow
- **Decision:** `SecondaryMarketService::purchaseListing()` wraps the entire ownership transfer in `DB::transaction()` and acquires a row lock on the `market_listings` row via `lockForUpdate()` before checking `status = active`.
- **Rationale:** MySQL InnoDB row locks prevent two concurrent requests from both seeing `status = active` and proceeding. The second request will block until the first commits, then find `status = sold` and fail gracefully.
- **Alternative considered:** Optimistic locking (version column + retry). Rejected — simpler to reason about with pessimistic lock given low expected concurrency on a single listing.
- **Deadlock risk:** Mitigated by consistent lock acquisition order: always lock `market_listings` first, then `investments`. Document this in `SecondaryMarketService`.

### Payment flow: reuse Stripe Payment Intent
- **Decision:** Buyer pays via the existing `StripeService::createPaymentIntent()`. The listing's `ask_price_cents` is used as the amount. On `payment_intent.succeeded` webhook, `ProcessStripeWebhook` is extended to handle `secondary_purchase` transaction type, which triggers `SecondaryMarketService::confirmPurchase()`.
- **Rationale:** Avoids duplicating payment infrastructure. Consistent with primary market purchase flow.
- **Metadata:** Stripe PaymentIntent metadata includes `{"type": "secondary_purchase", "listing_id": X}` for webhook routing.

### Ownership transfer atomicity
- **Decision:** `SecondaryMarketService::confirmPurchase()` within a single `DB::transaction()`:
  1. Lock `market_listings` row (`lockForUpdate`)
  2. Assert `status = active` (guard against duplicate webhook)
  3. Update `investment.user_id` to `buyer_id`
  4. Update `investment.status` to `sold` (from `listed`)
  5. Update `market_listings.status` to `sold`, set `buyer_id`, `purchased_at`
  6. Create `investment_transfers` record
  7. Dispatch `ListingPurchased` event (outside transaction, to avoid holding locks during queue dispatch)
- **Harvest payout recipient:** `Payout` records are created at harvest time using `investment.user_id` at that moment. Since `investment.user_id` is updated atomically on transfer, no special logic is needed — the payout will naturally go to whoever owns the investment when harvest completes.

### Platform fee
- **Decision:** Fee rate stored in `config('treevest.secondary_market_fee_rate')` (default `0.02`). Snapshotted into `market_listings.platform_fee_rate` at listing creation so fee is locked at time of listing (not at time of sale).
- **Calculation:** `platform_fee_cents = ceil(ask_price_cents * platform_fee_rate)` — always round up in platform's favor (consistent with payout-distribution rounding).

### Listing expiry
- **Decision:** Optional. `expires_at` is nullable. A scheduled command `ExpireStaleListings` runs daily and transitions expired `active` listings to `cancelled` and restores investment status to `active`.

### Ask price constraints
- **Decision:** Minimum ask price = `investment.amount_cents` (seller cannot list below cost, preventing wash-trading at a loss purely for accounting). Maximum = no hard cap (platform policy, not a system rule). Validated in `StoreMarketListingRequest`.

### One active listing per investment
- **Decision:** Enforced in `SecondaryMarketService::createListing()` by checking for existing `active` listing before creating a new one. Also enforced at DB level with a unique constraint: `(investment_id, status)` where `status = 'active'` (achieved via a partial unique index in MySQL or validated at service layer since MySQL partial unique indexes require expression indexes — use service-layer check + test coverage).

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| Deadlock between concurrent purchases | Consistent lock-acquisition order documented in service; tested with concurrent feature tests |
| Duplicate webhook fires `confirmPurchase` twice | Guard: check `market_listings.status = active` inside lock; idempotency via `transaction_id` check |
| Regulatory: secondary trading may be classified as a securities market | Out of scope for spec — flagged for legal review before launch |
| Price manipulation (wash trading) | Minimum ask price ≥ original investment amount; KYC required; audit trail; seller cannot buy their own listing |
| Seller lists investment just before harvest to capture payout early | By design: payout accrues to owner at harvest time; buyer assumes this risk; disclosed in listing UI |

## Migration Plan
1. Add `market_listings` migration
2. Add `investment_transfers` migration
3. Add `listed` case to `InvestmentStatus` PHP enum
4. Add `ListingStatus` PHP enum
5. No data backfill needed (new tables, no existing data affected)

## Open Questions
- Should listing `expires_at` default be configurable (e.g., 30 days) or always null (no expiry)? → Defaulting to no expiry (null) until a business requirement is confirmed.
- Should admins be able to force-cancel any listing? → Yes; admin route `DELETE /admin/market-listings/{id}` — included in scope.
- Should buyers be able to see seller identity (user name)? → No; seller identity is hidden (privacy); only investment details are shown.
