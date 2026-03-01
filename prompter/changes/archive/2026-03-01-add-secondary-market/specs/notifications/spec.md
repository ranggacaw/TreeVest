## MODIFIED Requirements

### Requirement: Notification Type Classification

The system SHALL support eight notification types: `investment` (investment opportunities, purchase confirmations), `harvest` (harvest schedule, yield updates, completion), `payment` (payment confirmations, payout distributions), `market` (price changes, market opportunities), `system` (platform announcements, maintenance alerts), `health` (health updates, pest/disease reports), `weather` (weather alerts affecting farms), and **`secondary_sale`** (secondary market listing purchased, listing sold, transfer completed).

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

#### Scenario: Secondary sale sold notification sent to seller
- **WHEN** a `ListingPurchased` event is dispatched after a secondary market purchase is confirmed
- **THEN** the system sends a `secondary_sale` type notification to the seller with message: "Your listing for [Fruit Type] [Variant] on [Farm Name] has been sold for RM [ask_price]. Your net proceeds of RM [net_proceeds] are being processed."
- **AND** the notification action links to `/secondary-market/{listing_id}`

#### Scenario: Secondary sale purchased notification sent to buyer
- **WHEN** a `ListingPurchased` event is dispatched
- **THEN** the system sends a `secondary_sale` type notification to the buyer with message: "You have successfully purchased a [Fruit Type] [Variant] investment on [Farm Name] for RM [ask_price]. View your new investment in your portfolio."
- **AND** the notification action links to `/investments/{investment_id}`

---

### Requirement: User Notification Preferences

The system SHALL allow users to manage notification preferences on a per-type and per-channel basis. Users SHALL be able to enable or disable notifications for each combination of notification type (investment, harvest, payment, market, system, health, weather, **secondary_sale**) and channel (email, database, SMS, push). Default preferences SHALL be created on user registration.

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
- **AND** email and database channels are enabled for all types (investment, harvest, payment, market, system, health, weather, secondary_sale)
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
  - `health` + `email` = enabled
  - `health` + `database` = enabled
  - `health` + `sms` = disabled
  - `health` + `push` = disabled
  - `weather` + `email` = enabled
  - `weather` + `database` = enabled
  - `weather` + `sms` = disabled
  - `weather` + `push` = disabled
  - **`secondary_sale` + `email` = enabled**
  - **`secondary_sale` + `database` = enabled**
  - **`secondary_sale` + `sms` = enabled**
  - **`secondary_sale` + `push` = disabled**
