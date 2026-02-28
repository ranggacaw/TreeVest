# Deployment Plan: User Registration & Authentication

This document outlines the deployment strategy for the new authentication features (phone auth, OAuth, 2FA).

## Feature Flags

### Current Implementation

The application uses environment variables to control feature availability:

```env
# .env
ENABLE_PHONE_AUTH=true
ENABLE_OAUTH_AUTH=true
ENABLE_2FA=true
```

### Configuration

Feature flags are configured in `config/features.php`:

```php
return [
    'phone_auth' => env('ENABLE_PHONE_AUTH', false),
    'oauth_auth' => env('ENABLE_OAUTH_AUTH', false),
    '2fa' => env('ENABLE_2FA', false),
];
```

### Middleware Integration

Feature flags are enforced via middleware:

```php
// App\Http\Middleware\FeatureEnabled.php
public function handle($request, Closure $next, $feature)
{
    if (!config("features.{$feature}")) {
        abort(404);
    }
    return $next($request);
}
```

### Route Protection

Apply feature flag middleware to routes:

```php
// routes/web.php
Route::middleware(['feature:phone_auth'])->group(function () {
    Route::get('/register/phone', [PhoneAuthController::class, 'showRegisterForm']);
    Route::post('/auth/phone/register', [PhoneAuthController::class, 'register']);
});

Route::middleware(['feature:oauth_auth'])->group(function () {
    Route::get('/auth/{provider}/redirect', [OAuthController::class, 'redirect']);
});

Route::middleware(['feature:2fa'])->group(function () {
    Route::get('/profile/2fa', [TwoFactorController::class, 'show']);
});
```

## Deployment Checklist

### Pre-Deployment

- [ ] Verify all migrations are tested in staging environment
- [ ] Ensure `.env.example` is updated with all new environment variables
- [ ] Review rate limiting configuration
- [ ] Test all authentication flows in staging environment
- [ ] Verify SMS gateway integration (Twilio) is working
- [ ] Verify OAuth providers are configured and tested
- [ ] Check audit logging is capturing all auth events
- [ ] Review security headers and CSRF protection
- [ ] Verify database backups are recent and accessible
- [ ] Create deployment rollback plan

### Deployment Steps

#### Phase 1: Database Changes

1. **Backup production database**
   ```bash
   php artisan db:backup
   ```

2. **Run migrations**
   ```bash
   php artisan migrate --force
   ```

3. **Verify migrations**
   ```bash
   php artisan migrate:status
   ```

4. **Rollback if needed**
   ```bash
   php artisan migrate:rollback --step=1
   ```

#### Phase 2: Backend Deployment

1. **Deploy application code**
   ```bash
   git pull origin main
   composer install --no-dev --optimize-autoloader
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   ```

2. **Set environment variables**
   - Configure SMS gateway credentials (TWILIO_SID, TWILIO_TOKEN, TWILIO_FROM)
   - Configure OAuth provider credentials
   - Enable feature flags (set to `false` initially)

3. **Clear caches**
   ```bash
   php artisan cache:clear
   php artisan config:clear
   ```

4. **Run queue workers**
   ```bash
   php artisan queue:work --daemon --tries=3
   ```

#### Phase 3: Frontend Deployment

1. **Build production assets**
   ```bash
   npm run build
   ```

2. **Deploy static files**
   ```bash
   php artisan storage:link
   ```

#### Phase 4: External Services Setup

1. **Configure Twilio**
   - Verify account SID and auth token
   - Set up monitoring for SMS delivery rates
   - Configure billing alerts

2. **Configure OAuth Apps**
   - Update redirect URIs to production URLs
   - Enable apps for production (not development mode)
   - Verify consent screens are properly configured

3. **Test Integration**
   - Send test SMS OTP
   - Test OAuth callback
   - Verify 2FA QR code generation

#### Phase 5: Gradual Rollout

1. **Enable phone authentication** (10% of users)
   ```env
   ENABLE_PHONE_AUTH=true
   ```
   - Monitor for 24 hours
   - Check SMS delivery success rate
   - Review error logs

2. **Enable OAuth authentication** (10% of users)
   ```env
   ENABLE_OAUTH_AUTH=true
   ```
   - Monitor for 24 hours
   - Check OAuth callback success rate
   - Review error logs

3. **Enable 2FA** (5% of users)
   ```env
   ENABLE_2FA=true
   ```
   - Monitor for 24 hours
   - Check 2FA setup completion rate
   - Review recovery code usage

4. **Full rollout** (100% of users)
   - Gradually increase to 25%, 50%, then 100%
   - Monitor each increase phase
   - Pause if issues detected

### Post-Deployment Verification

- [ ] Verify all authentication methods are working
- [ ] Test phone registration and login
- [ ] Test OAuth registration and login (Google, Facebook, Apple)
- [ ] Test 2FA enable/disable flow
- [ ] Verify OTP codes are being sent
- [ ] Check audit logs for auth events
- [ ] Verify rate limiting is working
- [ ] Test session management (view, revoke)
- [ ] Test account deactivation
- [ ] Verify GDPR deletion requests are processed

## Rollback Plan

### Rollback Triggers

Deploy rollback if:
- SMS delivery rate drops below 95%
- OAuth callback failure rate exceeds 10%
- 2FA lockout rate exceeds 5%
- Database migration fails
- Application error rate increases significantly
- Security vulnerabilities detected

### Rollback Steps

1. **Disable feature flags**
   ```env
   ENABLE_PHONE_AUTH=false
   ENABLE_OAUTH_AUTH=false
   ENABLE_2FA=false
   ```

2. **Revert code changes**
   ```bash
   git checkout previous_stable_tag
   composer install --no-dev --optimize-autoloader
   php artisan config:cache
   php artisan route:cache
   ```

3. **Rebuild frontend**
   ```bash
   npm run build
   ```

4. **Rollback migrations** (if needed)
   ```bash
   php artisan migrate:rollback --step=1
   ```

5. **Clear caches**
   ```bash
   php artisan cache:clear
   php artisan config:clear
   ```

6. **Restart services**
   ```bash
   php artisan queue:restart
   php artisan cache:clear
   ```

### Rollback Verification

- [ ] Verify existing email authentication is working
- [ ] Check database integrity
- [ ] Verify no data corruption
- [ ] Test existing user login flow
- [ ] Check application logs for errors

## Monitoring Alerts

### Key Metrics to Monitor

#### SMS Gateway (Twilio)
- **Delivery Rate**: >95% (alert if <95%)
- **Delivery Time**: <5 seconds (alert if >10 seconds)
- **Failed Deliveries**: Alert if >5%
- **Cost**: Alert if exceeds $X per day

#### OAuth Providers
- **Callback Success Rate**: >95% (alert if <90%)
- **Response Time**: <2 seconds (alert if >5 seconds)
- **Error Rate**: Alert if >5%

#### 2FA
- **Setup Completion Rate**: Track percentage
- **Login Success Rate**: >90% (alert if <80%)
- **Recovery Code Usage**: Alert if >10% of logins use recovery codes
- **Lockout Rate**: Alert if >5% of users locked out

#### General Authentication
- **Login Success Rate**: >90%
- **Registration Success Rate**: >80%
- **Average Time to Complete Flow**: <2 minutes
- **Error Rate**: Alert if >5%

### Alert Configuration

#### Monitoring Tools

1. **Application Monitoring** (e.g., Laravel Telescope, New Relic, Datadog)
2. **Log Aggregation** (e.g., Laravel Pail, Papertrail, Loggly)
3. **Error Tracking** (e.g., Sentry, Bugsnag)
4. **Uptime Monitoring** (e.g., Pingdom, UptimeRobot)

#### Critical Alerts

Set up immediate notifications (email, Slack, SMS) for:
- SMS delivery failures
- OAuth callback failures
- Database migration errors
- Application downtime
- High error rates
- Security anomalies

### Log Review

**Daily Check:**
- Review authentication error logs
- Check for unusual login patterns
- Monitor failed OTP attempts
- Review OAuth failure reasons

**Weekly Check:**
- Analyze SMS delivery success rate trends
- Review OAuth provider performance
- Check 2FA adoption rates
- Monitor rate limiting effectiveness

## Security Considerations

### Pre-Deployment Security Review

- [ ] All credentials are stored in environment variables
- [ ] No sensitive data in `.env.example`
- [ ] Rate limiting configured and tested
- [ ] CSRF protection enabled
- [ ] Security headers configured (HSTS, CSP, X-Frame-Options)
- [ ] Encryption at rest verified (phone numbers, OAuth tokens)
- [ ] Audit logging enabled and tested
- [ ] Brute force protection enabled
- [ ] Input validation implemented and tested

### Production Security Checklist

- [ ] HTTPS enforced (redirect HTTP to HTTPS)
- [ ] SSL/TLS certificates valid and up-to-date
- [ ] Database access restricted to application server only
- [ ] File permissions properly configured
- [ ] Debug mode disabled (`APP_DEBUG=false`)
- [ ] Error logging enabled (but not displayed to users)
- [ ] Backup encryption enabled
- [ ] Access logs enabled
- [ ] Firewall configured to restrict access

## Post-Deployment Tasks

### Monitoring Phase (First 7 Days)

- Monitor application performance continuously
- Review logs every 4 hours
- Check user feedback and support tickets
- Adjust rate limits if needed
- Monitor SMS costs

### Optimization Phase (After 7 Days)

- Analyze performance metrics
- Optimize slow queries
- Adjust feature flags based on usage
- Update documentation with lessons learned
- Plan next phase improvements

### Communication

- Notify users of new authentication options
- Provide help articles for 2FA setup
- Send security best practices tips
- Collect user feedback on new features

## References

- [Laravel Deployment Documentation](https://laravel.com/docs/deployment)
- [Twilio Monitoring Best Practices](https://www.twilio.com/docs/usage/dashboard/monitoring)
- [OAuth Security Best Practices](https://oauth.net/2/)
- [2FA Implementation Guide](https://www.authy.com/blog/how-to-add-two-factor-authentication-to-your-app)

## Support Contacts

- **Deployment Issues**: DevOps Team
- **SMS Gateway Issues**: support@twilio.com
- **OAuth Issues**: Contact respective provider support
- **Application Issues**: support@treevest.com
