# Change: Farm Owner Tree Inventory, Geolocation, Agrotourism & Profit Split

## Why

Farm Owners need a comprehensive management experience to accurately represent their farm's investment capacity — including per-crop tree counts, GPS coordinates for map-based discovery, and agrotourism event management for investor engagement. The platform also lacks a defined profit split: the current `ProfitCalculationService` distributes 100% of harvest revenue to investors, but the business model requires a fixed 60/40 (Farm Owner / Investor) split.

## What Changes

- **BREAKING** — `ProfitCalculationService::calculate()` now applies a 60/40 split: investor pool receives 40% of `net_harvest_revenue` before proportional distribution. All existing profit-calculation scenarios are updated to reflect this.
- `fruit_crops` table gains `total_trees` (unsigned int) and `productive_trees` (unsigned int) columns; `FruitCrop` model is updated with validation (`productive_trees <= total_trees`).
- ROI projections and harvest payout calculations reference `productive_trees` exclusively, not `total_trees`.
- `farms.latitude` and `farms.longitude` columns already exist in the migration (string 20); this change upgrades the map picker UI and adds GPS-range validation at the form-request level. An interactive Google Maps JS SDK picker is added.
- New `agrotourism_events` table and `agrotourism_registrations` table with full Eloquent models, service, enums, controllers (FarmOwner, Investor, Admin), and Inertia pages.
- Agrotourism event registration requires authentication only (no KYC gate).
- Profit split ratio (60/40) is displayed on investment detail pages, farm profiles, and payout summaries.

## Impact

- **Affected specs:** `fruit-crop-catalog`, `farm-management`, `profit-calculation`, new `agrotourism-events`
- **Affected code:**
  - `app/Services/ProfitCalculationService.php` — **BREAKING** split logic
  - `app/Models/FruitCrop.php` — new columns
  - `database/migrations/` — two new migrations, one column-add migration
  - `app/Models/AgrotourismEvent.php`, `app/Models/AgrotourismRegistration.php` — new
  - `app/Services/AgrotourismService.php` — new
  - `app/Enums/AgrotourismEventType.php`, `app/Enums/AgrotourismRegistrationStatus.php` — new
  - `app/Http/Controllers/FarmOwner/AgrotourismController.php` — new
  - `app/Http/Controllers/Investor/AgrotourismController.php` — new
  - `app/Http/Controllers/Admin/AgrotourismController.php` — new
  - `app/Http/Requests/StoreAgrotourismEventRequest.php`, `UpdateAgrotourismEventRequest.php`, `StoreAgrotourismRegistrationRequest.php` — new
  - `app/Events/AgrotourismRegistrationConfirmed.php`, `AgrotourismEventCancelled.php` — new
  - `app/Listeners/` — new notification listeners
  - `resources/js/Pages/FarmOwner/Agrotourism/` — new pages (Index, Create, Edit, Show)
  - `resources/js/Pages/Investor/Agrotourism/Index.tsx` — new
  - `resources/js/Components/MapPicker.tsx` — new
  - `resources/js/Components/AgrotourismEventCard.tsx` — new
  - `resources/js/Pages/Farms/Show.tsx` — GPS map embed + agrotourism section
  - `resources/js/Pages/FarmOwner/Farms/Edit.tsx` — tree inventory fields + map picker
  - `resources/js/Pages/Investments/Show.tsx` — 60/40 split label
  - `routes/web.php` — new agrotourism routes
