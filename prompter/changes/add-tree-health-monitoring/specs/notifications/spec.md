## MODIFIED Requirements

### Requirement: Multi-Channel Notification Dispatch

The system SHALL support dispatching notifications through multiple channels: database (in-app), email, SMS, and broadcast (web push). Each notification type (investment, harvest, payment, market, system, **health**, **weather**) SHALL be deliverable via any channel based on user preferences.

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

---

### Requirement: Notification Type Classification

The system SHALL support seven notification types: `investment` (investment opportunities, purchase confirmations), `harvest` (harvest schedule, yield updates, completion), `payment` (payment confirmations, payout distributions), `market` (price changes, market opportunities), `system` (platform announcements, maintenance alerts), **`health`** (health updates, pest/disease reports), and **`weather`** (weather alerts affecting farms).

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

#### Scenario: Health update notification
- **WHEN** a farm owner creates a health update with severity "medium" or higher
- **THEN** the system sends a `health` type notification to all investors with trees in that crop
- **AND** the notification contains crop name, farm name, update type, severity, and excerpt

#### Scenario: Weather alert notification
- **WHEN** a weather alert is generated (heavy rainfall, extreme heat, etc.)
- **THEN** the system sends a `weather` type notification to all investors with trees on the affected farm
- **AND** the notification contains farm name, alert type, severity, and weather details

---

### Requirement: User Notification Preferences

The system SHALL allow users to manage notification preferences on a per-type and per-channel basis. Users SHALL be able to enable or disable notifications for each combination of notification type (investment, harvest, payment, market, system, **health**, **weather**) and channel (email, database, SMS, push). Default preferences SHALL be created on user registration.

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
- **AND** email and database channels are enabled for all types (investment, harvest, payment, market, system, health, weather)
- **AND** SMS is enabled only for payment type
- **AND** push is disabled for all types (user must opt-in)

#### Scenario: User enables email for health notifications
- **WHEN** an investor enables email channel for health notifications
- **THEN** the system updates the notification preference
- **AND** the user receives email notifications for health updates affecting their invested trees

#### Scenario: User disables weather alert notifications
- **WHEN** an investor disables all channels for weather notifications
- **THEN** the system stops sending weather alerts to that user
- **AND** weather alerts are still visible in the in-app health feed

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
  - **`health` + `email` = enabled**
  - **`health` + `database` = enabled**
  - **`health` + `sms` = disabled**
  - **`health` + `push` = disabled**
  - **`weather` + `email` = enabled**
  - **`weather` + `database` = enabled**
  - **`weather` + `sms` = disabled**
  - **`weather` + `push` = disabled**
