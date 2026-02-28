# User Authorization (Fruit Crop & Tree Catalog)

## ADDED Requirements

### Requirement: Farm Owner Authorization for Crop Management
Farm owners SHALL be authorized to create and manage only crops belonging to farms they own.

#### Scenario: Farm owner creates crop for their own farm
- **WHEN** an authenticated user with role `farm_owner` submits a crop creation request for a farm they own
- **THEN** the system grants access and creates the crop with farm_id set to the owner's farm

#### Scenario: Farm owner accesses their crop list
- **WHEN** an authenticated user with role `farm_owner` accesses the crop management dashboard
- **THEN** the system grants access and returns only crops belonging to farms where owner_id matches the authenticated user's ID

#### Scenario: Farm owner edits their own crop
- **WHEN** an authenticated user with role `farm_owner` requests to edit a crop they own
- **THEN** the system grants access and renders the crop edit form

#### Scenario: Farm owner attempts to edit another owner's crop
- **WHEN** an authenticated user with role `farm_owner` attempts to access or edit a crop belonging to a different owner's farm
- **THEN** the system denies access with HTTP 403 Forbidden
- **AND** the system logs the unauthorized access attempt

---

### Requirement: Farm Owner Authorization for Tree Management
Farm owners SHALL be authorized to create and manage only trees belonging to crops on farms they own.

#### Scenario: Farm owner creates tree for their own crop
- **WHEN** an authenticated user with role `farm_owner` submits a tree creation request for a crop they own
- **THEN** the system grants access and creates the tree with fruit_crop_id set to the owner's crop

#### Scenario: Farm owner accesses their tree list
- **WHEN** an authenticated user with role `farm_owner` accesses the tree management dashboard
- **THEN** the system grants access and returns only trees belonging to crops on farms where owner_id matches the authenticated user's ID

#### Scenario: Farm owner edits their own tree
- **WHEN** an authenticated user with role `farm_owner` requests to edit a tree they own
- **THEN** the system grants access and renders the tree edit form

#### Scenario: Farm owner updates tree status
- **WHEN** an authenticated user with role `farm_owner` requests to update the status of a tree they own
- **THEN** the system grants access and updates the tree status (with validation for sequential transitions)

#### Scenario: Farm owner attempts to edit another owner's tree
- **WHEN** an authenticated user with role `farm_owner` attempts to access or edit a tree belonging to a different owner's crop
- **THEN** the system denies access with HTTP 403 Forbidden
- **AND** the system logs the unauthorized access attempt

---

### Requirement: Admin Authorization for Fruit Type Management
Admins SHALL be authorized to create, edit, and delete fruit types as reference data.

#### Scenario: Admin creates fruit type
- **WHEN** an authenticated user with role `admin` submits a fruit type creation request
- **THEN** the system grants access and creates the fruit type

#### Scenario: Admin edits fruit type
- **WHEN** an authenticated user with role `admin` requests to edit a fruit type
- **THEN** the system grants access and renders the fruit type edit form

#### Scenario: Admin deletes fruit type without associated crops
- **WHEN** an authenticated user with role `admin` requests to delete a fruit type with zero associated crops
- **THEN** the system grants access and deletes (soft deletes) the fruit type

#### Scenario: Non-admin attempts to access fruit type management
- **WHEN** an authenticated user with role `investor` or `farm_owner` attempts to access fruit type management routes
- **THEN** the system denies access with HTTP 403 Forbidden

---

### Requirement: Public Access to Tree Marketplace
All users SHALL be able to browse active investable trees on the marketplace without authentication.

#### Scenario: Unauthenticated user browses tree marketplace
- **WHEN** an unauthenticated user accesses the tree marketplace index page
- **THEN** the system grants access and displays trees with status `productive` or `growing`

#### Scenario: Authenticated investor views tree detail
- **WHEN** an authenticated user with role `investor` views a tree detail page
- **THEN** the system grants access and displays full tree details with "Invest Now" button (if KYC verified)

#### Scenario: Farm owner browses public marketplace
- **WHEN** an authenticated user with role `farm_owner` accesses the public tree marketplace
- **THEN** the system grants access and displays the same trees as other users (including their own farms' trees)

---

### Requirement: Admin Full Access to All Crops and Trees
Admins SHALL have read access to all crops and trees regardless of ownership for oversight and support purposes.

#### Scenario: Admin views all crops
- **WHEN** an authenticated user with role `admin` accesses the crop management interface
- **THEN** the system grants access and returns all crops regardless of farm owner

#### Scenario: Admin views all trees
- **WHEN** an authenticated user with role `admin` accesses the tree management interface
- **THEN** the system grants access and returns all trees regardless of crop or farm owner

#### Scenario: Admin views crop owned by any farm owner
- **WHEN** an authenticated user with role `admin` accesses a crop detail page for any crop
- **THEN** the system grants access and displays the full crop details
