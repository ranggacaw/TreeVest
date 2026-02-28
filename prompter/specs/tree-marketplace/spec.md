# tree-marketplace Specification

## Purpose
TBD - created by archiving change add-fruit-crop-tree-catalog. Update Purpose after archive.
## Requirements
### Requirement: Public Tree Marketplace Browsing
All users (authenticated and unauthenticated) SHALL be able to browse investable trees on the marketplace with pagination and sorting.

#### Scenario: User accesses tree marketplace index
- **WHEN** a user (authenticated or not) accesses the tree marketplace
- **THEN** the system displays a paginated grid of tree cards showing only trees with status `productive` or `growing`
- **AND** each tree card displays: featured image (from farm), fruit type name, variant, price, expected ROI, risk badge, harvest cycle indicator
- **AND** the system paginates results with 24 trees per page
- **AND** the system provides sorting options: "Price: Low to High", "Price: High to Low", "ROI: High to Low", "Newest First"

#### Scenario: User sorts trees by price ascending
- **WHEN** a user selects "Price: Low to High" from the sort dropdown
- **THEN** the system returns trees ordered by `price_cents` ascending
- **AND** the system maintains active filters

#### Scenario: User sorts trees by ROI descending
- **WHEN** a user selects "ROI: High to Low" from the sort dropdown
- **THEN** the system returns trees ordered by `expected_roi_percent` descending
- **AND** the system maintains active filters

---

### Requirement: Tree Filtering by Fruit Type and Variant
Investors SHALL be able to filter trees by fruit type and search for specific variants.

#### Scenario: User filters by fruit type
- **WHEN** a user selects "Durian" from the fruit type filter checkboxes
- **THEN** the system returns only trees belonging to crops with fruit_type "Durian"
- **AND** the system displays the active filter badge "Fruit Type: Durian"
- **AND** the system provides a "Clear Filters" button

#### Scenario: User filters by multiple fruit types
- **WHEN** a user selects "Durian" and "Mango" from the fruit type filter checkboxes
- **THEN** the system returns trees belonging to crops with fruit_type "Durian" OR "Mango"

#### Scenario: User searches for variant
- **WHEN** a user enters "Musang King" in the variant search input
- **THEN** the system returns only trees belonging to crops with variant matching "Musang King" (case-insensitive partial match)

---

### Requirement: Tree Filtering by Price and ROI Range
Investors SHALL be able to filter trees by price range and expected ROI range to match their investment budget and return expectations.

#### Scenario: User filters by price range
- **WHEN** a user sets the price range slider to min=RM 1,000 and max=RM 5,000
- **THEN** the system returns only trees with price_cents between 100000 and 500000
- **AND** the system displays the active filter badge "Price: RM 1,000 - RM 5,000"

#### Scenario: User filters by minimum ROI
- **WHEN** a user sets the ROI range slider to min=15%
- **THEN** the system returns only trees with expected_roi_percent >= 15
- **AND** the system displays the active filter badge "ROI: ≥ 15%"

---

### Requirement: Tree Filtering by Risk Rating
Investors SHALL be able to filter trees by risk rating to match their risk tolerance.

#### Scenario: User filters by low risk only
- **WHEN** a user selects "Low" from the risk rating filter checkboxes
- **THEN** the system returns only trees with risk_rating = `low`
- **AND** the system displays the active filter badge "Risk: Low"

#### Scenario: User filters by multiple risk ratings
- **WHEN** a user selects "Low" and "Medium" from the risk rating filter checkboxes
- **THEN** the system returns trees with risk_rating = `low` OR `medium`

---

### Requirement: Tree Filtering by Harvest Cycle
Investors SHALL be able to filter trees by harvest cycle frequency to match their investment timeline preferences.

#### Scenario: User filters by annual harvest cycle
- **WHEN** a user selects "Annual" from the harvest cycle filter checkboxes
- **THEN** the system returns only trees belonging to crops with harvest_cycle = `annual`
- **AND** the system displays the active filter badge "Harvest: Annual"

#### Scenario: User filters by multiple harvest cycles
- **WHEN** a user selects "Annual" and "Biannual" from the harvest cycle filter checkboxes
- **THEN** the system returns trees belonging to crops with harvest_cycle = `annual` OR `biannual`

---

### Requirement: Combined Filter Application
The system SHALL apply multiple filters simultaneously using AND logic between filter categories.

#### Scenario: User applies fruit type and price range filters
- **WHEN** a user selects fruit type "Durian" AND sets price range min=RM 2,000 max=RM 10,000
- **THEN** the system returns only trees that match BOTH conditions: fruit type = Durian AND price between RM 2,000 and RM 10,000

#### Scenario: User applies all filter types
- **WHEN** a user applies fruit type "Mango", variant search "Alphonso", price range RM 1,000-RM 3,000, ROI min 12%, risk "Low", and harvest cycle "Annual"
- **THEN** the system returns only trees that match ALL conditions using AND logic

#### Scenario: No results match filters
- **WHEN** a user applies filters that return zero results
- **THEN** the system displays a "No trees found" message with suggestions to adjust filters
- **AND** the system shows a "Clear All Filters" button

---

### Requirement: Tree Detail Page Display
Investors SHALL be able to view comprehensive details for a single tree, including all investment attributes, farm information, and historical yield data.

#### Scenario: User views tree detail page for investable tree
- **WHEN** a user accesses the tree detail page for a tree with status `productive`
- **THEN** the system displays: breadcrumb navigation (Farm Name > Crop Name > Tree Identifier), tree image gallery (from farm), tree attributes (age, lifespan, status, risk rating), pricing information (price, min/max investment, expected ROI, pricing formula breakdown), harvest cycle and frequency, historical yield chart or "No data" message, farm profile summary with link, risk disclosure banner ("Agricultural investments carry inherent risks..."), "Invest Now" button (if user is authenticated and KYC verified)

#### Scenario: User views tree detail page for non-investable tree
- **WHEN** a user accesses the tree detail page for a tree with status `seedling`
- **THEN** the system displays all tree attributes and farm information
- **AND** the system hides the "Invest Now" button
- **AND** the system displays a message "This tree is not yet available for investment. Status: Seedling"

#### Scenario: Unauthenticated user views tree detail page
- **WHEN** an unauthenticated user accesses the tree detail page for a tree with status `productive`
- **THEN** the system displays all tree information
- **AND** the system displays "Sign In to Invest" button that redirects to login page

---

### Requirement: Risk Disclosure on Tree Detail Page
The system SHALL prominently display investment risk disclosure on every tree detail page to ensure informed investor decisions.

#### Scenario: Risk disclosure banner displayed
- **WHEN** a user views any tree detail page
- **THEN** the system displays a prominent banner with text: "Agricultural investments carry inherent risks including crop failure, weather events, and market price fluctuations. Past performance does not guarantee future returns. Invest only what you can afford to lose."
- **AND** the banner is displayed above the "Invest Now" button

#### Scenario: High-risk tree displays additional warning
- **WHEN** a user views a tree detail page for a tree with risk_rating = `high`
- **THEN** the system displays an additional warning: "This tree has been rated as HIGH RISK due to factors such as young age, experimental variety, or environmental exposure. Carefully review all investment details before proceeding."

---

### Requirement: Tree Card Display on Marketplace
The system SHALL display tree cards with consistent information to enable quick comparison.

#### Scenario: Tree card displays all key attributes
- **WHEN** a tree card is rendered on the marketplace index page
- **THEN** the system displays: featured image (from farm, or default placeholder), fruit type name and variant (e.g., "Durian - Musang King"), price (formatted currency), expected ROI (percentage with badge), risk rating badge (color-coded: green for low, yellow for medium, red for high), harvest cycle icon (calendar with frequency indicator), farm name (link to farm profile), "View Details" button

#### Scenario: Tree card links to tree detail page
- **WHEN** a user clicks on a tree card or "View Details" button
- **THEN** the system navigates to the tree detail page for that tree

---

### Requirement: Farm Profile Link from Tree Details
Investors SHALL be able to navigate from a tree detail page to the parent farm profile to review farm-level information.

#### Scenario: User clicks farm profile link
- **WHEN** a user clicks the farm profile link on a tree detail page
- **THEN** the system navigates to the farm detail page showing farm information, location map, certifications, and all crops/trees on that farm

---

### Requirement: Mobile-Responsive Marketplace Layout
The tree marketplace SHALL be fully responsive and usable on mobile devices.

#### Scenario: User accesses marketplace on mobile device
- **WHEN** a user accesses the tree marketplace on a device with screen width < 768px
- **THEN** the system displays a single-column grid of tree cards
- **AND** the system displays a collapsible filter drawer accessible via a "Filters" button
- **AND** the system displays pagination controls adapted for touch interaction

---

### Requirement: Search Engine Optimization for Tree Listings
Tree marketplace pages SHALL be optimized for search engine discovery to drive organic investor traffic.

#### Scenario: Tree detail page includes meta tags
- **WHEN** a search engine crawler accesses a tree detail page
- **THEN** the system renders meta tags: title="[Tree Identifier] - [Fruit Type] [Variant] Investment | Treevest", description="Invest in [Fruit Type] [Variant] tree [Tree Identifier] with expected ROI of [X]%. [Farm Name], [Location].", og:image=[Farm featured image URL]

