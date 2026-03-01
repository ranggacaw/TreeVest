# notifications Specification

## Purpose
TBD - created by archiving change add-notification-system. Update Purpose after archive.
## Requirements
### Requirement: Multi-Channel Notification Dispatch

The system SHALL support dispatching notifications through multiple channels: database (in-app), email, SMS, and broadcast (web push). Each notification type (investment, harvest, payment, market, system) SHALL be deliverable via any channel based on user preferences.

#### Scenario: Investment notification sent via email and database
- **WHEN** an investment opportunity is created
- **AND** an investor has email and database channels enabled for investment notifications
- **THEN** the system sends the notification to both email and in-app database
- **AND** the email contains investment details with a link to the investment page
- **AND** the in-app notification appears in the notification center

#### Scenario: Payment notification sent via SMS
- **WHEN** a payout is distributed to an investor
- **AND** the investor has SMS enabled for payment notifications
- **THEN** the system sends an SMS notification with payment amount and confirmation
- **AND** the SMS delivery is logged with status "sent"

#### Scenario: User has disabled email for market alerts
- **WHEN** a market alert notification is triggered
- **AND** the user has disabled email channel for market notifications
- **THEN** the system does NOT send the notification via email
- **AND** the notification is only sent via enabled channels (database, push)

---

### Requirement: Notification Type Classification

The system SHALL support five notification types: `investment` (investment opportunities, purchase confirmations), `harvest` (harvest schedule, yield updates, completion), `payment` (payment confirmations, payout distributions), `market` (price changes, market opportunities), and `system` (platform announcements, maintenance alerts).

#### Scenario: Investment purchase confirmation
- **WHEN** a user completes an investment purchase
- **THEN** the system sends an `investment` type notification
- **AND** the notification contains purchase details: tree name, amount, farm name, transaction ID

#### Scenario: Harvest completion alert
- **WHEN** a harvest is marked as completed by a farm owner
- **THEN** the system sends a `harvest` type notification to all investors with trees in that harvest
- **AND** the notification contains yield data and estimated payout timeline

#### Scenario: System maintenance announcement
- **WHEN** an admin creates a system maintenance notification
- **THEN** the system sends a `system` type notification to all users
- **AND** the notification contains maintenance schedule and expected downtime

---

### Requirement: User Notification Preferences

The system SHALL allow users to manage notification preferences on a per-type and per-channel basis. Users SHALL be able to enable or disable notifications for each combination of notification type and channel. Default preferences SHALL be created on user registration.

#### Scenario: User disables all SMS notifications
- **WHEN** a user disables the SMS channel for all notification types
- **THEN** the system does NOT send any SMS notifications to that user
- **AND** notifications are still sent via other enabled channels

#### Scenario: User enables web push for harvest notifications
- **WHEN** a user enables the push channel for harvest notifications
- **THEN** the system sends real-time web push notifications for harvest events
- **AND** the notification appears as a browser notification (if browser permissions granted)

#### Scenario: Default preferences on user registration
- **WHEN** a new user registers
- **THEN** the system creates default notification preferences
- **AND** email and database channels are enabled for all types
- **AND** SMS is enabled only for payment type
- **AND** push is disabled for all types (user must opt-in)

---

### Requirement: In-App Notification Center

The system SHALL provide an in-app notification center where users can view all notifications with read/unread status, mark notifications as read, mark all notifications as read, and delete notifications. Notifications SHALL be displayed in reverse chronological order with pagination.

#### Scenario: User views notification center
- **WHEN** a user navigates to `/notifications`
- **THEN** the system displays all notifications for that user
- **AND** unread notifications are visually distinct (bold text)
- **AND** notifications are paginated (20 per page)

#### Scenario: User marks notification as read
- **WHEN** a user clicks on an unread notification
- **THEN** the system marks the notification as read
- **AND** the notification's visual style changes to read state
- **AND** the unread count badge decreases by 1

#### Scenario: User marks all notifications as read
- **WHEN** a user clicks "Mark all as read" button
- **THEN** the system marks all unread notifications as read
- **AND** the unread count badge resets to 0

#### Scenario: User deletes a notification
- **WHEN** a user clicks delete on a notification
- **THEN** the system removes the notification from the notification center
- **AND** the notification is no longer visible to the user

---

### Requirement: Real-Time Notification Badge

The system SHALL display a real-time notification badge in the application header showing the count of unread notifications. The badge SHALL update immediately when new notifications arrive via Laravel Broadcasting (WebSocket).

#### Scenario: New notification increments badge count
- **WHEN** a user receives a new notification
- **THEN** the system broadcasts the notification via WebSocket
- **AND** the notification badge in the header increments by 1
- **AND** the update happens without page refresh

#### Scenario: User navigates to notification center from badge
- **WHEN** a user clicks the notification badge
- **THEN** the system navigates to `/notifications`

#### Scenario: Badge shows zero for users with no unread notifications
- **WHEN** a user has zero unread notifications
- **THEN** the notification badge is not displayed

---

### Requirement: Real-Time Toast Notifications

The system SHALL display real-time toast notifications when new notifications arrive. Toast notifications SHALL auto-dismiss after 5 seconds and provide a link to the full notification or relevant page.

#### Scenario: Investment notification toast
- **WHEN** a user receives an investment notification while browsing the platform
- **THEN** the system displays a toast notification with title, message preview, and icon
- **AND** the toast auto-dismisses after 5 seconds
- **AND** clicking the toast navigates to the investment detail page

#### Scenario: User dismisses toast manually
- **WHEN** a toast notification is displayed
- **AND** the user clicks the dismiss button
- **THEN** the toast disappears immediately

---

### Requirement: Notification Templates

The system SHALL support admin-configurable notification templates for each notification type and channel combination. Templates SHALL use Blade-style placeholders for dynamic content (e.g., user name, tree name, amount). Admins SHALL be able to create, update, activate, deactivate, and delete templates.

#### Scenario: Admin creates email template for investment notifications
- **WHEN** an admin creates a new notification template
- **AND** selects type "investment" and channel "email"
- **AND** provides subject "New Investment: {{ $tree->name }}" and body with placeholders
- **THEN** the system saves the template
- **AND** the template is marked as active

#### Scenario: Notification uses active template
- **WHEN** an investment notification is dispatched via email
- **THEN** the system retrieves the active template for type "investment" and channel "email"
- **AND** the system replaces placeholders with actual data (user name, tree name, etc.)
- **AND** the rendered content is sent via email

#### Scenario: Admin deactivates a template
- **WHEN** an admin deactivates a notification template
- **THEN** the system stops using that template for new notifications
- **AND** notifications fall back to default hardcoded content

#### Scenario: Template with invalid placeholder
- **WHEN** an admin saves a template with an undefined placeholder (e.g., {{ $invalid }})
- **THEN** the system validates the template syntax
- **AND** returns an error if placeholders are not in the allowed list

---

### Requirement: Notification Delivery Logging

The system SHALL log all notification delivery attempts (success and failure) to a delivery log table. Logs SHALL include notification ID, user ID, channel, status (sent, delivered, failed, bounced), provider ID (external service message ID), error message, and timestamps.

#### Scenario: SMS delivery success logged
- **WHEN** an SMS notification is successfully sent via Twilio
- **THEN** the system creates a delivery log entry
- **AND** the log includes status "sent", Twilio message SID, and sent_at timestamp

#### Scenario: Email delivery failure logged
- **WHEN** an email notification fails to send (invalid email address)
- **THEN** the system creates a delivery log entry
- **AND** the log includes status "failed", error message, and failed_at timestamp

#### Scenario: Admin views delivery logs for troubleshooting
- **WHEN** an admin navigates to the delivery logs page
- **THEN** the system displays all delivery attempts with filters (user, channel, status, date range)

---

### Requirement: Graceful Channel Degradation

The system SHALL continue delivering notifications via available channels even if one channel fails. Notification dispatch SHALL NOT fail entirely if a single channel (e.g., SMS) is unavailable.

#### Scenario: SMS provider unavailable, email still sent
- **WHEN** a payment notification is dispatched
- **AND** the SMS provider (Twilio) is unavailable
- **THEN** the system logs the SMS failure
- **AND** the system continues to send the notification via email and database channels
- **AND** the user receives the notification via email

#### Scenario: All channels fail, error logged
- **WHEN** a notification is dispatched
- **AND** all channels fail (email bounces, SMS fails, broadcast unavailable)
- **THEN** the system logs all failures in the delivery log
- **AND** the system alerts admins of the critical failure

---

### Requirement: Notification API for EPIC Integration

The system SHALL provide a reusable notification API for other EPICs to trigger notifications. The API SHALL accept notification type, recipient user(s), notification data, and optional channel override.

#### Scenario: Investment EPIC triggers purchase confirmation
- **WHEN** EPIC-006 (Investment) completes a purchase
- **THEN** the Investment controller calls `NotificationService::send($user, 'investment', $data)`
- **AND** the NotificationService checks user preferences
- **AND** the NotificationService dispatches the appropriate notification class
- **AND** the notification is sent via enabled channels

#### Scenario: Harvest EPIC triggers harvest completion alert
- **WHEN** EPIC-009 (Harvest) marks a harvest as completed
- **THEN** the Harvest controller dispatches a `HarvestCompleted` event
- **AND** a listener calls `Notification::send($investors, new HarvestNotification($harvest))`
- **AND** all investors with trees in that harvest receive the notification

#### Scenario: Admin triggers system announcement to all users
- **WHEN** an admin creates a system announcement
- **THEN** the Admin controller calls `NotificationService::sendToAll('system', $announcementData)`
- **AND** the system dispatches the notification to all users
- **AND** the notification is queued for async delivery

---

### Requirement: Email Notification Content

The system SHALL send email notifications with subject, body, action button (link to relevant page), and platform branding. Emails SHALL use Markdown mail templates for consistent styling.

#### Scenario: Investment notification email structure
- **WHEN** an investment notification is sent via email
- **THEN** the email includes:
  - Subject: "New Investment Opportunity: [Tree Name]"
  - Greeting: "Hello [User Name],"
  - Body: Investment details (tree name, farm, ROI, price)
  - Action button: "View Investment" linking to investment detail page
  - Footer: Treevest branding and unsubscribe link

---

### Requirement: SMS Notification Content

The system SHALL send SMS notifications with concise message content (max 160 characters) including key details and a short link to the relevant page.

#### Scenario: Payment confirmation SMS
- **WHEN** a payment notification is sent via SMS
- **THEN** the SMS message contains:
  - "Treevest: Payout of RM 1,500 distributed to your account. View: [short link]"
  - Message is under 160 characters

---

### Requirement: Web Push Notification Content

The system SHALL send web push notifications (via Laravel Broadcasting) with title, body, icon, and click action (navigate to relevant page). Web push requires user browser permission.

#### Scenario: Harvest completion web push
- **WHEN** a harvest notification is sent via push
- **AND** the user has granted browser notification permission
- **THEN** the browser displays a notification with:
  - Title: "Harvest Completed"
  - Body: "Your investment in [Tree Name] has been harvested. View payout details."
  - Icon: Treevest logo
  - Click action: Navigate to harvest detail page

#### Scenario: User has not granted browser permission
- **WHEN** a user enables push notifications in preferences
- **AND** the user has not granted browser notification permission
- **THEN** the system prompts the user to grant permission
- **AND** if permission is denied, push notifications are not sent (database and email used instead)

---

### Requirement: Notification Preference Management UI

The system SHALL provide a settings page at `/settings/notifications` where users can view and update notification preferences in a matrix format (notification types as rows, channels as columns, toggle switches for enable/disable).

#### Scenario: User updates preferences
- **WHEN** a user navigates to `/settings/notifications`
- **THEN** the system displays a preference matrix with toggle switches
- **AND** the user can toggle any type × channel combination
- **AND** clicking "Save" updates preferences via AJAX
- **AND** a success toast confirms the update

#### Scenario: Preference change reflected immediately
- **WHEN** a user disables email for harvest notifications
- **AND** saves the preference
- **THEN** the system immediately stops sending harvest email notifications to that user
- **AND** the next harvest notification is only sent via enabled channels

---

### Requirement: Admin Notification Template Management

The system SHALL provide an admin panel at `/admin/notification-templates` where admins can create, edit, activate, deactivate, and delete notification templates. Only users with `admin` role SHALL access this page.

#### Scenario: Admin creates new template
- **WHEN** an admin navigates to `/admin/notification-templates/create`
- **THEN** the system displays a form with fields: type (select), channel (select), subject, body (textarea), active (checkbox)
- **AND** the admin fills in the template details
- **AND** clicks "Save"
- **THEN** the system validates the template
- **AND** saves the template if valid

#### Scenario: Non-admin user attempts to access templates
- **WHEN** a non-admin user navigates to `/admin/notification-templates`
- **THEN** the system returns 403 Forbidden error

#### Scenario: Admin previews template before saving
- **WHEN** an admin is editing a template
- **AND** clicks "Preview"
- **THEN** the system renders the template with sample data
- **AND** displays the preview in a modal

---

### Requirement: Default Notification Preferences

The system SHALL create default notification preferences on user registration. Default preferences SHALL enable email and database channels for all types, SMS for payment type only, and push disabled for all types.

#### Scenario: New user default preferences
- **WHEN** a new user completes registration
- **THEN** the system creates notification preferences:
  - `investment` + `email` = enabled
  - `investment` + `database` = enabled
  - `investment` + `sms` = disabled
  - `investment` + `push` = disabled
  - `harvest` + `email` = enabled
  - `harvest` + `database` = enabled
  - `harvest` + `sms` = disabled
  - `harvest` + `push` = disabled
  - `payment` + `email` = enabled
  - `payment` + `database` = enabled
  - `payment` + `sms` = enabled
  - `payment` + `push` = disabled
  - `market` + `email` = enabled
  - `market` + `database` = enabled
  - `market` + `sms` = disabled
  - `market` + `push` = disabled
  - `system` + `email` = enabled
  - `system` + `database` = enabled
  - `system` + `sms` = disabled
  - `system` + `push` = disabled

---

### Requirement: Notification Queue Processing

The system SHALL dispatch all notifications asynchronously via Laravel's queue system. Notification classes SHALL implement `ShouldQueue` interface. Queue workers SHALL process notifications in the background.

#### Scenario: Notification is queued on dispatch
- **WHEN** a notification is triggered
- **THEN** the system adds the notification job to the queue
- **AND** returns immediately without blocking the HTTP response
- **AND** the queue worker processes the notification in the background

#### Scenario: Queue worker processes notification
- **WHEN** a queue worker picks up a notification job
- **THEN** the system checks user preferences
- **AND** dispatches the notification to enabled channels
- **AND** logs delivery attempts
- **AND** marks the job as complete

---

### Requirement: Notification Broadcasting Authorization

The system SHALL authorize WebSocket connections for private notification channels. Users SHALL only be able to subscribe to their own notification channel (`App.User.{userId}`).

#### Scenario: User subscribes to own notification channel
- **WHEN** a user connects to Laravel Echo
- **AND** subscribes to `App.User.{userId}` channel
- **THEN** the system authorizes the subscription
- **AND** the user receives real-time notifications on that channel

#### Scenario: User attempts to subscribe to another user's channel
- **WHEN** a user attempts to subscribe to `App.User.{otherUserId}` channel
- **THEN** the system rejects the subscription
- **AND** returns 403 Forbidden error

---

### Requirement: Notification Data Structure

The system SHALL store notification data in the `notifications.data` JSON column with a consistent structure: `type`, `title`, `message`, `action_url`, `action_text`, and `metadata` (flexible object for type-specific data).

#### Scenario: Investment notification data structure
- **WHEN** an investment notification is saved to the database
- **THEN** the `data` column contains:
  ```json
  {
    "type": "investment",
    "title": "New Investment Opportunity",
    "message": "Musang King Durian is now available for investment.",
    "action_url": "/investments/123",
    "action_text": "View Investment",
    "metadata": {
      "tree_id": 123,
      "tree_name": "Musang King Durian",
      "farm_name": "Green Valley Farm",
      "expected_roi": 15,
      "price": 150000,
      "currency": "MYR"
    }
  }
  ```

#### Scenario: Notification center displays data
- **WHEN** the notification center renders a notification
- **THEN** the system reads the `data` JSON column
- **AND** displays title, message, and action button based on the data structure

