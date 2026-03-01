## 1. Database & Enums

- [ ] 1.1 Create migration `create_market_listings_table` (id, investment_id FK, seller_id FK, ask_price_cents, currency, platform_fee_rate, platform_fee_cents, net_proceeds_cents, status ENUM, buyer_id FK null, purchased_at null, cancelled_at null, expires_at null, notes text null, metadata json null, timestamps)
- [ ] 1.2 Add indexes: `investment_id`, `seller_id`, `status`, `buyer_id` on `market_listings`
- [ ] 1.3 Create migration `create_investment_transfers_table` (id, investment_id FK, listing_id FK, from_user_id FK, to_user_id FK, transfer_price_cents, platform_fee_cents, transaction_id FK null, transferred_at, timestamps)
- [ ] 1.4 Create `app/Enums/ListingStatus.php` backed enum with cases: `Active`, `Sold`, `Cancelled`
- [ ] 1.5 Add `Listed` case to `app/Enums/InvestmentStatus.php`
- [ ] 1.6 Add `secondary_purchase` case to `app/Enums/TransactionType.php` (if enum exists)
- [ ] 1.7 Add `secondary_sale` case to the notification type enum (if PHP enum) or seeder for `notification_preferences`

## 2. Models

- [ ] 2.1 Create `app/Models/MarketListing.php` with fillable, casts (`status` → `ListingStatus`, monetary integers), relationships (`investment()`, `seller()`, `buyer()`)
- [ ] 2.2 Create `app/Models/InvestmentTransfer.php` with fillable, casts, relationships (`investment()`, `listing()`, `fromUser()`, `toUser()`, `transaction()`)
- [ ] 2.3 Update `app/Models/Investment.php`: add `hasMany(MarketListing::class)` and `hasMany(InvestmentTransfer::class)` relationships; update `$casts` for `status` to include `listed` and `sold`
- [ ] 2.4 Update `app/Models/User.php`: add `hasMany(MarketListing::class, 'seller_id')` relationship

## 3. Service & Business Logic

- [ ] 3.1 Create `app/Services/SecondaryMarketService.php` with:
  - `createListing(User $seller, Investment $investment, int $askPriceCents): MarketListing`
  - `cancelListing(MarketListing $listing, User $actor): void` (actor can be seller or admin)
  - `initiatePurchase(MarketListing $listing, User $buyer): Transaction`
  - `confirmPurchase(MarketListing $listing, Transaction $transaction): InvestmentTransfer` (uses `DB::transaction()` + `lockForUpdate()`)
  - `expireListings(): int` (for scheduled command)
- [ ] 3.2 Add config key `treevest.secondary_market_fee_rate` (default `0.02`) to `config/treevest.php`

## 4. Events & Listeners

- [ ] 4.1 Create `app/Events/ListingPurchased.php` with listing, transfer, buyer, seller
- [ ] 4.2 Create `app/Listeners/NotifySellerOfSale.php` (listens to `ListingPurchased`, sends `secondary_sale` notification to seller)
- [ ] 4.3 Create `app/Listeners/NotifyBuyerOfPurchase.php` (listens to `ListingPurchased`, sends `secondary_sale` notification to buyer)
- [ ] 4.4 Register event and listeners in `app/Providers/EventServiceProvider.php`
- [ ] 4.5 Create `app/Console/Commands/ExpireStaleListings.php` console command (transitions expired `active` listings to `cancelled`)
- [ ] 4.6 Register `ExpireStaleListings` in `app/Console/Kernel.php` schedule (daily)

## 5. HTTP Layer

- [ ] 5.1 Create `app/Http/Requests/StoreMarketListingRequest.php` (validate: ask_price_cents integer > 0, investment_id, KYC authorized check)
- [ ] 5.2 Create `app/Http/Requests/PurchaseMarketListingRequest.php` (validate: payment_method_id or new card data, KYC authorized check)
- [ ] 5.3 Create `app/Http/Controllers/SecondaryMarket/ListingController.php` (`index`, `show`, `create`, `store`, `destroy` — Inertia responses)
- [ ] 5.4 Create `app/Http/Controllers/SecondaryMarket/PurchaseController.php` (`store`, `confirm` — initiate and confirm purchase)
- [ ] 5.5 Create `app/Http/Controllers/Admin/MarketListingController.php` (`index`, `destroy` for admin oversight)
- [ ] 5.6 Add secondary market routes to `routes/web.php`: `GET /secondary-market`, `GET /secondary-market/{listing}`, `GET /secondary-market/create`, `POST /secondary-market`, `DELETE /secondary-market/{listing}`, `POST /secondary-market/{listing}/purchase`, admin routes under `/admin/market-listings`
- [ ] 5.7 Extend `ProcessStripeWebhook` job handler to route `secondary_purchase` transaction type to `SecondaryMarketService::confirmPurchase()`

## 6. Frontend

- [ ] 6.1 Create `resources/js/Pages/SecondaryMarket/Index.tsx` (browse with filter controls: fruit type, price range, risk rating; paginated listing cards)
- [ ] 6.2 Create `resources/js/Pages/SecondaryMarket/Show.tsx` (listing detail with tree info, fee breakdown, Purchase button or Cancel Listing button)
- [ ] 6.3 Create `resources/js/Pages/SecondaryMarket/Create.tsx` (listing creation form: ask price input, real-time fee/proceeds calculation, risk disclosure)
- [ ] 6.4 Update `resources/js/Pages/Investments/Show.tsx` to add "List for Sale" button (when `status = active`) and "Cancel Listing" button (when `status = listed`)
- [ ] 6.5 Update `resources/js/Pages/Investments/Show.tsx` to show Investment Transfer History section
- [ ] 6.6 Update `resources/js/types/index.d.ts`: add `MarketListing`, `InvestmentTransfer` TypeScript interfaces
- [ ] 6.7 Update notification preference matrix in `resources/js/Pages/Settings/Notifications.tsx` to include `secondary_sale` row

## 7. Notifications

- [ ] 7.1 Create `app/Notifications/SecondarySaleSoldNotification.php` (for seller, `secondary_sale` type, email + database + SMS channels)
- [ ] 7.2 Create `app/Notifications/SecondarySalePurchasedNotification.php` (for buyer, `secondary_sale` type, email + database + SMS channels)
- [ ] 7.3 Update notification preference seeder/migration to include `secondary_sale` type with defaults (email=enabled, database=enabled, sms=enabled, push=disabled)
- [ ] 7.4 Add `secondary_sale` translations to `lang/en/notifications.php` and `lang/id/notifications.php`

## 8. Tests

- [ ] 8.1 `tests/Unit/SecondaryMarketServiceTest.php`: test `createListing` validations (not active, already listed, ask < cost, KYC check), fee calculation, `cancelListing` state transitions
- [ ] 8.2 `tests/Feature/SecondaryMarketPurchaseTest.php`: test happy path (initiate → Stripe webhook → ownership transfer), concurrent purchase (two requests race — second gets error), duplicate webhook idempotency
- [ ] 8.3 `tests/Feature/SecondaryMarketListingTest.php`: test browse (paginated, filter by fruit type, price range), create (form validation), cancel (seller OK, non-seller 403, already sold error)
- [ ] 8.4 `tests/Feature/AdminMarketListingTest.php`: test admin index view, admin force cancel
- [ ] 8.5 Verify `investment.status` transitions: active→listed, listed→active, listed→sold; invalid transitions rejected

## 9. Post-Implementation

- [ ] 9.1 Run `./vendor/bin/pint` to enforce PSR-12
- [ ] 9.2 Run `php artisan test` — all tests green
- [ ] 9.3 Update `AGENTS.md` (root) to document `MarketListing`, `InvestmentTransfer` models and the `listed` + `sold` investment status cases in the data models section
