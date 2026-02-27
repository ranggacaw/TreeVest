# Change: Implement Complete User Registration & Authentication System

## Why
EPIC-001 requires a comprehensive authentication system that supports email, phone, and social OAuth registration/login methods, along with two-factor authentication (2FA) and complete user profile management. While Laravel Breeze provides email-based auth foundation (registration, login, password reset, email verification), we need to extend it with phone-based authentication, social OAuth providers (Google, Facebook, Apple), 2FA capabilities (TOTP and SMS OTP), enhanced profile management, account deactivation, and comprehensive audit logging for all authentication events. This change establishes the identity layer that all other platform features depend on.

## What Changes
- **Phone-based Authentication:** Add phone number as alternative registration/login credential with SMS OTP verification
- **Social OAuth Integration:** Add Google, Facebook, and Apple OAuth login/registration via Laravel Socialite
- **Two-Factor Authentication:** Implement TOTP (app-based) and SMS OTP as optional 2FA methods with recovery codes
- **Enhanced User Profile:** Extend user model with phone, avatar, profile fields; add profile management UI
- **Account Management:** Implement account deactivation/deletion with GDPR compliance (soft delete + anonymization)
- **Authentication Events & Audit Logging:** Log all auth events (login, logout, registration, 2FA, password changes)
- **Session Management:** Enhance session tracking with device fingerprinting and multi-device session management
- **Recovery Mechanisms:** Add 2FA recovery codes and account recovery flows for locked accounts
- **Rate Limiting Extensions:** Extend existing rate-limiting for phone OTP, OAuth callbacks, and 2FA attempts
- **Database Schema:** Add phone verification, OAuth provider linkages, 2FA secrets, recovery codes tables
- **React Components:** Build phone input with country code selector, OAuth buttons, 2FA setup/verify flows, profile editor
- **Middleware Extensions:** Add phone verification check, 2FA enforcement middleware

### Breaking Changes
None — this extends existing Breeze authentication without modifying core flows.

## Impact
- **Affected specs:** 
  - NEW: `user-authentication` — Core authentication requirements
  - NEW: `user-profile-management` — Profile CRUD operations
  - NEW: `two-factor-authentication` — 2FA flows and recovery
  - EXTENDS: `audit-logging` — Adds auth event types
  - EXTENDS: `rate-limiting` — Adds phone OTP and 2FA limiters
  - EXTENDS: `gdpr-compliance` — Account deletion flow
  
- **Affected code:**
  - `app/Models/User.php` — Add phone, avatar, oauth fields, 2FA relations
  - `app/Http/Controllers/Auth/*` — Extend with phone, OAuth, 2FA controllers
  - `app/Services/` — NEW: `PhoneVerificationService`, `TwoFactorAuthService`, `OAuthProviderService`
  - `database/migrations/` — Add phone verification, OAuth providers, 2FA secrets, recovery codes tables
  - `resources/js/Pages/Auth/*` — NEW: Phone registration/login, OAuth flows, 2FA setup/verify
  - `resources/js/Pages/Profile/*` — NEW: Profile edit, 2FA management, device sessions
  - `resources/js/Components/Auth/*` — NEW: PhoneInput, OAuthButtons, TwoFactorSetup, RecoveryCodeDisplay
  - `routes/web.php`, `routes/auth.php` — Add phone auth, OAuth callbacks, 2FA routes
  - `config/services.php` — Add OAuth provider credentials
  - `config/auth.php` — Configure 2FA settings
  
- **External Dependencies:**
  - Laravel Socialite package for OAuth
  - SMS gateway service for phone OTP (Twilio, Vonage, or AWS SNS)
  - TOTP library (pragmarx/google2fa or similar)
  - React libraries: react-phone-number-input, qrcode.react

- **Database Changes:**
  - NEW tables: `phone_verifications`, `oauth_providers`, `two_factor_secrets`, `two_factor_recovery_codes`
  - ALTER `users`: add `phone`, `phone_country_code`, `phone_verified_at`, `avatar_url`, `two_factor_enabled_at`

- **Testing Requirements:**
  - Unit tests: phone number formatting/validation, OTP generation, 2FA TOTP validation, OAuth token exchange
  - Feature tests: complete auth flows (phone registration, OAuth login, 2FA enforcement, profile updates)
  - Integration tests: SMS gateway, OAuth provider API mocks

## Security Considerations
- All phone numbers stored with encryption at rest (existing encryption-at-rest spec)
- OTP codes: 6-digit numeric, 10-minute expiry, single-use, rate-limited to 5 attempts/hour per phone
- 2FA secrets: encrypted, unique per user, invalidated on disable
- Recovery codes: 8 codes, single-use, bcrypt hashed, regenerated on recovery usage
- OAuth tokens: encrypted storage, automatic expiry refresh, revocable
- Session hijacking protection: IP address + user agent fingerprinting, suspicious activity alerts
- Brute force protection: existing rate limiting (5 login attempts/min) applies to phone/OAuth/2FA
- CSRF protection: all forms use Laravel CSRF tokens
- XSS prevention: NoXss rule on all text inputs (existing pattern)

## Migration Plan
1. Deploy database migrations (additive only — no breaking changes)
2. Deploy backend code (new services, controllers, middleware)
3. Deploy frontend components (new pages, forms, OAuth buttons)
4. Configure external services (SMS gateway, OAuth apps with providers)
5. Test flows end-to-end in staging
6. Enable feature flags for gradual rollout: phone auth → OAuth → 2FA
7. Monitor auth event logs and fraud detection alerts

## Rollback Strategy
- All new tables are additive; existing auth flows remain unchanged
- Feature flags allow disabling phone auth, OAuth, or 2FA independently
- Rollback: revert deployment, disable feature flags, existing email auth continues working

## Open Questions
- [ ] Which SMS gateway provider to use? (Twilio recommended for reliability, Vonage for cost)
- [ ] Should 2FA be mandatory for investors after KYC verification, or optional?
- [ ] Should we implement "remember this device" for 2FA to reduce friction?
- [ ] Social OAuth: should we support linking multiple providers to one account, or one provider per account?
- [ ] Phone number formatting: should we store normalized E.164 format, or raw input + country code?
- [ ] Avatar storage: local storage (`storage/app/public/avatars/`) or cloud (S3)?
- [ ] Account deactivation: immediate or 30-day grace period?
- [ ] Session management: should we allow users to remotely log out other devices?
