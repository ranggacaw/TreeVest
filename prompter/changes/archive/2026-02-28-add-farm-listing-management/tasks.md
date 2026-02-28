## 1. Database Schema

- [x] 1.1 Create `FarmStatus` enum (pending_approval, active, suspended, deactivated)
- [x] 1.2 Create migration for `farms` table with spatial columns
- [x] 1.3 Create migration for `farm_images` table
- [x] 1.4 Create migration for `farm_certifications` table
- [x] 1.5 Create `Farm` model with relationships and scopes
- [x] 1.6 Create `FarmImage` model
- [x] 1.7 Create `FarmCertification` model
- [x] 1.8 Create farm factories for testing

## 2. Backend Implementation

- [x] 2.1 Create `StoreFarmRequest` and `UpdateFarmRequest` with validation
- [x] 2.2 Create `FarmService` for business logic (status transitions, image handling)
- [x] 2.3 Create `FarmController` for farm owner CRUD operations
- [x] 2.4 Create `Admin\FarmApprovalController` for admin actions
- [x] 2.5 Create `MarketplaceFarmController` for public browsing
- [x] 2.6 Add routes for farm management (web.php)
- [x] 2.7 Create `FarmApproved`, `FarmSuspended` events
- [x] 2.8 Create event listeners for farm status change notifications
- [x] 2.9 Add audit log event types for farm operations

## 3. Frontend Implementation

- [x] 3.1 Install `@react-google-maps/api` package
- [x] 3.2 Create `FarmMap` component for Google Maps integration
- [x] 3.3 Create `FarmCard` component for marketplace listings
- [x] 3.4 Create `FarmImageGallery` component
- [x] 3.5 Create `Farms/Index.tsx` (marketplace listing)
- [x] 3.6 Create `Farms/Show.tsx` (public farm profile)
- [x] 3.7 Create `Farms/Manage/Index.tsx` (farm owner dashboard)
- [x] 3.8 Create `Farms/Manage/Create.tsx` (farm creation form)
- [x] 3.9 Create `Farms/Manage/Edit.tsx` (farm edit form)
- [x] 3.10 Add TypeScript types for Farm entities (resources/js/types/)

## 4. Testing

- [x] 4.1 Write unit tests for `FarmService` (status transitions, validation)
- [x] 4.2 Write feature tests for farm owner CRUD operations
- [x] 4.3 Write feature tests for admin approval workflow
- [x] 4.4 Write feature tests for marketplace browsing and filtering
- [x] 4.5 Write feature tests for authorization (farm owner can only edit own farms)
- [x] 4.6 Write feature tests for geospatial queries (map-based discovery)
- [x] 4.7 Write tests for farm edit triggering re-approval

## 5. Configuration & Documentation

- [x] 5.1 Add Google Maps API key configuration to `.env.example` and `.env`
- [x] 5.2 Create symlink for public storage (`php artisan storage:link`)
- [x] 5.3 Update `config/filesystems.php` for farm image disk configuration
- [x] 5.4 Document image upload size limits and accepted formats
- [x] 5.5 Add seeder for sample farm data (optional, for development)

## Post-Implementation

- [x] Update AGENTS.md Section 6 (Data Models) with Farm, FarmImage, FarmCertification entities
- [ ] Update AGENTS.md Section 15 (Troubleshooting) if new patterns emerge
- [x] Validate with `prompter validate add-farm-listing-management --strict --no-interactive`

(End of file - total 59 lines)
