## MODIFIED Requirements

### Requirement: Public Tree Marketplace Browsing
All users (authenticated and unauthenticated) SHALL be able to browse investable lots on the marketplace — each lot card showing tree availability including how many trees remain purchasable.

#### Scenario: User accesses tree marketplace index
- **WHEN** a user (authenticated or not) accesses the tree marketplace
- **THEN** the system displays a paginated grid of lot cards showing only lots with `status = active`
- **AND** each lot card displays: featured image (from farm), fruit type name, variant, price per tree (current), expected ROI, risk badge, harvest cycle indicator, **"X of Y trees available"** availability counter
- **AND** lots with `available_trees = 0` display a "Sold Out" badge and are excluded from the default view unless the user selects "Show Sold Out"
- **AND** the system paginates results with 24 lots per page
- **AND** the system provides sorting options: "Price: Low to High", "Price: High to Low", "ROI: High to Low", "Newest First", "Most Available"

#### Scenario: User sorts lots by price ascending
- **WHEN** a user selects "Price: Low to High" from the sort dropdown
- **THEN** the system returns lots ordered by `current_price_per_tree_cents` ascending
- **AND** the system maintains active filters

#### Scenario: User sorts lots by ROI descending
- **WHEN** a user selects "ROI: High to Low" from the sort dropdown
- **THEN** the system returns lots ordered by expected ROI descending
- **AND** the system maintains active filters

## ADDED Requirements

### Requirement: Lot Availability Display on Marketplace
The marketplace lot listing SHALL prominently display tree availability so investors can make informed purchase decisions.

#### Scenario: Lot detail page shows available trees
- **WHEN** an investor views a lot detail page
- **THEN** the system displays:
  - Total trees in lot: N
  - Trees available: X
  - Trees already invested: Y (= N - X)
  - A visual progress bar showing `(N - X) / N × 100%` sold
- **AND** if `available_trees = 0`, the page shows a "Sold Out" banner and disables the purchase form

#### Scenario: Quantity input is bounded by available_trees
- **WHEN** an investor enters a quantity in the lot purchase form
- **THEN** the maximum allowed quantity is `min(lot.available_trees, investor's allowed max)`
- **AND** the input's `max` attribute is set to `lot.available_trees`
- **AND** if the investor enters a quantity greater than `available_trees`, an inline validation message appears: "Only [available_trees] tree(s) available."
