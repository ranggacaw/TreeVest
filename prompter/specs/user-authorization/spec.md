# user-authorization Specification

## Purpose
TBD - created by archiving change add-role-based-access-control. Update Purpose after archive.
## Requirements
### Requirement: User Role Assignment
The system SHALL assign exactly one role to each user from the set {investor, farm_owner, admin}.

#### Scenario: New user registration with default role
- **WHEN** a user completes registration without specifying a role
- **THEN** the system SHALL assign the role `investor` by default
- **AND** the user SHALL have access to investor-specific features

#### Scenario: New user registration with explicit role
- **WHEN** a user registration includes a role parameter
- **THEN** the system SHALL assign the specified role if valid
- **AND** the system SHALL reject the registration if the role is invalid

#### Scenario: Admin assigns role to existing user
- **WHEN** an admin changes a user's role
- **THEN** the system SHALL update the user's role in the database
- **AND** the system SHALL log the role change event with timestamp and admin user ID
- **AND** the change SHALL take effect on the user's next request

### Requirement: Role-Based Route Protection
The system SHALL enforce role-based access control on all protected routes.

#### Scenario: Investor accesses investor-protected route
- **WHEN** an authenticated user with role `investor` accesses an investor-protected route
- **THEN** the system SHALL grant access and render the requested page

#### Scenario: Investor attempts to access admin route
- **WHEN** an authenticated user with role `investor` attempts to access an admin-only route
- **THEN** the system SHALL deny access with HTTP 403 Forbidden
- **AND** the system SHALL render a custom 403 error page
- **AND** the system SHALL log the unauthorized access attempt

#### Scenario: Farm owner accesses farm owner route
- **WHEN** an authenticated user with role `farm_owner` accesses a farm-owner-protected route
- **THEN** the system SHALL grant access and render the requested page

#### Scenario: Admin accesses any protected route
- **WHEN** an authenticated user with role `admin` accesses any admin-protected route
- **THEN** the system SHALL grant access and render the requested page

#### Scenario: Unauthenticated user accesses protected route
- **WHEN** an unauthenticated user attempts to access any role-protected route
- **THEN** the system SHALL redirect to the login page

### Requirement: Role Verification Methods
The User model SHALL provide methods to check user roles programmatically.

#### Scenario: Check if user is investor
- **WHEN** the `isInvestor()` method is called on a User instance
- **THEN** the method SHALL return `true` if the user's role is `investor`
- **AND** the method SHALL return `false` otherwise

#### Scenario: Check if user is farm owner
- **WHEN** the `isFarmOwner()` method is called on a User instance
- **THEN** the method SHALL return `true` if the user's role is `farm_owner`
- **AND** the method SHALL return `false` otherwise

#### Scenario: Check if user is admin
- **WHEN** the `isAdmin()` method is called on a User instance
- **THEN** the method SHALL return `true` if the user's role is `admin`
- **AND** the method SHALL return `false` otherwise

#### Scenario: Generic role check
- **WHEN** the `hasRole($role)` method is called with a role string
- **THEN** the method SHALL return `true` if the user's role matches the parameter
- **AND** the method SHALL return `false` otherwise

### Requirement: Frontend Role Data Access
The system SHALL provide user role data to React components via Inertia.js shared properties.

#### Scenario: Authenticated user role data available in React
- **WHEN** an authenticated user loads any Inertia page
- **THEN** the user's role SHALL be available in the `auth.user.role` shared prop
- **AND** the role value SHALL match the user's database role

#### Scenario: Unauthenticated user has no role data
- **WHEN** an unauthenticated user loads any Inertia page
- **THEN** the `auth.user` shared prop SHALL be `null`

#### Scenario: Role-based UI element rendering
- **WHEN** a React component checks the user's role via Inertia props
- **THEN** the component SHALL conditionally render elements based on role
- **AND** the component SHALL hide admin-only elements from non-admin users

### Requirement: Role Change Audit Logging
The system SHALL log all role change events for security auditing.

#### Scenario: Admin changes user role
- **WHEN** an admin updates a user's role
- **THEN** the system SHALL create an audit log entry
- **AND** the log SHALL include the user ID, old role, new role, admin user ID, and timestamp

#### Scenario: Unauthorized access attempt logging
- **WHEN** a user attempts to access a route they are not authorized for
- **THEN** the system SHALL log the attempt with user ID, requested route, and timestamp

### Requirement: Role Middleware Configuration
The system SHALL provide a configurable middleware for role-based route protection.

#### Scenario: Apply role middleware to route group
- **WHEN** a route group is protected with `middleware('role:admin')`
- **THEN** only users with role `admin` SHALL be able to access routes in the group
- **AND** all other users SHALL receive HTTP 403 Forbidden

#### Scenario: Multiple role options
- **WHEN** a route accepts multiple roles (e.g., `middleware('role:admin,farm_owner')`)
- **THEN** users with either role SHALL be granted access
- **AND** users with other roles SHALL be denied access

### Requirement: Database Schema for Roles
The users table SHALL include a role column with enum type.

#### Scenario: User table has role column
- **WHEN** the role migration runs
- **THEN** the users table SHALL have a `role` column
- **AND** the column SHALL be an enum with values: `investor`, `farm_owner`, `admin`
- **AND** the column SHALL have a default value of `investor`

#### Scenario: Existing users receive default role
- **WHEN** the role migration runs on an existing database with users
- **THEN** all existing users without a role SHALL be assigned `investor`
- **AND** no user records SHALL have a NULL role value

### Requirement: TypeScript Role Type Definitions
The frontend SHALL include TypeScript type definitions for user roles.

#### Scenario: Role type is defined
- **WHEN** TypeScript code references the `Role` type
- **THEN** the type SHALL be a union type: `'investor' | 'farm_owner' | 'admin'`
- **AND** TypeScript SHALL enforce type safety for role values

#### Scenario: User type includes role
- **WHEN** TypeScript code references the `User` type
- **THEN** the User type SHALL include a `role: Role` property
- **AND** the property SHALL be required (not optional)

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

