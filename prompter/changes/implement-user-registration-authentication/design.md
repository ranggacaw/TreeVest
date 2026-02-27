# Design Document: User Registration & Authentication System

## Context
We are extending Laravel Breeze's email-based authentication to support multiple authentication methods (email, phone, social OAuth), two-factor authentication, and enhanced profile management. The system must maintain security best practices while providing a seamless user experience across different authentication flows.

**Current State:**
- Laravel Breeze 2.x (React + TypeScript) installed, providing email-based registration/login/password reset/email verification
- User model exists with basic fields (name, email, password, role)
- Session-based authentication using database driver
- Audit logging, rate limiting, and GDPR compliance specs already in place

**Constraints:**
- Must not break existing email-based authentication
- Must integrate with existing audit logging and rate limiting infrastructure
- Must comply with existing GDPR data export/deletion requirements
- Phone numbers and OAuth tokens must be encrypted at rest
- All auth events must be auditable

## Goals / Non-Goals

### Goals
- Support email, phone, and social OAuth as registration/login methods
- Implement optional 2FA (TOTP and SMS OTP) for enhanced security
- Provide complete user profile management (name, email, phone, avatar)
- Enable account deactivation with GDPR-compliant data handling
- Log all authentication events for security auditing
- Maintain backward compatibility with existing Breeze auth flows

### Non-Goals
- Passwordless authentication (magic links) — deferred to future scope
- Biometric authentication — deferred to mobile apps
- Single Sign-On (SSO) / SAML integration — not required for MVP
- Multi-tenancy support — not applicable
- Device trust scoring / risk-based authentication — deferred

## Technical Decisions

### Decision 1: Phone Authentication Strategy
**Choice:** Phone as alternative credential to email (either/or, not both required)

**Rationale:**
- Users can register with phone OR email (user's choice)
- Login accepts either phone or email as identifier
- Both methods have equal status (neither is "primary")
- Simplifies onboarding for users who prefer phone-based auth

**Implementation:**
- `users` table: `email` remains nullable, `phone` is also nullable, but at least one must be present (database constraint)
- Login form accepts text input, server determines if it's email or phone format
- Separate verification flows: email verification via link, phone verification via SMS OTP
- User model validation: `required_without` rule ensures at least one credential exists

**Alternatives Considered:**
- **Phone as additional field (email required):** Rejected — adds friction for users who prefer phone-only
- **Both required:** Rejected — excessive friction, not user-friendly

### Decision 2: Social OAuth Provider Integration
**Choice:** Laravel Socialite with database-backed OAuth provider linkages

**Rationale:**
- Socialite is Laravel's official OAuth abstraction, well-maintained and supports major providers
- Store OAuth provider linkages in separate `oauth_providers` table for flexibility
- Allow users to link multiple OAuth providers to one account (Google + Facebook, etc.)
- OAuth providers can be added/removed without affecting primary credentials

**Implementation:**
- Install `laravel/socialite` package
- `oauth_providers` table: `user_id`, `provider` (enum: google, facebook, apple), `provider_user_id`, `access_token` (encrypted), `refresh_token` (encrypted), `expires_at`
- OAuth flow: `/auth/{provider}/redirect` → provider consent → `/auth/{provider}/callback` → create/link account
- If OAuth email matches existing user email, prompt to link accounts (requires password confirmation)
- If new OAuth user, create account without password (email auth disabled unless password set later)

**Alternatives Considered:**
- **Sanctum for OAuth:** Rejected — Sanctum is for API tokens, not OAuth flows
- **Manual OAuth implementation:** Rejected — Socialite handles CSRF, state validation, token refresh

### Decision 3: Two-Factor Authentication (2FA) Architecture
**Choice:** Hybrid 2FA supporting both TOTP (app-based) and SMS OTP, with recovery codes

**Rationale:**
- TOTP (Google Authenticator, Authy, etc.) is more secure and doesn't depend on SMS delivery
- SMS OTP is more accessible for users without authenticator apps
- Users choose their preferred 2FA method during setup
- Recovery codes provide backup access if 2FA device is lost

**Implementation:**
- `two_factor_secrets` table: `user_id`, `type` (enum: totp, sms), `secret` (encrypted), `enabled_at`, `last_used_at`
- `two_factor_recovery_codes` table: `user_id`, `code` (bcrypt hashed), `used_at`
- TOTP: Use `pragmarx/google2fa` package, 30-second window, 6-digit codes
- SMS OTP: Generate 6-digit code, send via SMS gateway, 10-minute expiry, single-use
- 2FA Setup Flow: User enables 2FA → system generates secret/codes → user scans QR (TOTP) or verifies phone (SMS) → user saves recovery codes → 2FA activated
- 2FA Login Flow: Username/password → success → 2FA prompt → verify TOTP/SMS code OR recovery code → session established
- Recovery codes: 8 codes generated, single-use, bcrypt hashed, user must download/print during setup

**Alternatives Considered:**
- **TOTP-only:** Rejected — excludes users without authenticator apps
- **SMS-only:** Rejected — vulnerable to SIM swap attacks, less secure
- **WebAuthn/FIDO2:** Deferred — better for future mobile apps, more complex integration

### Decision 4: Session Management & Device Tracking
**Choice:** Extend Laravel session table with device fingerprinting

**Rationale:**
- Users need visibility into active sessions across devices
- Fraud detection requires device fingerprinting (IP + user agent)
- Remote logout capability enhances security

**Implementation:**
- Existing `sessions` table already has `ip_address` and `user_agent`
- Add session service: `SessionService::getActiveSessions(User $user)` → returns list of sessions with last activity
- Profile page displays active sessions: device name (parsed from user agent), location (from IP), last active time
- "Log out this device" button dispatches job to invalidate session by ID
- "Log out all other devices" uses Laravel's `Auth::logoutOtherDevices()`

**Alternatives Considered:**
- **JWT tokens:** Rejected — Breeze uses session-based auth, JWT adds complexity, not suitable for web SPA
- **No device tracking:** Rejected — security requirement, users need visibility

### Decision 5: Phone Number Storage Format
**Choice:** Store normalized E.164 format (`+60123456789`) with separate country code field

**Rationale:**
- E.164 is international standard for phone numbers
- Separate country code field allows frontend to display formatted numbers correctly
- Simplifies phone number validation and comparison (no formatting ambiguity)

**Implementation:**
- `users` table: `phone` (encrypted, E.164 format), `phone_country_code` (e.g., `MY`, `US`)
- Frontend: Use `react-phone-number-input` component for input with country selector
- Backend validation: Validate E.164 format using `libphonenumber` PHP port
- Display: Frontend parses `phone` and `phone_country_code` to show national format

**Alternatives Considered:**
- **Raw input + country code:** Rejected — formatting inconsistencies, harder to validate
- **National format only:** Rejected — doesn't support international users

### Decision 6: SMS Gateway Selection
**Choice:** Twilio as primary SMS provider, configurable via `.env`

**Rationale:**
- Twilio has best reliability and deliverability (99.95% uptime SLA)
- Supports 180+ countries, good for international expansion
- Comprehensive API, good Laravel integration packages available
- Fallback: configurable to swap with Vonage or AWS SNS via adapter pattern

**Implementation:**
- Install `twilio/sdk` package
- Create `SmsService` interface with `sendOtp(string $phone, string $code): bool` method
- `TwilioSmsProvider` implements `SmsService` using Twilio API
- Config: `config/services.php` → `'sms' => ['driver' => env('SMS_DRIVER', 'twilio'), ...]`
- Adapter pattern allows swapping SMS provider without changing business logic

**Alternatives Considered:**
- **Vonage (Nexmo):** Deferred — cheaper but slightly lower reliability
- **AWS SNS:** Deferred — good for AWS-hosted apps, requires more setup
- **No SMS:** Rejected — phone authentication requires OTP delivery

### Decision 7: Avatar Storage Strategy
**Choice:** Local storage (`storage/app/public/avatars/`) with symlink to `public/storage`

**Rationale:**
- Simplest solution for MVP, no external dependencies
- Laravel's storage system handles uploads securely
- Easy to migrate to S3/cloud storage later via Laravel's filesystem abstraction
- Avatars are public (not sensitive), so public storage is acceptable

**Implementation:**
- Store avatars in `storage/app/public/avatars/{user_id}/{filename}`
- Symlink: `php artisan storage:link` creates `public/storage → storage/app/public`
- User model: `avatar_url` field stores relative path (`avatars/{user_id}/{filename}`)
- Frontend: Display via `<img src={`/storage/${user.avatar_url}`} />`
- File validation: Max 2MB, MIME types: `image/jpeg`, `image/png`, `image/webp`

**Alternatives Considered:**
- **S3/cloud storage:** Deferred — adds cost and complexity, not needed for MVP
- **Database storage:** Rejected — bloats database, not recommended for binary files

### Decision 8: Account Deactivation vs Deletion
**Choice:** Soft delete (immediate) with optional hard delete (manual admin action)

**Rationale:**
- GDPR requires "right to be forgotten" but allows retention of financial records
- Soft delete (Laravel's `SoftDeletes` trait) marks account inactive, preserves data for audit
- Hard delete (manual admin trigger) anonymizes financial records, permanently deletes PII
- User-initiated deactivation = soft delete; user requests full deletion = admin review + hard delete

**Implementation:**
- `users` table: `deleted_at` (soft delete timestamp)
- Deactivate flow: User clicks "Deactivate Account" → confirmation modal → soft delete → logout
- GDPR deletion flow: User requests deletion → admin reviews (ensures no pending investments/payouts) → admin triggers hard delete → `GdprDataDeletionService` anonymizes transactions, purges PII
- Deactivated accounts: cannot log in, profile hidden, investment portfolio frozen (no new investments)
- Reactivation: Admin can restore soft-deleted accounts within 30 days (configurable)

**Alternatives Considered:**
- **Immediate hard delete:** Rejected — violates audit requirements, loses financial records
- **30-day grace period:** Deferred — adds complexity, can be added later if needed

## Data Model Changes

### New Tables

#### `phone_verifications`
```
id: bigint (PK)
phone: string (encrypted, E.164 format)
code: string (6-digit numeric, bcrypt hashed)
expires_at: timestamp
verified_at: timestamp (nullable)
created_at: timestamp
```
**Purpose:** Store OTP codes for phone verification (registration and phone number updates)

#### `oauth_providers`
```
id: bigint (PK)
user_id: bigint (FK → users.id)
provider: enum('google', 'facebook', 'apple')
provider_user_id: string (unique per provider)
access_token: text (encrypted)
refresh_token: text (encrypted, nullable)
expires_at: timestamp (nullable)
created_at: timestamp
updated_at: timestamp
UNIQUE(provider, provider_user_id)
```
**Purpose:** Link users to external OAuth providers

#### `two_factor_secrets`
```
id: bigint (PK)
user_id: bigint (FK → users.id, unique)
type: enum('totp', 'sms')
secret: text (encrypted, TOTP shared secret or SMS phone number)
enabled_at: timestamp
last_used_at: timestamp (nullable)
created_at: timestamp
updated_at: timestamp
```
**Purpose:** Store 2FA configuration per user

#### `two_factor_recovery_codes`
```
id: bigint (PK)
user_id: bigint (FK → users.id)
code: string (bcrypt hashed)
used_at: timestamp (nullable)
created_at: timestamp
INDEX(user_id)
```
**Purpose:** Recovery codes for 2FA account access

### Modified Tables

#### `users` (existing table, add columns)
```
+ phone: string (encrypted, nullable, unique, E.164 format)
+ phone_country_code: string(2) (nullable, ISO 3166-1 alpha-2)
+ phone_verified_at: timestamp (nullable)
+ avatar_url: string (nullable, relative path)
+ two_factor_enabled_at: timestamp (nullable)
+ last_login_at: timestamp (nullable)
+ last_login_ip: string(45) (nullable)
```

**Constraints:**
- At least one of `email` or `phone` must be non-null (check constraint)
- `email` unique when not null
- `phone` unique when not null

## API Surface / Routes

### New Routes (added to `routes/auth.php`)

#### Phone Authentication
```
POST /auth/phone/register          # Register with phone number
POST /auth/phone/verify            # Verify phone OTP (registration)
POST /auth/phone/login             # Login with phone + OTP
POST /auth/phone/resend-otp        # Resend OTP code
POST /profile/phone/update         # Update phone number (authenticated)
POST /profile/phone/verify         # Verify new phone OTP
```

#### OAuth
```
GET  /auth/{provider}/redirect     # Redirect to OAuth provider
GET  /auth/{provider}/callback     # OAuth callback handler
POST /auth/{provider}/link         # Link OAuth provider to existing account
DELETE /profile/oauth/{provider}   # Unlink OAuth provider
```

#### Two-Factor Authentication
```
GET  /profile/2fa                  # Show 2FA settings page
POST /profile/2fa/enable           # Enable 2FA (returns QR code for TOTP or sends SMS)
POST /profile/2fa/verify           # Verify 2FA setup (confirm code)
POST /profile/2fa/disable          # Disable 2FA (requires password confirmation)
POST /profile/2fa/recovery-codes   # Regenerate recovery codes
POST /auth/2fa/verify              # Verify 2FA code during login
POST /auth/2fa/recovery            # Use recovery code during login
```

#### Profile Management
```
GET  /profile                      # View profile (Breeze existing route)
PATCH /profile                     # Update profile (Breeze existing, extended)
POST /profile/avatar               # Upload avatar
DELETE /profile/avatar             # Remove avatar
GET  /profile/sessions             # View active sessions
DELETE /profile/sessions/{id}      # Log out specific session
POST /profile/sessions/revoke-all  # Log out all other devices
```

#### Account Management
```
POST /profile/deactivate           # Deactivate account (soft delete)
POST /profile/delete-request       # Request full GDPR deletion (admin review)
```

### Inertia Pages (React Components)

#### New Pages
```
resources/js/Pages/Auth/
├── PhoneRegister.tsx              # Phone registration form
├── PhoneLogin.tsx                 # Phone login form
├── PhoneVerify.tsx                # Phone OTP verification
├── TwoFactorChallenge.tsx         # 2FA verification during login

resources/js/Pages/Profile/
├── TwoFactorAuthentication.tsx    # 2FA settings (enable/disable, recovery codes)
├── ActiveSessions.tsx             # Device/session management
├── AccountSettings.tsx            # Account deactivation/deletion
```

#### Modified Pages
```
resources/js/Pages/Auth/
├── Login.tsx                      # Add OAuth buttons, phone login link
├── Register.tsx                   # Add OAuth buttons, phone registration link

resources/js/Pages/Profile/
├── Edit.tsx                       # Add avatar upload, phone field
```

#### New Components
```
resources/js/Components/Auth/
├── PhoneInput.tsx                 # Phone number input with country selector
├── OAuthButtons.tsx               # Google/Facebook/Apple sign-in buttons
├── TwoFactorSetup.tsx             # 2FA setup wizard (TOTP QR code or SMS)
├── RecoveryCodeDisplay.tsx        # Display/download recovery codes
├── SessionCard.tsx                # Device session card (location, last active)
```

## Service Layer Architecture

### Core Services

#### `PhoneVerificationService`
**Responsibilities:**
- Generate 6-digit OTP codes
- Send OTP via SMS gateway
- Verify OTP codes
- Track OTP attempts (rate limiting integration)

**Methods:**
```php
sendVerificationCode(string $phone): bool
verifyCode(string $phone, string $code): bool
resendCode(string $phone): bool
markPhoneAsVerified(User $user): void
```

#### `TwoFactorAuthService`
**Responsibilities:**
- Enable/disable 2FA for users
- Generate TOTP secrets and QR codes
- Verify TOTP codes
- Generate/verify recovery codes
- Send SMS OTP for SMS-based 2FA

**Methods:**
```php
enableTotp(User $user): array // returns ['secret', 'qr_code_url', 'recovery_codes']
enableSms(User $user): bool
verify(User $user, string $code): bool
verifyRecoveryCode(User $user, string $code): bool
disable(User $user): bool
regenerateRecoveryCodes(User $user): array
```

#### `OAuthProviderService`
**Responsibilities:**
- Handle OAuth callback flows
- Create/link OAuth provider accounts
- Refresh OAuth tokens
- Unlink OAuth providers

**Methods:**
```php
handleCallback(string $provider, SocialiteUser $socialiteUser): User
linkProvider(User $user, string $provider, SocialiteUser $socialiteUser): OAuthProvider
unlinkProvider(User $user, string $provider): bool
refreshToken(OAuthProvider $oauthProvider): bool
```

#### `SessionService`
**Responsibilities:**
- Retrieve active sessions for user
- Parse user agent to device name
- Revoke specific sessions
- Log out all other devices

**Methods:**
```php
getActiveSessions(User $user): Collection
revokeSession(string $sessionId): bool
revokeAllOtherSessions(User $user): int
updateLastLogin(User $user, Request $request): void
```

#### `AvatarService`
**Responsibilities:**
- Upload and validate avatar images
- Generate optimized versions (resize, compress)
- Delete old avatars
- Return public URLs

**Methods:**
```php
upload(User $user, UploadedFile $file): string // returns avatar_url
delete(User $user): bool
getPublicUrl(string $avatarUrl): string
```

## Security Measures

### OTP Security
- **Generation:** `random_int(100000, 999999)` for cryptographically secure randomness
- **Storage:** bcrypt hashed before storing in `phone_verifications` table
- **Expiry:** 10 minutes (configurable via `config/auth.php`)
- **Rate Limiting:** 5 OTP send attempts per phone per hour, 5 verify attempts per phone per hour
- **Single-Use:** OTP marked as used after successful verification, cannot be reused

### 2FA Security
- **TOTP Secret:** 32-byte random secret, base32 encoded, encrypted at rest
- **TOTP Window:** 30-second time step, allow ±1 step tolerance to account for clock drift
- **Recovery Codes:** 20-character alphanumeric, bcrypt hashed, single-use, 8 codes generated
- **Brute Force Protection:** 5 failed 2FA attempts → lock account for 15 minutes
- **Backup Codes:** User must download recovery codes before 2FA activation completes

### OAuth Security
- **State Parameter:** CSRF protection via random state parameter in OAuth flow
- **Token Encryption:** Access/refresh tokens encrypted at rest using Laravel's encryption
- **Token Refresh:** Automatic refresh of expired tokens before API calls
- **Scope Limitation:** Request minimal OAuth scopes (profile, email only)
- **Account Linking:** Require password confirmation before linking OAuth provider to existing account

### Session Security
- **Session Fixation:** Laravel regenerates session ID on login (Breeze default)
- **Session Hijacking:** IP address and user agent validation on each request (optional, configurable)
- **Suspicious Activity:** Log auth events with IP/user agent, flag unusual patterns (new device, new location)
- **Timeout:** Idle session timeout (default 120 minutes, configurable via `config/session.php`)

## Rate Limiting Extensions

### New Rate Limiters (add to `config/rate-limiting.php` or `RouteServiceProvider`)

```php
// Phone OTP
RateLimiter::for('phone-otp-send', function (Request $request) {
    return Limit::perHour(5)->by($request->input('phone'));
});

RateLimiter::for('phone-otp-verify', function (Request $request) {
    return Limit::perHour(5)->by($request->input('phone'));
});

// 2FA
RateLimiter::for('2fa-verify', function (Request $request) {
    return Limit::perMinute(5)->by($request->user()->id);
});

// OAuth (prevent callback spam)
RateLimiter::for('oauth-callback', function (Request $request) {
    return Limit::perMinute(10)->by($request->ip());
});
```

## Audit Logging Extensions

### New Auth Event Types (add to `AuditLogService`)

```
- user.registered.email
- user.registered.phone
- user.registered.oauth.{provider}
- user.login.email
- user.login.phone
- user.login.oauth.{provider}
- user.logout
- user.password.changed
- user.password.reset
- user.email.changed
- user.phone.added
- user.phone.changed
- user.phone.verified
- user.2fa.enabled.totp
- user.2fa.enabled.sms
- user.2fa.disabled
- user.2fa.recovery_code_used
- user.oauth.linked.{provider}
- user.oauth.unlinked.{provider}
- user.avatar.uploaded
- user.avatar.deleted
- user.session.revoked
- user.account.deactivated
- user.account.deletion_requested
```

## Testing Strategy

### Unit Tests

#### `PhoneVerificationServiceTest`
- `test_generates_6_digit_otp_code`
- `test_otp_code_expires_after_10_minutes`
- `test_otp_code_is_single_use`
- `test_phone_number_normalized_to_e164_format`
- `test_resend_otp_invalidates_previous_code`

#### `TwoFactorAuthServiceTest`
- `test_totp_secret_is_32_bytes_and_base32_encoded`
- `test_totp_verification_accepts_valid_code`
- `test_totp_verification_rejects_expired_code`
- `test_recovery_codes_are_single_use`
- `test_recovery_code_regeneration_invalidates_old_codes`
- `test_sms_otp_generation_and_verification`

#### `OAuthProviderServiceTest`
- `test_creates_new_user_from_oauth_callback`
- `test_links_oauth_provider_to_existing_user`
- `test_prevents_duplicate_oauth_linkage`
- `test_refreshes_expired_oauth_token`

### Feature Tests

#### `PhoneAuthenticationTest`
- `test_user_can_register_with_phone_number`
- `test_phone_registration_sends_otp`
- `test_phone_registration_requires_otp_verification`
- `test_user_can_login_with_phone_and_otp`
- `test_phone_login_rate_limited_after_5_attempts`
- `test_invalid_otp_rejects_login`
- `test_expired_otp_rejects_verification`

#### `OAuthAuthenticationTest`
- `test_user_redirected_to_google_oauth_consent`
- `test_oauth_callback_creates_new_user`
- `test_oauth_callback_logs_in_existing_user`
- `test_oauth_provider_linkage_requires_password_confirmation`
- `test_user_can_unlink_oauth_provider`
- `test_oauth_state_parameter_prevents_csrf`

#### `TwoFactorAuthenticationTest`
- `test_user_can_enable_totp_2fa`
- `test_2fa_login_requires_totp_code_after_password`
- `test_invalid_totp_code_rejects_login`
- `test_recovery_code_allows_2fa_login`
- `test_recovery_code_is_single_use`
- `test_user_can_disable_2fa_with_password_confirmation`
- `test_2fa_enabled_logged_in_audit_trail`

#### `ProfileManagementTest`
- `test_user_can_update_profile_name`
- `test_user_can_add_phone_number_with_verification`
- `test_user_can_upload_avatar`
- `test_avatar_upload_validates_file_size_and_type`
- `test_user_can_view_active_sessions`
- `test_user_can_revoke_specific_session`
- `test_user_can_logout_all_other_devices`

#### `AccountDeactivationTest`
- `test_user_can_deactivate_account`
- `test_deactivated_user_cannot_login`
- `test_deactivated_user_profile_hidden`
- `test_admin_can_restore_deactivated_account_within_30_days`

### Integration Tests (External Services)

#### SMS Gateway Mock
- Mock Twilio API responses for OTP delivery
- Test failure scenarios (invalid phone, rate limit exceeded, network error)

#### OAuth Provider Mock
- Mock Google/Facebook/Apple OAuth callbacks
- Test token refresh flows
- Test account linking with conflicting emails

## Migration Plan

### Phase 1: Database & Backend (Week 1)
1. Create migrations for new tables (`phone_verifications`, `oauth_providers`, `two_factor_secrets`, `two_factor_recovery_codes`)
2. Alter `users` table to add new columns
3. Implement service layer (`PhoneVerificationService`, `TwoFactorAuthService`, `OAuthProviderService`, `SessionService`, `AvatarService`)
4. Implement controllers (`PhoneAuthController`, `OAuthAuthController`, `TwoFactorController`, `SessionController`)
5. Add routes to `routes/auth.php` and `routes/web.php`
6. Configure external services (Twilio, OAuth apps)
7. Write unit tests for services

### Phase 2: Frontend Components (Week 2)
1. Install dependencies (`react-phone-number-input`, `qrcode.react`, `laravel/socialite`, `pragmarx/google2fa`, `twilio/sdk`)
2. Build `PhoneInput` component with country selector
3. Build `OAuthButtons` component (Google, Facebook, Apple)
4. Build `TwoFactorSetup` wizard component (TOTP QR code, SMS flow)
5. Build `RecoveryCodeDisplay` component
6. Build `SessionCard` component
7. Create Inertia pages (`PhoneRegister`, `PhoneLogin`, `PhoneVerify`, `TwoFactorChallenge`, `TwoFactorAuthentication`, `ActiveSessions`, `AccountSettings`)
8. Extend existing `Login`, `Register`, `Profile/Edit` pages with new features

### Phase 3: Integration & Testing (Week 3)
1. Write feature tests for all auth flows
2. Write integration tests with mocked external services
3. Test end-to-end flows in local environment
4. Configure staging environment with real SMS gateway (Twilio sandbox)
5. Create OAuth apps with Google/Facebook/Apple (dev credentials)
6. Test OAuth flows with real providers in staging

### Phase 4: Deployment & Rollout (Week 4)
1. Deploy database migrations to staging
2. Deploy backend + frontend to staging
3. Smoke test all flows in staging
4. Create production OAuth apps (Google/Facebook/Apple)
5. Configure production SMS gateway (Twilio)
6. Deploy to production with feature flags disabled
7. Enable phone auth via feature flag → monitor for 24h
8. Enable OAuth via feature flag → monitor for 24h
9. Enable 2FA via feature flag → monitor for 24h
10. Full rollout complete

## Risks & Mitigations

### Risk: SMS delivery failures
**Impact:** Users cannot register/login with phone
**Mitigation:**
- Use Twilio (99.95% uptime SLA)
- Implement retry logic (max 3 retries with exponential backoff)
- Provide fallback: "Not receiving OTP? Try email registration"
- Monitor SMS delivery rates, alert if < 95%

### Risk: OAuth provider API changes
**Impact:** OAuth login breaks without warning
**Mitigation:**
- Pin Socialite package versions, test before upgrading
- Monitor OAuth provider changelogs
- Implement graceful error handling (OAuth failure → fallback to email auth)
- Test OAuth flows in CI/CD pipeline

### Risk: 2FA lockouts (users lose device)
**Impact:** Users locked out of accounts, support burden increases
**Mitigation:**
- Mandatory recovery code download during 2FA setup (cannot enable without confirming)
- Admin recovery flow: user contacts support → identity verification → admin disables 2FA
- Display recovery code reminder on login page for 2FA users
- Provide "Lost device?" link during 2FA challenge → recovery code entry

### Risk: Account takeover via SIM swap (phone-based auth)
**Impact:** Attacker gains access to OTP codes via SIM swap attack
**Mitigation:**
- Recommend users enable TOTP-based 2FA (more secure than SMS)
- Log device changes (new IP, new user agent) → trigger email alert
- Fraud detection: flag rapid account changes (phone update + email change within 24h)
- Rate limit phone number changes (1 per 7 days)

### Risk: Avatar upload abuse (large files, inappropriate content)
**Impact:** Storage exhaustion, inappropriate images displayed
**Mitigation:**
- Strict file validation: max 2MB, MIME types `image/jpeg|png|webp` only
- Image processing: resize to max 512x512px, strip EXIF data (prevents privacy leaks)
- Moderation: Admin can delete avatars, user receives notification
- Rate limit uploads (max 5 per hour per user)

### Risk: Session hijacking
**Impact:** Attacker steals session cookie, gains unauthorized access
**Mitigation:**
- HTTPS enforced in production (HSTS headers already configured)
- Session cookies: `httponly`, `secure`, `samesite=lax`
- IP/user agent validation (optional, configurable — can break legitimate users on mobile networks)
- Suspicious activity alerts: new device + new location → email notification

## Open Questions

1. **SMS Gateway:** Use Twilio (recommended, $0.0075/SMS) or Vonage (cheaper, $0.005/SMS)?
   - **Recommendation:** Twilio for MVP (reliability > cost), evaluate Vonage after launch if volume increases

2. **2FA Mandatory or Optional?** Should 2FA be mandatory for investors after KYC verification?
   - **Recommendation:** Optional for MVP, consider mandatory for high-value accounts (> $10k invested) in future

3. **Remember Device for 2FA?** Should we implement "trust this device for 30 days" to reduce friction?
   - **Recommendation:** Yes, add in Phase 2 if user feedback indicates friction

4. **OAuth Account Linking:** One provider per account, or allow linking multiple providers?
   - **Recommendation:** Allow multiple providers (Google + Facebook) — provides flexibility, not complex

5. **Avatar Storage:** Local or S3?
   - **Recommendation:** Local for MVP, migrate to S3 in future if storage costs become issue

6. **Account Deactivation Grace Period?** Immediate soft delete, or 30-day grace period before deactivation?
   - **Recommendation:** Immediate soft delete, admin can restore within 30 days — simpler UX

7. **Session Management UI Priority?** Is active session management (view/revoke devices) essential for MVP?
   - **Recommendation:** Yes — security-conscious users expect this feature, not complex to implement

## Conclusion

This design provides a comprehensive, secure, and user-friendly authentication system that extends Laravel Breeze with phone authentication, social OAuth, two-factor authentication, and enhanced profile management. The architecture is modular, testable, and allows for gradual rollout via feature flags. External dependencies are abstracted via service interfaces, making it easy to swap providers (SMS gateway, OAuth) in the future. All authentication events are audited, rate-limited, and comply with existing security infrastructure (encryption at rest, GDPR compliance, fraud detection).
