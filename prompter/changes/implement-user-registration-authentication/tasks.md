# Implementation Tasks

## 1. Database Schema & Migrations

- [x] 1.1 Create `phone_verifications` table migration
- [x] 1.2 Create `oauth_providers` table migration
- [x] 1.3 Create `two_factor_secrets` table migration
- [x] 1.4 Create `two_factor_recovery_codes` table migration
- [x] 1.5 Create migration to add columns to `users` table (phone, phone_country_code, phone_verified_at, avatar_url, two_factor_enabled_at, last_login_at, last_login_ip)
- [x] 1.6 Add check constraint to `users` table (at least one of email or phone must be non-null)
- [x] 1.7 Create Eloquent models for new tables (`PhoneVerification`, `OAuthProvider`, `TwoFactorSecret`, `TwoFactorRecoveryCode`)
- [x] 1.8 Add relationships to `User` model (hasMany for oauth providers, hasOne for 2FA secret, hasMany for recovery codes)
- [x] 1.9 Update `User` model with new fillable fields and casts (phone encrypted, avatar_url, timestamps)
- [x] 1.10 Create database seeders for testing (users with phone, OAuth, 2FA enabled)

## 2. External Service Configuration

- [x] 2.1 Install `laravel/socialite` package via composer
- [x] 2.2 Install `pragmarx/google2fa` package for TOTP
- [x] 2.3 Install `twilio/sdk` package for SMS
- [x] 2.4 Add Socialite provider configurations to `config/services.php` (Google, Facebook, Apple)
- [x] 2.5 Add Twilio configuration to `config/services.php`
- [x] 2.6 Add 2FA configuration to `config/auth.php` (TOTP window, recovery code count, OTP expiry)
- [x] 2.7 Create `.env.example` entries for OAuth client IDs/secrets and Twilio credentials
- [x] 2.8 Create development OAuth apps (Google, Facebook, Apple) for local/staging testing

## 3. Service Layer Implementation

### Phone Verification Service
- [x] 3.1 Create `App\Services\PhoneVerificationService` class
- [x] 3.2 Implement `sendVerificationCode(string $phone): bool` method
- [x] 3.3 Implement `verifyCode(string $phone, string $code): bool` method
- [x] 3.4 Implement `resendCode(string $phone): bool` method (invalidate previous codes)
- [x] 3.5 Implement `markPhoneAsVerified(User $user): void` method
- [x] 3.6 Add phone number normalization helper (convert to E.164 format)

### SMS Service
- [x] 3.7 Create `App\Contracts\SmsServiceInterface` interface
- [x] 3.8 Create `App\Services\TwilioSmsProvider` implementing `SmsServiceInterface`
- [x] 3.9 Implement `sendOtp(string $phone, string $code): bool` method
- [x] 3.10 Add SMS service binding to `AppServiceProvider` (bind interface to Twilio provider)

### Two-Factor Authentication Service
- [x] 3.11 Create `App\Services\TwoFactorAuthService` class
- [x] 3.12 Implement `enableTotp(User $user): array` method (generate secret, QR code, recovery codes)
- [x] 3.13 Implement `enableSms(User $user): bool` method
- [x] 3.14 Implement `verify(User $user, string $code): bool` method (verify TOTP or SMS code)
- [x] 3.15 Implement `verifyRecoveryCode(User $user, string $code): bool` method
- [x] 3.16 Implement `disable(User $user): bool` method
- [x] 3.17 Implement `regenerateRecoveryCodes(User $user): array` method
- [x] 3.18 Add TOTP QR code generation helper using `pragmarx/google2fa`

### OAuth Provider Service
- [x] 3.19 Create `App\Services\OAuthProviderService` class
- [x] 3.20 Implement `handleCallback(string $provider, \Laravel\Socialite\Contracts\User $socialiteUser): User` method
- [x] 3.21 Implement `linkProvider(User $user, string $provider, \Laravel\Socialite\Contracts\User $socialiteUser): OAuthProvider` method
- [x] 3.22 Implement `unlinkProvider(User $user, string $provider): bool` method
- [x] 3.23 Implement `refreshToken(OAuthProvider $oauthProvider): bool` method (for OAuth token refresh)

### Session Service
- [x] 3.24 Create `App\Services\SessionService` class
- [x] 3.25 Implement `getActiveSessions(User $user): Collection` method (query sessions table)
- [x] 3.26 Implement `revokeSession(string $sessionId): bool` method
- [x] 3.27 Implement `revokeAllOtherSessions(User $user): int` method
- [x] 3.28 Implement `updateLastLogin(User $user, Request $request): void` method (update last_login_at, last_login_ip)
- [x] 3.29 Add user agent parser helper (extract device name from user agent string)

### Avatar Service
- [x] 3.30 Create `App\Services\AvatarService` class
- [x] 3.31 Implement `upload(User $user, \Illuminate\Http\UploadedFile $file): string` method (validate, resize, store, return path)
- [x] 3.32 Implement `delete(User $user): bool` method (remove file from storage)
- [x] 3.33 Implement `getPublicUrl(string $avatarUrl): string` method
- [x] 3.34 Add image validation rules (max 2MB, MIME types: jpeg, png, webp)
- [x] 3.35 Add image processing (resize to 512x512, strip EXIF data using Intervention Image or GD)

## 4. Controller Implementation

### Phone Authentication
- [x] 4.1 Create `App\Http\Controllers\Auth\PhoneAuthController`
- [x] 4.2 Implement `showRegisterForm()` → Inertia::render('Auth/PhoneRegister')
- [x] 4.3 Implement `register(Request $request)` → validate phone, send OTP, return verification page
- [x] 4.4 Implement `verify(Request $request)` → validate OTP, create user, log in, redirect to dashboard
- [x] 4.5 Implement `showLoginForm()` → Inertia::render('Auth/PhoneLogin')
- [x] 4.6 Implement `login(Request $request)` → send OTP, return verification page
- [x] 4.7 Implement `verifyLogin(Request $request)` → validate OTP, log in user, redirect to dashboard
- [x] 4.8 Implement `resendOtp(Request $request)` → resend OTP code

### OAuth Authentication
- [x] 4.9 Create `App\Http\Controllers\Auth\OAuthController`
- [x] 4.10 Implement `redirect(string $provider)` → redirect to OAuth provider
- [x] 4.11 Implement `callback(string $provider)` → handle callback, create/login user, redirect to dashboard
- [x] 4.12 Implement `link(Request $request, string $provider)` → link OAuth provider to authenticated user (requires password confirmation)
- [x] 4.13 Implement `unlink(string $provider)` → unlink OAuth provider

### Two-Factor Authentication
- [x] 4.14 Create `App\Http\Controllers\Auth\TwoFactorController`
- [x] 4.15 Implement `show()` → Inertia::render('Profile/TwoFactorAuthentication') with 2FA status
- [x] 4.16 Implement `enable(Request $request)` → enable TOTP or SMS 2FA, return QR code/recovery codes
- [x] 4.17 Implement `confirmEnable(Request $request)` → verify 2FA code, activate 2FA
- [x] 4.18 Implement `disable(Request $request)` → disable 2FA (requires password confirmation)
- [x] 4.19 Implement `regenerateRecoveryCodes()` → regenerate recovery codes
- [x] 4.20 Create `App\Http\Controllers\Auth\TwoFactorChallengeController`
- [x] 4.21 Implement `show()` → Inertia::render('Auth/TwoFactorChallenge') during login
- [x] 4.22 Implement `verify(Request $request)` → verify 2FA code, complete login
- [x] 4.23 Implement `useRecoveryCode(Request $request)` → verify recovery code, complete login

### Session Management
- [x] 4.24 Create `App\Http\Controllers\SessionController`
- [x] 4.25 Implement `index()` → Inertia::render('Profile/ActiveSessions') with active sessions list
- [x] 4.26 Implement `destroy(string $sessionId)` → revoke specific session
- [x] 4.27 Implement `destroyAll()` → revoke all other sessions

### Profile Management Extensions
- [x] 4.28 Extend `App\Http\Controllers\ProfileController@update` to handle phone number changes (requires re-verification)
- [x] 4.29 Create `App\Http\Controllers\AvatarController`
- [x] 4.30 Implement `store(Request $request)` → upload avatar
- [x] 4.31 Implement `destroy()` → delete avatar

### Account Deactivation
- [x] 4.32 Create `App\Http\Controllers\AccountController`
- [x] 4.33 Implement `deactivate(Request $request)` → soft delete user, log out, redirect to deactivation confirmation
- [x] 4.34 Implement `requestDeletion(Request $request)` → create GDPR deletion request (admin review)

## 5. Form Request Validation

- [x] 5.1 Create `App\Http\Requests\PhoneRegisterRequest` (validate phone, country code, OTP)
- [x] 5.2 Create `App\Http\Requests\PhoneLoginRequest` (validate phone or email input)
- [x] 5.3 Create `App\Http\Requests\VerifyOtpRequest` (validate OTP code)
- [x] 5.4 Create `App\Http\Requests\EnableTwoFactorRequest` (validate 2FA type, password confirmation)
- [x] 5.5 Create `App\Http\Requests\VerifyTwoFactorRequest` (validate 2FA code)
- [x] 5.6 Create `App\Http\Requests\UpdateProfileRequest` (extend existing, add phone, avatar validation)
- [x] 5.7 Create `App\Http\Requests\UploadAvatarRequest` (validate image file)

## 6. Middleware Implementation

- [x] 6.1 Create `App\Http\Middleware\EnsurePhoneIsVerified` middleware (check phone_verified_at)
- [x] 6.2 Create `App\Http\Middleware\RequireTwoFactorAuth` middleware (check if 2FA enabled, redirect to 2FA challenge)
- [x] 6.3 Register middlewares in `bootstrap/app.php` or `app/Http/Kernel.php`

## 7. Routes Configuration

- [x] 7.1 Add phone auth routes to `routes/auth.php`
- [x] 7.2 Add OAuth routes to `routes/auth.php`
- [x] 7.3 Add 2FA routes to `routes/auth.php` and `routes/web.php` (profile)
- [x] 7.4 Add session management routes to `routes/web.php`
- [x] 7.5 Add avatar upload routes to `routes/web.php`
- [x] 7.6 Add account deactivation routes to `routes/web.php`
- [x] 7.7 Apply rate limiting middleware to sensitive routes (phone OTP, 2FA verify, OAuth callback)

## 8. Rate Limiting Configuration

- [x] 8.1 Add `phone-otp-send` rate limiter (5 per hour per phone)
- [x] 8.2 Add `phone-otp-verify` rate limiter (5 per hour per phone)
- [x] 8.3 Add `2fa-verify` rate limiter (5 per minute per user)
- [x] 8.4 Add `oauth-callback` rate limiter (10 per minute per IP)
- [x] 8.5 Apply rate limiters to respective routes

## 9. Audit Logging Extensions

- [x] 9.1 Extend `AuditLogService` with new auth event types (phone registration, OAuth login, 2FA enabled, etc.)
- [x] 9.2 Add audit log calls to all auth controllers (log successful/failed events)
- [x] 9.3 Add audit log calls to profile update actions (phone change, avatar upload, 2FA toggle)

## 10. Frontend Dependencies Installation

- [x] 10.1 Install `react-phone-number-input` package via npm
- [x] 10.2 Install `qrcode.react` package for TOTP QR code display
- [x] 10.3 Install any additional UI libraries (optional: `react-otp-input` for OTP field)

## 11. React Component Development

### Shared Components
- [x] 11.1 Create `resources/js/Components/Auth/PhoneInput.tsx` (phone number input with country selector)
- [x] 11.2 Create `resources/js/Components/Auth/OAuthButtons.tsx` (Google, Facebook, Apple sign-in buttons)
- [x] 11.3 Create `resources/js/Components/Auth/OtpInput.tsx` (6-digit OTP input field)
- [x] 11.4 Create `resources/js/Components/Auth/TwoFactorSetup.tsx` (TOTP QR code display + SMS setup)
- [x] 11.5 Create `resources/js/Components/Auth/RecoveryCodeDisplay.tsx` (display/download recovery codes)
- [x] 11.6 Create `resources/js/Components/Profile/SessionCard.tsx` (device session display card)
- [x] 11.7 Create `resources/js/Components/Profile/AvatarUpload.tsx` (avatar upload with preview)

### Auth Pages
- [x] 11.8 Create `resources/js/Pages/Auth/PhoneRegister.tsx` (phone registration form)
- [x] 11.9 Create `resources/js/Pages/Auth/PhoneLogin.tsx` (phone login form)
- [x] 11.10 Create `resources/js/Pages/Auth/PhoneVerify.tsx` (OTP verification page)
- [x] 11.11 Create `resources/js/Pages/Auth/TwoFactorChallenge.tsx` (2FA verification during login)
- [x] 11.12 Extend `resources/js/Pages/Auth/Login.tsx` to add OAuth buttons and "Login with Phone" link
- [x] 11.13 Extend `resources/js/Pages/Auth/Register.tsx` to add OAuth buttons and "Register with Phone" link

### Profile Pages
- [x] 11.14 Create `resources/js/Pages/Profile/TwoFactorAuthentication.tsx` (2FA settings page)
- [x] 11.15 Create `resources/js/Pages/Profile/ActiveSessions.tsx` (session management page)
- [x] 11.16 Create `resources/js/Pages/Profile/AccountSettings.tsx` (account deactivation page)
- [x] 11.17 Extend `resources/js/Pages/Profile/Edit.tsx` to add phone field, avatar upload, and link to 2FA/session pages

## 12. TypeScript Type Definitions

- [x] 12.1 Create `resources/js/types/auth.d.ts` with types for PhoneAuth, OAuth, TwoFactor, Session
- [x] 12.2 Extend `resources/js/types/index.d.ts` with User model extensions (phone, avatar, 2FA status)
- [x] 12.3 Add Inertia page props types for new pages (PhoneRegister, TwoFactorChallenge, etc.)

## 13. Testing: Unit Tests

### Service Tests
- [ ] 13.1 `tests/Unit/Services/PhoneVerificationServiceTest.php` (OTP generation, verification, expiry)
- [ ] 13.2 `tests/Unit/Services/TwoFactorAuthServiceTest.php` (TOTP secret generation, verification, recovery codes)
- [ ] 13.3 `tests/Unit/Services/OAuthProviderServiceTest.php` (OAuth callback handling, account linking)
- [ ] 13.4 `tests/Unit/Services/SessionServiceTest.php` (session retrieval, revocation)
- [ ] 13.5 `tests/Unit/Services/AvatarServiceTest.php` (avatar upload, validation, deletion)

### Model Tests
- [ ] 13.6 `tests/Unit/Models/UserTest.php` (test new relationships, phone formatting, 2FA status methods)
- [ ] 13.7 `tests/Unit/Models/OAuthProviderTest.php` (test encrypted tokens)

## 14. Testing: Feature Tests

### Phone Authentication
- [ ] 14.1 `tests/Feature/Auth/PhoneRegistrationTest.php` (register with phone, OTP verification)
- [ ] 14.2 `tests/Feature/Auth/PhoneLoginTest.php` (login with phone, OTP verification)
- [ ] 14.3 Test: phone registration rate limiting
- [ ] 14.4 Test: OTP expiry and single-use enforcement
- [ ] 14.5 Test: invalid OTP rejection

### OAuth Authentication
- [ ] 14.6 `tests/Feature/Auth/OAuthAuthenticationTest.php` (OAuth redirect, callback, user creation)
- [ ] 14.7 Test: OAuth account linking to existing user
- [ ] 14.8 Test: OAuth provider unlinking
- [ ] 14.9 Test: OAuth state parameter CSRF protection
- [ ] 14.10 Mock Socialite provider responses

### Two-Factor Authentication
- [ ] 14.11 `tests/Feature/Auth/TwoFactorAuthenticationTest.php` (enable TOTP, verify code, login with 2FA)
- [ ] 14.12 Test: 2FA with SMS OTP
- [ ] 14.13 Test: recovery code login
- [ ] 14.14 Test: recovery code single-use enforcement
- [ ] 14.15 Test: 2FA disable with password confirmation
- [ ] 14.16 Test: 2FA rate limiting (5 failed attempts)

### Profile Management
- [ ] 14.17 `tests/Feature/Profile/ProfileManagementTest.php` (update profile, add phone, upload avatar)
- [ ] 14.18 Test: phone number update requires re-verification
- [ ] 14.19 Test: avatar upload validation (size, MIME type)
- [ ] 14.20 Test: avatar deletion

### Session Management
- [ ] 14.21 `tests/Feature/Profile/SessionManagementTest.php` (view sessions, revoke session, logout all devices)
- [ ] 14.22 Test: session device name parsing from user agent

### Account Deactivation
- [ ] 14.23 `tests/Feature/Profile/AccountDeactivationTest.php` (deactivate account, cannot login)
- [ ] 14.24 Test: deactivated user profile hidden
- [ ] 14.25 Test: admin can restore deactivated account

## 15. Integration Testing (External Services)

- [ ] 15.1 Create `tests/Integration/SmsGatewayTest.php` with mocked Twilio responses
- [ ] 15.2 Create `tests/Integration/OAuthProviderTest.php` with mocked OAuth callbacks
- [ ] 15.3 Test SMS delivery failure scenarios (network error, invalid phone, rate limit)
- [ ] 15.4 Test OAuth token refresh flow

## 16. Documentation & Configuration

- [ ] 16.1 Update `.env.example` with all new environment variables (OAuth credentials, Twilio keys, 2FA config)
- [ ] 16.2 Create `docs/AUTH.md` documenting authentication flows (phone, OAuth, 2FA)
- [ ] 16.3 Create `docs/SMS_GATEWAY.md` documenting SMS provider setup (Twilio)
- [ ] 16.4 Create `docs/OAUTH_SETUP.md` documenting OAuth app creation (Google, Facebook, Apple)
- [ ] 16.5 Update README.md with setup instructions for new dependencies

## 17. Deployment Preparation

- [ ] 17.1 Create feature flags for gradual rollout (phone auth, OAuth, 2FA) using config or database
- [ ] 17.2 Create deployment checklist (migrations, OAuth apps, SMS gateway config)
- [ ] 17.3 Create rollback plan (feature flag disablement, migration rollback)
- [ ] 17.4 Set up monitoring alerts (SMS delivery rate, OAuth callback failures, 2FA lockout rate)

## 18. End-to-End Testing

- [ ] 18.1 Test complete phone registration flow (register → verify OTP → login)
- [ ] 18.2 Test complete OAuth registration flow (Google → callback → create account → login)
- [ ] 18.3 Test complete 2FA setup flow (enable TOTP → scan QR → verify code → save recovery codes)
- [ ] 18.4 Test complete 2FA login flow (login → password → 2FA challenge → verify code → dashboard)
- [ ] 18.5 Test profile update flow (change phone → verify OTP → upload avatar → view sessions)
- [ ] 18.6 Test account deactivation flow (deactivate → logout → cannot login)
- [ ] 18.7 Test edge cases (expired OTP, invalid 2FA code, OAuth email conflict)

## 19. Code Quality & Style

- [ ] 19.1 Run `./vendor/bin/pint` to format PHP code (PSR-12)
- [ ] 19.2 Run ESLint/Prettier on TypeScript/React code (if configured)
- [ ] 19.3 Run `php artisan test` to ensure all tests pass
- [ ] 19.4 Review code for security vulnerabilities (SQL injection, XSS, CSRF)
- [ ] 19.5 Review code for performance issues (N+1 queries, unoptimized images)

## Post-Implementation

- [ ] Update AGENTS.md in project root with new authentication capabilities (phone auth, OAuth, 2FA)
- [ ] Update prompter specs: archive this change, update `user-authentication`, `user-profile-management`, `two-factor-authentication` specs
- [ ] Create user-facing documentation (help articles for 2FA setup, account security best practices)
- [ ] Monitor production metrics (SMS delivery rate, OAuth success rate, 2FA adoption rate, account lockouts)
- [ ] Gather user feedback and iterate on UX (2FA friction, phone input UX, OAuth provider preferences)
