## ADDED Requirements

### Requirement: Harvest Calendar Data from Harvest Records
The portfolio dashboard harvest calendar SHALL source upcoming harvest data from the `harvests` table (records with `status = scheduled` or `status = in_progress`) for trees the investor has active investments in.

#### Scenario: Harvest calendar displays upcoming scheduled harvests
- **WHEN** an investor views the portfolio dashboard
- **THEN** the harvest calendar queries `Harvest` records where `status IN (scheduled, in_progress)` and `tree_id IN` (the investor's active investment tree IDs)
- **AND** displays up to 10 upcoming harvest events ordered by `scheduled_date` ASC
- **AND** each event shows: scheduled date, farm name, fruit type, variant, estimated yield (if set), status badge

#### Scenario: In-progress harvest shown distinctly
- **WHEN** a harvest has `status = in_progress`
- **THEN** the calendar entry shows an "In Progress" badge instead of "Scheduled"
- **AND** the estimated yield is shown if available

---

### Requirement: Payout History Sourced from Payouts Table
The investment detail page payout history table SHALL source data from the `payouts` table, displaying all payouts linked to the investment regardless of status.

#### Scenario: Payout history table shows all payout records
- **WHEN** an investor views an investment detail page for an investment with payout records
- **THEN** the payout history table queries `Payout` records where `investment_id = investment.id`
- **AND** each row shows: harvest date, gross amount (RM), platform fee (RM), net amount (RM), status, completed date (if `status = completed`), transaction reference (if available)
- **AND** rows are ordered by `created_at` DESC

#### Scenario: Pending payouts shown with "Processing" indicator
- **WHEN** a payout has `status = pending` or `status = processing`
- **THEN** the payout row shows "Pending Disbursement" or "Processing" status badge
- **AND** the completed date and transaction reference columns show "—"

---

### Requirement: Actual Returns Calculation from Completed Payouts
The portfolio dashboard performance metrics SHALL calculate actual returns by summing completed payouts for each investment.

#### Scenario: Actual returns shown from completed payouts
- **WHEN** an investor views the performance metrics chart
- **THEN** the system calculates actual returns for each investment as: `SUM(net_amount_cents) WHERE investment_id = X AND status = completed`
- **AND** only payouts with `status = completed` are included
- **AND** pending or processing payouts are shown in a separate "Pending Payouts" summary (total pending payout value)

#### Scenario: Pending payout value shown in portfolio summary
- **WHEN** an investor has payouts with `status = pending` or `status = processing`
- **THEN** the portfolio summary card includes a "Pending Payouts" line showing the total `net_amount_cents` of all non-completed, non-failed payouts
