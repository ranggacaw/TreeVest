## ADDED Requirements

### Requirement: Tree Inventory Per Fruit Crop
Farm owners SHALL be able to define the total number of trees and the subset of productive trees for each `FruitCrop` on their farm, enabling accurate investment capacity reporting.

#### Scenario: Farm owner sets total and productive tree counts on crop creation
- **WHEN** a farm owner submits a crop creation form with `total_trees = 10` and `productive_trees = 8`
- **THEN** the system stores both values on the `FruitCrop` record
- **AND** the system enforces `productive_trees <= total_trees`
- **AND** the system creates an audit log entry

#### Scenario: Productive trees cannot exceed total trees
- **WHEN** a farm owner submits a crop form with `productive_trees = 12` and `total_trees = 10`
- **THEN** the system returns a validation error "Productive tree count cannot exceed total tree count"
- **AND** no crop record is created or updated

#### Scenario: Farm owner updates productive tree count after crop exists
- **WHEN** a farm owner updates `productive_trees` from 8 to 6 on an existing crop
- **THEN** the system saves the updated count
- **AND** the system creates an audit log entry with the old and new values

#### Scenario: Tree inventory defaults to zero for existing crops
- **WHEN** the migration adding `total_trees` and `productive_trees` runs against existing `fruit_crops` rows
- **THEN** both columns default to 0 without data loss or error

### Requirement: Productive Tree Count Drives Payout Eligibility
The system SHALL scope all harvest payout calculations and investor-facing ROI displays to productive trees only, never total trees.

#### Scenario: Payout calculation uses productive tree scope
- **WHEN** `ProfitCalculationService::calculate()` runs for a harvest
- **THEN** the service calculates the investor pool against active investments in the harvest tree
- **AND** the tree is always within the productive crop scope (enforced by `TreeLifecycleStage` status constraints)
- **AND** the `productive_trees` count is available on the `FruitCrop` for informational display

#### Scenario: Marketplace ROI display references productive tree context
- **WHEN** an investor views a farm profile or tree marketplace listing
- **THEN** the system displays the per-tree expected ROI from the `Tree.expected_roi_percent` field
- **AND** the farm profile displays `productive_trees` count alongside `total_trees` count for transparency
