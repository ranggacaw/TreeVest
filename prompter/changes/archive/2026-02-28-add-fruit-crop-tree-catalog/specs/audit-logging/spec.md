# Audit Logging (Fruit Crop & Tree Catalog)

## ADDED Requirements

### Requirement: Fruit Crop and Tree Event Type Support
The system SHALL support audit logging for fruit crop and tree management operations to maintain comprehensive security and ownership tracking.

#### Scenario: Fruit crop management events
- **WHEN** a fruit crop is created, updated, or deleted
- **THEN** the system logs events with types `fruit_crop.created`, `fruit_crop.updated`, `fruit_crop.deleted`
- **AND** the event_data includes: fruit_crop_id, farm_id, fruit_type_id, variant, harvest_cycle, farm_owner_id

#### Scenario: Tree management events
- **WHEN** a tree is created, updated, or deleted
- **THEN** the system logs events with types `tree.created`, `tree.updated`, `tree.deleted`
- **AND** the event_data includes: tree_id, fruit_crop_id, tree_identifier, price_cents, status, risk_rating, farm_owner_id

#### Scenario: Tree status transition events
- **WHEN** a tree's lifecycle status is changed
- **THEN** the system logs event type `tree.status.changed`
- **AND** the event_data includes: tree_id, old_status, new_status, changed_by_user_id

#### Scenario: Tree price change events
- **WHEN** a tree's price is recalculated due to attribute changes
- **THEN** the system logs event type `tree.price.changed`
- **AND** the event_data includes: tree_id, old_price_cents, new_price_cents, reason (e.g., "age_years updated"), changed_by_user_id

#### Scenario: Fruit type management events
- **WHEN** an admin creates, updates, or deletes a fruit type
- **THEN** the system logs events with types `fruit_type.created`, `fruit_type.updated`, `fruit_type.deleted`
- **AND** the event_data includes: fruit_type_id, name, slug, admin_user_id

---

### Requirement: Crop and Tree Audit Log Context
The system SHALL capture comprehensive context for all crop and tree operations to support ownership verification and dispute resolution.

#### Scenario: Crop creation logs full context
- **WHEN** a farm owner creates a fruit crop
- **THEN** the audit log entry includes: event_type='fruit_crop.created', user_id (farm owner), farm_id, fruit_type_id, variant, harvest_cycle, planted_date, ip_address, user_agent, timestamp

#### Scenario: Tree update logs changed fields
- **WHEN** a farm owner updates a tree (e.g., age_years, risk_rating, pricing_config)
- **THEN** the audit log entry includes: event_type='tree.updated', tree_id, old values, new values, changed_fields array, user_id, timestamp

#### Scenario: Unauthorized crop access logs failed attempt
- **WHEN** a farm owner attempts to access or edit a crop they do not own
- **THEN** the system creates an audit log entry with event_type='authorization.failed', resource_type='fruit_crop', resource_id, attempted_action='edit', user_id, ip_address

---

### Requirement: Tree Pricing Audit Trail
The system SHALL maintain a complete audit trail of all tree price changes for transparency and regulatory compliance.

#### Scenario: Price recalculation logs formula inputs
- **WHEN** a tree's price is recalculated due to age_years update
- **THEN** the audit log entry includes: event_type='tree.price.changed', tree_id, old_price_cents, new_price_cents, formula_inputs (base_price, age_coefficient, new_age_years, crop_premium, risk_multiplier), calculated_price, reason='age_years updated from 5 to 6'

#### Scenario: Manual pricing config change logs coefficients
- **WHEN** a farm owner updates a tree's pricing_config coefficients
- **THEN** the audit log entry includes: event_type='tree.updated', tree_id, old_pricing_config, new_pricing_config, resulting_old_price, resulting_new_price
