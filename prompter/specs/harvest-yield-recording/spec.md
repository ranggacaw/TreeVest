# harvest-yield-recording Specification

## Purpose
TBD - created by archiving change add-harvest-returns-system. Update Purpose after archive.
## Requirements
### Requirement: Yield Estimation Submission
Farm owners SHALL be able to submit and update a yield estimate for a harvest while it is in `scheduled` or `in_progress` status, to inform investors before the actual harvest occurs.

#### Scenario: Farm owner submits yield estimate
- **WHEN** a farm owner submits an estimated yield for a harvest with `status = scheduled` or `status = in_progress`
- **THEN** the system updates `harvest.estimated_yield_kg` with the provided value
- **AND** the system creates an audit log entry with event type `yield_estimate_updated`, `harvest_id`, `estimated_yield_kg`, `user_id`

#### Scenario: Yield estimate must be a positive number
- **WHEN** a farm owner submits an estimated yield of zero or a negative number
- **THEN** the system rejects the input with validation error: "Estimated yield must be greater than zero."

#### Scenario: Yield estimate update is allowed multiple times
- **WHEN** a farm owner submits a new yield estimate for a harvest that already has an estimate
- **THEN** the system overwrites `estimated_yield_kg` with the new value
- **AND** the audit log records both the old and new values

#### Scenario: Yield estimate cannot be set on completed or failed harvest
- **WHEN** a farm owner attempts to submit a yield estimate for a harvest with `status = completed` or `status = failed`
- **THEN** the system rejects the request with error: "Yield estimates cannot be updated on a completed or failed harvest."

---

### Requirement: Actual Yield Recording
Farm owners SHALL be able to record the actual yield after the physical harvest is completed. Recording actual yield is a prerequisite for confirming harvest completion, which triggers profit calculation.

#### Scenario: Farm owner records actual yield
- **WHEN** a farm owner submits the actual yield form for a harvest with `status = in_progress`
- **AND** provides `actual_yield_kg` (positive decimal) and `quality_grade` (A, B, or C)
- **THEN** the system updates `harvest.actual_yield_kg` and `harvest.quality_grade`
- **AND** the system creates an audit log entry with event type `actual_yield_recorded`, `harvest_id`, `actual_yield_kg`, `quality_grade`, `user_id`

#### Scenario: Actual yield must be a positive number
- **WHEN** a farm owner submits an actual yield of zero or a negative number
- **THEN** the system rejects the input with validation error: "Actual yield must be greater than zero. If the harvest produced no yield, use 'Record Zero Yield' instead."

#### Scenario: Farm owner records zero yield (total crop failure outcome)
- **WHEN** a farm owner explicitly submits zero actual yield using the "Record Zero Yield" action
- **THEN** the system sets `harvest.actual_yield_kg = 0`
- **AND** the system requires the farm owner to enter notes explaining the cause
- **AND** the system creates an audit log entry with event type `zero_yield_recorded`

#### Scenario: Actual yield cannot be recorded on scheduled harvest
- **WHEN** a farm owner attempts to record actual yield on a harvest with `status = scheduled`
- **THEN** the system rejects the request with error: "Please mark the harvest as 'In Progress' before recording actual yield."

---

### Requirement: Harvest Completion Confirmation
Farm owners SHALL explicitly confirm harvest completion after recording actual yield. This confirmation is the final gate before profit calculation is triggered.

#### Scenario: Farm owner confirms harvest completion
- **WHEN** a farm owner clicks "Confirm Harvest Complete" on a harvest with `status = in_progress` and `actual_yield_kg` set (including zero)
- **THEN** the system transitions `harvest.status` to `completed`
- **AND** the system sets `harvest.confirmed_by = farm_owner.id` and `harvest.confirmed_at = now()`
- **AND** the system sets `harvest.completed_at = now()`
- **AND** the system locks the active market price for the fruit type into `harvest.market_price_id`
- **AND** the system snapshots `platform_fee_rate` from the current admin config into `harvest.platform_fee_rate`
- **AND** the system dispatches a `HarvestCompleted` event
- **AND** the system creates an audit log entry with event type `harvest_confirmed`, `harvest_id`, `actual_yield_kg`, `market_price_id`, `platform_fee_rate`

#### Scenario: Confirmation blocked if actual yield not recorded
- **WHEN** a farm owner attempts to confirm harvest completion without `actual_yield_kg` being set
- **THEN** the system rejects the confirmation with error: "You must record the actual yield before confirming harvest completion."

#### Scenario: Confirmation blocked if no market price exists for fruit type
- **WHEN** a farm owner attempts to confirm harvest completion
- **AND** no active market price exists for the harvested fruit type
- **THEN** the system rejects the confirmation with error: "No market price is set for [Fruit Type]. Please contact an administrator to enter the current market price before confirming."

#### Scenario: Completed harvest cannot be re-confirmed
- **WHEN** a farm owner attempts to confirm a harvest that already has `status = completed`
- **THEN** the system rejects the request with error: "This harvest has already been confirmed as complete."

---

### Requirement: Yield Recording Authorization
Only the farm owner who owns the farm associated with the harvest's tree SHALL be able to record yield data. Admins may also perform these actions.

#### Scenario: Farm owner records yield for their own tree
- **WHEN** a farm owner submits yield data for a harvest linked to a tree on their farm
- **THEN** the system accepts the submission

#### Scenario: Farm owner blocked from recording yield for another owner's harvest
- **WHEN** a farm owner submits yield data for a harvest linked to a tree that belongs to a different farm owner
- **THEN** the system returns HTTP 403 Forbidden
- **AND** the system logs an audit event `unauthorized_yield_update_attempt`

