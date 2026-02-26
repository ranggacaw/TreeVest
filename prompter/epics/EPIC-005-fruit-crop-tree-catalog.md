# EPIC-005: Build Fruit Crop & Tree Catalog

> **Status:** DRAFT (PRD-based, pending FSD/TDD-Lite refinement)

## Business Value Statement
Provide a detailed, browsable catalog of investable fruit trees organized by crop type and variant, giving investors the granular information they need (price, ROI, risk, harvest cycle) to make informed investment decisions. Trees are the core investable units of the platform.

## Description
This EPIC establishes the fruit crop types, variants, and individual tree investment units on the platform. Farm owners create crop listings within their farms, specifying fruit type and variant. Each tree is an individual investable unit with its own pricing, expected ROI, harvest cycle, age, lifespan, risk rating, and investment limits. The EPIC includes the reference data system for fruit types/variants, tree listing creation, and marketplace browsing/filtering for specific crop types and trees.

## Source Traceability
| Document | Reference | Section/Page |
|----------|-----------|--------------|
| PRD | Fruit Crop Variants (Durian, Mango, Grapes, etc.) | Section 2 - Investment Marketplace |
| PRD | Investment Details Per Tree | Section 2 - Investment Marketplace |
| AGENTS.md | FruitCrop Entity | Section 6 - Data Models |
| AGENTS.md | Tree Entity | Section 6 - Data Models |
| AGENTS.md | Fruit Type Reference Data | Section 6 - Data Models |
| AGENTS.md | Tree Status Enumeration | Section 7 - Domain Vocabulary |

## Scope Definition
| In Scope | Out of Scope |
|----------|--------------|
| Fruit type and variant reference data management | Investment purchase transaction (EPIC-006) |
| Crop listing creation by farm owners (within a farm) | Tree health monitoring updates (EPIC-008) |
| Individual tree investment unit creation | Harvest schedule management (EPIC-009) |
| Tree attributes: price, expected ROI, harvest cycle, age, lifespan | Marketplace payment flow (EPIC-010) |
| Risk assessment rating per tree | Educational content about crops (EPIC-012) |
| Minimum/maximum investment limits per tree | |
| Historical yield data display per tree | |
| Tree status management (seedling, growing, productive, declining, retired) | |
| Marketplace search/filter by fruit type, variant, ROI, risk, price | |
| Tree detail page with all investment information | |

## High-Level Acceptance Criteria
- [ ] Platform supports predefined fruit types and variants (Durian, Mango, Grapes, Melon, Citrus, Others)
- [ ] Farm owners can create crop listings within their approved farms
- [ ] Farm owners can create individual tree units with all required investment attributes
- [ ] Each tree displays: price, expected ROI, harvest cycle, age, lifespan, risk rating, min/max investment
- [ ] Historical yield data is displayed where available
- [ ] Tree status is tracked and displayed (seedling, growing, productive, declining, retired)
- [ ] Investors can browse and filter trees by fruit type, variant, ROI range, risk level, and price
- [ ] Tree detail pages provide comprehensive investment information
- [ ] Only trees in "productive" or "growing" status are available for investment
- [ ] Reference data for fruit types and variants can be managed by admins

## Dependencies
- **Prerequisite EPICs:** EPIC-004 (Farm Listing - crops/trees belong to farms)
- **External Dependencies:** None
- **Technical Prerequisites:** Farm entity and data model from EPIC-004; Eloquent models (FruitCrop, Tree) with MySQL for hierarchical data (Farm > Crop > Tree); Inertia pages for marketplace browsing

## Complexity Assessment
- **Size:** M
- **Technical Complexity:** Medium (hierarchical data model: Farm > Crop > Tree, filtering)
- **Integration Complexity:** Low (internal data only)
- **Estimated Story Count:** 8-12

## Risks & Assumptions
**Assumptions:**
- The fruit type/variant list from the PRD is the initial set but should be extensible
- Tree investment attributes are set by farm owners and potentially reviewed by admins
- "Historical yield data" may not be available for new trees — the system should handle missing data gracefully
- Risk assessment rating methodology is not defined in the PRD — assumed to be a manual rating initially
- Fruit type reference data seeded via Laravel database seeders
- Tree listing pages built as Inertia/React components with Tailwind CSS
- Filtering/search implemented via Eloquent query scopes

**Risks:**
- Pricing mechanism for trees is undefined — how prices are set and updated needs clarification
- Risk rating methodology needs definition (who rates, what criteria, how often updated)
- Expected ROI is inherently speculative — risk disclosure must be prominent
- Large catalog of trees per farm could create performance challenges in search/filter

## Related EPICs
- **Depends On:** EPIC-004 (Farm Listing)
- **Blocks:** EPIC-006 (Investment Purchase), EPIC-008 (Health Monitoring), EPIC-009 (Harvest & Returns)
- **Related:** EPIC-012 (Education - crop encyclopedia)
