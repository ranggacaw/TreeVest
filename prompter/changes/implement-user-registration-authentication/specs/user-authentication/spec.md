# User Authentication Capability

## ADDED Requirements

### Requirement: Email-Based Registration and Login
The system SHALL provide email-based user registration and login flows using Laravel Breeze authentication scaffold.

#### Scenario: User registers with email and password
- **WHEN** a user submits the registration form with valid email, password, and name
- **THEN** the system creates a new user account
- **AND** sends an email verification link
- **AND** logs the `user.registered.email` audit event
- **AND** redirects to the email verification notice page

#### Scenario: User logs in with email and password
- **WHEN** a user submits the login form with valid email and password credentials
- **THEN** the system authenticates the user
- **AND** establishes a session
- **AND** logs the `user.login.email` audit event
- **AND** redirects to the dashboard

#### Scenario: Email verification required before full account access
- **WHEN** a user has not verified their email address
- **THEN** the system displays a verification prompt on protected pages
- **AND** restricts access to certain features until email is verified

#### Scenario: Password reset via email
- **WHEN** a user requests a password reset with a valid email address
- **THEN** the system sends a password reset link via email
- **AND** logs the `user.password.reset` audit event
- **AND** the reset link expires after 60 minutes

### Requirement: Phone-Based Registration and Login
The system SHALL provide phone number as an alternative registration and login method with SMS OTP verification.

#### Scenario: User registers with phone number
- **WHEN** a user submits the phone registration form with valid phone number (E.164 format) and country code
- **THEN** the system generates a 6-digit OTP code
- **AND** sends the OTP via SMS to the provided phone number
- **AND** displays the OTP verification page
- **AND** logs the `user.registered.phone` audit event (pending verification)

#### Scenario: User verifies phone number with OTP
- **WHEN** a user submits a valid OTP code within 10 minutes of generation
- **THEN** the system marks the phone number as verified
- **AND** creates the user account
- **AND** establishes a session
- **AND** redirects to the dashboard

#### Scenario: OTP code expires after 10 minutes
- **WHEN** a user submits an OTP code that was generated more than 10 minutes ago
- **THEN** the system rejects the verification
- **AND** displays an error message "OTP code expired. Request a new code."

#### Scenario: OTP code is single-use
- **WHEN** a user submits a valid OTP code that has already been used
- **THEN** the system rejects the verification
- **AND** displays an error message "OTP code already used. Request a new code."

#### Scenario: User logs in with phone number
- **WHEN** a user submits the phone login form with a valid phone number
- **THEN** the system generates and sends a 6-digit OTP via SMS
- **AND** displays the OTP verification page

#### Scenario: User completes phone login with OTP
- **WHEN** a user submits a valid OTP code for phone login
- **THEN** the system authenticates the user
- **AND** establishes a session
- **AND** logs the `user.login.phone` audit event
- **AND** redirects to the dashboard

#### Scenario: User resends OTP code
- **WHEN** a user clicks "Resend OTP" on the verification page
- **THEN** the system invalidates the previous OTP code
- **AND** generates and sends a new OTP via SMS
- **AND** logs the OTP resend event

### Requirement: Social OAuth Registration and Login
The system SHALL support social media OAuth providers (Google, Facebook, Apple) for registration and login using Laravel Socialite.

#### Scenario: User initiates OAuth registration with Google
- **WHEN** a user clicks "Continue with Google" on the registration page
- **THEN** the system redirects to Google's OAuth consent page with a secure state parameter

#### Scenario: User completes OAuth registration with new account
- **WHEN** Google redirects back with a valid authorization code and the OAuth email does not exist in the system
- **THEN** the system creates a new user account with OAuth provider linkage
- **AND** stores encrypted OAuth access and refresh tokens
- **AND** logs the `user.registered.oauth.google` audit event
- **AND** establishes a session
- **AND** redirects to the dashboard

#### Scenario: User logs in with existing OAuth account
- **WHEN** Google redirects back with a valid authorization code and the OAuth email already exists with a linked provider
- **THEN** the system authenticates the user
- **AND** refreshes the OAuth access token if expired
- **AND** logs the `user.login.oauth.google` audit event
- **AND** redirects to the dashboard

#### Scenario: OAuth email matches existing email account
- **WHEN** Google redirects back with an email that matches an existing user account without OAuth linkage
- **THEN** the system prompts the user to confirm account linking
- **AND** requires password confirmation before linking the OAuth provider

#### Scenario: User links OAuth provider to existing account
- **WHEN** an authenticated user clicks "Link Google Account" and confirms with password
- **THEN** the system creates an OAuth provider linkage for the user
- **AND** stores encrypted OAuth tokens
- **AND** logs the `user.oauth.linked.google` audit event

#### Scenario: User unlinks OAuth provider
- **WHEN** an authenticated user clicks "Unlink Google Account"
- **THEN** the system deletes the OAuth provider linkage
- **AND** logs the `user.oauth.unlinked.google` audit event
- **AND** the user can no longer log in via that OAuth provider

#### Scenario: User can link multiple OAuth providers
- **WHEN** a user has linked Google and attempts to link Facebook
- **THEN** the system allows linking Facebook as an additional provider
- **AND** the user can log in using either Google or Facebook

#### Scenario: OAuth callback CSRF protection
- **WHEN** an OAuth callback is received without a valid state parameter
- **THEN** the system rejects the callback
- **AND** displays an error message "Invalid OAuth state. Please try again."

### Requirement: Unified Login Form
The system SHALL accept either email or phone number in the login form and determine the authentication method automatically.

#### Scenario: User enters email in login form
- **WHEN** a user enters an email address (contains '@') in the login field
- **THEN** the system treats it as email-based login
- **AND** prompts for password
- **AND** authenticates via email credentials

#### Scenario: User enters phone number in login form
- **WHEN** a user enters a phone number (numeric with optional country code) in the login field
- **THEN** the system treats it as phone-based login
- **AND** sends an OTP via SMS
- **AND** displays the OTP verification page

### Requirement: Session Management
The system SHALL manage user sessions with secure token-based authentication and device tracking.

#### Scenario: Session established on successful login
- **WHEN** a user successfully authenticates via any method (email, phone, OAuth)
- **THEN** the system creates a session in the `sessions` table
- **AND** stores the session ID in an httponly, secure, samesite=lax cookie
- **AND** records the IP address and user agent
- **AND** updates the user's `last_login_at` and `last_login_ip` fields

#### Scenario: Session ID regenerated on login
- **WHEN** a user logs in successfully
- **THEN** the system regenerates the session ID to prevent session fixation attacks

#### Scenario: Session expires after idle timeout
- **WHEN** a user's session is inactive for 120 minutes (configurable)
- **THEN** the system invalidates the session
- **AND** redirects the user to the login page on next request

#### Scenario: User logs out
- **WHEN** a user clicks "Log Out"
- **THEN** the system destroys the current session
- **AND** logs the `user.logout` audit event
- **AND** redirects to the login page

### Requirement: Password Management
The system SHALL provide secure password creation, update, and reset flows.

#### Scenario: Password complexity validation
- **WHEN** a user creates or updates their password
- **THEN** the system enforces minimum 8 characters
- **AND** requires at least one letter (configurable for additional complexity)

#### Scenario: User changes password while authenticated
- **WHEN** an authenticated user submits the password change form with current password and new password
- **THEN** the system verifies the current password
- **AND** updates the password (bcrypt hashed)
- **AND** logs the `user.password.changed` audit event
- **AND** logs out all other sessions (security measure)

#### Scenario: Password stored with bcrypt hashing
- **WHEN** a user creates or updates their password
- **THEN** the system hashes the password using bcrypt with cost factor 12 (Laravel default)
- **AND** never stores plaintext passwords

### Requirement: Authentication Rate Limiting
The system SHALL rate-limit authentication attempts to prevent brute force attacks.

#### Scenario: Email/password login rate limited
- **WHEN** a user fails to log in 5 times within 1 minute from the same IP
- **THEN** the system blocks further login attempts for 1 minute
- **AND** displays an error message "Too many login attempts. Please try again in 1 minute."
- **AND** logs a fraud alert event

#### Scenario: Phone OTP send rate limited
- **WHEN** an IP address requests OTP codes for the same phone number 5 times within 1 hour
- **THEN** the system blocks further OTP requests for that phone
- **AND** displays an error message "Too many OTP requests. Please try again later."

#### Scenario: Phone OTP verify rate limited
- **WHEN** an IP address submits invalid OTP codes 5 times within 1 hour for the same phone
- **THEN** the system blocks further OTP verification attempts
- **AND** displays an error message "Too many verification attempts. Request a new OTP."

#### Scenario: OAuth callback rate limited
- **WHEN** an IP address makes more than 10 OAuth callback requests within 1 minute
- **THEN** the system blocks further callbacks
- **AND** displays an error message "Too many authentication attempts. Please try again later."

### Requirement: Authentication Audit Logging
The system SHALL log all authentication events to the audit trail for security monitoring.

#### Scenario: Successful login logged
- **WHEN** a user successfully logs in via any method
- **THEN** the system logs an audit event with type `user.login.{method}`, user ID, IP address, user agent, and timestamp

#### Scenario: Failed login logged
- **WHEN** a user fails to log in (incorrect password, invalid OTP, OAuth error)
- **THEN** the system logs an audit event with type `user.login.failed`, attempted credential (email/phone), IP address, user agent, and failure reason

#### Scenario: Registration logged
- **WHEN** a user successfully registers an account
- **THEN** the system logs an audit event with type `user.registered.{method}`, user ID, IP address, and timestamp

#### Scenario: Password change logged
- **WHEN** a user changes their password
- **THEN** the system logs an audit event with type `user.password.changed`, user ID, IP address, and timestamp

#### Scenario: OAuth provider link/unlink logged
- **WHEN** a user links or unlinks an OAuth provider
- **THEN** the system logs an audit event with type `user.oauth.linked.{provider}` or `user.oauth.unlinked.{provider}`, user ID, provider, and timestamp

### Requirement: Account Credential Constraints
The system SHALL enforce that every user account has at least one authentication method (email OR phone OR OAuth).

#### Scenario: New user must have email or phone
- **WHEN** a user attempts to register without both email and phone
- **THEN** the system rejects the registration
- **AND** displays an error message "At least one of email or phone is required."

#### Scenario: Database constraint enforces at least one credential
- **WHEN** a database insert or update attempts to set both email and phone to null
- **THEN** the database check constraint fails
- **AND** the system prevents the operation

#### Scenario: User cannot remove last authentication method
- **WHEN** a user has only one authentication method (e.g., email only) and attempts to delete or unlink it
- **THEN** the system prevents the operation
- **AND** displays an error message "You must have at least one authentication method."

### Requirement: Phone Number Storage and Formatting
The system SHALL store phone numbers in normalized E.164 international format with separate country code field.

#### Scenario: Phone number normalized to E.164 format
- **WHEN** a user enters a phone number during registration or profile update
- **THEN** the system normalizes it to E.164 format (e.g., `+60123456789`)
- **AND** stores the normalized phone in the `phone` field (encrypted)
- **AND** stores the ISO 3166-1 alpha-2 country code in the `phone_country_code` field (e.g., `MY`)

#### Scenario: Phone number uniqueness enforced
- **WHEN** a user attempts to register with a phone number that already exists in the system
- **THEN** the system rejects the registration
- **AND** displays an error message "This phone number is already registered."

#### Scenario: Phone number encrypted at rest
- **WHEN** a phone number is stored in the database
- **THEN** the system encrypts the phone number using Laravel's encryption (AES-256-CBC)
- **AND** decrypts it transparently on retrieval

### Requirement: Email Uniqueness and Verification
The system SHALL enforce email uniqueness and require email verification for email-based accounts.

#### Scenario: Email uniqueness enforced
- **WHEN** a user attempts to register with an email that already exists in the system
- **THEN** the system rejects the registration
- **AND** displays an error message "This email address is already registered."

#### Scenario: Email verification link sent on registration
- **WHEN** a user registers with an email address
- **THEN** the system sends a verification email with a signed URL
- **AND** the verification link expires after 60 minutes

#### Scenario: Email verification link clicked
- **WHEN** a user clicks a valid email verification link
- **THEN** the system marks the email as verified (`email_verified_at` timestamp)
- **AND** logs the `user.email.verified` audit event
- **AND** redirects to the dashboard with a success message

#### Scenario: Expired email verification link
- **WHEN** a user clicks an email verification link that expired
- **THEN** the system displays an error message "Verification link expired. Request a new link."
- **AND** provides a button to resend the verification email

### Requirement: OAuth Token Management
The system SHALL securely store and refresh OAuth access tokens.

#### Scenario: OAuth tokens encrypted at rest
- **WHEN** an OAuth provider linkage is created
- **THEN** the system encrypts the access_token and refresh_token using Laravel's encryption
- **AND** stores them in the `oauth_providers` table

#### Scenario: OAuth access token refreshed automatically
- **WHEN** an OAuth access token is expired and a refresh_token is available
- **THEN** the system automatically requests a new access token using the refresh token
- **AND** updates the stored access_token and expires_at fields

#### Scenario: OAuth tokens revoked on provider unlink
- **WHEN** a user unlinks an OAuth provider
- **THEN** the system deletes the OAuth provider record
- **AND** the stored tokens are removed from the database

### Requirement: Security Headers for Auth Pages
The system SHALL apply security headers to all authentication pages to prevent attacks.

#### Scenario: CSRF protection on auth forms
- **WHEN** a user loads any authentication form (login, register, password reset)
- **THEN** the system includes a CSRF token in the form
- **AND** validates the token on form submission

#### Scenario: X-Frame-Options prevents clickjacking
- **WHEN** the system serves any authentication page
- **THEN** the response includes the header `X-Frame-Options: DENY`

#### Scenario: Content Security Policy applied
- **WHEN** the system serves any authentication page
- **THEN** the response includes a Content-Security-Policy header restricting script sources
