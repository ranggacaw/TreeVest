# User Authorization Specification Delta

## ADDED Requirements

### Requirement: Farm Owner Farm Management Authorization

Farm owners SHALL be authorized to create and manage only their own farms, with admins having full access to all farms.

#### Scenario: Farm owner creates new farm

- **WHEN** an authenticated user with role `farm_owner` submits a farm creation request
- **THEN** the system grants access and creates the farm with the owner_id set to the authenticated user's ID

#### Scenario: Farm owner views own farms

- **WHEN** an authenticated user with role `farm_owner` accesses the farm management dashboard
- **THEN** the system grants access and returns only farms where owner_id matches the authenticated user's ID

#### Scenario: Farm owner edits own farm

- **WHEN** an authenticated user with role `farm_owner` requests to edit a farm they own
- **THEN** the system grants access and renders the farm edit form

#### Scenario: Farm owner attempts to edit another owner's farm

- **WHEN** an authenticated user with role `farm_owner` attempts to access or edit a farm owned by a different user
- **THEN** the system denies access with HTTP 403 Forbidden
- **AND** the system logs the unauthorized access attempt

#### Scenario: Investor cannot access farm management routes

- **WHEN** an authenticated user with role `investor` attempts to access farm owner management routes
- **THEN** the system denies access with HTTP 403 Forbidden

#### Scenario: Admin views all farms

- **WHEN** an authenticated user with role `admin` accesses the farm management interface
- **THEN** the system grants access and returns all farms regardless of owner

#### Scenario: Admin approves any farm

- **WHEN** an authenticated user with role `admin` performs a farm approval action
- **THEN** the system grants access and updates the farm status

---

### Requirement: Public Farm Marketplace Access

All users (authenticated and unauthenticated) SHALL be able to view active farms on the marketplace.

#### Scenario: Unauthenticated user browses marketplace

- **WHEN** an unauthenticated user accesses the farm marketplace
- **THEN** the system grants access and displays farms with status `active`

#### Scenario: Investor views farm profile

- **WHEN** an authenticated user with role `investor` views a farm profile
- **THEN** the system grants access and displays the full farm details

#### Scenario: Farm owner views public marketplace

- **WHEN** an authenticated user with role `farm_owner` accesses the public marketplace
- **THEN** the system grants access and displays the same active farms as other users

#### Scenario: Hidden farms not accessible

- **WHEN** any user (authenticated or not) attempts to directly access a farm with status `pending_approval`, `suspended`, or `deactivated`
- **THEN** the system returns HTTP 404 Not Found (unless the user is the farm owner or an admin)

---

### Requirement: Farm Owner Self-Access to Non-Active Farms

Farm owners SHALL be able to view and edit their own farms regardless of status.

#### Scenario: Farm owner views own pending farm

- **WHEN** an authenticated user with role `farm_owner` accesses their own farm with status `pending_approval`
- **THEN** the system grants access and displays the farm details with a status indicator

#### Scenario: Farm owner edits own suspended farm

- **WHEN** an authenticated user with role `farm_owner` attempts to edit their own farm with status `suspended`
- **THEN** the system grants access and renders the farm edit form (edit triggers re-approval)

#### Scenario: Farm owner cannot access others' pending farms

- **WHEN** an authenticated user with role `farm_owner` attempts to access another owner's pending farm
- **THEN** the system returns HTTP 404 Not Found
