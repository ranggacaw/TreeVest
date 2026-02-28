# Two-Factor Authentication Capability

## ADDED Requirements

### Requirement: Enable TOTP-Based Two-Factor Authentication
The system SHALL allow users to enable app-based TOTP (Time-based One-Time Password) two-factor authentication.

#### Scenario: User initiates TOTP 2FA setup
- **WHEN** an authenticated user navigates to `/profile/2fa` and clicks "Enable Two-Factor Authentication"
- **THEN** the system generates a 32-byte random TOTP shared secret
- **AND** generates a QR code containing the secret for scanning with an authenticator app
- **AND** generates 8 single-use recovery codes
- **AND** displays the QR code, manual entry key, and recovery codes
- **AND** the 2FA is not yet enabled (pending verification)

#### Scenario: User scans QR code with authenticator app
- **WHEN** a user scans the displayed QR code with an authenticator app (Google Authenticator, Authy, etc.)
- **THEN** the authenticator app registers the Treevest account
- **AND** begins generating 6-digit TOTP codes every 30 seconds

#### Scenario: User confirms TOTP 2FA setup
- **WHEN** a user submits a valid 6-digit TOTP code from their authenticator app
- **THEN** the system validates the TOTP code against the shared secret
- **AND** creates a `two_factor_secrets` record with type `totp`, encrypted secret, and `enabled_at` timestamp
- **AND** stores the 8 bcrypt-hashed recovery codes in the `two_factor_recovery_codes` table
- **AND** updates the user's `two_factor_enabled_at` field
- **AND** logs the `user.2fa.enabled.totp` audit event
- **AND** redirects to the 2FA management page with a success message

#### Scenario: TOTP 2FA setup requires valid code confirmation
- **WHEN** a user submits an invalid TOTP code during setup
- **THEN** the system rejects the setup
- **AND** displays an error message "Invalid verification code. Please try again."
- **AND** the 2FA remains disabled

#### Scenario: User must save recovery codes before 2FA activation
- **WHEN** a user completes TOTP setup
- **THEN** the system requires the user to confirm they have saved the recovery codes
- **AND** displays a checkbox "I have saved my recovery codes in a safe place"
- **AND** the "Enable 2FA" button is disabled until the checkbox is checked

### Requirement: Enable SMS-Based Two-Factor Authentication
The system SHALL allow users to enable SMS-based OTP two-factor authentication.

#### Scenario: User initiates SMS 2FA setup
- **WHEN** an authenticated user navigates to `/profile/2fa` and selects "Enable SMS Two-Factor Authentication"
- **THEN** the system requires the user to have a verified phone number
- **AND** generates 8 single-use recovery codes
- **AND** displays the recovery codes
- **AND** sends a 6-digit OTP to the user's verified phone number

#### Scenario: User confirms SMS 2FA setup
- **WHEN** a user submits a valid SMS OTP code
- **THEN** the system creates a `two_factor_secrets` record with type `sms`, encrypted phone number, and `enabled_at` timestamp
- **AND** stores the 8 bcrypt-hashed recovery codes
- **AND** updates the user's `two_factor_enabled_at` field
- **AND** logs the `user.2fa.enabled.sms` audit event
- **AND** redirects to the 2FA management page with a success message

#### Scenario: SMS 2FA setup requires verified phone
- **WHEN** a user without a verified phone number attempts to enable SMS 2FA
- **THEN** the system displays an error message "You must add and verify a phone number before enabling SMS 2FA."
- **AND** provides a link to add a phone number in profile settings

### Requirement: Two-Factor Authentication Login Challenge
The system SHALL require 2FA verification after successful password authentication for users with 2FA enabled.

#### Scenario: User with TOTP 2FA redirected to challenge page
- **WHEN** a user with TOTP 2FA enabled successfully submits valid password credentials
- **THEN** the system does not establish a full session yet
- **AND** redirects to the 2FA challenge page (`/auth/2fa/verify`)
- **AND** prompts for a 6-digit TOTP code

#### Scenario: User submits valid TOTP code during login
- **WHEN** a user submits a valid TOTP code on the 2FA challenge page
- **THEN** the system validates the code against the stored secret with ±1 time step tolerance (accounts for clock drift)
- **AND** establishes a full authenticated session
- **AND** updates the `last_used_at` field in the `two_factor_secrets` table
- **AND** logs the `user.login.2fa.totp` audit event
- **AND** redirects to the dashboard

#### Scenario: User submits invalid TOTP code during login
- **WHEN** a user submits an invalid TOTP code on the 2FA challenge page
- **THEN** the system rejects the code
- **AND** displays an error message "Invalid verification code. Please try again."
- **AND** the session remains unauthenticated
- **AND** logs a failed 2FA attempt

#### Scenario: User with SMS 2FA receives OTP on login
- **WHEN** a user with SMS 2FA enabled successfully submits valid password credentials
- **THEN** the system sends a 6-digit OTP to the user's phone via SMS
- **AND** redirects to the 2FA challenge page
- **AND** prompts for the SMS OTP code

#### Scenario: User submits valid SMS OTP during login
- **WHEN** a user submits a valid SMS OTP code on the 2FA challenge page
- **THEN** the system validates the OTP code
- **AND** establishes a full authenticated session
- **AND** logs the `user.login.2fa.sms` audit event
- **AND** redirects to the dashboard

#### Scenario: SMS OTP expires after 10 minutes
- **WHEN** a user submits an SMS OTP code that was sent more than 10 minutes ago
- **THEN** the system rejects the code
- **AND** displays an error message "OTP code expired. Request a new code."

#### Scenario: User resends SMS OTP during login
- **WHEN** a user clicks "Resend OTP" on the 2FA SMS challenge page
- **THEN** the system invalidates the previous OTP code
- **AND** generates and sends a new 6-digit OTP via SMS
- **AND** displays a success message "A new code has been sent to your phone."

### Requirement: Recovery Code Login
The system SHALL allow users to bypass 2FA using single-use recovery codes in case of lost device.

#### Scenario: User clicks "Lost your device?" link
- **WHEN** a user is on the 2FA challenge page and clicks "Use a recovery code"
- **THEN** the system displays a recovery code input field
- **AND** prompts for one of the 8 recovery codes

#### Scenario: User submits valid recovery code
- **WHEN** a user submits a valid, unused recovery code
- **THEN** the system verifies the code against the bcrypt-hashed recovery codes in the database
- **AND** marks the recovery code as used (`used_at` timestamp)
- **AND** establishes a full authenticated session
- **AND** logs the `user.2fa.recovery_code_used` audit event
- **AND** displays a warning message "You have used a recovery code. Consider regenerating recovery codes or disabling 2FA if you lost your device."
- **AND** redirects to the dashboard

#### Scenario: User submits invalid recovery code
- **WHEN** a user submits an invalid or already-used recovery code
- **THEN** the system rejects the code
- **AND** displays an error message "Invalid recovery code. Please try again."
- **AND** the session remains unauthenticated

#### Scenario: Recovery code is single-use
- **WHEN** a user attempts to reuse a recovery code that has already been used
- **THEN** the system rejects the code
- **AND** displays an error message "This recovery code has already been used."

#### Scenario: User warned after using recovery code
- **WHEN** a user successfully logs in with a recovery code
- **THEN** the system displays a prominent warning message on the dashboard
- **AND** prompts the user to regenerate recovery codes or disable 2FA if device is permanently lost

### Requirement: Disable Two-Factor Authentication
The system SHALL allow users to disable 2FA with password confirmation for security.

#### Scenario: User disables 2FA with password confirmation
- **WHEN** an authenticated user with 2FA enabled clicks "Disable Two-Factor Authentication" and enters their current password
- **THEN** the system validates the password
- **AND** deletes the `two_factor_secrets` record
- **AND** deletes all associated `two_factor_recovery_codes`
- **AND** sets the user's `two_factor_enabled_at` field to null
- **AND** logs the `user.2fa.disabled` audit event
- **AND** displays a success message "Two-factor authentication has been disabled."

#### Scenario: 2FA disable requires password
- **WHEN** a user attempts to disable 2FA without providing their password
- **THEN** the system displays a password confirmation modal
- **AND** requires the password to be entered before disabling

#### Scenario: Invalid password rejects 2FA disable
- **WHEN** a user provides an incorrect password to disable 2FA
- **THEN** the system rejects the request
- **AND** displays an error message "Incorrect password. Please try again."

### Requirement: Regenerate Recovery Codes
The system SHALL allow users to regenerate recovery codes if they are lost or depleted.

#### Scenario: User regenerates recovery codes
- **WHEN** an authenticated user with 2FA enabled clicks "Regenerate Recovery Codes"
- **THEN** the system generates 8 new recovery codes
- **AND** deletes all existing recovery codes from the database
- **AND** stores the new bcrypt-hashed recovery codes
- **AND** displays the new recovery codes
- **AND** logs the `user.2fa.recovery_codes_regenerated` audit event

#### Scenario: Recovery code regeneration requires password
- **WHEN** a user initiates recovery code regeneration
- **THEN** the system prompts for password confirmation
- **AND** validates the password before regenerating

#### Scenario: User must save regenerated recovery codes
- **WHEN** the system displays new recovery codes
- **THEN** it requires the user to confirm they have saved the codes
- **AND** displays a warning "These codes will not be shown again. Save them in a secure location."

### Requirement: Two-Factor Authentication Status Display
The system SHALL clearly display the user's 2FA status on the profile and settings pages.

#### Scenario: 2FA status badge displayed
- **WHEN** a user views their profile or security settings page
- **THEN** the system displays a 2FA status badge ("Enabled" with green checkmark, or "Disabled" with gray icon)

#### Scenario: 2FA type displayed when enabled
- **WHEN** a user has 2FA enabled
- **THEN** the system displays the 2FA type (TOTP or SMS)
- **AND** displays the enabled timestamp ("Enabled on February 28, 2026")

#### Scenario: Remaining recovery codes count displayed
- **WHEN** a user views their 2FA settings
- **THEN** the system displays the number of unused recovery codes remaining (e.g., "5 of 8 recovery codes remaining")
- **AND** displays a warning if fewer than 3 codes remain

### Requirement: Two-Factor Authentication Rate Limiting
The system SHALL rate-limit 2FA verification attempts to prevent brute force attacks.

#### Scenario: 2FA verification attempts rate limited
- **WHEN** a user submits 5 invalid 2FA codes within 1 minute
- **THEN** the system blocks further 2FA attempts for 15 minutes
- **AND** logs the user out
- **AND** displays an error message "Too many verification attempts. Your account has been locked for 15 minutes."
- **AND** logs a fraud alert event

#### Scenario: SMS OTP send rate limited during 2FA
- **WHEN** a user requests "Resend OTP" more than 5 times within 1 hour during 2FA login
- **THEN** the system blocks further OTP requests
- **AND** displays an error message "Too many OTP requests. Please try again later."

### Requirement: TOTP Secret Security
The system SHALL securely generate and store TOTP shared secrets.

#### Scenario: TOTP secret is cryptographically random
- **WHEN** the system generates a TOTP shared secret
- **THEN** it uses a cryptographically secure random number generator
- **AND** generates a 32-byte (160-bit) secret
- **AND** base32-encodes the secret for QR code and manual entry

#### Scenario: TOTP secret encrypted at rest
- **WHEN** the system stores a TOTP shared secret
- **THEN** it encrypts the secret using Laravel's encryption (AES-256-CBC)
- **AND** stores the encrypted value in the `secret` field of the `two_factor_secrets` table

#### Scenario: TOTP secret unique per user
- **WHEN** the system generates a TOTP secret for a user
- **THEN** each user's secret is unique
- **AND** secrets are never reused or shared between users

### Requirement: Recovery Code Security
The system SHALL securely generate and store recovery codes.

#### Scenario: Recovery codes are cryptographically random
- **WHEN** the system generates recovery codes
- **THEN** each code is 20 characters long
- **AND** each code contains alphanumeric characters (A-Z, 0-9)
- **AND** codes are generated using a cryptographically secure random number generator

#### Scenario: Recovery codes hashed before storage
- **WHEN** the system stores recovery codes
- **THEN** each code is hashed using bcrypt with cost factor 12
- **AND** only the hashed value is stored in the database
- **AND** plaintext codes are never stored

#### Scenario: Recovery codes displayed only once
- **WHEN** the system generates recovery codes during 2FA setup or regeneration
- **THEN** the plaintext codes are displayed to the user once
- **AND** the codes are not stored in plaintext anywhere
- **AND** the user cannot retrieve the plaintext codes after closing the page

### Requirement: TOTP Time Step Tolerance
The system SHALL allow a tolerance window for TOTP code validation to account for clock drift.

#### Scenario: TOTP code accepted within time step tolerance
- **WHEN** a user submits a TOTP code
- **THEN** the system validates the code against the current 30-second time step
- **AND** also validates against the previous time step (30 seconds ago) and next time step (30 seconds ahead)
- **AND** accepts the code if it matches any of the 3 time steps

#### Scenario: TOTP code rejected outside tolerance window
- **WHEN** a user submits a TOTP code that was generated more than 60 seconds ago or more than 60 seconds in the future
- **THEN** the system rejects the code
- **AND** displays an error message "Invalid verification code. Please try again."

### Requirement: Two-Factor Authentication Audit Logging
The system SHALL log all 2FA events to the audit trail for security monitoring.

#### Scenario: 2FA enabled logged
- **WHEN** a user enables TOTP or SMS 2FA
- **THEN** the system logs an audit event with type `user.2fa.enabled.{type}`, user ID, IP address, and timestamp

#### Scenario: 2FA disabled logged
- **WHEN** a user disables 2FA
- **THEN** the system logs an audit event with type `user.2fa.disabled`, user ID, IP address, and timestamp

#### Scenario: 2FA verification success logged
- **WHEN** a user successfully verifies a 2FA code during login
- **THEN** the system logs an audit event with type `user.login.2fa.{type}`, user ID, IP address, and timestamp

#### Scenario: 2FA verification failure logged
- **WHEN** a user submits an invalid 2FA code during login
- **THEN** the system logs an audit event with type `user.2fa.failed`, user ID, IP address, failure reason, and timestamp

#### Scenario: Recovery code usage logged
- **WHEN** a user successfully logs in with a recovery code
- **THEN** the system logs an audit event with type `user.2fa.recovery_code_used`, user ID, IP address, and timestamp
- **AND** includes a flag indicating the user should regenerate codes

#### Scenario: Recovery codes regenerated logged
- **WHEN** a user regenerates recovery codes
- **THEN** the system logs an audit event with type `user.2fa.recovery_codes_regenerated`, user ID, IP address, and timestamp

### Requirement: Two-Factor Authentication User Education
The system SHALL provide clear guidance and warnings to users about 2FA.

#### Scenario: 2FA setup displays educational content
- **WHEN** a user navigates to the 2FA setup page
- **THEN** the system displays an explanation of two-factor authentication
- **AND** explains the benefits (account security, protection from unauthorized access)
- **AND** explains what authenticator apps are (Google Authenticator, Authy, 1Password, etc.)

#### Scenario: Recovery code warning displayed
- **WHEN** the system displays recovery codes
- **THEN** it displays a prominent warning "Save these codes in a secure location. They are the only way to access your account if you lose your device."
- **AND** provides a "Download Codes" button to save them as a text file

#### Scenario: 2FA login provides help link
- **WHEN** a user is on the 2FA challenge page
- **THEN** the system displays a "Need help?" link
- **AND** the link points to documentation explaining how to use authenticator apps and recovery codes

### Requirement: Two-Factor Authentication Method Switching
The system SHALL allow users to switch between TOTP and SMS 2FA methods.

#### Scenario: User switches from TOTP to SMS 2FA
- **WHEN** a user with TOTP 2FA enabled selects "Switch to SMS Authentication"
- **THEN** the system disables TOTP 2FA
- **AND** initiates SMS 2FA setup flow
- **AND** requires password confirmation before switching

#### Scenario: User switches from SMS to TOTP 2FA
- **WHEN** a user with SMS 2FA enabled selects "Switch to App-Based Authentication"
- **THEN** the system disables SMS 2FA
- **AND** initiates TOTP 2FA setup flow
- **AND** requires password confirmation before switching

#### Scenario: Switching 2FA method generates new recovery codes
- **WHEN** a user switches 2FA methods
- **THEN** the system generates new recovery codes
- **AND** invalidates old recovery codes
- **AND** displays the new recovery codes

### Requirement: Two-Factor Authentication Backup Contacts
The system SHALL allow users to designate backup contacts for account recovery if locked out.

#### Scenario: User adds backup email for 2FA recovery
- **WHEN** a user with 2FA enabled adds a backup email address
- **THEN** the system sends a verification email to the backup address
- **AND** stores the verified backup email
- **AND** allows admin-assisted account recovery using the backup email

#### Scenario: Admin recovery with backup email verification
- **WHEN** a user is locked out of their 2FA account and contacts support
- **THEN** the administrator can initiate account recovery
- **AND** sends a recovery link to the backup email
- **AND** the user can temporarily disable 2FA and regain access
- **AND** logs the admin recovery event
