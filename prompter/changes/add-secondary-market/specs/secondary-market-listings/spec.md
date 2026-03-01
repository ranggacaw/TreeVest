## ADDED Requirements

### Requirement: Secondary Market Listing Creation
An investor with a KYC-verified account and an `active` investment SHALL be able to create a market listing to offer that investment for sale at a specified ask price.

#### Scenario: Investor creates listing successfully
- **WHEN** a KYC-verified investor submits a listing creation form with a valid `ask_price_cents` for an investment they own with status `active`
- **THEN** the system creates a `MarketListing` record with `status = active`, `seller_id`, `investment_id`, `ask_price_cents`, `platform_fee_cents`, `net_proceeds_cents`, `platform_fee_rate` (snapshotted from config), and `expires_at = null`
- **AND** the system transitions `investment.status` from `active` to `listed` atomically within a DB transaction
- **AND** an audit log entry is created with event type `listing_created`
- **AND** the investor is redirected to the listing detail page

#### Scenario: Listing rejected when investment is not active
- **WHEN** an investor attempts to create a listing for an investment with status other than `active` (e.g., `pending_payment`, `listed`, `matured`, `sold`, `cancelled`)
- **THEN** the system rejects the request
- **AND** displays an error: "Only active investments can be listed for sale."

#### Scenario: Listing rejected when investment already has an open listing
- **WHEN** an investor attempts to create a second listing for an investment that already has a listing with `status = active`
- **THEN** the system rejects the request
- **AND** displays an error: "This investment is already listed for sale."

#### Scenario: Listing rejected for unverified KYC
- **WHEN** a user without verified KYC attempts to create a listing
- **THEN** the system rejects the request with HTTP 403
- **AND** displays a message: "You must complete KYC verification before listing investments for sale."

#### Scenario: Ask price below investment cost rejected
- **WHEN** an investor submits an ask price less than the original `investment.amount_cents`
- **THEN** the system rejects the request
- **AND** displays an error: "Ask price cannot be lower than your original investment amount of [formatted amount]."

#### Scenario: Platform fee calculated and displayed
- **WHEN** an investor views the listing creation form and enters an ask price
- **THEN** the system displays: ask price, platform fee (ask_price × fee_rate), and net proceeds (ask_price − fee) in real time
- **AND** the fee rate is sourced from `config('treevest.secondary_market_fee_rate')`

---

### Requirement: Secondary Market Browse and Search
Any authenticated KYC-verified investor SHALL be able to browse active secondary market listings, filter by fruit type, farm, risk rating, and price range, and view listing details.

#### Scenario: Investor browses secondary market listings
- **WHEN** a KYC-verified investor navigates to `/secondary-market`
- **THEN** the system displays all listings with `status = active` owned by other investors, paginated (20 per page)
- **AND** each listing card shows: fruit type and variant, farm name, risk rating, ask price (RM), original investment amount, net proceeds to seller, days listed, tree lifecycle stage badge

#### Scenario: Investor filters listings by fruit type
- **WHEN** an investor selects a fruit type filter on the secondary market page
- **THEN** the system displays only listings where the investment's tree belongs to the selected fruit type

#### Scenario: Investor filters by price range
- **WHEN** an investor enters min and max ask price filters
- **THEN** the system displays only listings where `ask_price_cents` is within the specified range

#### Scenario: Investor views own active listing
- **WHEN** an investor views their own active listing at `/secondary-market/{listing_id}`
- **THEN** the system displays the listing details
- **AND** shows a "Cancel Listing" button (not a "Purchase" button)

#### Scenario: Investor views listing detail
- **WHEN** an investor navigates to `/secondary-market/{listing_id}` for a listing they do not own
- **THEN** the system displays: ask price, platform fee note, tree details (fruit type, variant, farm, ROI, lifecycle stage, harvest cycle), risk rating, investment history summary, transfer history, and a "Purchase" button
- **AND** the seller's identity is NOT disclosed (only investment details are shown)

#### Scenario: Seller cannot buy own listing
- **WHEN** an investor (who is the seller) attempts to purchase their own listing
- **THEN** the system rejects the request
- **AND** displays an error: "You cannot purchase your own listing."

---

### Requirement: Secondary Market Purchase Flow
A KYC-verified investor SHALL be able to purchase an active secondary market listing through the standard Stripe payment flow, resulting in atomic ownership transfer upon payment confirmation.

#### Scenario: Buyer initiates purchase
- **WHEN** a KYC-verified investor who is not the seller clicks "Purchase" on a listing with `status = active`
- **THEN** the system creates a Stripe PaymentIntent with `amount = listing.ask_price_cents`, `currency = listing.currency`, and metadata `{"type": "secondary_purchase", "listing_id": X}`
- **AND** creates a `Transaction` record with `type = secondary_purchase`, `status = pending`, linked to the listing
- **AND** redirects the buyer to the Stripe Elements payment page

#### Scenario: Payment confirmation triggers ownership transfer
- **WHEN** a `payment_intent.succeeded` webhook is received for a `secondary_purchase` transaction
- **THEN** `SecondaryMarketService::confirmPurchase()` is called within a DB transaction with `SELECT FOR UPDATE` on the listing row
- **AND** if `listing.status = active`, the system: updates `investment.user_id` to `buyer_id`, transitions `investment.status` from `listed` to `sold`, sets `listing.status = sold`, sets `listing.buyer_id` and `listing.purchased_at`, creates an `InvestmentTransfer` record
- **AND** dispatches a `ListingPurchased` event after the transaction commits

#### Scenario: Concurrent purchase attempt blocked
- **WHEN** two buyers simultaneously attempt to confirm purchase of the same listing
- **THEN** the `SELECT FOR UPDATE` lock ensures only one succeeds
- **AND** the second buyer's transaction finds `listing.status = sold` and receives an error: "This listing is no longer available."
- **AND** the second buyer's Stripe PaymentIntent is cancelled

#### Scenario: Duplicate webhook handled idempotently
- **WHEN** the `payment_intent.succeeded` webhook fires twice for the same listing purchase
- **THEN** the second invocation finds `listing.status = sold` and exits without re-processing
- **AND** no duplicate `InvestmentTransfer` record is created

#### Scenario: Purchase blocked for unverified KYC buyer
- **WHEN** a user without verified KYC attempts to initiate a purchase
- **THEN** the system rejects the request with HTTP 403
- **AND** displays a message: "You must complete KYC verification to purchase on the secondary market."

#### Scenario: Harvest payout recipient updated
- **WHEN** an ownership transfer is completed for an investment associated with a future scheduled harvest
- **THEN** the `investment.user_id` is now the buyer
- **AND** when the harvest later triggers payout creation, the payout is created for the buyer (current `investment.user_id`)
- **AND** the seller receives no future payouts for that investment

---

### Requirement: Listing Cancellation
An investor SHALL be able to cancel their own active listing before it is purchased, restoring the investment to `active` status.

#### Scenario: Seller cancels active listing
- **WHEN** an investor who owns the listing submits a cancellation request for a listing with `status = active`
- **THEN** the system transitions `listing.status` from `active` to `cancelled`, sets `listing.cancelled_at`
- **AND** transitions `investment.status` from `listed` back to `active`
- **AND** logs an audit event `listing_cancelled`
- **AND** redirects the seller to their portfolio

#### Scenario: Cancellation rejected for purchased listing
- **WHEN** an investor attempts to cancel a listing with `status = sold`
- **THEN** the system rejects the request
- **AND** displays an error: "This listing has already been purchased and cannot be cancelled."

#### Scenario: Unauthorized cancellation rejected
- **WHEN** a user who is not the listing seller attempts to cancel the listing
- **THEN** the system returns HTTP 403 Forbidden
- **AND** logs an audit event `unauthorized_listing_cancellation_attempt`

#### Scenario: Admin force-cancels a listing
- **WHEN** an admin submits a cancellation for any active listing via `DELETE /admin/market-listings/{id}`
- **THEN** the system transitions the listing to `cancelled` and the investment back to `active`
- **AND** logs an audit event `admin_listing_cancelled` with admin user ID

---

### Requirement: Investment Transfer History
The system SHALL maintain a queryable record of all ownership transfers for each investment, visible to the current investment owner and admins.

#### Scenario: Transfer history shown on investment detail page
- **WHEN** an investor views the detail page for an investment they currently own
- **THEN** the system displays a transfer history section listing all past ownership changes with: transfer date, from owner (anonymised: "Previous Investor"), transfer price (RM), and platform fee charged

#### Scenario: Admin views full transfer history
- **WHEN** an admin views an investment detail in the admin panel
- **THEN** the system displays the full transfer history with: from user ID and name, to user ID and name, transfer price, fee, transaction reference, and transfer date

---

### Requirement: Secondary Market Transaction Fee
The system SHALL deduct a configurable platform transaction fee from secondary market sale proceeds. The fee is calculated at listing creation, locked for the life of the listing, and credited to the platform on purchase confirmation.

#### Scenario: Fee snapshotted at listing creation
- **WHEN** a listing is created
- **THEN** `platform_fee_rate` is read from `config('treevest.secondary_market_fee_rate')` and stored in `market_listings.platform_fee_rate`
- **AND** `platform_fee_cents = ceil(ask_price_cents * platform_fee_rate)` is stored
- **AND** `net_proceeds_cents = ask_price_cents - platform_fee_cents` is stored

#### Scenario: Proceeds distributed on purchase
- **WHEN** a purchase is confirmed
- **THEN** the platform retains `platform_fee_cents` (logged as a platform revenue event in audit log)
- **AND** the seller receives `net_proceeds_cents` (disbursement is handled as a payout via EPIC-010 payment infrastructure)

#### Scenario: Fee rate change does not affect existing listings
- **WHEN** an admin changes `config('treevest.secondary_market_fee_rate')`
- **THEN** all existing active listings retain their snapshotted `platform_fee_rate`
- **AND** only new listings created after the change use the updated rate

---

### Requirement: Secondary Market KYC Gate
The system SHALL require KYC verification for all secondary market participants (both buyers and sellers).

#### Scenario: KYC middleware applied to secondary market routes
- **WHEN** any request is made to a secondary market route (create listing, purchase, cancel)
- **THEN** the `kyc-verified` middleware validates the authenticated user's KYC status
- **AND** users with `kyc_status` other than `verified` or with expired `kyc_expires_at` are redirected to the KYC verification page

#### Scenario: Browse page accessible without KYC
- **WHEN** a KYC-unverified investor navigates to `/secondary-market` (browse page)
- **THEN** the system displays active listings (read-only)
- **AND** "Purchase" and "Create Listing" buttons are disabled with a tooltip: "Complete KYC verification to participate in the secondary market"

---

### Requirement: Secondary Market Admin Oversight
Admins SHALL be able to view all secondary market listings, cancel any active listing, and view platform fee revenue from secondary sales.

#### Scenario: Admin views all listings
- **WHEN** an admin navigates to `/admin/market-listings`
- **THEN** the system displays all listings (all statuses) with filters by status, date range, fruit type, and seller
- **AND** each row shows: listing ID, seller (name/ID), investment ID, ask price, fee, status, created_at, purchased_at

#### Scenario: Admin views platform fee revenue
- **WHEN** an admin views the secondary market admin page
- **THEN** the system displays a summary: total listings (active, sold, cancelled), total platform fees collected (sum of `platform_fee_cents` for `status = sold`), and total transfer volume (sum of `ask_price_cents` for `status = sold`)
