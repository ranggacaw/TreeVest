# rate-limiting Specification

## Purpose
TBD - created by archiving change add-security-compliance-infrastructure. Update Purpose after archive.
## Requirements
### Requirement: Authentication Endpoint Rate Limiting
The system SHALL enforce rate limits on authentication endpoints (login, registration, password reset) to prevent brute-force attacks and credential stuffing.

#### Scenario: Login attempts rate limited
- **WHEN** a client makes more than 5 login requests from the same IP address within 1 minute
- **THEN** subsequent requests return HTTP 429 Too Many Requests
- **AND** a `Retry-After` header indicates when the limit will reset

#### Scenario: Registration rate limited
- **WHEN** a client makes more than 5 registration requests from the same IP address within 1 minute
- **THEN** subsequent requests return HTTP 429 Too Many Requests
- **AND** the rate limit counter resets after 1 minute

#### Scenario: Password reset rate limited
- **WHEN** a client requests password reset more than 5 times from the same IP address within 1 minute
- **THEN** subsequent requests return HTTP 429 Too Many Requests
- **AND** legitimate users are not prevented from recovering their accounts after the cooldown period

#### Scenario: Rate limit based on IP address
- **WHEN** rate limiting is applied to authentication endpoints
- **THEN** the limit is keyed by the client's IP address (`$request->ip()`)
- **AND** different IP addresses have independent rate limit counters

### Requirement: Financial Transaction Rate Limiting
The system SHALL enforce rate limits on financial transaction endpoints (investment purchases, payout requests) to prevent rapid-fire fraud and system abuse.

#### Scenario: Investment purchase rate limited per user
- **WHEN** an authenticated user makes more than 10 investment purchase requests within 1 minute
- **THEN** subsequent requests return HTTP 429 Too Many Requests
- **AND** the rate limit is keyed by the authenticated user's ID

#### Scenario: Investment purchase rate limited per IP for guests
- **WHEN** an unauthenticated client attempts investment purchases (which should fail auth anyway)
- **THEN** the rate limit falls back to IP-based limiting (10 requests/minute)
- **AND** the system is protected from unauthenticated mass requests

#### Scenario: Payout request rate limited
- **WHEN** a user requests payouts more than 10 times within 1 minute
- **THEN** subsequent requests return HTTP 429 Too Many Requests
- **AND** legitimate payout requests are not blocked during normal operation

### Requirement: General API Rate Limiting
The system SHALL enforce a general rate limit on all API endpoints to protect against DDoS and resource exhaustion attacks.

#### Scenario: General endpoint rate limited per user
- **WHEN** an authenticated user makes more than 100 requests within 1 minute to any endpoint
- **THEN** subsequent requests return HTTP 429 Too Many Requests
- **AND** the rate limit is keyed by the authenticated user's ID

#### Scenario: General endpoint rate limited per IP for guests
- **WHEN** an unauthenticated client makes more than 100 requests within 1 minute
- **THEN** subsequent requests return HTTP 429 Too Many Requests
- **AND** the rate limit is keyed by IP address

### Requirement: Rate Limit Configuration
The system SHALL define rate limiters in `RouteServiceProvider` with named limiters (`auth-throttle`, `financial-throttle`, `general-throttle`) for flexible application to route groups.

#### Scenario: Named rate limiters defined
- **WHEN** the application boots
- **THEN** named rate limiters are registered: `auth` (5/min), `financial` (10/min), `general` (100/min)
- **AND** these limiters can be referenced in route middleware

#### Scenario: Rate limiters applied to route groups
- **WHEN** routes are defined in `routes/web.php`
- **THEN** authentication routes use `middleware(['throttle:auth'])`
- **AND** financial transaction routes use `middleware(['auth', 'throttle:financial'])`
- **AND** general routes use the default rate limiter or explicit `throttle:general`

### Requirement: Rate Limit Response Format
The system SHALL return appropriate HTTP 429 responses with `Retry-After` headers when rate limits are exceeded, compatible with both Inertia.js (web) and JSON (API) clients.

#### Scenario: Inertia.js web response on rate limit
- **WHEN** a rate-limited Inertia request exceeds its limit
- **THEN** an HTTP 429 response is returned with an Inertia error page
- **AND** the error page displays a user-friendly message: "Too many requests. Please try again in X seconds."

#### Scenario: JSON API response on rate limit
- **WHEN** a rate-limited JSON API request exceeds its limit
- **THEN** an HTTP 429 response is returned with JSON body: `{"message": "Too Many Requests", "retry_after": <seconds>}`
- **AND** the `Retry-After` header indicates the cooldown period in seconds

#### Scenario: Retry-After header present
- **WHEN** any rate-limited request exceeds its limit
- **THEN** the `Retry-After` HTTP header is included in the 429 response
- **AND** the value is the number of seconds until the rate limit resets

### Requirement: Rate Limit Monitoring
The system SHALL log rate limit violations to the audit log for security monitoring and threshold tuning.

#### Scenario: Rate limit violation logged
- **WHEN** a client exceeds a rate limit
- **THEN** an audit log entry is created with event type `rate_limit_exceeded`
- **AND** the log includes the client IP, user ID (if authenticated), endpoint path, and rate limiter name
- **AND** administrators can query rate limit violations to identify abusive clients or tune thresholds

### Requirement: Phone OTP Rate Limiting
The system SHALL enforce rate limits on phone OTP operations to prevent SMS abuse and brute force attacks.

#### Scenario: Phone OTP send rate limited per phone number
- **WHEN** a client requests OTP codes for the same phone number more than 5 times within 1 hour
- **THEN** subsequent requests return HTTP 429 Too Many Requests
- **AND** a `Retry-After` header indicates when the limit will reset (in seconds)
- **AND** the rate limit is keyed by the phone number (hashed for privacy)

#### Scenario: Phone OTP verify rate limited per phone number
- **WHEN** a client submits invalid OTP verification attempts for the same phone number more than 5 times within 1 hour
- **THEN** subsequent verification attempts return HTTP 429 Too Many Requests
- **AND** the rate limit counter resets after 1 hour

#### Scenario: Phone OTP resend rate limited
- **WHEN** a user clicks "Resend OTP" more than 5 times within 1 hour for the same phone number
- **THEN** subsequent resend requests return HTTP 429 Too Many Requests
- **AND** displays an error message "Too many OTP requests. Please try again later."

### Requirement: OAuth Callback Rate Limiting
The system SHALL enforce rate limits on OAuth callback endpoints to prevent OAuth flow abuse.

#### Scenario: OAuth callback rate limited per IP
- **WHEN** a client makes more than 10 OAuth callback requests from the same IP address within 1 minute
- **THEN** subsequent requests return HTTP 429 Too Many Requests
- **AND** legitimate OAuth flows are not blocked during normal operation

#### Scenario: OAuth redirect rate limited per IP
- **WHEN** a client initiates more than 20 OAuth redirects from the same IP address within 1 minute
- **THEN** subsequent requests return HTTP 429 Too Many Requests
- **AND** the rate limit prevents OAuth flow spamming

### Requirement: Two-Factor Authentication Rate Limiting
The system SHALL enforce rate limits on 2FA verification attempts to prevent brute force attacks on TOTP/SMS codes.

#### Scenario: 2FA verification rate limited per user
- **WHEN** a user submits more than 5 invalid 2FA codes within 1 minute
- **THEN** the system blocks further 2FA verification attempts
- **AND** logs the user out
- **AND** locks the account for 15 minutes
- **AND** displays an error message "Too many verification attempts. Your account has been locked for 15 minutes."
- **AND** logs a fraud alert event

#### Scenario: 2FA SMS OTP send rate limited during login
- **WHEN** a user requests "Resend OTP" more than 5 times within 1 hour during 2FA login
- **THEN** the system blocks further OTP requests
- **AND** displays an error message "Too many OTP requests. Please try again later."

#### Scenario: Recovery code attempts rate limited
- **WHEN** a user submits more than 5 invalid recovery codes within 1 minute
- **THEN** the system blocks further recovery code attempts
- **AND** logs the user out
- **AND** displays an error message "Too many recovery code attempts. Please contact support."

### Requirement: Profile Update Rate Limiting
The system SHALL enforce rate limits on profile update operations to prevent abuse.

#### Scenario: Profile updates rate limited per user
- **WHEN** an authenticated user submits more than 10 profile update requests within 1 hour
- **THEN** subsequent requests return HTTP 429 Too Many Requests
- **AND** displays an error message "Too many update requests. Please try again later."

#### Scenario: Avatar uploads rate limited per user
- **WHEN** an authenticated user uploads more than 5 avatars within 1 hour
- **THEN** subsequent upload requests return HTTP 429 Too Many Requests
- **AND** displays an error message "Too many upload attempts. Please try again later."

#### Scenario: Phone number change rate limited per user
- **WHEN** a user attempts to change their phone number more than once within 7 days
- **THEN** the system rejects the update
- **AND** displays an error message "You can only change your phone number once every 7 days."
- **AND** the rate limit is keyed by user ID and action type

#### Scenario: Email change rate limited per user
- **WHEN** a user attempts to change their email address more than 3 times within 24 hours
- **THEN** the system rejects the update
- **AND** displays an error message "Too many email change requests. Please try again later."

### Requirement: Rate Limiter Configuration
The system SHALL define named rate limiters for authentication operations in the service provider.

#### Scenario: Phone OTP send rate limiter defined
- **WHEN** the system initializes rate limiters
- **THEN** a named rate limiter `phone-otp-send` is defined
- **AND** it limits to 5 requests per hour keyed by phone number

#### Scenario: Phone OTP verify rate limiter defined
- **WHEN** the system initializes rate limiters
- **THEN** a named rate limiter `phone-otp-verify` is defined
- **AND** it limits to 5 requests per hour keyed by phone number

#### Scenario: 2FA verify rate limiter defined
- **WHEN** the system initializes rate limiters
- **THEN** a named rate limiter `2fa-verify` is defined
- **AND** it limits to 5 requests per minute keyed by user ID

#### Scenario: OAuth callback rate limiter defined
- **WHEN** the system initializes rate limiters
- **THEN** a named rate limiter `oauth-callback` is defined
- **AND** it limits to 10 requests per minute keyed by IP address

#### Scenario: Profile update rate limiter defined
- **WHEN** the system initializes rate limiters
- **THEN** a named rate limiter `profile-update` is defined
- **AND** it limits to 10 requests per hour keyed by user ID

#### Scenario: Avatar upload rate limiter defined
- **WHEN** the system initializes rate limiters
- **THEN** a named rate limiter `avatar-upload` is defined
- **AND** it limits to 5 requests per hour keyed by user ID

### Requirement: Rate Limiter Application to Routes
The system SHALL apply named rate limiters to authentication and profile management routes.

#### Scenario: Phone auth routes rate limited
- **WHEN** phone authentication routes are registered
- **THEN** the `phone-otp-send` limiter is applied to OTP send routes (`/auth/phone/register`, `/auth/phone/login`, `/auth/phone/resend-otp`)
- **AND** the `phone-otp-verify` limiter is applied to OTP verification routes (`/auth/phone/verify`, `/auth/phone/verifyLogin`)

#### Scenario: OAuth routes rate limited
- **WHEN** OAuth routes are registered
- **THEN** the `oauth-callback` limiter is applied to callback routes (`/auth/{provider}/callback`)
- **AND** OAuth redirect routes are limited to 20 requests/minute per IP

#### Scenario: 2FA routes rate limited
- **WHEN** 2FA routes are registered
- **THEN** the `2fa-verify` limiter is applied to verification routes (`/auth/2fa/verify`, `/auth/2fa/recovery`)
- **AND** 2FA setup routes are limited to 10 requests/hour per user

#### Scenario: Profile update routes rate limited
- **WHEN** profile management routes are registered
- **THEN** the `profile-update` limiter is applied to update routes (`/profile`, `/profile/phone/update`, `/profile/email/update`)
- **AND** the `avatar-upload` limiter is applied to avatar routes (`/profile/avatar`)

### Requirement: Rate Limit Response Format Extensions
The system SHALL provide consistent error messages for rate-limited authentication operations.

#### Scenario: Phone OTP rate limit displays user-friendly message
- **WHEN** a phone OTP request is rate-limited
- **THEN** the Inertia response includes an error message "Too many OTP requests. Please try again later."
- **AND** the response includes a `Retry-After` header with seconds until reset

#### Scenario: 2FA rate limit locks account temporarily
- **WHEN** a 2FA verification request is rate-limited
- **THEN** the user is logged out
- **AND** the error message displays "Too many verification attempts. Your account has been locked for 15 minutes."
- **AND** a fraud alert is logged

#### Scenario: OAuth callback rate limit displays retry message
- **WHEN** an OAuth callback request is rate-limited
- **THEN** the error message displays "Too many authentication attempts. Please try again later."
- **AND** the user is redirected to the login page

### Requirement: Rate Limit Monitoring for Authentication
The system SHALL log rate limit violations for authentication operations to detect abuse patterns.

#### Scenario: Phone OTP rate limit violation logged
- **WHEN** a phone OTP rate limit is exceeded
- **THEN** an audit log event is created with type `rate_limit_exceeded` and details: `{"limiter": "phone-otp-send", "phone": "...", "ip_address": "...", "retry_after": 3600}`

#### Scenario: 2FA rate limit violation logged
- **WHEN** a 2FA verification rate limit is exceeded
- **THEN** an audit log event is created with type `rate_limit_exceeded` and details: `{"limiter": "2fa-verify", "user_id": "...", "ip_address": "...", "account_locked": true}`
- **AND** a fraud alert is created with severity `high`

#### Scenario: OAuth callback rate limit violation logged
- **WHEN** an OAuth callback rate limit is exceeded
- **THEN** an audit log event is created with type `rate_limit_exceeded` and details: `{"limiter": "oauth-callback", "ip_address": "...", "provider": "..."}`

### Requirement: Rate Limit Bypass for Testing
The system SHALL allow rate limits to be disabled or adjusted in testing and development environments.

#### Scenario: Rate limits disabled in testing environment
- **WHEN** the application runs in the `testing` environment
- **THEN** rate limiters return unlimited capacity
- **AND** tests can execute authentication flows without hitting rate limits

#### Scenario: Rate limit thresholds configurable via environment variables
- **WHEN** the system initializes rate limiters
- **THEN** rate limit thresholds are read from config/environment variables (e.g., `RATE_LIMIT_PHONE_OTP_SEND=5`, `RATE_LIMIT_2FA_VERIFY=5`)
- **AND** default values are used if environment variables are not set

