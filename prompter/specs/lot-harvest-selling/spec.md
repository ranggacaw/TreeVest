# lot-harvest-selling Specification

## Purpose
TBD - created by archiving change implement-farm-owner-core-platform. Update Purpose after archive.
## Requirements
### Requirement: Harvest Data Recording by Farm Owner
Farm owners SHALL be able to record harvest results for a completed lot, uploading photographic evidence and yield metrics.

#### Scenario: Farm owner records harvest data
- **WHEN** a farm owner submits harvest data for a lot with `status = in_progress`, including: `total_fruit`, `total_weight_kg`, and at least one harvest photo
- **THEN** the system records the harvest data against the lot's associated `Harvest` record
- **AND** transitions `lot.status` to `harvest`
- **AND** displays the harvest data on the lot's status page

#### Scenario: Harvest cannot be recorded for a lot not in progress
- **WHEN** a farm owner attempts to record harvest data for a lot with `status != in_progress`
- **THEN** the system returns error: "Harvest data can only be recorded for lots in the growing phase."

#### Scenario: Harvest photo upload required
- **WHEN** a farm owner submits harvest data without any photos
- **THEN** the system returns validation error: "At least one harvest photo is required."

#### Scenario: Investors see harvest evidence
- **WHEN** an investor views a lot with `status = harvest`
- **THEN** the system displays: harvest photo gallery, total fruit count, total weight (kg)
- **AND** shows status: "Harvest Complete – Awaiting Sales Data"

---

### Requirement: Sales Revenue Submission
Farm owners SHALL be able to submit actual sales revenue for a harvested lot to trigger automatic profit distribution.

#### Scenario: Farm owner submits sales revenue
- **WHEN** a farm owner submits: `selling_revenue_cents` (total sales revenue) and a `proof_photo` for a lot with `status = harvest`
- **THEN** the system stores the revenue and proof on the harvest record
- **AND** transitions `lot.status` to `selling`
- **AND** dispatches `DistributeLotProfits` job to the queue
- **AND** displays: "Sales submitted. Profit distribution is being processed."

#### Scenario: Zero revenue is valid but triggers notice
- **WHEN** a farm owner submits `selling_revenue_cents = 0`
- **THEN** the system accepts the submission
- **AND** the profit distribution job assigns RM 0.00 to all investors
- **AND** investors are notified: "The lot [Name] sold for RM 0. No payout will be distributed."

#### Scenario: Sales proof photo is required
- **WHEN** a farm owner submits selling data without a proof photo
- **THEN** the system returns validation error: "A proof of sale photo is required."

#### Scenario: Revenue cannot be submitted for non-harvest status lot
- **WHEN** a farm owner attempts to submit revenue for a lot not in `harvest` status
- **THEN** the system returns error: "Revenue can only be submitted after harvest data has been recorded."

---

### Requirement: Lot Completion After Profit Distribution
The system SHALL finalise a lot as completed after profits are successfully distributed to all investor wallets.

#### Scenario: Lot transitions to completed after distribution
- **WHEN** the `DistributeLotProfits` job completes successfully
- **THEN** the system transitions `lot.status` to `completed`
- **AND** dispatches `LotProfitsDistributed` event
- **AND** creates an audit log entry: `lot_completed`, `lot_id`, `total_revenue_cents`, `platform_fee_cents`, `investor_pool_cents`, `farm_owner_payout_cents`

#### Scenario: Investor notified of payout credit
- **WHEN** `LotProfitsDistributed` event is dispatched
- **THEN** the `NotifyInvestorsOfLotPayout` listener sends a notification to each investor
- **AND** the notification reads: "Your investment in [Lot Name] on [Farm Name] has returned RM [net_amount]. Funds have been credited to your wallet."

#### Scenario: Farm owner notified of their share
- **WHEN** `LotProfitsDistributed` event is dispatched
- **THEN** the system sends a notification to the farm owner: "Sales revenue distributed for [Lot Name]. Your share of RM [farm_owner_share] has been credited to your wallet."

---

### Requirement: Lot Status Visibility
The system SHALL provide clear real-time status indicators for all lot lifecycle stages.

#### Scenario: Farm owner dashboard shows lot status pipeline
- **WHEN** a farm owner views their dashboard
- **THEN** the system displays lots grouped by status with count: Active | In Progress | Harvest | Selling | Completed
- **AND** lots requiring action (e.g., `harvest` status awaiting selling submission) are highlighted with a call-to-action badge

#### Scenario: Investor can track lot progress
- **WHEN** an investor views a lot they have invested in
- **THEN** the system displays a timeline: Investment Open → Cycle Closed → Harvest Recorded → Sales Submitted → Profit Distributed
- **AND** each stage shows date completed or "Pending" for future stages

