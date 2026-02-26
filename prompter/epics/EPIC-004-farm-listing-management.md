# EPIC-004: Build Farm Listing & Management

> **Status:** DRAFT (PRD-based, pending FSD/TDD-Lite refinement)

## Business Value Statement
Enable farm owners to create and manage comprehensive farm profiles on the marketplace, providing investors with the information and transparency they need to make informed investment decisions. Farms are the foundational asset containers in the platform's investment model.

## Description
This EPIC covers the complete farm listing lifecycle: creation by farm owners, admin approval workflow, public display on the marketplace, and ongoing management. Farm profiles include location with map integration, size and capacity data, certification status, historical performance, climate/soil conditions, high-resolution images, and virtual tour links. The EPIC also includes farm search and discovery features for investors, including map-based browsing and filtering.

## Source Traceability
| Document | Reference | Section/Page |
|----------|-----------|--------------|
| PRD | Comprehensive farm profiles | Section 2 - Investment Marketplace |
| PRD | Map integration (Google Maps/Mapbox) | Section 2 / Technical Specs |
| PRD | High-resolution images and virtual tours | Section 2 - Farm Listings |
| AGENTS.md | Farm Entity | Section 6 - Data Models |
| AGENTS.md | Farm Status Enumeration | Section 7 - Domain Vocabulary |
| AGENTS.md | Farm Onboarding Flow | Section 5 - Core Business Logic |

## Scope Definition
| In Scope | Out of Scope |
|----------|--------------|
| Farm profile creation (name, location, size, capacity) | Individual tree/crop listings (EPIC-005) |
| Farm certification status management | Investment purchase from farm (EPIC-006) |
| Farm location with map integration (Google Maps/Mapbox) | Harvest data reporting (EPIC-009) |
| Image upload and gallery management | Admin approval dashboard UI (EPIC-014) |
| Virtual tour links | Weather data integration (EPIC-008) |
| Farm owner credentials and background | |
| Climate and soil condition data | |
| Historical performance data display | |
| Farm status management (pending_approval, active, suspended, deactivated) | |
| Admin approval workflow (API-level) | |
| Marketplace search, filter, and sort for farms | |
| Map-based farm discovery | |

## High-Level Acceptance Criteria
- [ ] Farm owners can create a farm profile with all required fields
- [ ] Farm profiles include map-based location display
- [ ] Farm owners can upload multiple high-resolution images
- [ ] Farm owners can add virtual tour links
- [ ] Newly created farms enter "pending_approval" status
- [ ] Farms are only visible on marketplace after admin approval
- [ ] Farm owners can edit their farm profiles (changes may require re-approval)
- [ ] Investors can browse farms on the marketplace with search and filters
- [ ] Investors can view farms on a map-based discovery interface
- [ ] Farm profiles display certification status, capacity, and historical data
- [ ] Farm status transitions are logged for audit
- [ ] Farms can be suspended or deactivated by admins

## Dependencies
- **Prerequisite EPICs:** EPIC-001 (User Auth), EPIC-003 (RBAC - Farm Owner role)
- **External Dependencies:** Google Maps or Mapbox API for map integration, image storage/CDN service
- **Technical Prerequisites:** Laravel filesystem abstraction (local/S3) for farm image storage, Eloquent models for Farm and FruitCrop entities, Inertia page components for marketplace UI, MySQL 8.x spatial extensions for geospatial queries

## Complexity Assessment
- **Size:** L
- **Technical Complexity:** Medium-High (map integration, image handling, geospatial queries)
- **Integration Complexity:** Medium (Maps API, CDN/storage)
- **Estimated Story Count:** 10-14

## Risks & Assumptions
**Assumptions:**
- Google Maps or Mapbox will be selected (not both)
- Farm approval is a manual admin process initially (no auto-approval)
- Farm images stored via Laravel filesystem abstraction (S3 or local disk)
- Virtual tours are external links (not hosted on platform)
- Map integration uses a React component (e.g., react-google-maps or react-map-gl) within Inertia pages
- Farm approval workflow implemented via Eloquent model status field + admin controller actions
- MySQL 8.x spatial data types used for farm coordinates

**Risks:**
- Maps API costs can scale with usage — budget planning needed
- Image upload size limits and processing (thumbnails, compression) add complexity
- Geospatial indexing supported natively by MySQL 8.x spatial indexes, but query performance should be validated under load
- Farm data completeness depends on farm owner willingness to provide information
- Admin approval bottleneck could delay marketplace availability

## Related EPICs
- **Depends On:** EPIC-001 (User Auth), EPIC-003 (RBAC)
- **Blocks:** EPIC-005 (Crop/Tree Catalog - trees belong to farms)
- **Related:** EPIC-008 (Health Monitoring - farm-level data), EPIC-014 (Admin - farm approval)
