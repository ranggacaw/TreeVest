## ADDED Requirements

### Requirement: Farm Owner Health Update Submission

Farm owners SHALL be able to submit health updates for their fruit crops, including update type (routine, pest, disease, damage, weather impact, other), severity level (low, medium, high, critical), title, description, and up to 5 photos. Health updates SHALL be visible to investors with trees in the affected crop.

#### Scenario: Farm owner creates routine health update with photos
- **WHEN** a farm owner navigates to `/farm-owner/health-updates/create`
- **AND** selects a fruit crop from their farm
- **AND** sets update type to "routine" and severity to "low"
- **AND** enters title "Monthly Growth Check" and description "Trees showing healthy growth, no issues detected"
- **AND** uploads 3 photos (JPEG, under 5MB each)
- **AND** submits the form
- **THEN** the system validates the input
- **AND** stores the health update in the database
- **AND** uploads photos to storage (optimized and thumbnails generated)
- **AND** dispatches `HealthUpdateCreated` event
- **AND** redirects to health update list with success message

#### Scenario: Farm owner reports pest issue with critical severity
- **WHEN** a farm owner creates a health update
- **AND** sets update type to "pest" and severity to "critical"
- **AND** enters title "Aphid Infestation Detected" and description "Urgent treatment required"
- **AND** submits the form
- **THEN** the system creates the health update
- **AND** immediately notifies all investors with trees in that crop via email and in-app notification
- **AND** creates a health alert record with alert_type "pest"

#### Scenario: Photo upload validation failure
- **WHEN** a farm owner attempts to upload 6 photos (exceeds max 5)
- **THEN** the system returns validation error "Maximum 5 photos allowed"
- **AND** the form displays the error inline

#### Scenario: Farm owner edits health update within 24 hours
- **WHEN** a farm owner navigates to `/farm-owner/health-updates/{id}/edit`
- **AND** the health update was created less than 24 hours ago
- **THEN** the system displays the edit form pre-filled with existing data
- **AND** the farm owner can modify title, description, and add/remove photos
- **AND** submits the updated form
- **THEN** the system updates the health update record

#### Scenario: Farm owner attempts to edit health update after 24 hours
- **WHEN** a farm owner navigates to `/farm-owner/health-updates/{id}/edit`
- **AND** the health update was created more than 24 hours ago
- **THEN** the system returns 403 Forbidden error
- **AND** displays message "Health updates can only be edited within 24 hours of creation"

---

### Requirement: Automated Weather Data Fetching

The system SHALL fetch weather data from OpenWeatherMap API every 6 hours for all active farms with geolocation coordinates. Weather data SHALL include temperature (°C), humidity (%), wind speed (km/h), rainfall (mm/24h), and weather condition. Fetched data SHALL be stored in the `weather_data` table for caching.

#### Scenario: Scheduled weather data fetch for all farms
- **WHEN** the Laravel scheduled command `FetchWeatherData` runs (every 6 hours)
- **THEN** the system queries all farms with status "active" and valid latitude/longitude
- **AND** for each farm, calls OpenWeatherMap API `GET /data/2.5/weather?lat={lat}&lon={lon}&appid={key}`
- **AND** parses the API response and stores weather data in the database
- **AND** sets `fetched_at` timestamp to current time

#### Scenario: Weather data cached for 6 hours
- **WHEN** an investor views a tree detail page
- **THEN** the system displays the most recent weather data from the `weather_data` table
- **AND** does NOT make a live API call (uses cached data)

#### Scenario: OpenWeatherMap API unavailable
- **WHEN** the scheduled weather fetch job runs
- **AND** the OpenWeatherMap API returns 500 error or times out
- **THEN** the system logs the error with farm ID and timestamp
- **AND** continues processing remaining farms
- **AND** displays last known weather data to investors with "Last updated: X hours ago" message

#### Scenario: Farm has no geolocation coordinates
- **WHEN** the scheduled weather fetch job runs
- **AND** a farm has null latitude or longitude
- **THEN** the system skips that farm with a log entry
- **AND** displays "Weather data unavailable (no farm coordinates)" on tree detail pages

---

### Requirement: Automatic Weather Alert Generation

The system SHALL automatically generate weather alerts when fetched weather data exceeds predefined thresholds. Thresholds SHALL include heavy rainfall (>50mm/24h), extreme heat (>35°C), strong wind (>30km/h), and low humidity (<30% for 3 days). Alerts SHALL be deduplicated (max 1 alert per farm per 24 hours per alert type).

#### Scenario: Heavy rainfall alert generated
- **WHEN** the system fetches weather data for a farm
- **AND** rainfall in the last 24 hours is >50mm
- **THEN** the system creates a health alert with alert_type "weather" and title "Heavy Rainfall Warning"
- **AND** sets severity to "high"
- **AND** message includes "Heavy rainfall detected (55mm). Risk of flooding and soil erosion."
- **AND** dispatches `WeatherAlertGenerated` event

#### Scenario: Extreme heat alert generated
- **WHEN** weather data shows temperature >35°C
- **THEN** the system creates a weather alert with title "Extreme Heat Warning"
- **AND** severity "medium"
- **AND** message "High temperature detected (37°C). Trees may experience heat stress."

#### Scenario: Alert deduplication (no duplicate within 24 hours)
- **WHEN** a heavy rainfall alert was created for a farm 12 hours ago
- **AND** the weather fetch runs again and rainfall is still >50mm
- **THEN** the system does NOT create a duplicate alert
- **AND** logs "Alert already exists for farm {id} within 24 hours"

#### Scenario: Weather alert triggers investor notification
- **WHEN** a weather alert is generated for a farm
- **THEN** the system queries all investors with active investments in trees on that farm
- **AND** sends notifications via enabled channels (email, database, SMS)
- **AND** notification message includes farm name, alert type, and severity

---

### Requirement: Investor Health Feed

Investors SHALL be able to view a health feed at `/investments/health-feed` showing all health updates and alerts affecting their invested trees. The feed SHALL display updates in reverse chronological order with pagination (20 per page). Investors SHALL be able to filter by farm, crop type, and severity.

#### Scenario: Investor views health feed
- **WHEN** an investor navigates to `/investments/health-feed`
- **THEN** the system queries all health updates and alerts for crops where the investor has active investments
- **AND** displays updates in reverse chronological order (newest first)
- **AND** each update card shows: title, severity badge, crop name, farm name, excerpt, timestamp, photo thumbnail (if available)
- **AND** pagination controls are displayed at the bottom (20 updates per page)

#### Scenario: Investor filters health feed by severity
- **WHEN** an investor selects "High" severity filter
- **AND** applies the filter
- **THEN** the system reloads the feed showing only health updates and alerts with severity "high" or "critical"

#### Scenario: Investor clicks on health update card
- **WHEN** an investor clicks on a health update card
- **THEN** the system navigates to `/investments/health-feed/{id}`
- **AND** displays full health update details: title, severity, crop, farm, full description, photo gallery, timestamp, author name

#### Scenario: Investor with no investments sees empty feed
- **WHEN** an investor with zero investments navigates to `/investments/health-feed`
- **THEN** the system displays "No health updates available. Invest in trees to start monitoring their health."

---

### Requirement: Growth Progress Photo Gallery

The system SHALL display health update photos in a chronological gallery with thumbnail view and full-size lightbox. Photos SHALL be optimized (resized to max 1920x1080, compressed to <500KB) and thumbnails generated (300x300). The gallery SHALL support navigation between photos.

#### Scenario: Investor views photo gallery in health update detail
- **WHEN** an investor views a health update detail page
- **AND** the update has 3 photos attached
- **THEN** the system displays 3 thumbnail images (300x300) in a grid
- **AND** clicking a thumbnail opens the full-size image in a lightbox overlay
- **AND** lightbox includes navigation arrows to view next/previous photos
- **AND** lightbox includes a close button

#### Scenario: Farm owner uploads large image
- **WHEN** a farm owner uploads a 5MB JPEG image (4000x3000)
- **THEN** the system validates the file size (under 5MB before optimization)
- **AND** resizes the image to max 1920x1080 maintaining aspect ratio
- **AND** compresses the image to <500KB using JPEG quality 85%
- **AND** generates a 300x300 thumbnail cropped to center
- **AND** stores both optimized and thumbnail versions

---

### Requirement: Health Status Indicators on Tree Details

The system SHALL display health status indicators on tree detail pages (`/trees/{id}`) showing the most recent health update severity, weather conditions, and active alerts. The indicator SHALL use color-coded badges (green=low, yellow=medium, orange=high, red=critical).

#### Scenario: Tree detail page shows healthy status
- **WHEN** an investor views a tree detail page
- **AND** the most recent health update for that tree's crop has severity "low"
- **AND** no active weather alerts exist
- **THEN** the system displays a green "Healthy" badge
- **AND** shows recent weather data: "25°C, Partly Cloudy, Humidity 65%"
- **AND** displays "No alerts" message

#### Scenario: Tree detail page shows pest alert
- **WHEN** an investor views a tree detail page
- **AND** the most recent health update has severity "high" and type "pest"
- **THEN** the system displays an orange "Pest Issue" badge
- **AND** shows alert message "Aphid Infestation Detected - Urgent treatment required"
- **AND** displays link to full health update details

#### Scenario: Tree has weather alert
- **WHEN** a tree's farm has an active weather alert (heavy rainfall)
- **THEN** the tree detail page displays a weather alert banner at the top
- **AND** banner includes alert icon, severity, and message
- **AND** banner is dismissible

---

### Requirement: Historical Health Data Timeline

The system SHALL provide a timeline view of historical health updates for each tree/crop, accessible on the tree detail page. The timeline SHALL show all health updates and weather alerts in chronological order with expandable details.

#### Scenario: Investor views health timeline on tree detail
- **WHEN** an investor scrolls to the "Health History" section on a tree detail page
- **THEN** the system displays a vertical timeline with all health updates and alerts for that tree's crop
- **AND** each timeline entry shows date, severity badge, title, and excerpt
- **AND** clicking "View Details" expands the entry to show full description and photos

#### Scenario: Timeline shows weather alerts
- **WHEN** the timeline includes a weather alert
- **THEN** the entry is marked with a weather icon
- **AND** displays alert title, severity, and message
- **AND** shows "Auto-generated" label (not authored by farm owner)

---

### Requirement: Health Update Authorization

The system SHALL authorize health update CRUD operations to ensure only farm owners can create/edit updates for their own farms' crops. Investors and admins SHALL have read-only access to health updates.

#### Scenario: Farm owner creates health update for owned crop
- **WHEN** a farm owner with farm ID 1 attempts to create a health update for crop ID 10 on farm ID 1
- **THEN** the system authorizes the request
- **AND** allows the health update creation

#### Scenario: Farm owner attempts to create update for another farm's crop
- **WHEN** a farm owner with farm ID 1 attempts to create a health update for crop ID 20 on farm ID 2
- **THEN** the system returns 403 Forbidden error
- **AND** logs the unauthorized attempt

#### Scenario: Investor attempts to create health update
- **WHEN** an investor (not a farm owner) navigates to `/farm-owner/health-updates/create`
- **THEN** the system returns 403 Forbidden error
- **AND** displays "You do not have permission to access this page"

---

### Requirement: Weather Data Caching Strategy

The system SHALL cache weather data in the database for 6 hours to minimize OpenWeatherMap API calls. Tree detail pages and health feeds SHALL use cached weather data. The system SHALL display "Last updated: X hours ago" timestamp for cached data.

#### Scenario: Cached weather data displayed on tree page
- **WHEN** an investor views a tree detail page
- **AND** weather data was fetched 3 hours ago
- **THEN** the system displays the cached weather data from the database
- **AND** shows "Last updated: 3 hours ago" below the weather widget

#### Scenario: Weather data older than 6 hours triggers refresh
- **WHEN** the scheduled weather fetch job runs
- **AND** the last weather data for a farm is older than 6 hours
- **THEN** the system fetches fresh weather data from OpenWeatherMap API
- **AND** updates the cached data in the database

---

### Requirement: Health Update Visibility Control

Farm owners SHALL be able to set health update visibility to "public" (visible to all) or "investors_only" (visible only to users with active investments in the crop). Default visibility SHALL be "investors_only".

#### Scenario: Farm owner sets health update to public
- **WHEN** a farm owner creates a health update
- **AND** sets visibility to "public"
- **THEN** the system stores visibility = "public"
- **AND** the update is visible on the public tree detail page (even to non-investors)

#### Scenario: Investor-only update hidden from public
- **WHEN** a non-investor (not logged in or no investments) views a tree detail page
- **AND** the tree's crop has health updates with visibility "investors_only"
- **THEN** the system does NOT display those health updates
- **AND** shows message "Health updates available to investors only"

#### Scenario: Investor with active investment sees investor-only update
- **WHEN** an investor with an active investment in a tree views the tree detail page
- **AND** the crop has health updates with visibility "investors_only"
- **THEN** the system displays those health updates

---

### Requirement: Photo Upload Storage Organization

The system SHALL store health update photos in an organized directory structure: `health-updates/{crop_id}/{year}/{month}/{filename}`. Filenames SHALL be hashed to prevent conflicts. Deleted health updates SHALL delete associated photo files from storage.

#### Scenario: Photo stored with organized path
- **WHEN** a farm owner uploads a photo for crop ID 5 in March 2026
- **THEN** the system stores the optimized photo at `health-updates/5/2026/03/{hash}.jpg`
- **AND** stores the thumbnail at `health-updates/5/2026/03/thumbs/{hash}.jpg`
- **AND** records the file paths in the `photos_json` column

#### Scenario: Health update deleted, photos removed from storage
- **WHEN** a farm owner deletes a health update
- **THEN** the system deletes the health update record
- **AND** deletes all associated photo files from storage (optimized and thumbnails)
- **AND** logs the deletion event

---

### Requirement: Weather Alert Threshold Configuration

The system SHALL use predefined weather alert thresholds: heavy rainfall (>50mm/24h), extreme heat (>35°C), strong wind (>30km/h), low humidity (<30% for 3 days). Thresholds SHALL be configurable via environment variables for future tuning.

#### Scenario: Default thresholds used on initial deployment
- **WHEN** the system is deployed for the first time
- **THEN** the weather alert service uses hardcoded default thresholds:
  - HEAVY_RAIN_THRESHOLD=50 (mm/24h)
  - EXTREME_HEAT_THRESHOLD=35 (°C)
  - STRONG_WIND_THRESHOLD=30 (km/h)
  - LOW_HUMIDITY_THRESHOLD=30 (%)

#### Scenario: Admin configures custom thresholds via environment variables
- **WHEN** an admin sets `HEAVY_RAIN_THRESHOLD=60` in `.env`
- **AND** restarts the application
- **THEN** the weather alert service uses the custom threshold (60mm instead of default 50mm)
