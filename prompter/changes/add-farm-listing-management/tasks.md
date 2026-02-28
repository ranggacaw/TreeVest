## 1. Database Schema

- [ ] 1.1 Create `FarmStatus` enum (pending_approval, active, suspended, deactivated)
- [ ] 1.2 Create migration for `farms` table with spatial columns
- [ ] 1.3 Create migration for `farm_images` table
- [ ] 1.4 Create migration for `farm_certifications` table
- [ ] 1.5 Create `Farm` model with relationships and scopes
- [ ] 1.6 Create `FarmImage` model
- [ ] 1.7 Create `FarmCertification` model
- [ ] 1.8 Create farm factories for testing

## 2. Backend Implementation

- [ ] 2.1 Create `StoreFarmRequest` and `UpdateFarmRequest` with validation
- [ ] 2.2 Create `FarmService` for business logic (status transitions, image handling)
- [ ] 2.3 Create `FarmController` for farm owner CRUD operations
- [ ] 2.4 Create `Admin\FarmApprovalController` for admin actions
- [ ] 2.5 Create `MarketplaceFarmController` for public browsing
- [ ] 2.6 Add routes for farm management (web.php)
- [ ] 2.7 Create `FarmApproved`, `FarmSuspended` events
- [ ] 2.8 Create event listeners for farm status change notifications
- [ ] 2.9 Add audit log event types for farm operations

## 3. Frontend Implementation

- [ ] 3.1 Install `@react-google-maps/api` package
- [ ] 3.2 Create `FarmMap` component for Google Maps integration
- [ ] 3.3 Create `FarmCard` component for marketplace listings
- [ ] 3.4 Create `FarmImageGallery` component
- [ ] 3.5 Create `Farms/Index.tsx` (marketplace listing)
- [ ] 3.6 Create `Farms/Show.tsx` (public farm profile)
- [ ] 3.7 Create `Farms/Manage/Index.tsx` (farm owner dashboard)
- [ ] 3.8 Create `Farms/Manage/Create.tsx` (farm creation form)
- [ ] 3.9 Create `Farms/Manage/Edit.tsx` (farm edit form)
- [ ] 3.10 Add TypeScript types for Farm entities (resources/js/types/)

## 4. Testing

- [ ] 4.1 Write unit tests for `FarmService` (status transitions, validation)
- [ ] 4.2 Write feature tests for farm owner CRUD operations
- [ ] 4.3 Write feature tests for admin approval workflow
- [ ] 4.4 Write feature tests for marketplace browsing and filtering
- [ ] 4.5 Write feature tests for authorization (farm owner can only edit own farms)
- [ ] 4.6 Write feature tests for geospatial queries (map-based discovery)
- [ ] 4.7 Write tests for farm edit triggering re-approval

## 5. Configuration & Documentation

- [ ] 5.1 Add Google Maps API key configuration to `.env.example`
- [ ] 5.2 Create symlink for public storage (`php artisan storage:link`)
- [ ] 5.3 Update `config/filesystems.php` for farm image disk configuration
- [ ] 5.4 Document image upload size limits and accepted formats
- [ ] 5.5 Add seeder for sample farm data (optional, for development)

## Post-Implementation

- [ ] Update AGENTS.md Section 6 (Data Models) with Farm, FarmImage, FarmCertification entities
- [ ] Update AGENTS.md Section 15 (Troubleshooting) if new patterns emerge
- [ ] Validate with `prompter validate add-farm-listing-management --strict --no-interactive`
