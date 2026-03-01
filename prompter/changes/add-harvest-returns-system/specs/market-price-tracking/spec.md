## ADDED Requirements

### Requirement: Market Price Entry by Admins
Admins SHALL be able to create new market price records for fruit types, specifying price per kg and effective date. Prices are versioned: multiple records per fruit type are allowed, differentiated by `effective_date`. The active price for a fruit type at any point in time is the most recent record where `effective_date <= reference_date`.

#### Scenario: Admin creates new market price
- **WHEN** an admin submits a market price creation form with `fruit_type_id`, `price_per_kg_cents`, `currency = MYR`, `effective_date`, and optional `notes`
- **THEN** the system creates a new `MarketPrice` record
- **AND** the system creates an audit log entry with event type `market_price_created`, `fruit_type_id`, `price_per_kg_cents`, `effective_date`, `admin_id`

#### Scenario: Market price must be positive
- **WHEN** an admin submits a price of zero or negative
- **THEN** the system rejects the input with validation error: "Market price must be greater than zero."

#### Scenario: Effective date cannot be in the far future (> 30 days)
- **WHEN** an admin submits an effective date more than 30 days in the future
- **THEN** the system warns (not blocks) with a message: "Warning: This price will not take effect for more than 30 days."
- **AND** the system allows the admin to proceed

#### Scenario: Duplicate effective date for same fruit type is rejected
- **WHEN** an admin attempts to create a market price for a `fruit_type_id` with an `effective_date` that already exists for that fruit type
- **THEN** the system rejects the request with validation error: "A market price for this fruit type on [date] already exists. Use the edit action to update it instead."

---

### Requirement: Market Price Retrieval for Harvest Settlement
The system SHALL provide a query to retrieve the effective market price for a given fruit type at a given date (used during harvest completion confirmation).

#### Scenario: Active price retrieved for harvest settlement date
- **WHEN** `MarketPriceService::getEffectivePrice(fruitTypeId, referenceDate)` is called
- **AND** a market price exists for the fruit type with `effective_date <= referenceDate`
- **THEN** the service returns the `MarketPrice` record with the highest `effective_date` that is still on or before `referenceDate`

#### Scenario: No price found returns null
- **WHEN** `MarketPriceService::getEffectivePrice(fruitTypeId, referenceDate)` is called
- **AND** no market price exists for the fruit type at or before `referenceDate`
- **THEN** the service returns `null`
- **AND** the caller (harvest confirmation) blocks completion with an appropriate error

---

### Requirement: Market Price Management UI
The system SHALL provide an admin panel for viewing, creating, and editing market prices per fruit type.

#### Scenario: Admin views market price list
- **WHEN** an admin navigates to `/admin/market-prices`
- **THEN** the system displays all market price records, grouped by fruit type, ordered by `effective_date` DESC
- **AND** each row shows: fruit type name, price per kg (RM), effective date, admin who entered it, notes

#### Scenario: Admin edits existing market price
- **WHEN** an admin submits an edit form for an existing market price record
- **THEN** the system updates the `price_per_kg_cents` and/or `notes` fields
- **AND** `effective_date` and `fruit_type_id` are NOT editable after creation (immutable identifiers)
- **AND** the system creates an audit log entry with event type `market_price_updated`, old and new values

#### Scenario: Non-admin user cannot access market prices
- **WHEN** a non-admin user attempts to access `/admin/market-prices`
- **THEN** the system returns HTTP 403 Forbidden

---

### Requirement: Market Price Audit Trail
Every market price creation and update SHALL be logged in the audit log.

#### Scenario: Market price creation logged
- **WHEN** an admin creates a market price
- **THEN** an audit log entry is created with event type `market_price_created`
- **AND** the entry includes: `fruit_type_id`, `price_per_kg_cents`, `effective_date`, `admin_id`, timestamp

#### Scenario: Market price update logged
- **WHEN** an admin updates a market price
- **THEN** an audit log entry is created with event type `market_price_updated`
- **AND** the entry includes: `market_price_id`, `old_price_per_kg_cents`, `new_price_per_kg_cents`, `admin_id`, timestamp
