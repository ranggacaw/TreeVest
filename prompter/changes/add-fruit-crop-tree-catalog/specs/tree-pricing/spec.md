# Tree Pricing Specification

## ADDED Requirements

### Requirement: Formula-Based Price Calculation
The system SHALL calculate tree prices using a transparent formula based on configurable coefficients stored per tree.

#### Scenario: Calculate price for new tree with default coefficients
- **WHEN** TreePricingService calculates price for a tree with: base_price=100000, age_coefficient=0.05, crop_premium=1.0, risk_multiplier=1.0, age_years=0
- **THEN** the calculated price is: 100000 * (1 + 0.05 * 0) * 1.0 * 1.0 = 100000 cents (RM 1,000.00)

#### Scenario: Calculate price for mature tree with premium crop
- **WHEN** TreePricingService calculates price for a tree with: base_price=100000, age_coefficient=0.05, crop_premium=1.5, risk_multiplier=1.0, age_years=10
- **THEN** the calculated price is: 100000 * (1 + 0.05 * 10) * 1.5 * 1.0 = 225000 cents (RM 2,250.00)

#### Scenario: Calculate price for high-risk tree
- **WHEN** TreePricingService calculates price for a tree with: base_price=100000, age_coefficient=0.05, crop_premium=1.0, risk_multiplier=1.2, age_years=5
- **THEN** the calculated price is: 100000 * (1 + 0.05 * 5) * 1.0 * 1.2 = 150000 cents (RM 1,500.00)

#### Scenario: Calculate price with all factors combined
- **WHEN** TreePricingService calculates price for a tree with: base_price=100000, age_coefficient=0.05, crop_premium=1.5, risk_multiplier=1.1, age_years=8
- **THEN** the calculated price is: 100000 * (1 + 0.05 * 8) * 1.5 * 1.1 = 231000 cents (RM 2,310.00)

---

### Requirement: Risk Rating Multiplier Mapping
The system SHALL map risk rating enums to pricing multipliers to reflect investment risk in tree pricing.

#### Scenario: Low risk rating uses 1.0 multiplier
- **WHEN** a tree has risk_rating = `low`
- **THEN** the system uses risk_multiplier = 1.0 in the pricing formula (no premium)

#### Scenario: Medium risk rating uses 1.1 multiplier
- **WHEN** a tree has risk_rating = `medium`
- **THEN** the system uses risk_multiplier = 1.1 in the pricing formula (10% premium)

#### Scenario: High risk rating uses 1.2 multiplier
- **WHEN** a tree has risk_rating = `high`
- **THEN** the system uses risk_multiplier = 1.2 in the pricing formula (20% premium)

---

### Requirement: Price Recalculation on Attribute Change
The system SHALL automatically recalculate tree price when pricing-relevant attributes are updated.

#### Scenario: Price recalculated when age_years increases
- **WHEN** a tree's age_years is updated from 5 to 6
- **THEN** the system calls TreePricingService::updateTreePrice($tree)
- **AND** the system stores the new calculated price in tree.price_cents
- **AND** the system dispatches a TreePriceChanged event with old and new prices

#### Scenario: Price recalculated when risk_rating changes
- **WHEN** a tree's risk_rating is updated from `low` to `medium`
- **THEN** the system recalculates the price using the new risk_multiplier (1.1)
- **AND** the system stores the new price

#### Scenario: Price recalculated when pricing_config is updated
- **WHEN** a farm owner updates a tree's pricing_config (e.g., crop_premium from 1.5 to 1.8)
- **THEN** the system recalculates the price using the new coefficients
- **AND** the system stores the new price

#### Scenario: Price not recalculated for non-pricing attributes
- **WHEN** a tree's tree_identifier or status is updated
- **THEN** the system does NOT recalculate the price (only pricing-relevant attributes trigger recalculation)

---

### Requirement: Pricing Configuration Storage
The system SHALL store per-tree pricing configuration as JSON to allow flexible coefficient management.

#### Scenario: Tree stores pricing config on creation
- **WHEN** a tree is created with custom pricing_config: base_price=120000, age_coefficient=0.06, crop_premium=1.4, risk_multiplier=1.0
- **THEN** the system stores the config in tree.pricing_config_json as: {"base_price":120000,"age_coefficient":0.06,"crop_premium":1.4,"risk_multiplier":1.0}

#### Scenario: Farm owner retrieves pricing config for editing
- **WHEN** a farm owner accesses the tree edit form
- **THEN** the system displays the current pricing_config values in editable input fields

---

### Requirement: Default Pricing Configuration
The system SHALL provide global default pricing coefficients that are used when farm owners do not specify custom values.

#### Scenario: Tree creation uses defaults if config not provided
- **WHEN** a tree is created without specifying pricing_config
- **THEN** the system retrieves default values from config('treevest.tree_pricing.default_base_price'), config('treevest.tree_pricing.default_age_coefficient'), config('treevest.tree_pricing.default_crop_premium'), config('treevest.tree_pricing.default_risk_multipliers.low')
- **AND** the system uses these defaults to calculate the initial price

#### Scenario: Config file defines default pricing values
- **WHEN** config/treevest.php is loaded
- **THEN** it includes: 'tree_pricing' => ['default_base_price' => 100000, 'default_age_coefficient' => 0.05, 'default_crop_premium' => 1.0, 'default_risk_multipliers' => ['low' => 1.0, 'medium' => 1.1, 'high' => 1.2]]

---

### Requirement: Expected ROI Calculation
The system SHALL calculate expected ROI percentage based on pricing configuration and display it to investors.

#### Scenario: Expected ROI derived from crop premium
- **WHEN** a tree has crop_premium = 1.5 (indicating high-value crop)
- **THEN** the system calculates expected_roi_percent as: (crop_premium - 1.0) * 100 + base_roi_percent (e.g., (1.5 - 1.0) * 100 + 10 = 60%)
- **AND** the system stores the value in tree.expected_roi_percent

#### Scenario: Expected ROI displayed on marketplace
- **WHEN** an investor views a tree card on the marketplace
- **THEN** the system displays the expected_roi_percent formatted as: "Expected ROI: 15% per cycle"

---

### Requirement: Pricing Formula Transparency
The system SHALL display the pricing formula breakdown on the tree detail page to build investor trust.

#### Scenario: Tree detail page shows pricing breakdown
- **WHEN** an investor views a tree detail page
- **THEN** the system displays a "Pricing Breakdown" section with: "Base Price: RM X.XX", "Age Adjustment: X years × coefficient (0.05) = +Y%", "Crop Premium: Z%", "Risk Adjustment: W%", "Final Price: RM A,BBB.CC"

---

### Requirement: Price History Tracking
The system SHALL create audit log entries for all price changes to maintain transparency and enable dispute resolution.

#### Scenario: Price change logged in audit trail
- **WHEN** a tree's price is recalculated from 200000 cents to 225000 cents
- **THEN** the system creates an audit log entry with: event_type = 'tree_price_changed', tree_id, old_price = 200000, new_price = 225000, reason = 'age_years updated from 5 to 6', timestamp, user_id (farm owner)

#### Scenario: Admin reviews price change history
- **WHEN** an admin accesses a tree's audit log
- **THEN** the system displays all price change events with old/new prices and reasons

---

### Requirement: Pricing Service Error Handling
The system SHALL handle invalid pricing configurations gracefully and log errors without crashing.

#### Scenario: Invalid pricing config triggers validation error
- **WHEN** a farm owner attempts to save a tree with base_price = 0 or negative
- **THEN** the system returns validation error "Base price must be greater than zero"

#### Scenario: Missing pricing config coefficient uses fallback
- **WHEN** a tree's pricing_config_json is missing the age_coefficient field
- **THEN** the system uses the default age_coefficient from config/treevest.php
- **AND** the system logs a warning "Missing age_coefficient in tree [ID], using default"
