# Design: Multi-Channel Notification System

## Context

The Treevest platform needs a comprehensive notification system to communicate with users across multiple channels (email, SMS, web push, in-app). This system must be flexible enough to support various notification types (investment, harvest, payment, market alerts) while respecting user preferences and tracking delivery status.

**Constraints:**
- Laravel 12.x with Inertia.js frontend (React + TypeScript)
- Database-backed queues, sessions, and cache (no Redis at launch)
- Must integrate with external email (Mailgun/SendGrid/SES) and SMS (Twilio) providers
- Real-time notifications require WebSocket infrastructure (Pusher or Soketi)
- Must be reusable by all EPICs (Investment, Harvest, Payments, etc.)

**Stakeholders:**
- Product: Needs configurable notification templates and user preference controls
- Development: Other EPICs will consume this notification API
- Operations: Must track delivery success/failure for debugging
- Users: Need control over notification frequency and channels

## Goals / Non-Goals

### Goals
- Multi-channel notification dispatch (email, SMS, web push, database)
- User preference management (per type × per channel)
- Admin-configurable notification templates with placeholder substitution
- Delivery status tracking for troubleshooting
- Real-time in-app notifications via Laravel Broadcasting
- Reusable API for other EPICs to trigger notifications
- Graceful degradation (if one channel fails, others still work)

### Non-Goals (Deferred)
- In-app user-to-user messaging system (separate proposal)
- Customer support chat widget integration (separate proposal)
- Mobile push notifications via FCM/APNs (requires native apps — future scope)
- Notification analytics dashboard (open rates, click rates — future scope)
- A/B testing for notification content
- Notification scheduling/batching (send later, digest emails)

## Decisions

### Decision 1: Use Laravel's Built-in Notification System

**Choice:** Leverage Laravel's `Illuminate\Notifications\Notification` system with database, mail, broadcast, and custom SMS channels.

**Rationale:**
- Laravel Notifications provide a unified API for multi-channel dispatch
- Built-in support for `database` and `mail` channels
- Easy to extend with custom channels (SMS via Twilio)
- Queued by default via `ShouldQueue` interface
- Automatic notification table management with `notifications` table

**Alternatives Considered:**
- **Custom event/listener system:** More flexible but requires reinventing channel management, queuing, and user preference checking. Laravel Notifications already solve this.
- **Third-party notification service (e.g., OneSignal, Pusher Beams):** Adds external dependency and cost. Laravel's native system is sufficient for MVP.

**Implementation:**
- All notification classes extend `Illuminate\Notifications\Notification`
- Implement `ShouldQueue` for async dispatch
- Define `via()` method to return enabled channels based on user preferences
- Implement `toMail()`, `toDatabase()`, `toBroadcast()`, and `toSms()` methods

### Decision 2: Custom SMS Channel via Twilio

**Choice:** Create a custom notification channel `SmsChannel` using Twilio SDK.

**Rationale:**
- Laravel does not provide a built-in SMS channel (deprecated Nexmo)
- Twilio is widely used, reliable, and has good PHP SDK
- Custom channel allows us to log delivery status to `notification_delivery_logs`

**Alternatives Considered:**
- **Laravel Notification Channels (community package):** Available but adds dependency. Custom channel is simple enough (<50 lines) and gives us full control over logging.
- **AWS SNS for SMS:** Good option but Twilio has better deliverability tracking and international coverage.

**Implementation:**
```php
// app/Channels/SmsChannel.php
class SmsChannel
{
    public function send($notifiable, Notification $notification)
    {
        if (! method_exists($notification, 'toSms')) {
            return;
        }

        $message = $notification->toSms($notifiable);
        $to = $notifiable->phone; // Assumes User model has phone attribute

        try {
            $twilio = new Client(config('services.twilio.sid'), config('services.twilio.token'));
            $result = $twilio->messages->create($to, [
                'from' => config('services.twilio.from'),
                'body' => $message,
            ]);

            NotificationDeliveryLog::create([
                'notification_id' => $notification->id,
                'user_id' => $notifiable->id,
                'channel' => NotificationChannel::Sms,
                'status' => NotificationDeliveryStatus::Sent,
                'provider_id' => $result->sid,
                'sent_at' => now(),
            ]);
        } catch (\Exception $e) {
            NotificationDeliveryLog::create([
                'notification_id' => $notification->id,
                'user_id' => $notifiable->id,
                'channel' => NotificationChannel::Sms,
                'status' => NotificationDeliveryStatus::Failed,
                'error_message' => $e->getMessage(),
                'failed_at' => now(),
            ]);
        }
    }
}
```

### Decision 3: Broadcasting via Pusher (Preferred) or Soketi (Self-Hosted Alternative)

**Choice:** Use Laravel Broadcasting with Pusher for web push notifications. Document Soketi as self-hosted alternative for cost reduction later.

**Rationale:**
- Laravel Broadcasting integrates seamlessly with Laravel Echo on the frontend
- Pusher has free tier (100 connections, 200k messages/day) sufficient for MVP
- Soketi is open-source, Pusher-compatible, self-hosted alternative (can migrate later without code changes)

**Alternatives Considered:**
- **Server-Sent Events (SSE):** Simpler than WebSockets but not bidirectional, harder to scale across multiple servers.
- **Polling:** Simple but inefficient, high server load, not real-time.
- **Native Web Push API (service workers):** Requires HTTPS, complex setup, browser permission prompts. Good for offline notifications but overkill for in-app real-time updates.

**Implementation:**
- Configure Pusher in `config/broadcasting.php` and `.env`
- Install `pusher/pusher-php-server` for backend
- Install `laravel-echo` and `pusher-js` for frontend
- Create private channel `App.User.{userId}` for user-specific notifications
- Broadcast `NewNotification` event when notification is sent
- Frontend: Listen to `App.User.{userId}` channel and update badge + show toast

**Cost Consideration:**
- Pusher free tier: 100 concurrent connections, 200k messages/day
- If platform scales beyond free tier, migrate to self-hosted Soketi (Docker container, ~$10/mo VPS)

### Decision 4: User Preferences Stored as Type × Channel Matrix

**Choice:** Store preferences in `notification_preferences` table with `user_id`, `notification_type`, `channel`, and `enabled` columns.

**Rationale:**
- Granular control: users can disable email for market alerts but keep it for payments
- Easy to query: `NotificationPreference::where('user_id', $userId)->where('notification_type', $type)->where('channel', $channel)->where('enabled', true)->exists()`
- Default preferences created on user registration (all enabled except push — requires opt-in)

**Alternatives Considered:**
- **Single JSON column per user:** Less queryable, harder to update individual preferences, no database constraints.
- **Separate boolean columns per type × channel:** 20+ columns (5 types × 4 channels), hard to extend, migration hell.

**Schema:**
```php
Schema::create('notification_preferences', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->string('notification_type'); // NotificationType enum
    $table->string('channel'); // NotificationChannel enum
    $table->boolean('enabled')->default(true);
    $table->timestamps();

    $table->unique(['user_id', 'notification_type', 'channel']);
    $table->index(['user_id', 'enabled']);
});
```

**Default Preferences (on user registration):**
| Type | Email | SMS | Push | Database |
|------|-------|-----|------|----------|
| investment | ✅ | ❌ | ❌ | ✅ |
| harvest | ✅ | ❌ | ❌ | ✅ |
| payment | ✅ | ✅ | ❌ | ✅ |
| market | ✅ | ❌ | ❌ | ✅ |
| system | ✅ | ❌ | ❌ | ✅ |

(Push disabled by default — user must explicitly opt-in via Settings)

### Decision 5: Notification Templates with Blade-Style Placeholders

**Choice:** Store templates in `notification_templates` table with Blade-style placeholders (e.g., `{{ $user->name }}`).

**Rationale:**
- Admins can customize notification content without code changes
- Blade syntax is familiar to Laravel developers and easy to render
- Supports dynamic content (user name, investment amount, tree name, etc.)

**Alternatives Considered:**
- **Hardcoded notification content:** Inflexible, requires code changes for copywriting updates.
- **Custom placeholder syntax (e.g., `{{name}}`):** Requires custom parser. Blade is already built-in.

**Schema:**
```php
Schema::create('notification_templates', function (Blueprint $table) {
    $table->id();
    $table->string('type'); // NotificationType enum
    $table->string('channel'); // NotificationChannel enum
    $table->string('subject')->nullable(); // Email subject (null for SMS/database)
    $table->text('body'); // Blade template with placeholders
    $table->boolean('is_active')->default(true);
    $table->timestamps();

    $table->unique(['type', 'channel']);
});
```

**Example Template (Investment Notification — Email):**
- **Subject:** `New Investment Opportunity: {{ $tree->name }}`
- **Body:**
```blade
Hello {{ $user->name }},

A new investment opportunity is now available on Treevest!

**Tree:** {{ $tree->name }}
**Farm:** {{ $tree->farm->name }}
**Expected ROI:** {{ $tree->expected_roi }}%
**Price:** {{ $tree->price_formatted }}

[View Investment]({{ $investmentUrl }})

Happy investing!
The Treevest Team
```

**Rendering:**
```php
$template = NotificationTemplate::where('type', 'investment')
    ->where('channel', 'email')
    ->where('is_active', true)
    ->first();

$body = Blade::render($template->body, [
    'user' => $user,
    'tree' => $tree,
    'investmentUrl' => route('investments.show', $tree->id),
]);
```

### Decision 6: Delivery Logging for Debugging and Compliance

**Choice:** Log all notification delivery attempts (success and failure) to `notification_delivery_logs` table.

**Rationale:**
- Debugging: Track why notifications failed (bounced email, invalid phone number, rate limit)
- Compliance: Prove notification was sent (legal requirement for financial transactions)
- Monitoring: Identify delivery rate issues by channel/provider

**Schema:**
```php
Schema::create('notification_delivery_logs', function (Blueprint $table) {
    $table->id();
    $table->uuid('notification_id')->nullable(); // FK to notifications table (nullable for non-database channels)
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->string('channel'); // NotificationChannel enum
    $table->string('status'); // NotificationDeliveryStatus enum
    $table->string('provider_id')->nullable(); // Twilio SID, SendGrid message ID, etc.
    $table->text('error_message')->nullable();
    $table->timestamp('sent_at')->nullable();
    $table->timestamp('delivered_at')->nullable(); // From webhook (email opened, SMS delivered)
    $table->timestamp('failed_at')->nullable();
    $table->timestamps();

    $table->index(['user_id', 'channel', 'status']);
    $table->index('sent_at');
});
```

**Webhook Integration (Future Enhancement):**
- Twilio webhook: Update `delivered_at` when SMS is delivered
- SendGrid/Mailgun webhook: Update `delivered_at` when email is opened, track bounces

## Risks / Trade-offs

### Risk 1: WebSocket Infrastructure Complexity
**Risk:** Pusher/Soketi adds operational complexity beyond the database-backed stack.

**Mitigation:**
- Start with Pusher free tier (managed service, no ops overhead)
- Document Soketi migration path for later cost optimization
- Web push is optional — users can rely on email/SMS if WebSocket fails

### Risk 2: SMS Costs
**Risk:** SMS costs can be significant at scale ($0.01-0.05 per message × high volume).

**Mitigation:**
- SMS disabled by default for most notification types (only payment confirmations enabled)
- User preferences allow opting out
- Monitor SMS usage and alert admins if costs spike
- Consider SMS rate limiting (max 10/day per user)

### Risk 3: Notification Fatigue
**Risk:** Too many notifications drive users away.

**Mitigation:**
- Preference management allows granular control
- Default preferences are conservative (only critical notifications enabled for SMS)
- Future: Implement notification digest (daily/weekly summary email)

### Risk 4: Email Deliverability
**Risk:** Transactional emails may land in spam, especially for new domains.

**Mitigation:**
- Use reputable email service provider (SendGrid, Mailgun, SES)
- Configure SPF, DKIM, DMARC records for domain
- Use dedicated sending domain (e.g., `notifications@treevest.com`)
- Monitor bounce rates and unsubscribe rates

### Risk 5: Template Injection Vulnerability
**Risk:** Admin-editable Blade templates could allow code injection if not sanitized.

**Mitigation:**
- Render templates in sandboxed Blade environment (no `@php` directives allowed)
- Validate template syntax before saving
- Only admins can edit templates (`role:admin` middleware)
- Future: Use restricted template engine (Mustache, Twig) instead of Blade

## Migration Plan

### Phase 1: Foundation (This Proposal)
1. Create database schema (preferences, delivery logs, templates)
2. Implement notification classes for all types
3. Build notification center UI (view, mark as read)
4. Build preference management UI
5. Configure email and SMS channels
6. Seed default templates

### Phase 2: Real-Time Notifications (Parallel with Phase 1)
1. Configure Pusher/Soketi broadcasting
2. Install Laravel Echo on frontend
3. Add notification badge to header
4. Implement real-time toast notifications
5. Test broadcast events

### Phase 3: Admin Template Management (After Phase 1)
1. Build admin CRUD for templates
2. Add template preview functionality
3. Validate template syntax

### Phase 4: Delivery Tracking & Webhooks (Future Enhancement)
1. Implement Twilio delivery status webhooks
2. Implement SendGrid/Mailgun event webhooks
3. Update delivery logs based on webhook events
4. Build admin delivery monitoring dashboard

### Rollback Plan
- If WebSocket infrastructure fails, fall back to email/SMS only (remove broadcast channel from `via()` method)
- If SMS costs spike, disable SMS for non-critical types (remove SMS channel from default preferences)
- If template rendering breaks, fall back to hardcoded notification content (check for template existence before rendering)

## Open Questions

1. **Should we rate-limit notifications per user?**
   - Proposed: Max 50 notifications/day per user (prevent abuse, reduce costs)
   - Needs product decision

2. **Should we support notification digests (daily/weekly email summaries)?**
   - Deferred to future enhancement
   - Requires scheduled jobs to batch notifications

3. **Should we implement read receipts for email notifications (tracking pixel)?**
   - Deferred to delivery tracking phase
   - Privacy concern — needs product/legal review

4. **Should we allow users to snooze notifications (remind me later)?**
   - Deferred to future enhancement
   - Requires snooze table and scheduled jobs

5. **Should we support notification categories (e.g., "Urgent", "Informational")?**
   - Not needed for MVP — notification types are sufficient granularity
   - Can add later if user feedback indicates need
