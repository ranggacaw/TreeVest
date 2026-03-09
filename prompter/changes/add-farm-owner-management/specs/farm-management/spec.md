## ADDED Requirements

### Requirement: GPS Coordinate Validation
Farm coordinate inputs SHALL be validated against real-world geographic ranges before storage.

#### Scenario: Valid coordinates are accepted
- **WHEN** a farm owner submits coordinates with `latitude = -4.5` and `longitude = 115.2`
- **THEN** the system stores both values and returns no validation error

#### Scenario: Latitude out of range is rejected
- **WHEN** a farm owner submits `latitude = 95` (outside −90 to +90 range)
- **THEN** the system returns a validation error "Latitude must be between -90 and 90"
- **AND** the farm record is not saved

#### Scenario: Longitude out of range is rejected
- **WHEN** a farm owner submits `longitude = -185` (outside −180 to +180 range)
- **THEN** the system returns a validation error "Longitude must be between -180 and 180"
- **AND** the farm record is not saved

#### Scenario: GPS coordinates required before farm is published
- **WHEN** an admin attempts to approve a farm with null `latitude` or `longitude`
- **THEN** the system returns a validation error "GPS coordinates are required before a farm can be published to the marketplace"
- **AND** the farm status remains `pending_approval`

### Requirement: Interactive Map Picker for Farm Coordinates
Farm owners SHALL be able to set and update GPS coordinates using an interactive Google Maps picker in the farm edit UI.

#### Scenario: Farm owner sets coordinates via map picker
- **WHEN** a farm owner drags a marker to a position on the Google Maps picker
- **THEN** the `latitude` and `longitude` form fields are populated with the marker's coordinates
- **AND** submitting the form stores the coordinates on the farm record

#### Scenario: Farm owner sets coordinates via manual input
- **WHEN** a farm owner types latitude and longitude values directly into the coordinate input fields
- **THEN** the map marker moves to the entered position
- **AND** the form stores the entered coordinates on submission

#### Scenario: Farm profile displays map embed for investors
- **WHEN** an investor views a farm profile with valid coordinates
- **THEN** the system renders an interactive Google Maps embed centered on the farm coordinates with a marker
- **AND** a "View on Google Maps" external link is displayed

#### Scenario: Farm marketplace card displays map link
- **WHEN** an investor views a farm card on the marketplace index page
- **THEN** the system displays a "View on Map" link if the farm has valid coordinates
