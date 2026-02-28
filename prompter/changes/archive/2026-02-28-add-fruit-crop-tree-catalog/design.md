# Technical Design: Fruit Crop & Tree Catalog

## Context

This change introduces the core investable asset hierarchy for the platform: Farm → FruitCrop → Tree. Trees are the fundamental investable units, each with unique attributes (price, ROI, risk, harvest cycle) that drive investor decisions. The system must support:
- Farm owners managing hundreds of trees per farm
- Investors filtering/sorting by multiple attributes
- Automated pricing based on configurable formulas
- Historical yield tracking for transparency
- Status lifecycle management from seedling to retirement

## Goals / Non-Goals

**Goals:**
- Establish clear data model hierarchy: Farm (1) → FruitCrop (N) → Tree (N)
- Implement formula-based tree pricing with configurable coefficients
- Enable efficient marketplace filtering with query optimization
- Support manual tree lifecycle status management by farm owners
- Display historical yield data or clear "No data" message for new trees
- Restrict investment availability to productive/growing trees only

**Non-Goals:**
- Automated tree status transitions based on age (manual only for MVP)
- Weather/IoT integration for tree health monitoring (EPIC-008)
- Investment purchase transaction processing (EPIC-006)
- Secondary market for tree resale (future scope)
- Multi-tree bulk operations (single tree management only)

## Decisions

### 1. Data Model Hierarchy

**Decision:** Three-level hierarchy: `Farm` → `FruitCrop` → `Tree`

**Rationale:**
- `FruitCrop` represents a planting of a specific fruit type/variant on a farm (e.g., "Musang King Durian Crop A")
- `Tree` is the individual investable unit within a crop (e.g., "Tree MK-001")
- Separating crop and tree allows bulk operations on crops in the future (e.g., apply harvest schedule to all trees in a crop)
- Aligns with agricultural reality: farms have crop sections, each with many individual trees

**Schema:**
```sql
fruit_types (reference data)
  - id, name, slug, description, is_active

fruit_crops (farm-specific crop planting)
  - id, farm_id FK, fruit_type_id FK, variant, harvest_cycle, planted_date

trees (individual investable unit)
  - id, fruit_crop_id FK, tree_identifier, price_cents, expected_roi_percent, 
    age_years, productive_lifespan_years, risk_rating, min_investment_cents, 
    max_investment_cents, status, historical_yield_json, pricing_config_json

tree_harvests (historical yield tracking)
  - id, tree_id FK, harvest_date, estimated_yield_kg, actual_yield_kg, quality_grade
```

**Alternatives Considered:**
- **Flat Farm → Tree:** Rejected because it duplicates fruit type/variant per tree and makes crop-level operations difficult
- **Four-level Farm → Crop Section → Tree:** Over-engineered for MVP; can add "section" concept later if needed

### 2. Tree Pricing Formula

**Decision:** Formula-based pricing with per-tree configurable coefficients stored in `pricing_config_json`

**Formula:**
```php
price = base_price * (1 + age_coefficient * age_years) * crop_premium * risk_multiplier
```

**Coefficients:**
- `base_price`: Starting price for a new tree of this crop type (e.g., 1000 = RM 10.00)
- `age_coefficient`: Price increase per year of age (e.g., 0.05 = 5% per year)
- `crop_premium`: Multiplier for high-value crop variants (e.g., 1.5 for Musang King)
- `risk_multiplier`: Adjustment based on risk rating (low: 1.0, medium: 1.1, high: 1.2)

**Storage:**
```json
{
  "base_price": 100000,
  "age_coefficient": 0.05,
  "crop_premium": 1.5,
  "risk_multiplier": 1.1
}
```

**Rationale:**
- Transparent: Investors can see how price is derived
- Flexible: Coefficients can be adjusted per tree to reflect local conditions
- Auditable: Pricing changes trigger recalculation with audit trail
- Scalable: Can add more factors (soil quality, weather risk) in future without schema changes

**Alternatives Considered:**
- **Manual pricing by farm owner:** Rejected due to inconsistency and potential abuse
- **Fixed price per crop type:** Too rigid; doesn't account for tree age or local factors
- **Machine learning pricing model:** Over-engineered for MVP; insufficient data

### 3. Tree Status Lifecycle

**Decision:** Manual status updates by farm owners with validation for sequential transitions

**Status Flow:**
```
seedling → growing → productive → declining → retired
```

**Business Rules:**
- Only `productive` and `growing` trees are investable
- Status transitions must be sequential (no skipping stages)
- Farm owners can update status at any time (no time-based automation)
- All status changes create audit log entries

**Rationale:**
- Farm owners are best positioned to assess tree readiness (no automation can replace on-ground observation)
- Sequential transitions prevent data corruption (can't go directly from seedling to retired)
- Flexibility for different crop types with varying maturation timelines

**Alternatives Considered:**
- **Time-based automatic transitions:** Rejected because maturation rates vary by crop, climate, farm practices
- **Admin approval for status changes:** Too burdensome; audit trail provides sufficient oversight
- **Non-sequential transitions:** Rejected due to risk of data integrity issues

### 4. Historical Yield Display

**Decision:** Store yields in `tree_harvests` table; display "No historical data" message for new trees

**Display Logic:**
```typescript
if (tree.tree_harvests.length === 0) {
  return <NoDataMessage>This tree has no harvest history yet.</NoDataMessage>
} else {
  return <YieldChart data={tree.tree_harvests} />
}
```

**Rationale:**
- Transparent: Investors know when yield data is unavailable
- Scalable: `tree_harvests` table grows independently; can add future analytics
- Trustworthy: No placeholder data or crop-level averages that may mislead

**Alternatives Considered:**
- **Use farm or crop type averages:** Rejected because it misrepresents individual tree performance
- **Hide yield section entirely:** Rejected because it's less transparent (investors don't know if data exists)

### 5. Marketplace Filtering & Query Optimization

**Decision:** Use Eloquent query scopes with eager loading and database indexes

**Indexes:**
```sql
CREATE INDEX idx_trees_status_price ON trees(status, price_cents);
CREATE INDEX idx_trees_fruit_crop ON trees(fruit_crop_id);
CREATE INDEX idx_fruit_crops_farm_type ON fruit_crops(farm_id, fruit_type_id);
```

**Query Scopes:**
```php
// Tree model
public function scopeInvestable($query) {
    return $query->whereIn('status', [TreeLifecycleStage::Productive, TreeLifecycleStage::Growing]);
}

public function scopeByPriceRange($query, $min, $max) {
    return $query->whereBetween('price_cents', [$min, $max]);
}

public function scopeByRiskRating($query, array $ratings) {
    return $query->whereIn('risk_rating', $ratings);
}
```

**Rationale:**
- Scopes keep query logic encapsulated and reusable
- Indexes optimize common filter combinations (status + price, crop → farm)
- Eager loading prevents N+1 queries when displaying tree cards with crop/farm data

**Alternatives Considered:**
- **Raw SQL for performance:** Premature optimization; Eloquent is sufficient for MVP scale (<10k trees)
- **Elasticsearch for search:** Over-engineered for MVP; can add if filtering performance degrades

### 6. Risk Rating Assignment

**Decision:** Manual assignment by farm owners during tree creation/editing

**UI:** Radio buttons with descriptions:
- **Low:** Well-established tree, proven yield, minimal environmental risk
- **Medium:** Moderate risk due to age, weather variability, or limited history
- **High:** Young tree, experimental variety, or high climate exposure

**Validation:** Risk rating is required and must be one of the enum values

**Rationale:**
- Farm owners have firsthand knowledge of local risk factors (soil, climate, pests)
- Manual assignment allows nuanced judgment that algorithms can't replicate at MVP stage
- Risk rating affects pricing (via `risk_multiplier` in pricing formula)

**Alternatives Considered:**
- **Admin approval of risk ratings:** Too burdensome; audit trail provides sufficient oversight
- **Calculated risk score:** Insufficient data and risk factors undefined at MVP stage

## Risks / Trade-offs

### Risk: Tree price volatility due to frequent attribute updates
- **Mitigation:** Trigger price recalculation only on specific attribute changes (age, risk rating, pricing_config); log all price changes in audit trail
- **Trade-off:** Manual recalculation adds logic complexity but provides transparency

### Risk: Large catalogs (>10k trees) may slow marketplace filtering
- **Mitigation:** Database indexes on common filter columns; pagination with reasonable page size (24 trees per page)
- **Trade-off:** If performance degrades, can add caching or Elasticsearch later; prefer simplicity for MVP

### Risk: Farm owners may manipulate risk ratings to inflate prices
- **Mitigation:** Audit logging of all risk rating changes; admin review of anomalies (manual or future automated alerts)
- **Trade-off:** Manual rating allows flexibility but requires trust and oversight

### Risk: Historical yield data may be missing for years after launch
- **Mitigation:** Clear "No historical data" message; educational content explaining why data is limited
- **Trade-off:** Investors may hesitate to invest in trees without yield history; mitigate with transparency

### Risk: Tree identifier collisions if farm owners use same naming scheme
- **Mitigation:** Unique constraint on `(fruit_crop_id, tree_identifier)` pair — identifiers must be unique per crop, not globally
- **Trade-off:** Farm owners can reuse identifiers across crops (acceptable; they manage different crop sections)

## Migration Plan

**Phase 1: Schema & Models** (Days 1-2)
1. Run migrations to create `fruit_types`, `fruit_crops`, `trees`, `tree_harvests` tables
2. Run `FruitTypeSeeder` to populate reference data
3. Test model relationships and scopes

**Phase 2: Services & Business Logic** (Days 3-4)
4. Implement `TreePricingService` with formula and tests
5. Implement `TreeFilterService` with scope composition
6. Add configuration defaults to `config/treevest.php`

**Phase 3: Farm Owner Features** (Days 5-8)
7. Implement farm owner controllers (FruitCropController, TreeController)
8. Implement FormRequests with validation
9. Create farm owner React pages (Crops/Trees Index/Create/Edit)
10. Test authorization and audit logging

**Phase 4: Public Marketplace** (Days 9-11)
11. Implement TreeMarketplaceController
12. Create public marketplace React pages (Trees/Index.tsx, Trees/Show.tsx)
13. Implement filtering UI and test all filter combinations

**Phase 5: Admin Features** (Days 12-13)
14. Implement Admin/FruitTypeController
15. Create admin React pages (FruitTypes CRUD)
16. Test admin authorization

**Phase 6: Testing & Refinement** (Days 14-15)
17. Run full test suite (unit + feature)
18. Test edge cases (status transitions, price recalculation, authorization)
19. Performance test marketplace with seeded data (1000 trees)
20. Update AGENTS.md documentation

**Rollback Plan:**
- All migrations use `Schema::dropIfExists()` in `down()` method
- No breaking changes to existing tables
- If critical issues arise post-deployment, disable farm owner tree creation routes and marketplace routes via feature flag or route commenting

## Open Questions

1. **Pricing formula coefficients:** Should default coefficients vary by fruit type? (e.g., Durian gets higher base price than Longan)
   - **Recommendation:** Start with global defaults in config; farm owners can adjust per tree if needed; can add fruit-type-specific defaults in future iteration

2. **Tree identifier format:** Should we enforce a specific format (e.g., alphanumeric, max length)?
   - **Recommendation:** Alphanumeric + hyphens, max 50 characters; farm owners use their own naming conventions (e.g., "MK-001", "ROW-A-12")

3. **Investment availability during status transitions:** If a tree transitions from `productive` to `declining`, what happens to active investments?
   - **Recommendation:** Existing investments remain active; only new purchases are blocked; add warning banner on tree detail page if status is `declining`

4. **Historical yield data entry:** Should farm owners enter yield data manually or wait for harvest system (EPIC-009)?
   - **Recommendation:** Defer manual entry to EPIC-009; for now, all trees have empty `tree_harvests` (show "No data" message)
