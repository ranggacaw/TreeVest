# Change: Add Fruit Crop & Tree Catalog System

## Why

Investors need granular visibility into investable fruit trees organized by crop type and variant, with detailed information (price, ROI, risk, harvest cycle) to make informed investment decisions. Trees are the core investable units of the platform — this change establishes the hierarchical catalog (Farm > Crop > Tree) that powers the investment marketplace.

## What Changes

- **New Data Models**: Add `FruitCrop` (fruit type + variant within a farm) and `Tree` (individual investable unit) Eloquent models with relationships to `Farm`
- **Reference Data System**: Implement fruit type/variant reference data as Laravel seeders (Durian → Musang King/D24, Mango → Alphonso/Nam Doc Mai, etc.)
- **Tree Lifecycle Management**: Add tree status enum (`seedling`, `growing`, `productive`, `declining`, `retired`) with manual updates by farm owners
- **Pricing System**: Implement formula-based tree pricing using configurable factors (base price, tree age coefficient, crop type premium, risk adjustment) — prices auto-recalculate on tree attribute changes
- **Risk Rating System**: Allow farm owners to manually assign risk ratings (`low`, `medium`, `high`) per tree during creation/editing
- **Historical Yield Tracking**: Add `TreeHarvest` model to record harvest history; display "No historical data" for new trees
- **Marketplace Browsing**: Add investor-facing pages for searching/filtering trees by fruit type, variant, ROI range, risk level, price, and harvest cycle
- **Farm Owner Management**: Add farm owner pages for creating/managing crops and trees within their farms
- **Admin Reference Data Management**: Add admin CRUD for fruit types/variants
- **Investment Availability**: Only trees with status `productive` or `growing` are available for investment

## Impact

### Affected Specs
- **NEW SPEC**: `fruit-crop-catalog` — Crop and tree data model, reference data, farm owner management
- **NEW SPEC**: `tree-marketplace` — Investor browsing, filtering, search, and detail pages
- **NEW SPEC**: `tree-pricing` — Formula-based pricing logic and configuration
- **MODIFIED**: `user-authorization` — Add farm owner permissions for crop/tree management
- **MODIFIED**: `audit-logging` — Add event types for crop/tree operations

### Affected Code
- **New Models**: `app/Models/FruitType.php`, `app/Models/FruitCrop.php`, `app/Models/Tree.php`, `app/Models/TreeHarvest.php`
- **New Enums**: `app/Enums/TreeLifecycleStage.php`, `app/Enums/RiskRating.php`, `app/Enums/HarvestCycle.php`
- **New Services**: `app/Services/TreePricingService.php`, `app/Services/TreeFilterService.php`
- **New Seeders**: `database/seeders/FruitTypeSeeder.php`
- **New Migrations**: `create_fruit_types_table`, `create_fruit_crops_table`, `create_trees_table`, `create_tree_harvests_table`
- **New Controllers**: `app/Http/Controllers/FarmOwner/FruitCropController.php`, `app/Http/Controllers/FarmOwner/TreeController.php`, `app/Http/Controllers/TreeMarketplaceController.php`, `app/Http/Controllers/Admin/FruitTypeController.php`
- **New FormRequests**: `StoreFruitCropRequest`, `UpdateFruitCropRequest`, `StoreTreeRequest`, `UpdateTreeRequest`
- **New Pages**: `resources/js/Pages/Trees/Index.tsx`, `resources/js/Pages/Trees/Show.tsx`, `resources/js/Pages/FarmOwner/Crops/Index.tsx`, `resources/js/Pages/FarmOwner/Trees/Create.tsx`, `resources/js/Pages/FarmOwner/Trees/Edit.tsx`
- **Routes**: New route groups for farm owner crop/tree management and public tree marketplace

### Dependencies
- **PREREQUISITE**: EPIC-004 (Farm Listing) must be implemented — requires `Farm` model with status management
- **BLOCKS**: EPIC-006 (Investment Purchase) — cannot purchase investments without tree catalog
- **BLOCKS**: EPIC-009 (Harvest & Returns) — harvest tracking requires tree catalog

### Breaking Changes
None — this is net-new functionality.
