## ADDED Requirements

### Requirement: Harvest Approaching Notification
The system SHALL send `harvest` type notifications to investors when their invested tree's harvest date is approaching (7 days and 1 day before the scheduled date).

#### Scenario: 7-day harvest reminder notification sent
- **WHEN** the daily scheduler runs and a harvest is 7 days away
- **AND** an investor has `harvest` notifications enabled on at least one channel
- **THEN** the system sends a `harvest` type notification with message: "Your [Fruit Type] tree on [Farm Name] is expected to harvest in 7 days (scheduled: [date])."
- **AND** the notification action links to `/investor/payouts` (where they can see expected payout context)

#### Scenario: 1-day harvest reminder notification sent
- **WHEN** the daily scheduler runs and a harvest is 1 day away
- **AND** an investor has `harvest` notifications enabled on at least one channel
- **THEN** the system sends a `harvest` type notification with message: "Your [Fruit Type] tree on [Farm Name] harvests tomorrow ([date])."

---

### Requirement: Harvest Completed Notification
The system SHALL send `harvest` type notifications to all investors with active investments in a tree when that tree's harvest is confirmed as complete.

#### Scenario: Harvest completion notification dispatched to all investors
- **WHEN** a `HarvestCompleted` event is dispatched
- **AND** an investor has `harvest` notifications enabled on at least one channel
- **THEN** the system sends a `harvest` type notification with message: "The [Fruit Type] harvest on [Farm Name] has been completed. Actual yield: [X kg]. Your payout is being calculated."
- **AND** the notification action links to `/investor/payouts`

---

### Requirement: Harvest Failed Notification
The system SHALL send `harvest` type notifications to all investors with active investments in a tree when that tree's harvest fails.

#### Scenario: Harvest failure notification dispatched
- **WHEN** a `HarvestFailed` event is dispatched
- **AND** an investor has `harvest` notifications enabled on at least one channel
- **THEN** the system sends a `harvest` type notification with message: "The scheduled [Fruit Type] harvest on [Farm Name] was unsuccessful. No payout will be distributed for this cycle."

---

### Requirement: Payout Created Notification
The system SHALL send `payment` type notifications to investors when payout records are created (i.e., payouts are queued for disbursement).

#### Scenario: Payout created notification sent to investor
- **WHEN** a `PayoutsCreated` event is dispatched for an investor
- **AND** the investor has `payment` notifications enabled on at least one channel
- **THEN** the system sends a `payment` type notification with message: "Your payout of RM [net_amount] from the [Fruit Type] harvest on [Farm Name] is being processed."
- **AND** the notification action links to `/investor/payouts/{payout_id}`

#### Scenario: Zero-yield payout notification
- **WHEN** a payout is created with `net_amount_cents = 0`
- **THEN** the notification message is: "The [Fruit Type] harvest on [Farm Name] produced no yield this cycle. No payout will be distributed."
