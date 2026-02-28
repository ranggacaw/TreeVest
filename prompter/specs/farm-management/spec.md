# farm-management Specification

## Purpose
TBD - created by archiving change add-farm-listing-management. Update Purpose after archive.
## Requirements
### Requirement: Farm Profile Creation

Farm owners SHALL be able to create comprehensive farm profiles with all required information to support investor decision-making on the marketplace.

#### Scenario: Farm owner creates complete farm profile

- **WHEN** a farm owner submits a farm creation form with name, location (address and coordinates), total size, tree capacity, description, climate/soil data, and at least one image
- **THEN** the system creates a new farm record with status `pending_approval`, stores the farm data, uploads images to storage, creates audit log entry, and returns success confirmation

#### Scenario: Farm creation validation fails

- **WHEN** a farm owner submits a farm creation form with missing required fields (name, location, size, or capacity)
- **THEN** the system returns validation errors without creating the farm record

#### Scenario: Farm owner adds certifications to profile

- **WHEN** a farm owner includes certification details (type, issuer, issue date, document URL) during farm creation
- **THEN** the system stores certification records linked to the farm

---

### Requirement: Farm Image Gallery Management

Farm owners SHALL be able to upload multiple high-resolution images to showcase their farm facilities and growing conditions.

#### Scenario: Farm owner uploads farm images

- **WHEN** a farm owner uploads images (JPEG/PNG, max 5MB each, max 4000x3000px) during farm creation or editing
- **THEN** the system stores images in `storage/app/public/farms/{farm_id}/`, creates `FarmImage` records with file paths, and associates images with the farm

#### Scenario: Image upload size exceeds limit

- **WHEN** a farm owner attempts to upload an image larger than 5MB
- **THEN** the system rejects the upload and returns a validation error

#### Scenario: Farm owner removes farm image

- **WHEN** a farm owner deletes an image from their farm gallery
- **THEN** the system removes the `FarmImage` record, deletes the file from storage, and updates the farm profile

---

### Requirement: Geospatial Farm Location

Farm profiles SHALL store and display precise geographic coordinates using MySQL spatial data types for efficient map-based queries.

#### Scenario: Farm location stored as spatial data

- **WHEN** a farm is created with latitude and longitude coordinates
- **THEN** the system stores coordinates as a `POINT` column with SRID 4326 and creates a spatial index for efficient geospatial queries

#### Scenario: Farm location displayed on map

- **WHEN** an investor views a farm profile
- **THEN** the system renders an interactive Google Map centered on the farm coordinates with a marker indicating the farm location

---

### Requirement: Farm Approval Workflow

Newly created farms SHALL enter a pending approval state and only become visible on the marketplace after admin approval.

#### Scenario: New farm awaits admin approval

- **WHEN** a farm owner creates a new farm
- **THEN** the system sets farm status to `pending_approval`, makes the farm visible only to the farm owner and admins, and dispatches a `FarmCreated` event for admin notification

#### Scenario: Admin approves pending farm

- **WHEN** an admin approves a farm with status `pending_approval`
- **THEN** the system changes status to `active`, makes the farm visible on the marketplace, creates audit log entry, and dispatches `FarmApproved` event

#### Scenario: Admin rejects farm permanently

- **WHEN** an admin deactivates a farm with status `pending_approval`
- **THEN** the system changes status to `deactivated`, keeps the farm hidden from marketplace, creates audit log entry, and dispatches `FarmDeactivated` event

---

### Requirement: Farm Profile Editing with Re-Approval

Farm owners SHALL be able to edit their farm profiles, with any edit triggering re-approval for safety and compliance.

#### Scenario: Farm owner edits active farm

- **WHEN** a farm owner updates any field on an `active` farm
- **THEN** the system saves the changes, changes status back to `pending_approval`, removes the farm from marketplace visibility, creates audit log entry, and dispatches `FarmUpdated` event for admin notification

#### Scenario: Farm owner edits pending farm

- **WHEN** a farm owner updates a farm with status `pending_approval`
- **THEN** the system saves the changes without changing status and updates the farm data

---

### Requirement: Farm Status Transitions

Farm status SHALL follow explicit transition rules to ensure data integrity and platform control.

#### Scenario: Valid status transition succeeds

- **WHEN** an admin attempts a valid status transition (e.g., `pending_approval` → `active`, `active` → `suspended`)
- **THEN** the system updates the status, creates audit log entry with old and new status, and dispatches appropriate status change event

#### Scenario: Invalid status transition rejected

- **WHEN** an admin attempts an invalid status transition (e.g., `deactivated` → `active`, `pending_approval` → `suspended`)
- **THEN** the system rejects the request and returns an error without changing the status

#### Scenario: Deactivated farms are terminal

- **WHEN** an admin sets a farm status to `deactivated`
- **THEN** the system prevents any further status changes and the farm remains permanently hidden from the marketplace

---

### Requirement: Farm Marketplace Browsing

Investors SHALL be able to browse active farms on the marketplace with search, filtering, and sorting capabilities.

#### Scenario: Investor views marketplace farm listing

- **WHEN** an investor accesses the farm marketplace
- **THEN** the system displays all farms with status `active`, shows farm cards with name, location, featured image, size, capacity, and certification badges, and paginates results

#### Scenario: Investor searches farms by keyword

- **WHEN** an investor enters a search query for farm name, location, or description
- **THEN** the system returns farms matching the query using MySQL FULLTEXT search on indexed columns

#### Scenario: Investor filters farms by certification

- **WHEN** an investor applies a certification filter (e.g., "Organic", "Rainforest Alliance")
- **THEN** the system returns only farms with matching certification records

---

### Requirement: Map-Based Farm Discovery

Investors SHALL be able to discover farms using an interactive map interface with geospatial filtering.

#### Scenario: Investor views farms on map

- **WHEN** an investor accesses the farm map view
- **THEN** the system displays an interactive Google Map with markers for all active farms in the current viewport bounding box

#### Scenario: Investor filters farms by radius

- **WHEN** an investor searches for farms within a specified radius (e.g., 50km) of a location
- **THEN** the system executes a spatial query using `ST_Distance_Sphere` and returns farms within the radius sorted by distance

#### Scenario: Investor clicks farm marker on map

- **WHEN** an investor clicks a farm marker on the map
- **THEN** the system displays a farm preview popup with name, featured image, size, and a link to the full farm profile

---

### Requirement: Farm Owner Dashboard

Farm owners SHALL be able to view and manage all farms they own from a dedicated dashboard.

#### Scenario: Farm owner views owned farms

- **WHEN** a farm owner accesses their farm management dashboard
- **THEN** the system displays all farms owned by the user with status indicators, edit actions, and creation date

#### Scenario: Farm owner can only edit own farms

- **WHEN** a farm owner attempts to access or edit a farm not owned by them
- **THEN** the system returns a 403 Forbidden error

---

### Requirement: Admin Farm Suspension

Admins SHALL be able to suspend active farms to temporarily remove them from the marketplace while preserving data.

#### Scenario: Admin suspends active farm

- **WHEN** an admin suspends a farm with status `active`
- **THEN** the system changes status to `suspended`, hides the farm from marketplace, creates audit log entry, and dispatches `FarmSuspended` event

#### Scenario: Admin reinstates suspended farm

- **WHEN** an admin activates a farm with status `suspended`
- **THEN** the system changes status to `active`, makes the farm visible on marketplace again, creates audit log entry, and dispatches `FarmActivated` event

---

### Requirement: Virtual Tour Links

Farm profiles SHALL support optional external virtual tour links to provide immersive farm experiences for investors.

#### Scenario: Farm owner adds virtual tour link

- **WHEN** a farm owner provides a valid URL for a virtual tour (e.g., Matterport, Google Street View)
- **THEN** the system stores the URL and displays it as a clickable link on the farm profile

#### Scenario: Virtual tour link validation

- **WHEN** a farm owner provides an invalid URL format for a virtual tour
- **THEN** the system returns a validation error

---

### Requirement: Farm Certification Display

Farm profiles SHALL prominently display certification information to build investor trust.

#### Scenario: Farm profile shows certifications

- **WHEN** an investor views a farm profile with certifications
- **THEN** the system displays certification badges with type, issuer, and issue date, and provides download links for certification documents if available

#### Scenario: Expired certifications flagged

- **WHEN** a farm has a certification with an expiry date in the past
- **THEN** the system displays the certification with an "Expired" indicator and removes the certification badge from marketplace listings

---

### Requirement: Farm Audit Trail

All farm status transitions and profile changes SHALL be logged immutably for compliance and dispute resolution.

#### Scenario: Farm status change logged

- **WHEN** a farm status is changed by an admin or system action
- **THEN** the system creates an immutable audit log entry with timestamp, admin user ID, old status, new status, and IP address

#### Scenario: Farm profile edit logged

- **WHEN** a farm owner updates farm profile data
- **THEN** the system creates an audit log entry with timestamp, farm owner ID, changed fields, and IP address

