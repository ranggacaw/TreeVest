# Change: Add Farm Listing & Management System

## Why

Enable farm owners to create comprehensive farm profiles that serve as the foundational asset containers for tree investments. Farms are the core marketplace entity that investors browse and evaluate before making investment decisions. This capability is a prerequisite for EPIC-005 (Crop/Tree Catalog) and critical to the platform's investment model.

## What Changes

- Add `Farm` model with complete profile data (name, location, size, capacity, certifications, climate/soil, historical performance)
- Implement farm image upload and gallery management using local filesystem storage
- Integrate Google Maps for farm location display and geospatial discovery
- Add farm status workflow (`pending_approval` → `active` → `suspended` / `deactivated`)
- Create farm owner management interface (create, edit farm profiles)
- Implement admin approval workflow (API-level, UI in EPIC-014)
- Build investor marketplace views (browse, search, filter, map-based discovery)
- Add farm status transition audit logging
- Require re-approval for any farm edits (safety measure)
- Support virtual tour links (external URLs only)

## Impact

**New Capabilities:**
- `farm-management` — Complete farm listing lifecycle management

**Affected Specs:**
- `user-authorization` — Add farm owner permissions for farm CRUD operations
- `audit-logging` — Add farm status transition event types

**New Database Tables:**
- `farms` — Farm profile data with geospatial columns
- `farm_images` — Farm image gallery (1:N relationship)
- `farm_certifications` — Farm certification records (1:N relationship)

**New Controllers:**
- `FarmController` — Farm owner CRUD operations
- `Admin\FarmApprovalController` — Admin approval actions (approve/suspend/deactivate)
- `MarketplaceFarmController` — Public farm browsing and discovery

**New Inertia Pages:**
- `Farms/Index.tsx` — Investor marketplace farm listing
- `Farms/Show.tsx` — Public farm profile detail
- `Farms/Manage/Index.tsx` — Farm owner farm list
- `Farms/Manage/Create.tsx` — Farm owner create form
- `Farms/Manage/Edit.tsx` — Farm owner edit form

**External Dependencies:**
- Google Maps JavaScript API (requires API key in `.env`)
- React Google Maps library (`@react-google-maps/api`)

**Breaking Changes:**
None — this is a new capability.

**Migration Notes:**
- MySQL 8.x spatial data types used for coordinates (POINT column type with SRID 4326)
- Farm images stored in `storage/app/public/farms/{farm_id}/` via Laravel filesystem
- Initial deployment requires Google Maps API key configuration

## Related Changes

- **Depends on:** Existing `user-authorization` spec (farm owner role already exists in User model)
- **Blocks:** EPIC-005 (Crop/Tree Catalog — trees belong to farms)
- **Related:** EPIC-008 (Health Monitoring — farm-level data), EPIC-014 (Admin dashboard — farm approval UI)
