## Context

This change introduces a comprehensive tree health monitoring system to provide investors with real-time visibility into their investment assets. The system integrates automated weather monitoring, manual farm owner health updates, and alert generation to keep investors informed about conditions that may affect returns.

**Key architectural decision:** Use OpenWeatherMap API as the weather data provider due to its reliability, agricultural data availability, and free tier sufficiency for MVP scale.

## Goals

- Provide investors with transparent, real-time health status for their invested trees
- Automate weather monitoring to reduce farm owner workload
- Enable farm owners to report critical health events (pest, disease, growth issues)
- Build trust through visual proof of asset status (photos)
- Proactively alert investors of conditions that may affect yields

## Non-Goals

- Automated pest/disease detection via computer vision (manual reporting only)
- Multi-provider weather data aggregation (single provider: OpenWeatherMap)
- Mobile app UI for health monitoring (web-only)
- Historical weather data backfill (start from implementation date forward)

## Decisions

### Decision 1: Crop-Level Health Updates

**What:** Farm owners submit health updates at the FruitCrop level, not individual Tree level.

**Why:**
- Reduces data entry burden (one update covers many trees)
- Matches agronomic reality (crops are typically managed as groups)
- Simpler database schema and querying
- Investors still see updates relevant to their specific trees (via tree → crop relationship)

**Alternatives considered:**
- Tree-level updates: Too granular, impractical for large farms
- Both levels: Adds complexity without clear benefit at MVP stage

### Decision 2: Automatic Weather Alerts

**What:** System automatically generates weather alerts when data exceeds predefined thresholds, without farm owner intervention.

**Why:**
- Ensures timely alerts even if farm owners are unavailable
- Reduces reliance on farm owner engagement
- Consistent alert logic across all farms
- Farm owners can still create manual pest/disease alerts

**Thresholds (initial values, tunable):**
- Heavy rainfall: >50mm in 24 hours → flood/erosion risk
- Extreme heat: >35°C daily high → heat stress risk
- Strong wind: >30 km/h sustained → tree damage risk
- Low humidity: <30% for 3 consecutive days → drought risk

**Alternatives considered:**
- Manual alerts only: Risk of delayed or missing alerts
- Hybrid approach: Added complexity for MVP

### Decision 3: 6-Hour Weather Polling Interval

**What:** Laravel scheduled command fetches weather data every 6 hours for all active farms.

**Why:**
- Stays within OpenWeatherMap free tier (1,000 calls/day = ~42 farms × 24 checks/day → need 6-hour interval for ~100 farms)
- Weather changes relevant to agriculture occur on multi-hour timescales
- Database caching reduces API dependency

**Alternatives considered:**
- Hourly polling: Exceeds free tier limits
- Daily polling: Too infrequent for timely alerts

### Decision 4: OpenWeatherMap API Integration

**What:** Use OpenWeatherMap's Current Weather Data API and One Call API (historical + forecast).

**Why:**
- Free tier: 1,000 calls/day (sufficient for MVP with ~100 farms)
- Agricultural data available: temperature, rainfall, humidity, wind
- Reliable uptime and global coverage
- Simple REST API, easy Laravel HTTP client integration

**API Endpoints:**
- Current weather: `GET /data/2.5/weather?lat={lat}&lon={lon}&appid={key}`
- Forecast: `GET /data/2.5/forecast?lat={lat}&lon={lon}&appid={key}`

**Data structure:**
```json
{
  "temp": 28.5,
  "humidity": 65,
  "wind_speed": 15,
  "rainfall_1h": 5.2,
  "weather_condition": "Clouds",
  "fetched_at": "2026-03-01 12:00:00"
}
```

**Alternatives considered:**
- WeatherAPI.com: Similar features, but less familiar ecosystem
- Provider-agnostic: Over-engineering for MVP

### Decision 5: Health Update Photo Storage

**What:** Store health update photos via Laravel filesystem with S3 or local driver (configurable).

**Why:**
- Laravel filesystem abstraction allows switching between local/S3 without code changes
- Support for multiple photos per update (up to 5 images)
- Image optimization via Intervention Image (resize to max 1920x1080, compress to <500KB)
- Organized storage: `health-updates/{crop_id}/{year}/{month}/{filename}`

**File validation:**
- Max 5 images per update
- Max 5MB per image (before optimization)
- Allowed types: JPEG, PNG, WebP
- Auto-generate thumbnails for gallery view (300x300)

## Data Model

### New Tables

**`tree_health_updates`**
```
id, fruit_crop_id, author_id (farm owner), severity (low/medium/high/critical),
update_type (routine/pest/disease/damage/other), title, description,
photos_json (array of file paths), visibility (public/investors_only),
created_at, updated_at
```

**`weather_data`**
```
id, farm_id, temperature_celsius, humidity_percent, wind_speed_kmh,
rainfall_mm_24h, weather_condition, alert_triggered (boolean),
fetched_at (timestamp), created_at
```

**`health_alerts`**
```
id, farm_id, fruit_crop_id (nullable), alert_type (weather/pest/disease/manual),
severity (low/medium/high), title, message, resolved_at (nullable),
created_by (nullable - null for automated), created_at, updated_at
```

### Relationships

- `FruitCrop` → hasMany → `TreeHealthUpdate`
- `Farm` → hasMany → `WeatherData`
- `Farm` → hasMany → `HealthAlert`
- `FruitCrop` → hasMany → `HealthAlert`
- `User` (farm owner) → hasMany → `TreeHealthUpdate`

### Enums

**`HealthSeverity`:** `low`, `medium`, `high`, `critical`

**`HealthUpdateType`:** `routine`, `pest`, `disease`, `damage`, `weather_impact`, `other`

**`HealthAlertType`:** `weather`, `pest`, `disease`, `manual`

## Notification Integration

**New notification types:**
- `health` — health updates, pest/disease reports
- `weather` — weather alerts affecting farms

**MODIFIED:** Notification type enum to add `health` and `weather`.

**Triggers:**
- Farm owner creates health update with severity >= medium → notify investors with trees in that crop
- Weather alert generated → notify investors with trees in affected farm
- Pest/disease report → immediate notification to all investors in affected crop

## API Routes

**Farm Owner (role: farm_owner):**
- `GET /farm-owner/health-updates` — list health updates for owned farms
- `GET /farm-owner/health-updates/create` — create health update form
- `POST /farm-owner/health-updates` — store health update with photos
- `GET /farm-owner/health-updates/{id}/edit` — edit health update
- `PUT /farm-owner/health-updates/{id}` — update health update
- `DELETE /farm-owner/health-updates/{id}` — delete health update

**Investor (role: investor):**
- `GET /investments/health-feed` — health feed for investor's trees
- `GET /investments/health-feed/{id}` — single health update detail

**Public/Investor (tree details):**
- `GET /trees/{id}` (MODIFIED) — add health status, recent updates, weather conditions

## Performance Considerations

- **Weather data caching:** Store in database, refresh every 6 hours (not on every page load)
- **Health feed query optimization:** Index on `fruit_crop_id`, `created_at`
- **Photo loading:** Lazy load thumbnails, full-size on click
- **Alert generation:** Queue job processes weather data and generates alerts asynchronously

## Risks & Trade-offs

**Risk:** OpenWeatherMap API unavailable or rate-limited
- **Mitigation:** Cache data for 6 hours, graceful degradation (show last known data), monitor API usage

**Risk:** Farm owners do not submit regular health updates
- **Mitigation:** Admin dashboard shows farms with no updates in >30 days, email reminders

**Risk:** Alert fatigue from too many weather alerts
- **Mitigation:** Tunable thresholds, allow investors to customize alert preferences (future), debounce alerts (max 1 per farm per 24 hours)

**Trade-off:** Crop-level updates vs tree-level granularity
- **Accepted:** Crop-level is sufficient for MVP; individual tree updates can be added later if needed

## Migration Plan

1. **Phase 1: Schema & Models** — Create tables, models, enums, relationships
2. **Phase 2: Weather Integration** — Implement WeatherService, scheduled job, alert generation
3. **Phase 3: Health Update Submission** — Farm owner UI for health updates with photo upload
4. **Phase 4: Investor Health Feed** — Health feed display, filtering, timeline
5. **Phase 5: Notifications** — Integrate health/weather notifications
6. **Phase 6: Portfolio/Tree Detail Integration** — Add health indicators to existing pages

**Rollback plan:** Drop new tables, remove scheduled job, disable routes.

## Open Questions

- **Q:** What are the exact agronomic thresholds for weather alerts per fruit type?
  - **Answer:** Use generic thresholds for MVP; refine based on agronomic expertise post-launch

- **Q:** Should health updates be editable after creation?
  - **Answer:** Yes, farm owners can edit/delete updates within 24 hours; after that, locked for audit integrity

- **Q:** How do we handle farms with no geolocation coordinates?
  - **Answer:** Validation requires coordinates for weather monitoring; existing farms without coordinates must update via migration script or admin intervention
