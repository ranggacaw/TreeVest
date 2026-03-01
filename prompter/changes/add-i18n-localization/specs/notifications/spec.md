## MODIFIED Requirements

### Requirement: Multi-Channel Notification Dispatch

The system SHALL support dispatching notifications through multiple channels: database (in-app), email, SMS, and broadcast (web push). Each notification type (investment, harvest, payment, market, system, **health**, **weather**) SHALL be deliverable via any channel based on user preferences. Notification content SHALL be rendered in the recipient user's stored locale, falling back to `APP_LOCALE` when no preference is set.

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

#### Scenario: Health update notification sent to investors
- **WHEN** a farm owner creates a health update with severity "high"
- **AND** an investor has email and database enabled for health notifications
- **THEN** the system sends the notification to both channels
- **AND** the notification includes crop name, farm name, severity, and link to health update detail

#### Scenario: Weather alert notification sent via SMS and email
- **WHEN** a weather alert is generated for heavy rainfall
- **AND** an investor has SMS and email enabled for weather notifications
- **THEN** the system sends SMS: "Treevest: Heavy rainfall alert for [Farm Name]. Risk of flooding. View: [short link]"
- **AND** sends email with full details and action button

#### Scenario: Notification content rendered in recipient's locale
- **WHEN** a notification is dispatched to a user with `locale = 'id'`
- **THEN** the notification subject line and body text are rendered using `lang/id/messages.php` strings via `__()` helper
- **AND** the notification content is in Bahasa Indonesia

#### Scenario: Notification falls back to English for users without locale preference
- **WHEN** a notification is dispatched to a user with `locale = null`
- **THEN** the notification content falls back to `APP_LOCALE` (English)
- **AND** the notification subject and body text are rendered in English
