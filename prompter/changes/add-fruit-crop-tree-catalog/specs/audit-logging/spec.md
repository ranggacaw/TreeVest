# Audit Logging (Fruit Crop & Tree Catalog)

## MODIFIED Requirements

### Requirement: Comprehensive Event Type Support
The system SHALL support audit logging for all security-relevant events including authentication, farm management, **fruit crop management, and tree management**.

#### Scenario: Phone authentication events
- **WHEN** a user registers or logs in with phone
- **THEN** the system logs events with types `user.registered.phone`, `user.login.phone`, `user.phone.added`, `user.phone.changed`, `user.phone.verified`

#### Scenario: OAuth authentication events
- **WHEN** a user registers or logs in with OAuth (Google, Facebook, Apple)
- **THEN** the system logs events with types `user.registered.oauth.{provider}`, `user.login.oauth.{provider}`, `user.oauth.linked.{provider}`, `user.oauth.unlinked.{provider}`

#### Scenario: 2FA events
- **WHEN** a user enables, disables, or uses 2FA
- **THEN** the system logs events with types `user.2fa.enabled.totp`, `user.2fa.enabled.sms`, `user.2fa.disabled`, `user.2fa.failed`, `user.2fa.recovery_code_used`, `user.2fa.recovery_codes_regenerated`, `user.login.2fa.totp`, `user.login.2fa.sms`

#### Scenario: Profile management events
- **WHEN** a user updates their profile or account settings
- **THEN** the system logs events with types `user.profile.updated`, `user.email.changed`, `user.avatar.uploaded`, `user.avatar.deleted`

#### Scenario: Session management events
- **WHEN** a user manages their active sessions
- **THEN** the system logs events with types `user.session.revoked`, `user.session.revoked.all`, `user.logout`

#### Scenario: Account status events
- **WHEN** a user or admin changes account status
- **THEN** the system logs events with types `user.account.deactivated`, `user.account.deletion_requested`, `user.account.restored`

#### Scenario: Farm management events
- **WHEN** a farm is created, updated, or its status changes
- **THEN** the system logs events with types `farm.created`, `farm.updated`, `farm.approved`, `farm.suspended`, `farm.deactivated`, `farm.activated`, `farm.image.uploaded`, `farm.image.deleted`, `farm.status.changed`

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

## ADDED Requirements

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
