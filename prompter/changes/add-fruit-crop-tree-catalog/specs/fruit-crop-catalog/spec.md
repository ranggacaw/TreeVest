# Fruit Crop Catalog Specification

## ADDED Requirements

### Requirement: Fruit Type Reference Data Management
The system SHALL maintain a reference database of fruit types with variants to support crop catalog organization.

#### Scenario: Fruit type data seeded on installation
- **WHEN** the database seeder runs
- **THEN** the system populates fruit types: Durian (Musang King, D24, Black Thorn, Red Prawn), Mango (Alphonso, Nam Doc Mai, Carabao, Kent), Grapes (Thompson Seedless, Concord, Shine Muscat), Melon (Honeydew, Cantaloupe, Yubari King), Citrus (Valencia Orange, Meyer Lemon, Pomelo), Others (Avocado, Longan, Rambutan, Mangosteen)

#### Scenario: Admin creates new fruit type
- **WHEN** an admin submits a fruit type creation form with name, slug, and description
- **THEN** the system creates a new fruit type record with status `active`
- **AND** the system creates an audit log entry

#### Scenario: Admin cannot create duplicate fruit type
- **WHEN** an admin attempts to create a fruit type with a slug that already exists
- **THEN** the system rejects the request with validation error "Slug already exists"

---

### Requirement: Fruit Crop Creation by Farm Owners
Farm owners SHALL be able to create fruit crop listings within their approved farms, specifying fruit type, variant, and harvest cycle.

#### Scenario: Farm owner creates crop with all required fields
- **WHEN** a farm owner submits a crop creation form with farm_id, fruit_type_id, variant, harvest_cycle (annual/biannual/seasonal), and planted_date
- **THEN** the system creates a new FruitCrop record linked to the farm
- **AND** the system dispatches a `FruitCropCreated` event
- **AND** the system creates an audit log entry

#### Scenario: Farm owner cannot create crop for another owner's farm
- **WHEN** a farm owner attempts to create a crop for a farm they do not own
- **THEN** the system rejects the request with HTTP 403 Forbidden
- **AND** the system logs the unauthorized access attempt

#### Scenario: Crop creation fails with missing required fields
- **WHEN** a farm owner submits a crop creation form missing fruit_type_id or variant
- **THEN** the system returns validation errors without creating the crop

---

### Requirement: Tree Investment Unit Creation
Farm owners SHALL be able to create individual tree investment units within their crops, specifying all attributes required for investor decision-making.

#### Scenario: Farm owner creates tree with all required attributes
- **WHEN** a farm owner submits a tree creation form with fruit_crop_id, tree_identifier (unique per crop), age_years, productive_lifespan_years, risk_rating (low/medium/high), min_investment_cents, max_investment_cents, status (seedling/growing/productive/declining/retired), and pricing_config (base_price, age_coefficient, crop_premium, risk_multiplier)
- **THEN** the system creates a new Tree record
- **AND** the system calculates the tree price using the pricing formula and stores it in `price_cents`
- **AND** the system calculates expected_roi_percent based on pricing configuration
- **AND** the system dispatches a `TreeCreated` event
- **AND** the system creates an audit log entry

#### Scenario: Tree identifier must be unique per crop
- **WHEN** a farm owner attempts to create a tree with a tree_identifier that already exists for the same fruit_crop_id
- **THEN** the system rejects the request with validation error "Tree identifier already exists for this crop"

#### Scenario: Tree creation fails if productive_lifespan_years less than age_years
- **WHEN** a farm owner submits a tree creation form with productive_lifespan_years less than age_years
- **THEN** the system returns validation error "Productive lifespan must be greater than or equal to current age"

#### Scenario: Tree creation fails if min_investment exceeds max_investment
- **WHEN** a farm owner submits a tree creation form with min_investment_cents greater than max_investment_cents
- **THEN** the system returns validation error "Minimum investment cannot exceed maximum investment"

---

### Requirement: Formula-Based Tree Pricing
The system SHALL automatically calculate tree prices using a configurable formula based on tree age, crop premium, and risk rating.

#### Scenario: Tree price calculated on creation
- **WHEN** a tree is created with pricing_config: base_price=100000, age_coefficient=0.05, crop_premium=1.5, risk_multiplier=1.1, and age_years=5
- **THEN** the system calculates price as: 100000 * (1 + 0.05 * 5) * 1.5 * 1.1 = 206,250 cents (RM 2,062.50)
- **AND** the system stores the calculated price in `price_cents`

#### Scenario: Tree price recalculated when age is updated
- **WHEN** a farm owner updates a tree's age_years from 5 to 6
- **THEN** the system recalculates the price using the updated age
- **AND** the system stores the new price in `price_cents`
- **AND** the system creates an audit log entry with old and new prices

#### Scenario: Tree price recalculated when risk rating changes
- **WHEN** a farm owner updates a tree's risk_rating from low (1.0) to medium (1.1)
- **THEN** the system recalculates the price using the new risk_multiplier
- **AND** the system stores the new price in `price_cents`
- **AND** the system creates an audit log entry

---

### Requirement: Tree Lifecycle Status Management
Farm owners SHALL be able to manually update tree lifecycle status, with sequential transitions enforced to maintain data integrity.

#### Scenario: Farm owner transitions tree from seedling to growing
- **WHEN** a farm owner updates a tree with status `seedling` to status `growing`
- **THEN** the system updates the tree status
- **AND** the system dispatches a `TreeStatusChanged` event with old and new status
- **AND** the system creates an audit log entry

#### Scenario: Farm owner cannot skip status transitions
- **WHEN** a farm owner attempts to update a tree with status `seedling` directly to status `productive`
- **THEN** the system rejects the request with validation error "Invalid status transition. Tree must progress through: seedling → growing → productive → declining → retired"

#### Scenario: Tree status displayed on marketplace detail page
- **WHEN** an investor views a tree detail page
- **THEN** the system displays the tree status with a visual indicator (badge)
- **AND** if status is `declining` or `retired`, the system displays a warning that new investments are not available

---

### Requirement: Investment Availability Based on Tree Status
The system SHALL restrict investment availability to trees with status `productive` or `growing` only.

#### Scenario: Marketplace displays only investable trees
- **WHEN** an investor accesses the tree marketplace index page
- **THEN** the system returns only trees with status `productive` or `growing`
- **AND** the system excludes trees with status `seedling`, `declining`, or `retired`

#### Scenario: Tree detail page shows investment availability
- **WHEN** an investor views a tree detail page for a tree with status `productive`
- **THEN** the system displays the "Invest Now" button
- **AND** the system displays investment limits (min/max amounts)

#### Scenario: Tree detail page blocks investment for non-investable tree
- **WHEN** an investor views a tree detail page for a tree with status `seedling`
- **THEN** the system hides the "Invest Now" button
- **AND** the system displays a message "This tree is not yet available for investment"

---

### Requirement: Historical Yield Data Display
The system SHALL display historical yield data for trees with harvest history, or a clear "No data" message for new trees.

#### Scenario: Tree with no harvest history displays no data message
- **WHEN** an investor views a tree detail page for a tree with zero tree_harvests records
- **THEN** the system displays a message "This tree has no harvest history yet. Yield data will be available after the first harvest."
- **AND** the system hides the yield chart section

#### Scenario: Tree with harvest history displays yield chart
- **WHEN** an investor views a tree detail page for a tree with tree_harvests records
- **THEN** the system displays a line chart showing harvest dates on X-axis and actual_yield_kg on Y-axis
- **AND** the system displays a table with harvest details (date, estimated vs actual yield, quality grade)

---

### Requirement: Fruit Crop Editing by Farm Owners
Farm owners SHALL be able to edit their fruit crop profiles, with validation to prevent changes that would orphan trees.

#### Scenario: Farm owner updates crop description and harvest cycle
- **WHEN** a farm owner updates a crop's description and harvest_cycle fields
- **THEN** the system saves the changes
- **AND** the system dispatches a `FruitCropUpdated` event
- **AND** the system creates an audit log entry

#### Scenario: Farm owner cannot delete crop with existing trees
- **WHEN** a farm owner attempts to delete a crop with one or more trees
- **THEN** the system rejects the request with validation error "Cannot delete crop with existing trees. Delete all trees first."
- **AND** the system logs the failed deletion attempt

---

### Requirement: Tree Editing by Farm Owners
Farm owners SHALL be able to edit tree attributes, with automatic price recalculation when relevant attributes change.

#### Scenario: Farm owner updates tree age and price recalculates
- **WHEN** a farm owner updates a tree's age_years from 5 to 6
- **THEN** the system saves the new age
- **AND** the system recalculates the price using TreePricingService
- **AND** the system dispatches a `TreeUpdated` event
- **AND** the system creates an audit log entry with changed fields

#### Scenario: Farm owner updates tree pricing config
- **WHEN** a farm owner updates a tree's pricing_config with new coefficients (e.g., crop_premium from 1.5 to 1.8)
- **THEN** the system saves the new config
- **AND** the system recalculates the price
- **AND** the system creates an audit log entry

#### Scenario: Farm owner cannot delete tree with existing investments
- **WHEN** a farm owner attempts to delete a tree with one or more investments (future feature)
- **THEN** the system rejects the request with validation error "Cannot delete tree with existing investments"
- **AND** the system logs the failed deletion attempt

---

### Requirement: Tree Management Dashboard for Farm Owners
Farm owners SHALL be able to view and manage all trees belonging to their crops from a dedicated dashboard.

#### Scenario: Farm owner views all their trees grouped by crop
- **WHEN** a farm owner accesses the tree management dashboard
- **THEN** the system displays all trees belonging to crops owned by the authenticated user
- **AND** the system groups trees by fruit_crop with crop name headers
- **AND** the system displays tree attributes: identifier, status, price, expected ROI, age, risk rating
- **AND** the system provides edit and status update actions for each tree

#### Scenario: Farm owner filters trees by status
- **WHEN** a farm owner applies a status filter (e.g., "productive" only)
- **THEN** the system returns only trees with the selected status
- **AND** the system maintains the grouping by crop

---

### Requirement: Risk Rating Manual Assignment
Farm owners SHALL manually assign risk ratings (low, medium, high) to trees during creation and editing, with risk affecting pricing.

#### Scenario: Farm owner assigns low risk rating
- **WHEN** a farm owner selects risk_rating "low" during tree creation
- **THEN** the system stores the risk_rating as `low`
- **AND** the system uses risk_multiplier 1.0 in the pricing formula (no premium)

#### Scenario: Farm owner assigns high risk rating
- **WHEN** a farm owner selects risk_rating "high" during tree creation
- **THEN** the system stores the risk_rating as `high`
- **AND** the system uses risk_multiplier 1.2 in the pricing formula (20% premium)

#### Scenario: Risk rating change triggers price recalculation
- **WHEN** a farm owner updates a tree's risk_rating from low to medium
- **THEN** the system recalculates the price with the new risk_multiplier (1.1)
- **AND** the system creates an audit log entry

---

### Requirement: Pricing Configuration Defaults
The system SHALL provide default pricing configuration values that farm owners can override per tree.

#### Scenario: Tree creation uses default pricing config if not provided
- **WHEN** a farm owner creates a tree without specifying pricing_config
- **THEN** the system uses default values from config/treevest.php: base_price=100000, age_coefficient=0.05, crop_premium=1.0, risk_multiplier=1.0 (for low risk)

#### Scenario: Admin updates default pricing config
- **WHEN** an admin updates the default pricing configuration in config/treevest.php
- **THEN** the new defaults apply to all trees created after the change
- **AND** existing trees retain their stored pricing_config (no retroactive changes)
