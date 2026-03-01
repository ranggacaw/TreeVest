# Change: Add Tree Health Monitoring System

## Why

Investors need real-time visibility into the health and conditions of their invested trees to build trust and transparency. Currently, there is no system for farm owners to provide health updates, no weather monitoring for farm conditions, and no alerts for events that may impact investment returns. This feature is critical for differentiating the platform from opaque investment products by providing tangible, visual proof of asset status.

## What Changes

- Add tree/crop health update submission system for farm owners (text + photo uploads)
- Integrate OpenWeatherMap API for automated farm weather monitoring
- Implement automatic weather alert generation based on agricultural thresholds
- Create pest/disease notification system for farm owners to report issues
- Build growth progress photo gallery with timeline display
- Add health status indicators to tree detail and portfolio views
- Create investor alert feed showing health events affecting their investments
- Add historical health data timeline for each tree/crop
- Implement weather data caching and scheduled polling via Laravel HTTP client
- Build health update filtering (farm, crop type, severity)

## Impact

**Affected specs:**
- `tree-health-monitoring` (NEW) — entire health monitoring capability
- `notifications` (MODIFIED) — add health/weather notification types
- `farm-management` (MODIFIED) — add health update submission for farm owners

**Affected code:**
- **New Models:** `TreeHealthUpdate`, `WeatherData`, `HealthAlert`
- **Modified Models:** `Tree`, `FruitCrop`, `Farm` (add health relationships)
- **New Controllers:** `FarmOwner/HealthUpdateController`, `Investor/HealthFeedController`
- **New Services:** `WeatherService`, `HealthMonitoringService`, `WeatherAlertService`
- **New Jobs:** `FetchWeatherData`, `GenerateWeatherAlerts`, `ProcessHealthUpdate`
- **New Events:** `HealthUpdateCreated`, `WeatherAlertGenerated`, `PestReported`
- **New Pages:** `resources/js/Pages/FarmOwner/HealthUpdates/`, `resources/js/Pages/Investments/HealthFeed/`
- **Database migrations:** 3 new tables (`tree_health_updates`, `weather_data`, `health_alerts`)

**External dependencies:**
- OpenWeatherMap API (Laravel HTTP client integration)
- File storage (Laravel filesystem for health update photos)
- Laravel scheduled commands (weather data polling every 6 hours)

**Integration points:**
- EPIC-013 (Notifications) — triggers health/weather notifications
- EPIC-007 (Portfolio Dashboard) — displays health indicators
- EPIC-005 (Tree Catalog) — displays health status on tree details
- EPIC-004 (Farm Management) — farm owner health update UI

## Risks

- Weather API rate limits (free tier: 1,000 calls/day) — mitigated by 6-hour polling interval and caching
- Farm owner engagement in submitting regular health updates — relies on farm owner incentives
- Alert fatigue if thresholds are too sensitive — requires tuning based on agronomic expertise
- Photo storage costs with frequent updates — implement file size limits and image optimization

## Success Criteria

- [ ] Farm owners can submit health updates with photos via farm management dashboard
- [ ] Weather data is fetched every 6 hours for all active farms and cached
- [ ] Weather alerts are automatically generated when thresholds are exceeded
- [ ] Investors see health updates and alerts in a dedicated feed
- [ ] Health status indicators appear on tree details and portfolio views
- [ ] Photo gallery displays growth progress in chronological order
- [ ] Historical health data is accessible with timeline visualization
- [ ] Health updates are filterable by farm, crop, and severity
