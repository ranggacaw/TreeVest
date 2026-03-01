## ADDED Requirements

### Requirement: Admin User List
The system SHALL provide an admin-only paginated, searchable user list with role and KYC status filters.

#### Scenario: Admin views paginated user list
- **WHEN** an admin navigates to `/admin/users`
- **THEN** the system returns a paginated list of all users (20 per page)
- **AND** each row shows: user ID, name, email, role badge, KYC status badge, created date, and account status (active/suspended)

#### Scenario: Admin searches users by name or email
- **WHEN** an admin enters a search query in the user list search box
- **THEN** the list filters to users whose name or email contains the search string (case-insensitive, partial match)
- **AND** pagination resets to page 1

#### Scenario: Admin filters by role
- **WHEN** an admin selects a role filter (investor, farm_owner, admin)
- **THEN** the list shows only users with that role

#### Scenario: Admin filters by KYC status
- **WHEN** an admin selects a KYC status filter (pending, submitted, verified, rejected)
- **THEN** the list shows only users with that KYC status

### Requirement: Admin User Detail View
The system SHALL provide an admin-only user detail page showing full profile, KYC history, active sessions, and recent audit events.

#### Scenario: Admin views user profile
- **WHEN** an admin navigates to `/admin/users/{id}`
- **THEN** the system renders the user's profile data: name, email, phone, role, KYC status, 2FA enabled flag, created date, last login date, and account status

#### Scenario: Admin views user KYC history
- **WHEN** an admin views a user detail page
- **THEN** the page shows the user's KYC verification records (all statuses) ordered by created_at descending
- **AND** each record shows: jurisdiction, status, submitted_at, verified_at or rejected_at, rejection_reason

#### Scenario: Admin views user's recent activity
- **WHEN** an admin views a user detail page
- **THEN** the page shows the last 20 audit log entries for that user ordered by created_at descending

### Requirement: Admin User Role Change
The system SHALL allow admins to change a user's role with confirmation, logging the change in the audit trail.

#### Scenario: Admin changes user role
- **WHEN** an admin submits a role change for a user
- **THEN** the system updates the user's role in the database
- **AND** an audit log entry is created with event_type `user_role_changed`, old role, new role, admin user ID, timestamp
- **AND** the user sees the new role on next page load

#### Scenario: Admin cannot set own role
- **WHEN** an admin attempts to change their own role
- **THEN** the system rejects the request with HTTP 422
- **AND** returns a validation error: "Administrators cannot change their own role"

#### Scenario: Role change to invalid value rejected
- **WHEN** an admin submits a role change with an invalid role value
- **THEN** the system returns HTTP 422 with a validation error

### Requirement: Admin User Suspension
The system SHALL allow admins to suspend and reactivate user accounts, preventing suspended users from authenticating.

#### Scenario: Admin suspends user account
- **WHEN** an admin submits a suspension request for a user with an optional reason
- **THEN** the system sets the user's `suspended_at` timestamp and `suspended_reason`
- **AND** any existing sessions for that user are invalidated
- **AND** an audit log entry is created with event_type `admin_user_suspended`
- **AND** the user receives a suspension notification

#### Scenario: Suspended user cannot log in
- **WHEN** a suspended user attempts to authenticate
- **THEN** the system rejects the login with an error message indicating the account is suspended

#### Scenario: Admin reactivates suspended user
- **WHEN** an admin submits a reactivation request for a suspended user
- **THEN** the system clears `suspended_at` and `suspended_reason`
- **AND** an audit log entry is created with event_type `admin_user_reactivated`
- **AND** the user receives a reactivation notification

#### Scenario: Admin cannot suspend another admin
- **WHEN** an admin attempts to suspend a user with role `admin`
- **THEN** the system rejects the request with HTTP 422
- **AND** returns a validation error: "Administrators cannot suspend other administrators"

### Requirement: Admin User Deletion
The system SHALL allow admins to soft-delete user accounts, retaining data for audit purposes.

#### Scenario: Admin soft-deletes user
- **WHEN** an admin submits a delete request for a user
- **THEN** the system soft-deletes the user (sets `deleted_at`)
- **AND** the user is excluded from all non-admin queries
- **AND** an audit log entry is created with event_type `admin_user_deleted`

#### Scenario: Deleted user cannot log in
- **WHEN** a soft-deleted user attempts to authenticate
- **THEN** the system rejects the login

#### Scenario: Admin cannot delete user with active investments
- **WHEN** an admin attempts to delete a user who has investments with status `active` or `pending_payment`
- **THEN** the system rejects the deletion with HTTP 422
- **AND** returns an error: "User has active investments and cannot be deleted"
