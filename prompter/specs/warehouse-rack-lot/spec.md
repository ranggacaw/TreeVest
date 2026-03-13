# warehouse-rack-lot Specification

## Purpose
TBD - created by archiving change implement-farm-owner-core-platform. Update Purpose after archive.
## Requirements
### Requirement: Warehouse Management by Farm Owners
Farm owners SHALL be able to create and manage warehouses within their approved farms to organise physical tree infrastructure.

#### Scenario: Farm owner creates a warehouse
- **WHEN** a farm owner submits a warehouse creation form with `name` and optional `description` for one of their farms
- **THEN** the system creates a `Warehouse` record linked to the farm
- **AND** the warehouse appears in the farm owner's warehouse list

#### Scenario: Farm owner cannot create warehouse for another owner's farm
- **WHEN** a farm owner attempts to create a warehouse for a farm they do not own
- **THEN** the system returns HTTP 403 Forbidden

#### Scenario: Farm owner creates a rack within a warehouse
- **WHEN** a farm owner submits a rack creation form with `name` linked to a warehouse they own
- **THEN** the system creates a `Rack` record linked to the warehouse

#### Scenario: Farm owner soft-deletes a warehouse
- **WHEN** a farm owner deletes a warehouse with no active lots
- **THEN** the system sets `deleted_at` on the warehouse and hides it from active listings
- **AND** the warehouse is retained in the database for audit purposes

#### Scenario: Farm owner cannot delete warehouse with active lots
- **WHEN** a farm owner attempts to delete a warehouse that contains racks with active or in-progress lots
- **THEN** the system returns a validation error: "Cannot delete warehouse with active lots. Complete or cancel all lots first."

---

### Requirement: Lot Management within the Hierarchy
Farm owners SHALL be able to create and manage lots within their racks to define investable tree packages.

#### Scenario: Farm owner creates a lot
- **WHEN** a farm owner submits a lot creation form with: `rack_id`, `fruit_crop_id`, `name`, `total_trees`, `base_price_per_tree_cents`, `monthly_increase_rate`, `cycle_months`, `last_investment_month`
- **THEN** the system creates a `Lot` record with `status = active` and `current_price_per_tree_cents = base_price_per_tree_cents`
- **AND** the lot appears in the investor marketplace

#### Scenario: last_investment_month must be less than cycle_months
- **WHEN** a farm owner submits a lot with `last_investment_month >= cycle_months`
- **THEN** the system returns a validation error: "Last investment month must be less than the total cycle duration."

#### Scenario: Investor browses lots on the marketplace
- **WHEN** an investor views the investment marketplace
- **THEN** the system displays active lots with: lot name, farm name, fruit crop, total trees, price per tree (current), cycle progress indicator, and "Invest Now" button
- **AND** lots with `is_investment_open = false` show a "Cycle Closed" badge instead

#### Scenario: Farm hierarchy is displayed on lot detail
- **WHEN** an investor views a lot detail page
- **THEN** the system displays the breadcrumb: Farm → Warehouse → Rack → Lot

