## ADDED Requirements

### Requirement: Wishlist Item Storage
The system SHALL allow authenticated investors to save trees, farms, and fruit crops to a personal wishlist for future reference.

#### Scenario: Investor adds a tree to wishlist from marketplace card
- **WHEN** an authenticated investor clicks the heart/bookmark icon on a tree card in the marketplace
- **THEN** the system creates a `WishlistItem` record with `user_id`, `wishlistable_type = App\Models\Tree`, `wishlistable_id`, and `created_at`
- **AND** the icon updates to its filled/active state immediately (optimistic UI)
- **AND** the system returns a success response confirming the item was saved

#### Scenario: Investor adds a tree to wishlist from tree detail page
- **WHEN** an authenticated investor clicks the "Save to Wishlist" button on a tree detail page
- **THEN** the system creates a `WishlistItem` record for that tree
- **AND** the button label changes to "Saved to Wishlist" with an active icon state

#### Scenario: Investor adds a farm to wishlist
- **WHEN** an authenticated investor clicks the "Save to Wishlist" button on a farm profile page
- **THEN** the system creates a `WishlistItem` record with `wishlistable_type = App\Models\Farm`
- **AND** the button changes to "Saved to Wishlist"

#### Scenario: Investor adds a fruit crop to wishlist
- **WHEN** an authenticated investor clicks "Save to Wishlist" on a fruit crop detail page
- **THEN** the system creates a `WishlistItem` record with `wishlistable_type = App\Models\FruitCrop`
- **AND** the button changes to "Saved to Wishlist"

#### Scenario: Duplicate wishlist entry rejected
- **WHEN** an investor attempts to add an item already in their wishlist
- **THEN** the system returns a 422 response with message: "This item is already in your wishlist."
- **AND** no duplicate `WishlistItem` record is created (enforced by unique constraint on `user_id + wishlistable_type + wishlistable_id`)

#### Scenario: Unauthenticated user cannot add to wishlist
- **WHEN** an unauthenticated user attempts to add an item to the wishlist
- **THEN** the system redirects to the login page
- **AND** after successful login, returns the user to the page they were on

---

### Requirement: Wishlist Item Removal
The system SHALL allow investors to remove items from their wishlist.

#### Scenario: Investor removes a tree from wishlist via marketplace card
- **WHEN** an authenticated investor clicks the filled/active heart/bookmark icon on a tree card that is already in their wishlist
- **THEN** the system deletes the corresponding `WishlistItem` record
- **AND** the icon returns to its unfilled/inactive state immediately (optimistic UI)

#### Scenario: Investor removes an item from the wishlist page
- **WHEN** an authenticated investor clicks the "Remove" button or trash icon next to an item on the wishlist page
- **THEN** the system deletes the `WishlistItem` record
- **AND** the item is removed from the list without a full page reload

#### Scenario: Removing a non-existent wishlist item returns not found
- **WHEN** an investor attempts to remove a `WishlistItem` that does not belong to them or does not exist
- **THEN** the system returns a 404 Not Found response

---

### Requirement: Wishlist Page Display
The system SHALL provide a dedicated wishlist page at `/investor/wishlist` listing all saved items grouped by entity type.

#### Scenario: Investor views wishlist page with saved items
- **WHEN** an authenticated investor navigates to `/investor/wishlist`
- **THEN** the system displays the wishlist page rendered via Inertia with component `Investor/Wishlist.tsx`
- **AND** items are grouped into three sections: "Trees" (with tree card summary), "Farms" (with farm card summary), "Fruit Crops" (with crop card summary)
- **AND** each section shows the count of saved items (e.g., "Trees (3)")
- **AND** sections with zero items are hidden

#### Scenario: Tree wishlist item card
- **WHEN** a tree is displayed in the wishlist
- **THEN** the card shows: tree identifier, fruit type and variant, price_cents (formatted), expected ROI, risk badge, tree lifecycle stage badge, "Invest Now" button (if tree is investable and KYC is verified), "View Details" link, "Remove" icon button

#### Scenario: Farm wishlist item card
- **WHEN** a farm is displayed in the wishlist
- **THEN** the card shows: farm name, location (city, country), active crops count, farm status badge, "View Farm" link, "Remove" icon button

#### Scenario: Fruit crop wishlist item card
- **WHEN** a fruit crop is displayed in the wishlist
- **THEN** the card shows: fruit type name, variant, harvest cycle, farm name, "View Crop" link, "Remove" icon button

#### Scenario: Empty wishlist state
- **WHEN** an authenticated investor navigates to the wishlist page with no saved items
- **THEN** the system displays an empty state with: illustration or icon, message "Your wishlist is empty", subtitle "Save trees, farms, and crops you're interested in to review them later", "Browse Marketplace" button linking to `/trees`

#### Scenario: Non-investor cannot access wishlist page
- **WHEN** a user with role `admin` or `farm_owner` attempts to access `/investor/wishlist`
- **THEN** the system returns HTTP 403 Forbidden

---

### Requirement: Wishlist State Propagation to Marketplace
The system SHALL pass the authenticated investor's wishlist item IDs to the tree marketplace and tree detail pages so the UI can render wishlist state accurately without additional requests.

#### Scenario: Marketplace page includes wishlist state
- **WHEN** an authenticated investor loads the tree marketplace page
- **THEN** the Inertia props include a `wishlistedTreeIds` array containing the IDs of all trees in the investor's wishlist
- **AND** each tree card renders its heart/bookmark icon in the active (filled) state if the tree's ID is in `wishlistedTreeIds`

#### Scenario: Tree detail page includes wishlist state
- **WHEN** an authenticated investor loads a tree detail page
- **THEN** the Inertia props include an `isWishlisted` boolean indicating whether this tree is in the investor's wishlist
- **AND** the "Save to Wishlist" / "Saved to Wishlist" button renders accordingly

#### Scenario: Guest user sees no wishlist state
- **WHEN** an unauthenticated user loads the tree marketplace or tree detail page
- **THEN** `wishlistedTreeIds` is an empty array and `isWishlisted` is `false`
- **AND** the heart/bookmark icon is shown in inactive state with a tooltip "Sign in to save"

---

### Requirement: Wishlist Notifications — Availability Alert
The system SHALL notify investors when a wishlisted tree's lifecycle stage transitions to investable (`growing` or `productive`).

#### Scenario: Wishlisted tree becomes investable
- **WHEN** a tree's `status` transitions from `seedling` to `growing` or `productive`
- **AND** one or more investors have that tree in their wishlist
- **THEN** the system dispatches a `WishlistTreeAvailableNotification` job for each investor
- **AND** the notification is delivered via email and database channels
- **AND** the email subject is: "A tree on your wishlist is now available for investment"
- **AND** the notification body includes: tree identifier, fruit type, variant, farm name, price, expected ROI, link to tree detail page

#### Scenario: Notification not sent for already-investable tree
- **WHEN** a tree already has status `growing` or `productive` and is updated without a status change
- **THEN** no wishlist availability notification is dispatched

---

### Requirement: Wishlist Notifications — Price Change Alert
The system SHALL notify investors when a wishlisted tree's `price_cents` changes.

#### Scenario: Wishlisted tree price changes
- **WHEN** a tree's `price_cents` is updated to a new value
- **AND** one or more investors have that tree in their wishlist
- **THEN** the system dispatches a `WishlistTreePriceChangedNotification` job for each affected investor
- **AND** the notification is delivered via email and database channels
- **AND** the notification includes: tree identifier, old price, new price (formatted), percentage change, link to tree detail page
- **AND** the notification is only sent if the price actually changed (old_price ≠ new_price)

#### Scenario: Price change notification respects user notification preferences
- **WHEN** an investor has disabled the `wishlist_price_change` notification type in their notification preferences
- **THEN** the system does not send the price change notification to that investor

---

### Requirement: Wishlist Data Model
The system SHALL implement a `wishlist_items` table using polymorphic morphable relationships to support multiple entity types.

#### Scenario: WishlistItem model has correct structure
- **WHEN** a WishlistItem is created
- **THEN** the record contains: `id`, `user_id` (FK to users), `wishlistable_type` (App\Models\Tree | App\Models\Farm | App\Models\FruitCrop), `wishlistable_id`, `created_at`, `updated_at`
- **AND** a unique constraint exists on (`user_id`, `wishlistable_type`, `wishlistable_id`)
- **AND** the `WishlistItem` model uses a `morphTo()` relationship named `wishlistable`
- **AND** `Tree`, `Farm`, and `FruitCrop` models each have a `wishlistItems()` `morphMany` relationship

#### Scenario: Cascade delete on user removal
- **WHEN** a user account is deleted
- **THEN** all associated `WishlistItem` records are deleted via cascade on the foreign key

#### Scenario: Cascade delete when wishlistable entity is deleted
- **WHEN** a `Tree`, `Farm`, or `FruitCrop` is soft-deleted
- **THEN** corresponding `WishlistItem` records are NOT automatically deleted (soft-delete on the entity; wishlist items remain until user removes them or entity is force-deleted)
- **AND** the wishlist page shows a "No longer available" badge for wishlist items whose entity has been soft-deleted
