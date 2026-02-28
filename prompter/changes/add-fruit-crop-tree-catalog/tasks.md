# Implementation Tasks

## 1. Database Schema & Migrations
- [x] 1.1 Create `create_fruit_types_table` migration (id, name, slug, description, is_active, timestamps)
- [x] 1.2 Create `create_fruit_crops_table` migration (id, farm_id FK, fruit_type_id FK, variant, description, harvest_cycle enum, planted_date, timestamps)
- [x] 1.3 Create `create_trees_table` migration (id, fruit_crop_id FK, tree_identifier, price_cents, expected_roi_percent, age_years, productive_lifespan_years, risk_rating enum, min_investment_cents, max_investment_cents, status enum, historical_yield_json, pricing_config_json, timestamps, soft deletes)
- [x] 1.4 Create `create_tree_harvests_table` migration (id, tree_id FK, harvest_date, estimated_yield_kg, actual_yield_kg, quality_grade, notes, timestamps)
- [x] 1.5 Add indexes: `fruit_crops(farm_id, fruit_type_id)`, `trees(fruit_crop_id, status)`, `trees(status, price_cents)`, `tree_harvests(tree_id, harvest_date)`

## 2. Enums
- [x] 2.1 Create `TreeLifecycleStage` enum (seedling, growing, productive, declining, retired)
- [x] 2.2 Create `RiskRating` enum (low, medium, high)
- [x] 2.3 Create `HarvestCycle` enum (annual, biannual, seasonal)

## 3. Eloquent Models
- [x] 3.1 Create `FruitType` model with relationships: `hasMany(FruitCrop)`
- [x] 3.2 Create `FruitCrop` model with relationships: `belongsTo(Farm)`, `belongsTo(FruitType)`, `hasMany(Tree)`
- [x] 3.3 Create `Tree` model with relationships: `belongsTo(FruitCrop)`, `hasMany(TreeHarvest)`, `hasMany(Investment)` (future), casts: `status`, `risk_rating`, `historical_yield` (array), `pricing_config` (array), accessors: `priceFormatted`, `expectedRoiFormatted`, scopes: `investable()`, `byFruitType()`, `byRiskRating()`, `byPriceRange()`
- [x] 3.4 Create `TreeHarvest` model with relationships: `belongsTo(Tree)`, casts: `harvest_date` (date)
- [x] 3.5 Add relationships to `Farm` model: `hasMany(FruitCrop)`

## 4. Seeders & Reference Data
- [x] 4.1 Create `FruitTypeSeeder` with PRD fruit types: Durian (variants: Musang King, D24, Black Thorn, Red Prawn), Mango (Alphonso, Nam Doc Mai, Carabao, Kent), Grapes (Thompson Seedless, Concord, Shine Muscat), Melon (Honeydew, Cantaloupe, Yubari King), Citrus (Valencia Orange, Meyer Lemon, Pomelo), Others (Avocado, Longan, Rambutan, Mangosteen)
- [x] 4.2 Run seeder in `DatabaseSeeder`

## 5. Services
- [x] 5.1 Create `TreePricingService` with method `calculatePrice(Tree $tree): int` using formula: `base_price * (1 + age_coefficient * age_years) * crop_premium * risk_multiplier` — coefficients stored in tree `pricing_config_json`
- [x] 5.2 Create `TreeFilterService` with method `applyFilters(Builder $query, array $filters): Builder` handling: fruit_type, variant, price_min, price_max, roi_min, roi_max, risk_rating, harvest_cycle, status
- [x] 5.3 Add `TreePricingService::updateTreePrice(Tree $tree)` to recalculate and save price when tree attributes change

## 6. FormRequests
- [x] 6.1 Create `StoreFruitCropRequest` with validation: farm_id (exists), fruit_type_id (exists), variant (required, max 100), harvest_cycle (in enum), planted_date (date, nullable), description (max 1000, NoXss)
- [x] 6.2 Create `UpdateFruitCropRequest` (same as Store)
- [x] 6.3 Create `StoreTreeRequest` with validation: fruit_crop_id (exists), tree_identifier (required, unique per crop, max 50), age_years (integer, min 0, max 100), productive_lifespan_years (integer, min age_years), risk_rating (in enum), min_investment_cents (integer, min 1), max_investment_cents (integer, gte min), status (in enum), pricing_config (array with base_price, age_coefficient, crop_premium, risk_multiplier)
- [x] 6.4 Create `UpdateTreeRequest` (same as Store, with status transition validation)
- [x] 6.5 Create `UpdateTreeStatusRequest` with validation: status (in enum, valid transition from current status)

## 7. Farm Owner Controllers
- [x] 7.1 Create `FarmOwner/FruitCropController` with methods: `index()` (list crops for owner's farms), `create()` (form with farm and fruit type selection), `store()`, `edit()`, `update()`, `destroy()` (soft delete if no trees exist)
- [x] 7.2 Create `FarmOwner/TreeController` with methods: `index()` (list trees for owner's crops), `create()` (form with crop selection), `store()` (call TreePricingService), `edit()`, `update()` (recalculate price), `updateStatus()` (manual status transition)
- [x] 7.3 Add authorization checks: farm owner can only manage crops/trees for farms they own

## 8. Public Marketplace Controllers
- [x] 8.1 Create `TreeMarketplaceController` with methods: `index()` (paginated tree list with filters using TreeFilterService, only investable trees), `show($id)` (tree detail with crop, farm, historical harvests, risk disclosure)
- [x] 8.2 Add route middleware: public access (no auth required for browsing)

## 9. Admin Controllers
- [x] 9.1 Create `Admin/FruitTypeController` with methods: `index()` (list all fruit types), `create()`, `store()`, `edit()`, `update()`, `destroy()` (soft delete if no crops exist)
- [x] 9.2 Add route middleware: `role:admin`

## 10. Routes
- [x] 10.1 Add farm owner routes group: `Route::middleware(['auth', 'role:farm_owner'])->prefix('farm-owner')->group(...)` with routes for crops and trees
- [x] 10.2 Add public marketplace routes: `Route::get('/trees', [TreeMarketplaceController, 'index'])->name('trees.index')`, `Route::get('/trees/{tree}', [TreeMarketplaceController, 'show'])->name('trees.show')`
- [x] 10.3 Add admin routes group: `Route::middleware(['auth', 'role:admin'])->prefix('admin')->group(...)` with routes for fruit types

## 11. React Pages (Farm Owner)
- [x] 11.1 Create `Pages/FarmOwner/Crops/Index.tsx` — table of crops grouped by farm, status indicators, links to tree management
- [x] 11.2 Create `Pages/FarmOwner/Crops/Create.tsx` — form with farm dropdown (owner's farms only), fruit type dropdown, variant input, harvest cycle select, planted date picker
- [x] 11.3 Create `Pages/FarmOwner/Crops/Edit.tsx` — same form as Create, pre-filled
- [x] 11.4 Create `Pages/FarmOwner/Trees/Index.tsx` — table of trees grouped by crop, status badges, price display, quick status update dropdown
- [x] 11.5 Create `Pages/FarmOwner/Trees/Create.tsx` — form with crop dropdown (owner's crops only), tree identifier input, age input, lifespan input, risk rating radio buttons, min/max investment inputs, status select, pricing config inputs (base price, coefficients), calculated price preview
- [x] 11.6 Create `Pages/FarmOwner/Trees/Edit.tsx` — same form as Create, pre-filled, price recalculates on change

## 12. React Pages (Public Marketplace)
- [x] 12.1 Create `Pages/Trees/Index.tsx` — grid of tree cards with image (from farm), fruit type, variant, price, expected ROI, risk badge, harvest cycle indicator; filter sidebar with fruit type checkboxes, variant search, price range slider, ROI range slider, risk checkboxes, harvest cycle checkboxes; sorting dropdown (price, ROI, newest)
- [x] 12.2 Create `Pages/Trees/Show.tsx` — tree detail page with breadcrumb (Farm > Crop > Tree), tree attributes (age, lifespan, status, risk), pricing (price, min/max investment, expected ROI), harvest cycle info, historical yield chart (or "No data" message), farm profile link, risk disclosure banner, "Invest Now" button (if investable)
- [x] 12.3 Create `Components/TreeCard.tsx` — reusable tree card component
- [x] 12.4 Create `Components/RiskBadge.tsx` — colored badge for low/medium/high risk
- [x] 12.5 Create `Components/HarvestCycleIcon.tsx` — icon representation of harvest cycle

## 13. React Pages (Admin)
- [x] 13.1 Create `Pages/Admin/FruitTypes/Index.tsx` — table of fruit types with variant count, active status toggle, edit/delete actions
- [x] 13.2 Create `Pages/Admin/FruitTypes/Create.tsx` — form with name, slug, description
- [x] 13.3 Create `Pages/Admin/FruitTypes/Edit.tsx` — same form as Create, pre-filled

## 14. Events & Audit Logging
- [x] 14.1 Dispatch `FruitCropCreated`, `FruitCropUpdated`, `FruitCropDeleted` events
- [x] 14.2 Dispatch `TreeCreated`, `TreeUpdated`, `TreeDeleted`, `TreeStatusChanged` events
- [x] 14.3 Add audit log listeners for all events with contextual data (farm_id, crop_id, tree_id, old/new values)

## 15. Testing
- [x] 15.1 Unit test `TreePricingService::calculatePrice()` with various input combinations
- [x] 15.2 Unit test `TreeFilterService::applyFilters()` with each filter type
- [x] 15.3 Feature test farm owner crop CRUD: authorization (owner only), validation, audit logs
- [x] 15.4 Feature test farm owner tree CRUD: authorization, price calculation on create/update, status transitions
- [x] 15.5 Feature test public marketplace: filter combinations, pagination, tree detail access (investable only)
- [x] 15.6 Feature test admin fruit type CRUD: authorization (admin only), soft delete prevents deletion if crops exist
- [x] 15.7 Test tree status transitions: seedling → growing → productive → declining → retired (sequential only)
- [x] 15.8 Test investable scope: only productive/growing trees returned in marketplace

## 16. Validation Edge Cases
- [x] 16.1 Test tree creation fails if fruit_crop belongs to a different farm than farm owner
- [x] 16.2 Test tree price recalculation on age_years update
- [x] 16.3 Test tree cannot be deleted if investments exist (future, add check in controller)
- [x] 16.4 Test crop cannot be deleted if trees exist

## 17. Configuration
- [x] 17.1 Add pricing defaults to `config/treevest.php`: `tree_pricing` (default_base_price, default_age_coefficient, default_crop_premium, default_risk_multipliers [low, medium, high])

## Post-Implementation
- [x] Update root AGENTS.md Section 6 (Data Models) to reflect FruitCrop, Tree, TreeHarvest entities and relationships
- [x] Update root AGENTS.md Section 7 (Domain Vocabulary) to add definitions for Tree Identifier, Productive Lifespan, Pricing Config
- [x] Update root AGENTS.md Section 10 (Integration Map) if any external services needed (none expected)
