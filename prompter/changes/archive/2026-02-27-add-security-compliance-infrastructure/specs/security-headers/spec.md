# Capability: Security Headers

## ADDED Requirements

### Requirement: HTTP Security Headers Middleware
The system SHALL inject security headers on every HTTP response to protect against common web vulnerabilities including clickjacking, XSS, MIME-type sniffing, and referrer leakage.

#### Scenario: Security headers present on all responses
- **WHEN** any HTTP response is sent to the browser
- **THEN** the response includes the following headers: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Content-Security-Policy`
- **AND** the headers are applied via global middleware

#### Scenario: X-Frame-Options prevents clickjacking
- **WHEN** a response is sent to the browser
- **THEN** the `X-Frame-Options` header is set to `DENY` (or `SAMEORIGIN` if configured)
- **AND** the page cannot be embedded in an iframe on external domains

#### Scenario: X-Content-Type-Options prevents MIME sniffing
- **WHEN** a response is sent to the browser
- **THEN** the `X-Content-Type-Options` header is set to `nosniff`
- **AND** browsers are prevented from MIME-type sniffing responses away from the declared content type

#### Scenario: Referrer-Policy controls referrer leakage
- **WHEN** a response is sent to the browser
- **THEN** the `Referrer-Policy` header is set to `strict-origin-when-cross-origin`
- **AND** full referrer URLs are only sent to same-origin requests

### Requirement: Content Security Policy (CSP)
The system SHALL implement a Content Security Policy that restricts resource loading to trusted sources, with configuration for external integrations (Google Maps, Stripe, analytics).

#### Scenario: CSP header applied to all responses
- **WHEN** an HTTP response is sent to the browser
- **THEN** the `Content-Security-Policy` header is present
- **AND** it includes directives for `default-src`, `script-src`, `style-src`, `img-src`, `connect-src`

#### Scenario: CSP allows Vite dev server in development
- **WHEN** the application is running in development mode
- **THEN** the CSP `script-src` directive includes `'unsafe-inline'` and the Vite dev server origin
- **AND** the CSP `connect-src` directive includes the Vite WebSocket connection

#### Scenario: CSP allows external integrations
- **WHEN** the application is configured with external services (Google Maps, Stripe)
- **THEN** the CSP `script-src` directive includes the configured external domains from `config('security.csp.script_src')`
- **AND** the CSP `connect-src` directive includes API endpoints for those services

#### Scenario: CSP configured from environment
- **WHEN** `CSP_SCRIPT_SRC` environment variable is set to `https://maps.googleapis.com https://js.stripe.com`
- **THEN** the generated CSP header includes those domains in the `script-src` directive
- **AND** CSP policy can be updated without code changes

### Requirement: HTTP Strict Transport Security (HSTS)
The system SHALL enforce HTTPS connections via HSTS header in production environments to prevent protocol downgrade attacks.

#### Scenario: HSTS enabled in production
- **WHEN** the application is running in production mode with `SECURITY_HSTS_ENABLED=true`
- **THEN** the `Strict-Transport-Security` header is set to `max-age=31536000; includeSubDomains`
- **AND** browsers are forced to use HTTPS for all future requests for 1 year

#### Scenario: HSTS disabled in development
- **WHEN** the application is running in development mode with `SECURITY_HSTS_ENABLED=false`
- **THEN** the `Strict-Transport-Security` header is NOT included in responses
- **AND** developers can use HTTP for local testing

### Requirement: Security Headers Configuration
The system SHALL provide configuration options for security headers via `config/security.php` to allow environment-specific tuning without code changes.

#### Scenario: X-Frame-Options configurable
- **WHEN** `config('security.x_frame_options')` is set to `SAMEORIGIN`
- **THEN** the `X-Frame-Options` header is set to `SAMEORIGIN` instead of `DENY`
- **AND** the page can be embedded in iframes on the same origin

#### Scenario: CSP directives configurable per environment
- **WHEN** different environments require different CSP policies (permissive dev, strict production)
- **THEN** CSP directives are read from `config/security.php` with environment-specific overrides via `.env`
- **AND** policy changes do not require code deployment

#### Scenario: HSTS toggleable via environment variable
- **WHEN** `SECURITY_HSTS_ENABLED` environment variable is set
- **THEN** HSTS header inclusion is controlled by that boolean flag
- **AND** HSTS can be disabled for local development without code changes
