# Change: Add Multi-Channel Notification System

## Why

The platform needs a comprehensive notification infrastructure to keep users informed about investment opportunities, harvest updates, payment confirmations, and market alerts. Timely notifications drive investor confidence, platform engagement, and operational efficiency. This is the foundation that enables all other EPICs to communicate with users effectively.

Currently, only `SecurityAlertNotification` exists for admin alerts. We need a full notification system supporting:
- Push notifications (web push only — mobile deferred)
- Email notifications for key events
- SMS notifications as fallback/optional channel
- In-app notification center with read/unread status
- User preferences to control notification delivery per channel and type

This proposal implements **Phase 1** of EPIC-013, focusing solely on the notification infrastructure. In-app user-to-user messaging and customer support chat will be separate proposals.

## What Changes

### New Capabilities
- **Notification Infrastructure** (new spec: `notifications`)
  - Multi-channel notification dispatch (database, email, SMS, broadcast/web push)
  - Notification event types: investment, harvest, payment, market, system
  - Notification center UI showing all notifications with read/unread status
  - User preference management (enable/disable per channel per type)
  - Notification delivery status tracking (sent, delivered, failed)
  - Notification templates management (admin-configurable)
  - Reusable notification API for other EPICs to trigger notifications

### Database Schema
- `notifications` table already exists (Laravel default)
- New: `notification_preferences` table
- New: `notification_delivery_logs` table
- New: `notification_templates` table

### New Models
- `NotificationPreference` — user preferences for channel + type combinations
- `NotificationDeliveryLog` — track delivery status for all sent notifications
- `NotificationTemplate` — admin-managed templates for different notification types

### New Notification Classes
- `InvestmentNotification` — investment opportunities, purchase confirmations
- `HarvestNotification` — harvest schedule, yield updates, completion
- `PaymentNotification` — payment confirmations, payout distributions
- `MarketAlertNotification` — price changes, market opportunities
- `SystemNotification` — platform announcements, maintenance

### New Controllers
- `NotificationController` — view notification center, mark as read
- `NotificationPreferenceController` — manage user preferences
- `Admin/NotificationTemplateController` — admin template management

### New Pages (Inertia/React)
- `Notifications/Index.tsx` — notification center with read/unread filtering
- `Settings/Notifications.tsx` — user preference management
- `Admin/NotificationTemplates/Index.tsx` — admin template CRUD

### New Components
- `NotificationBadge.tsx` — unread count in header
- `NotificationItem.tsx` — individual notification display
- `NotificationPreferenceToggle.tsx` — channel/type preference toggle
- `NotificationToast.tsx` — real-time toast notifications (via Laravel Echo)

### External Dependencies
- **Laravel Broadcasting** with Pusher or Soketi (WebSocket for real-time notifications)
- **Laravel Echo** (React frontend for WebSocket subscriptions)
- **Email Service Provider** (Laravel Mail with Mailgun, SendGrid, or SES)
- **SMS Gateway** (Twilio SDK for SMS delivery)

### Integration Points
- All notification-triggering EPICs will use `Notification::send()` with the appropriate notification class
- Example: EPIC-006 (Investment) will trigger `InvestmentNotification` on purchase
- Example: EPIC-009 (Harvest) will trigger `HarvestNotification` on completion

## Impact

### Affected Specs
- **New:** `specs/notifications/spec.md` (entire new capability)

### Affected Code
- **New:** `app/Models/NotificationPreference.php`
- **New:** `app/Models/NotificationDeliveryLog.php`
- **New:** `app/Models/NotificationTemplate.php`
- **New:** `app/Notifications/InvestmentNotification.php`
- **New:** `app/Notifications/HarvestNotification.php`
- **New:** `app/Notifications/PaymentNotification.php`
- **New:** `app/Notifications/MarketAlertNotification.php`
- **New:** `app/Notifications/SystemNotification.php`
- **New:** `app/Http/Controllers/NotificationController.php`
- **New:** `app/Http/Controllers/NotificationPreferenceController.php`
- **New:** `app/Http/Controllers/Admin/NotificationTemplateController.php`
- **New:** `app/Services/NotificationService.php`
- **New:** `resources/js/Pages/Notifications/Index.tsx`
- **New:** `resources/js/Pages/Settings/Notifications.tsx`
- **New:** `resources/js/Pages/Admin/NotificationTemplates/Index.tsx`
- **New:** `resources/js/Components/NotificationBadge.tsx`
- **New:** `resources/js/Components/NotificationItem.tsx`
- **New:** `resources/js/Components/NotificationPreferenceToggle.tsx`
- **New:** `resources/js/Components/NotificationToast.tsx`
- **New:** `database/migrations/*_create_notification_preferences_table.php`
- **New:** `database/migrations/*_create_notification_delivery_logs_table.php`
- **New:** `database/migrations/*_create_notification_templates_table.php`
- **Modified:** `resources/js/Layouts/AuthenticatedLayout.tsx` (add notification badge to header)
- **Modified:** `routes/web.php` (add notification routes)
- **Modified:** `config/broadcasting.php` (configure Pusher/Soketi)
- **New:** `.env.example` (add broadcast, email, SMS config examples)

### Dependencies
- **Prerequisite Specs:** `user-authentication` (notifications are tied to users)
- **Blocks:** EPIC-006 (Investment), EPIC-008 (Health Monitoring), EPIC-009 (Harvest), EPIC-010 (Payments) — these EPICs will trigger notifications

### Risks
- WebSocket infrastructure (Pusher/Soketi) adds operational complexity beyond database-backed queue/cache
- SMS costs can be significant for high-volume notifications
- Notification fatigue risk — preference management mitigates this
- Web push requires HTTPS and browser permission prompts
- Email deliverability depends on transactional email provider reputation

### Deferred to Future Proposals
- **In-app user-to-user messaging** (direct messages, message history)
- **Customer support chat** (third-party widget integration: Intercom, Zendesk, Crisp)
- **Mobile push notifications** (FCM/APNs — requires native mobile apps)
- **Notification analytics dashboard** (open rates, click rates, engagement metrics)
