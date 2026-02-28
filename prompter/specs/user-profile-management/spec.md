# user-profile-management Specification

## Purpose
TBD - created by archiving change implement-user-registration-authentication. Update Purpose after archive.
## Requirements
### Requirement: View User Profile
The system SHALL allow authenticated users to view their complete profile information.

#### Scenario: User views their profile page
- **WHEN** an authenticated user navigates to `/profile`
- **THEN** the system displays the user's profile information including name, email, phone, avatar, role, account creation date, and last login timestamp

### Requirement: Update Basic Profile Information
The system SHALL allow authenticated users to update their name and contact information.

#### Scenario: User updates their name
- **WHEN** an authenticated user submits the profile update form with a new name
- **THEN** the system updates the `name` field
- **AND** displays a success message "Profile updated successfully."
- **AND** logs the `user.profile.updated` audit event

#### Scenario: User cannot set name to empty
- **WHEN** an authenticated user attempts to update their name to an empty value
- **THEN** the system rejects the update
- **AND** displays an error message "Name is required."

### Requirement: Update Email Address
The system SHALL allow users to update their email address with re-verification required.

#### Scenario: User updates email address
- **WHEN** an authenticated user submits a new email address in the profile update form
- **THEN** the system validates the email format
- **AND** checks that the email is not already in use by another user
- **AND** updates the `email` field
- **AND** sets `email_verified_at` to null (requires re-verification)
- **AND** sends a verification email to the new email address
- **AND** logs the `user.email.changed` audit event

#### Scenario: User cannot update email to one already in use
- **WHEN** an authenticated user attempts to update their email to one already registered
- **THEN** the system rejects the update
- **AND** displays an error message "This email address is already in use."

#### Scenario: Email update requires password confirmation
- **WHEN** an authenticated user submits an email update
- **THEN** the system requires the current password to be provided
- **AND** validates the password before processing the email update

### Requirement: Add or Update Phone Number
The system SHALL allow users to add or update their phone number with SMS verification required.

#### Scenario: User adds phone number to email-only account
- **WHEN** an authenticated user without a phone number submits a phone number with country code
- **THEN** the system normalizes the phone to E.164 format
- **AND** generates and sends a 6-digit OTP via SMS
- **AND** displays the phone verification page
- **AND** the phone is not added until OTP verification completes

#### Scenario: User verifies new phone number with OTP
- **WHEN** a user submits a valid OTP code for phone verification
- **THEN** the system updates the `phone` and `phone_country_code` fields
- **AND** sets `phone_verified_at` to the current timestamp
- **AND** logs the `user.phone.added` or `user.phone.changed` audit event
- **AND** displays a success message "Phone number verified successfully."

#### Scenario: User updates existing phone number
- **WHEN** an authenticated user with an existing phone number submits a new phone number
- **THEN** the system generates and sends an OTP to the new phone number
- **AND** requires OTP verification before updating
- **AND** sets `phone_verified_at` to null until verification completes
- **AND** logs the `user.phone.changed` audit event on successful verification

#### Scenario: Phone update rate limited
- **WHEN** a user attempts to change their phone number more than once within 7 days
- **THEN** the system rejects the update
- **AND** displays an error message "You can only change your phone number once every 7 days."

### Requirement: Avatar Upload and Management
The system SHALL allow users to upload, update, and delete profile avatar images.

#### Scenario: User uploads avatar image
- **WHEN** an authenticated user uploads an image file via the avatar upload form
- **THEN** the system validates the file (max 2MB, MIME types: image/jpeg, image/png, image/webp)
- **AND** resizes the image to 512x512 pixels
- **AND** strips EXIF metadata for privacy
- **AND** stores the image in `storage/app/public/avatars/{user_id}/{filename}`
- **AND** updates the `avatar_url` field with the relative path
- **AND** logs the `user.avatar.uploaded` audit event
- **AND** displays the new avatar immediately

#### Scenario: Avatar upload validates file size
- **WHEN** a user attempts to upload an image larger than 2MB
- **THEN** the system rejects the upload
- **AND** displays an error message "Avatar image must be smaller than 2MB."

#### Scenario: Avatar upload validates file type
- **WHEN** a user attempts to upload a file that is not a JPEG, PNG, or WebP image
- **THEN** the system rejects the upload
- **AND** displays an error message "Avatar must be a JPEG, PNG, or WebP image."

#### Scenario: User updates existing avatar
- **WHEN** an authenticated user with an existing avatar uploads a new avatar
- **THEN** the system deletes the old avatar file from storage
- **AND** uploads and stores the new avatar
- **AND** updates the `avatar_url` field

#### Scenario: User deletes avatar
- **WHEN** an authenticated user clicks "Remove Avatar"
- **THEN** the system deletes the avatar file from storage
- **AND** sets the `avatar_url` field to null
- **AND** logs the `user.avatar.deleted` audit event
- **AND** displays the default avatar placeholder

#### Scenario: Avatar displayed via public URL
- **WHEN** the system renders a user's avatar
- **THEN** it generates the public URL as `/storage/{avatar_url}`
- **AND** serves the image via the symlink from `public/storage` to `storage/app/public`

### Requirement: View Active Sessions
The system SHALL allow users to view all active sessions across devices for security monitoring.

#### Scenario: User views active sessions list
- **WHEN** an authenticated user navigates to `/profile/sessions`
- **THEN** the system displays a list of active sessions
- **AND** each session shows: device name (parsed from user agent), browser name, IP address, approximate location (from IP), and last activity timestamp
- **AND** the current session is highlighted

#### Scenario: Device name parsed from user agent
- **WHEN** the system displays a session
- **THEN** it parses the user agent string to extract device name (e.g., "iPhone 14 Pro", "Windows Desktop", "MacBook Air")
- **AND** displays a human-readable device name

#### Scenario: Current session clearly identified
- **WHEN** a user views their active sessions
- **THEN** the session corresponding to the current device is marked as "This device"
- **AND** cannot be revoked (prevents accidental logout)

### Requirement: Revoke Active Sessions
The system SHALL allow users to remotely log out specific devices or all other devices.

#### Scenario: User revokes specific session
- **WHEN** an authenticated user clicks "Log Out" on a non-current session
- **THEN** the system deletes that session from the `sessions` table
- **AND** logs the `user.session.revoked` audit event
- **AND** displays a success message "Device logged out successfully."
- **AND** the revoked session is removed from the list

#### Scenario: User logs out all other devices
- **WHEN** an authenticated user clicks "Log Out All Other Devices"
- **THEN** the system prompts for password confirmation
- **AND** deletes all sessions except the current session
- **AND** logs the `user.session.revoked_all` audit event
- **AND** displays a success message "All other devices logged out successfully."

#### Scenario: Logout all other devices requires password
- **WHEN** a user attempts to log out all other devices
- **THEN** the system requires the current password to be entered in a confirmation modal
- **AND** validates the password before revoking sessions

### Requirement: Account Role Display
The system SHALL display the user's role on the profile page for transparency.

#### Scenario: User role displayed on profile
- **WHEN** an authenticated user views their profile
- **THEN** the system displays their role (investor, farm_owner, or admin) as a badge or label

#### Scenario: Role is read-only for users
- **WHEN** a user views their profile
- **THEN** the role field is displayed but not editable
- **AND** role changes can only be made by administrators

### Requirement: Profile Update Validation
The system SHALL validate all profile updates to prevent invalid data entry.

#### Scenario: Profile update validates required fields
- **WHEN** a user submits a profile update with missing required fields
- **THEN** the system rejects the update
- **AND** displays field-specific error messages

#### Scenario: Profile update applies XSS protection
- **WHEN** a user submits a profile update with text inputs
- **THEN** the system applies the `NoXss` validation rule to prevent cross-site scripting
- **AND** strips any potentially dangerous HTML or JavaScript

#### Scenario: Email format validated
- **WHEN** a user updates their email
- **THEN** the system validates the email format using Laravel's `email` rule
- **AND** rejects invalid email formats

#### Scenario: Phone format validated
- **WHEN** a user updates their phone number
- **THEN** the system validates the phone format using libphonenumber library
- **AND** rejects invalid phone formats
- **AND** displays an error message "Invalid phone number format."

### Requirement: Last Login Tracking
The system SHALL track and display the user's last login timestamp and IP address.

#### Scenario: Last login updated on successful authentication
- **WHEN** a user successfully logs in via any method
- **THEN** the system updates the `last_login_at` field with the current timestamp
- **AND** updates the `last_login_ip` field with the request IP address

#### Scenario: Last login displayed on profile
- **WHEN** a user views their profile
- **THEN** the system displays the `last_login_at` timestamp in a human-readable format (e.g., "Last login: 2 hours ago")
- **AND** displays the IP address (masked for privacy, e.g., "203.0.113.xxx")

### Requirement: Account Creation Date Display
The system SHALL display the account creation date on the profile page.

#### Scenario: Account creation date displayed
- **WHEN** a user views their profile
- **THEN** the system displays the `created_at` timestamp as "Member since: February 28, 2026"

### Requirement: Profile Update Confirmation
The system SHALL provide immediate visual feedback on successful profile updates.

#### Scenario: Success message displayed on update
- **WHEN** a user successfully updates any profile field
- **THEN** the system displays a success message "Profile updated successfully."
- **AND** the message automatically dismisses after 5 seconds

#### Scenario: Updated fields highlighted
- **WHEN** a user successfully updates a profile field
- **THEN** the updated field is briefly highlighted with a success indicator (e.g., green border)
- **AND** the highlight fades after 2 seconds

### Requirement: Profile Update Audit Logging
The system SHALL log all profile updates to the audit trail for security monitoring.

#### Scenario: Profile field changes logged
- **WHEN** a user updates any profile field (name, email, phone, avatar)
- **THEN** the system logs an audit event with the field name, old value (if applicable), new value, user ID, IP address, and timestamp

#### Scenario: Email change logged with both values
- **WHEN** a user changes their email address
- **THEN** the system logs an audit event with type `user.email.changed` including both old and new email addresses

#### Scenario: Phone change logged with both values
- **WHEN** a user changes their phone number
- **THEN** the system logs an audit event with type `user.phone.changed` including both old and new phone numbers (encrypted)

### Requirement: Profile Privacy Controls
The system SHALL respect user privacy by limiting public visibility of profile information.

#### Scenario: Profile information private by default
- **WHEN** a user's profile information is accessed
- **THEN** the system only displays profile data to the authenticated user themselves or administrators
- **AND** other users cannot view full profile details

#### Scenario: Avatar publicly visible on platform
- **WHEN** a user's avatar is displayed in the application (e.g., in forums, comments, investment listings)
- **THEN** the avatar image is visible to all authenticated users
- **AND** no other profile information is exposed without permission

### Requirement: Phone Number Display Formatting
The system SHALL display phone numbers in national format for better readability.

#### Scenario: Phone number displayed in national format
- **WHEN** the system displays a user's phone number on the profile page
- **THEN** it formats the phone using the `phone_country_code` and `phone` fields
- **AND** displays it in national format (e.g., E.164 `+60123456789` → National `012-345 6789` for Malaysia)

### Requirement: Avatar Fallback Display
The system SHALL display a default avatar when a user has not uploaded a custom avatar.

#### Scenario: Default avatar displayed for users without upload
- **WHEN** a user has not uploaded an avatar (`avatar_url` is null)
- **THEN** the system displays a default avatar placeholder (e.g., initials on colored background, or generic user icon)

#### Scenario: Default avatar uses user initials
- **WHEN** the system generates a default avatar
- **THEN** it extracts the first letter of the user's first and last name
- **AND** displays the initials on a colored background (color derived from user ID for consistency)

### Requirement: Profile Update Rate Limiting
The system SHALL rate-limit profile update requests to prevent abuse.

#### Scenario: Profile updates rate limited
- **WHEN** a user submits more than 10 profile update requests within 1 hour
- **THEN** the system blocks further updates
- **AND** displays an error message "Too many update requests. Please try again later."

#### Scenario: Avatar uploads rate limited
- **WHEN** a user uploads more than 5 avatars within 1 hour
- **THEN** the system blocks further uploads
- **AND** displays an error message "Too many upload attempts. Please try again later."

