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

