# payout-distribution Specification

## Purpose
TBD - created by archiving change add-harvest-returns-system. Update Purpose after archive.
## Requirements
### Requirement: Payout Record Creation
The system SHALL create `Payout` records for all active investors in a harvested tree when profit calculation completes. Records are created with `status = pending` and represent the obligation to pay the investor — actual fund disbursement is handled by EPIC-010.

#### Scenario: Payout records created after calculation
- **WHEN** `ProfitCalculationService::calculate()` completes for a harvest
- **THEN** a `Payout` record is created for each active investor with: `investment_id`, `harvest_id`, `investor_id`, `gross_amount_cents`, `platform_fee_cents`, `net_amount_cents`, `currency = MYR`, `status = pending`
- **AND** a `PayoutsCreated` event is dispatched with the list of payout IDs

#### Scenario: Payout created audit log entry
- **WHEN** a `Payout` record is created
- **THEN** an audit log entry is created with event type `payout_created`, `payout_id`, `investment_id`, `harvest_id`, `net_amount_cents`, `investor_id`

---

### Requirement: Payout Status Lifecycle
The system SHALL track `Payout` status through `pending → processing → completed / failed`. Transitions from `pending` are driven by EPIC-010 (Payment Gateway). This spec defines the data model and visibility rules.

#### Scenario: Payout status transition to processing
- **WHEN** EPIC-010 initiates a bank or wallet transfer for a payout
- **THEN** the payout `status` transitions to `processing`
- **AND** `processing_started_at` is set
- **AND** an audit log entry is created with event type `payout_processing_started`

#### Scenario: Payout status transition to completed
- **WHEN** EPIC-010 confirms successful fund disbursement for a payout
- **THEN** the payout `status` transitions to `completed`
- **AND** `completed_at` is set and `transaction_id` is populated (FK to the `Transaction` record)
- **AND** an audit log entry is created with event type `payout_completed`, `payout_id`, `transaction_id`, `net_amount_cents`

#### Scenario: Payout status transition to failed
- **WHEN** a payout disbursement fails (e.g., invalid bank account, gateway error)
- **THEN** the payout `status` transitions to `failed`
- **AND** `failed_at` is set and `failed_reason` is populated
- **AND** an audit log entry is created with event type `payout_failed`, `payout_id`, `failed_reason`

#### Scenario: Invalid payout status transition rejected
- **WHEN** code attempts to transition a payout from `completed` to `pending`
- **THEN** the system throws an `InvalidPayoutTransitionException`
- **AND** the payout record remains unchanged

---

### Requirement: Investor Payout Visibility
Investors SHALL be able to view their pending, processing, and completed payouts with full detail, including harvest information and calculation breakdown.

#### Scenario: Investor views payout list
- **WHEN** an investor navigates to `/investor/payouts`
- **THEN** the system displays all payouts for that investor, paginated (20 per page), ordered by `created_at` DESC
- **AND** each row shows: harvest date, fruit type and variant, farm name, gross amount (RM), platform fee (RM), net amount (RM), status badge, payout date (if completed)

#### Scenario: Investor views payout detail
- **WHEN** an investor navigates to `/investor/payouts/{payout_id}`
- **THEN** the system displays the full payout breakdown: investment amount, proportional share (%), gross revenue share, platform fee deducted, net payout amount, harvest details (date, actual yield kg, market price per kg at settlement), current status, associated transaction reference (if disbursed)

#### Scenario: Investor cannot view another investor's payout
- **WHEN** an investor attempts to access `/investor/payouts/{payout_id}` for a payout belonging to another investor
- **THEN** the system returns HTTP 403 Forbidden

---

### Requirement: Payout Notifications
The system SHALL notify investors when their payouts are created (pending) and when disbursement is completed.

#### Scenario: Investor notified when payout is created
- **WHEN** a `PayoutsCreated` event is dispatched
- **THEN** the `NotifyInvestorsOfPayoutCreated` listener dispatches notification jobs for each investor
- **AND** the notification type is `payment` with message: "Your payout of RM [net_amount] from the [Fruit Type] harvest on [Farm Name] is being processed."
- **AND** the notification action links to `/investor/payouts/{payout_id}`

#### Scenario: Investor notified when harvest produces zero yield
- **WHEN** a `PayoutsCreated` event is dispatched with `net_amount_cents = 0` for all payouts
- **THEN** the notification message is: "The [Fruit Type] harvest on [Farm Name] has been completed. Unfortunately, the harvest produced no yield this cycle. No payout will be distributed."

---

### Requirement: Failed Harvest Investor Notification
When a harvest fails (not a zero-yield completion but a true `HarvestStatus=failed`), the system SHALL notify all active investors in the affected tree.

#### Scenario: Investors notified of harvest failure
- **WHEN** a `HarvestFailed` event is dispatched
- **THEN** the `NotifyInvestorsOfHarvestFailure` listener dispatches notification jobs for all investors with `active` investments in the harvest's tree
- **AND** the notification type is `harvest` with message: "The [Fruit Type] harvest on [Farm Name] (scheduled for [date]) was unsuccessful. [Notes from farm owner]. No payout will be distributed for this harvest cycle."

---

### Requirement: Payout Admin Management
Admins SHALL be able to view all payouts with filters and manually trigger status updates for stuck or failed payouts.

#### Scenario: Admin views all payouts
- **WHEN** an admin navigates to `/admin/payouts`
- **THEN** the system displays all payouts with filters: status, investor, farm, fruit type, date range
- **AND** the system paginates results (25 per page) with sortable columns

#### Scenario: Admin manually marks payout as failed
- **WHEN** an admin marks a payout as `failed` with a required reason
- **THEN** the system transitions payout `status` to `failed` and populates `failed_reason`
- **AND** an audit log entry records the admin user ID and reason

#### Scenario: Admin retries failed payout
- **WHEN** an admin clicks "Retry Payout" on a payout with `status = failed`
- **THEN** the system resets the payout `status` to `pending` (cleared `failed_at`, `failed_reason`)
- **AND** an audit log entry records the retry action with admin user ID
- **AND** EPIC-010's disbursement process picks up the pending payout in its next processing cycle

