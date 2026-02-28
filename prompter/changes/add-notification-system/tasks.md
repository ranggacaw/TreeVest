## 1. Database Schema

### 1.1 Notification Preferences
- [ ] Create migration: `create_notification_preferences_table`
  - Columns: `id`, `user_id`, `notification_type` (enum), `channel` (enum: email, sms, push, database), `enabled` (boolean), `created_at`, `updated_at`
  - Unique index on `user_id + notification_type + channel`
- [ ] Create `NotificationPreference` model with relationships and scopes

### 1.2 Notification Delivery Logs
- [ ] Create migration: `create_notification_delivery_logs_table`
  - Columns: `id`, `notification_id` (uuid, FK to notifications), `user_id`, `channel`, `status` (enum: sent, delivered, failed, bounced), `provider_id` (external ID from SMS/email provider), `error_message`, `sent_at`, `delivered_at`, `failed_at`, `created_at`, `updated_at`
  - Index on `notification_id`, `user_id`, `status`, `sent_at`
- [ ] Create `NotificationDeliveryLog` model with relationships

### 1.3 Notification Templates
- [ ] Create migration: `create_notification_templates_table`
  - Columns: `id`, `type` (enum: investment, harvest, payment, market, system), `channel` (enum), `subject`, `body` (text with placeholders), `is_active` (boolean), `created_at`, `updated_at`
  - Unique index on `type + channel`
- [ ] Create `NotificationTemplate` model with scopes for active templates

### 1.4 Notification Type Enum
- [ ] Create `app/Enums/NotificationType.php`
  - Values: `investment`, `harvest`, `payment`, `market`, `system`
- [ ] Create `app/Enums/NotificationChannel.php`
  - Values: `email`, `sms`, `push`, `database`
- [ ] Create `app/Enums/NotificationDeliveryStatus.php`
  - Values: `sent`, `delivered`, `failed`, `bounced`

## 2. Core Notification Infrastructure

### 2.1 Notification Classes
- [ ] Create `app/Notifications/InvestmentNotification.php`
  - Support all channels: database, email, SMS, broadcast
  - Use notification templates
  - Log delivery status
- [ ] Create `app/Notifications/HarvestNotification.php`
- [ ] Create `app/Notifications/PaymentNotification.php`
- [ ] Create `app/Notifications/MarketAlertNotification.php`
- [ ] Create `app/Notifications/SystemNotification.php`

### 2.2 Notification Service
- [ ] Create `app/Services/NotificationService.php`
  - Method: `send(User $user, string $type, array $data, array $channels = null)`
  - Check user preferences before sending
  - Select appropriate notification class
  - Replace template placeholders with data
  - Log delivery attempts
  - Handle channel-specific failures gracefully

### 2.3 Broadcasting Configuration
- [ ] Update `config/broadcasting.php` to configure Pusher or Soketi
- [ ] Add broadcast driver env vars to `.env.example`
- [ ] Install Laravel Echo on frontend: `npm install --save laravel-echo pusher-js`
- [ ] Configure Laravel Echo in `resources/js/bootstrap.ts`
- [ ] Create broadcast channel authorization in `routes/channels.php`
  - Private channel: `App.User.{userId}`

## 3. Backend Controllers

### 3.1 Notification Controller
- [ ] Create `app/Http/Controllers/NotificationController.php`
  - `index()` — list notifications with pagination, filter by read/unread
  - `show($id)` — view single notification and mark as read
  - `markAsRead($id)` — mark notification as read
  - `markAllAsRead()` — mark all user notifications as read
  - `destroy($id)` — delete notification
  - Return Inertia responses with `Notifications/Index` or JSON for AJAX

### 3.2 Notification Preference Controller
- [ ] Create `app/Http/Controllers/NotificationPreferenceController.php`
  - `index()` — show user preferences (return Inertia `Settings/Notifications`)
  - `update()` — bulk update preferences via AJAX
  - Validate: type must be valid NotificationType, channel must be valid NotificationChannel

### 3.3 Admin Notification Template Controller
- [ ] Create `app/Http/Controllers/Admin/NotificationTemplateController.php`
  - `index()` — list all templates (Inertia `Admin/NotificationTemplates/Index`)
  - `create()` — create form (Inertia `Admin/NotificationTemplates/Create`)
  - `store()` — save new template
  - `edit($id)` — edit form (Inertia `Admin/NotificationTemplates/Edit`)
  - `update($id)` — update template
  - `destroy($id)` — delete template (if not active)
  - Apply `role:admin` middleware

### 3.4 Form Requests
- [ ] Create `app/Http/Requests/UpdateNotificationPreferencesRequest.php`
  - Validate preferences array structure
- [ ] Create `app/Http/Requests/StoreNotificationTemplateRequest.php`
- [ ] Create `app/Http/Requests/UpdateNotificationTemplateRequest.php`

## 4. Frontend Components

### 4.1 Notification Center
- [ ] Create `resources/js/Pages/Notifications/Index.tsx`
  - Display notifications in list (unread bold, read gray)
  - Filter: All / Unread
  - Mark as read on click
  - "Mark all as read" button
  - Pagination for large lists
  - Show notification icon, title, message, timestamp
  - Link to relevant page (investment detail, harvest detail, etc.)

### 4.2 Notification Badge
- [ ] Create `resources/js/Components/NotificationBadge.tsx`
  - Display unread count in header (badge with number)
  - Real-time update via Laravel Echo (listen to `App.User.{userId}` channel)
  - Click to navigate to `/notifications`
- [ ] Update `resources/js/Layouts/AuthenticatedLayout.tsx` to include badge in header

### 4.3 Real-Time Toast Notifications
- [ ] Create `resources/js/Components/NotificationToast.tsx`
  - Display toast on new notification (via Laravel Echo)
  - Auto-dismiss after 5 seconds
  - Click to navigate to notification center or dismiss
  - Use Headless UI Transition for animation

### 4.4 Notification Preferences Page
- [ ] Create `resources/js/Pages/Settings/Notifications.tsx`
  - Matrix of notification types (rows) × channels (columns)
  - Toggle switches for each preference
  - Save button (AJAX post to preference controller)
  - Loading state during save
  - Success/error toast feedback

### 4.5 Admin Template Management
- [ ] Create `resources/js/Pages/Admin/NotificationTemplates/Index.tsx`
  - Table of templates: type, channel, subject, active status
  - Edit/Delete actions
  - "Create Template" button
- [ ] Create `resources/js/Pages/Admin/NotificationTemplates/Create.tsx`
  - Form: type (select), channel (select), subject, body (textarea with placeholder hints)
  - Active toggle
- [ ] Create `resources/js/Pages/Admin/NotificationTemplates/Edit.tsx`

### 4.6 Reusable Components
- [ ] Create `resources/js/Components/NotificationItem.tsx`
  - Props: notification object
  - Display icon based on type, title, message, timestamp
  - Conditional styling for read/unread
- [ ] Create `resources/js/Components/NotificationPreferenceToggle.tsx`
  - Props: type, channel, enabled, onChange callback
  - Accessible toggle switch component

## 5. Routes & Middleware

### 5.1 Web Routes
- [ ] Add notification routes to `routes/web.php`
  ```php
  Route::middleware(['auth'])->group(function () {
      Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
      Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
      Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');
      Route::delete('/notifications/{id}', [NotificationController::class, 'destroy'])->name('notifications.destroy');
      
      Route::get('/settings/notifications', [NotificationPreferenceController::class, 'index'])->name('settings.notifications');
      Route::post('/settings/notifications', [NotificationPreferenceController::class, 'update'])->name('settings.notifications.update');
  });

  Route::middleware(['auth', 'role:admin'])->prefix('admin')->group(function () {
      Route::resource('notification-templates', NotificationTemplateController::class);
  });
  ```

### 5.2 Broadcast Channels
- [ ] Add private channel authorization in `routes/channels.php`
  ```php
  Broadcast::channel('App.User.{userId}', function ($user, $userId) {
      return (int) $user->id === (int) $userId;
  });
  ```

## 6. External Service Integration

### 6.1 Email Service
- [ ] Configure Laravel Mail in `.env` (Mailgun, SendGrid, or SES)
- [ ] Create Markdown mail templates in `resources/views/emails/`
  - `investment-notification.blade.php`
  - `harvest-notification.blade.php`
  - `payment-notification.blade.php`
  - `market-alert-notification.blade.php`
  - `system-notification.blade.php`

### 6.2 SMS Gateway (Twilio)
- [ ] Install Twilio SDK: `composer require twilio/sdk`
- [ ] Add Twilio credentials to `.env.example`
- [ ] Create `app/Services/SmsService.php` for Twilio integration
  - Method: `send(string $to, string $message): bool`
  - Log failures to NotificationDeliveryLog

### 6.3 Web Push (via Laravel Broadcasting + Pusher/Soketi)
- [ ] Install Pusher/Soketi dependencies: `composer require pusher/pusher-php-server`
- [ ] Configure broadcast driver in `.env`
- [ ] Test broadcast event dispatch and frontend Echo subscription

## 7. Seeding & Defaults

### 7.1 Default Notification Preferences
- [ ] Create seeder: `NotificationPreferenceSeeder.php`
  - On user registration, create default preferences:
    - All types enabled for `database` channel
    - `investment`, `harvest`, `payment` enabled for `email` channel
    - `payment` enabled for `sms` channel (optional)
    - All types disabled for `push` channel (user must opt-in)
- [ ] Hook into user registration event to create default preferences

### 7.2 Default Notification Templates
- [ ] Create seeder: `NotificationTemplateSeeder.php`
  - Seed default templates for all type + channel combinations
  - Example: `investment` + `email` → Subject: "New Investment Opportunity", Body: "Hello {{name}}, check out {{tree_name}}..."
  - Use placeholders: `{{name}}`, `{{tree_name}}`, `{{amount}}`, etc.

## 8. Testing

### 8.1 Unit Tests
- [ ] `tests/Unit/NotificationServiceTest.php`
  - Test notification dispatch respects user preferences
  - Test template placeholder replacement
  - Test channel selection logic
- [ ] `tests/Unit/NotificationPreferenceTest.php`
  - Test model scopes and relationships

### 8.2 Feature Tests
- [ ] `tests/Feature/NotificationCenterTest.php`
  - User can view notifications
  - User can mark notification as read
  - User can mark all as read
  - User can delete notification
- [ ] `tests/Feature/NotificationPreferenceTest.php`
  - User can view preferences
  - User can update preferences
  - Preferences are respected during notification dispatch
- [ ] `tests/Feature/Admin/NotificationTemplateTest.php`
  - Admin can CRUD templates
  - Non-admin cannot access templates
- [ ] `tests/Feature/NotificationDeliveryTest.php`
  - Test email notification delivery
  - Test SMS notification delivery
  - Test delivery logs are created

## 9. Documentation

### 9.1 Update AGENTS.md
- [ ] Add `Notification`, `NotificationPreference`, `NotificationDeliveryLog`, `NotificationTemplate` to Section 6 (Data Models)
- [ ] Document notification event types in Section 7 (Glossary)
- [ ] Update Section 13 (Integration Map) with email/SMS service details

### 9.2 API Documentation
- [ ] Document notification API in code comments
  - How other EPICs should trigger notifications
  - Example: `Notification::send([$user], new InvestmentNotification($data))`
  - How to check user preferences before sending

## Post-Implementation

- [ ] Validate all tasks are completed
- [ ] Run `prompter validate add-notification-system --strict --no-interactive`
- [ ] Update AGENTS.md in the project root with notification system details
- [ ] Create GitHub PR referencing EPIC-013
