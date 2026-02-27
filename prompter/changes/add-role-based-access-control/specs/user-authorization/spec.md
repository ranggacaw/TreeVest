## ADDED Requirements

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
