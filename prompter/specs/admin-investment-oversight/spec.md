# admin-investment-oversight Specification

## Purpose
TBD - created by archiving change add-admin-panel-core. Update Purpose after archive.
## Requirements
### Requirement: Admin Investment List
The system SHALL provide an admin-only paginated investment list with filtering by status, farm, and investor.

#### Scenario: Admin views all investments
- **WHEN** an admin navigates to `/admin/investments`
- **THEN** the system returns a paginated list of all investments (20 per page) ordered by purchase_date descending
- **AND** each row shows: investment ID, investor name/email, tree identifier, farm name, fruit crop variant, amount (formatted), status badge, purchase_date

#### Scenario: Admin filters investments by status
- **WHEN** an admin selects a status filter (pending_payment, active, matured, sold, cancelled)
- **THEN** the list shows only investments with that status

#### Scenario: Admin searches investments by investor email or tree identifier
- **WHEN** an admin enters a search query
- **THEN** the list filters to investments where investor email or tree identifier contains the search string (case-insensitive)

#### Scenario: Admin filters by farm
- **WHEN** an admin selects a farm from the farm filter dropdown
- **THEN** the list shows only investments for trees on that farm

### Requirement: Admin Investment Detail View
The system SHALL provide an admin-only investment detail page showing full investment context, associated tree, and payout history.

#### Scenario: Admin views investment detail
- **WHEN** an admin navigates to `/admin/investments/{investment}`
- **THEN** the system renders: investment amount, status, purchase_date, investor info (name, email, KYC status), tree details (identifier, farm, fruit crop, price, ROI), and paginated payout history for that investment

#### Scenario: Admin views payout history for investment
- **WHEN** an admin views an investment detail page
- **THEN** the payout history section lists all payouts linked to that investment ordered by created_at descending
- **AND** each payout shows: payout amount, status, harvest date, distribution method, processed_at

