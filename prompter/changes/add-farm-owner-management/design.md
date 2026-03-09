## Context

This change introduces four cross-cutting concerns to the Treevest platform — all originating from the Farm Owner Management epic:

1. **Tree Inventory** — adds `total_trees` / `productive_trees` per `FruitCrop`, constrains ROI calculations.
2. **GPS Map Picker** — activates the already-stored lat/lng columns with UI and validation.
3. **Agrotourism Events** — entirely new bounded context (two new tables, new service, three new controller namespaces, multiple Inertia pages).
4. **60/40 Profit Split** — breaking change to `ProfitCalculationService`.

## Goals / Non-Goals

**Goals:**
- Accurate tree inventory per crop with validation
- GPS coordinate validation and interactive Google Maps picker
- Agrotourism event CRUD with investor registration
- Fixed 60/40 profit split enforced in calculation service

**Non-Goals:**
- Per-farm configurable split ratios
- Ticketing / payment for agrotourism events
- Mobile app support
- Virtual tours or gamification
- Farm owner payout pipeline for the 60% share

## Decisions

### Map Provider: Google Maps JS SDK
- **Rationale:** Already listed as a `High` priority external dependency in `prompter/project.md`. More familiar UX for end users. Laravel project already uses Google Maps for `ST_Distance_Sphere` in `Farm::scopeSearchNearby()`.
- **Integration approach:** Load the Maps JS SDK via the `@googlemaps/js-api-loader` npm package. API key stored in `.env` as `GOOGLE_MAPS_API_KEY`, exposed to frontend via `config/services.php` → Inertia shared props.
- **Alternative considered:** Mapbox GL JS — more customizable, generous free tier. Rejected because it would split the map dependency (backend uses Google, frontend would use Mapbox).

### Tree Inventory: Per-FruitCrop, Not Per-Tree
- **Rationale:** Epic explicitly states productive trees are defined at the `FruitCrop` level (species × farm combination). Individual `Tree` records already exist as the investable unit; adding counts at the crop level avoids denormalization against the `trees` table.
- **Validation:** `productive_trees <= total_trees` enforced in `FruitCrop` Eloquent model boot hook and FormRequest rules.
- **ROI impact:** `Tree.expected_roi_percent` is displayed to investors; the epic requires this to reference productive trees. Because ROI is currently stored per-tree (not computed from total_trees), the existing per-tree ROI field remains the display source — the `total_trees`/`productive_trees` fields are informational for farm owner reporting and future yield estimation features. Payout calculation already operates at the `Investment→Tree→Harvest` level, which is already scoped to productive (investable) trees by their `TreeLifecycleStage`.

### Profit Split: Platform-Level Constant, Not Config Table
- **Rationale:** Epic requires a fixed 60/40 split for this phase. Storing as a PHP constant (`const INVESTOR_SHARE_RATE = 0.40`) in `ProfitCalculationService` avoids unnecessary database configuration tables. If dynamic rates are needed later, a migration to a config table is straightforward.
- **Breaking change mitigation:** All existing unit tests for `ProfitCalculationService` must be updated to use the 40% base before deployment. A snapshot of the old calculation is captured in test comments for regression reference.
- **Farm owner 60% tracking:** Stored as `farm_owner_share_cents` on the `harvests` table (or as a computed audit log field). The farm owner is NOT paid out through the investor payout pipeline in this epic — it is tracked-only.

### Agrotourism: Auth-Only (No KYC Gate)
- **Rationale:** Agrotourism is informational and social, not a financial transaction. Requiring KYC would increase friction without a regulatory justification. The `auth` middleware is sufficient.
- **Capacity enforcement:** `AgrotourismService::registerInvestor()` performs a `lockForUpdate()` count check inside a DB transaction to prevent over-registration under concurrent requests.

### Agrotourism Soft Deletes
- `AgrotourismEvent` uses `SoftDeletes`; cancelled events are not hard-deleted to preserve registration history.
- `AgrotourismRegistration` does NOT use soft deletes — cancellation is a status field change.

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| Breaking change to `ProfitCalculationService` affects all downstream payout tests | Update all tests in the same PR; add regression comment in test file |
| Google Maps API key exposure in frontend | Key restricted to specific HTTP referrers in Google Cloud Console; stored in `.env` only |
| Concurrent agrotourism registration exceeding capacity | `lockForUpdate()` in `DB::transaction()` in `AgrotourismService::registerInvestor()` |
| GPS lat/lng columns are currently stored as `string(20)` in migration | Add range validation in FormRequest; cast to `float` in model (already done); no migration change needed unless spatial type is desired (out of scope for this change) |

## Migration Plan

1. Deploy `fruit_crops` column-add migration first (non-breaking; existing rows get `total_trees = 0`, `productive_trees = 0`).
2. Deploy agrotourism table migrations (net-new tables; no existing data affected).
3. Deploy `ProfitCalculationService` update in the same release as updated tests. Any in-flight harvest calculations should be audited before release (risk: near-zero given no harvest completions during deployment window).

## Open Questions

- None — all ambiguities have been resolved with stakeholder input.
