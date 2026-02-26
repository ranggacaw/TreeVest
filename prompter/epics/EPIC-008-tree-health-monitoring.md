# EPIC-008: Implement Tree Health Monitoring

> **Status:** DRAFT (PRD-based, pending FSD/TDD-Lite refinement)

## Business Value Statement
Keep investors informed about the real-time health and conditions of their invested trees, building trust and transparency while enabling proactive risk awareness. Health monitoring differentiates this platform from opaque investment products by providing tangible, visual proof of asset status.

## Description
This EPIC implements the tree health monitoring system, which provides investors with live updates on crop conditions, weather impact alerts, pest/disease notifications, and growth progress photos from farms. Farm owners upload health data and photos, the platform integrates weather API data for relevant farms, and investors receive timely alerts about conditions that may affect their investments.

## Source Traceability
| Document | Reference | Section/Page |
|----------|-----------|--------------|
| PRD | Tree Health Monitoring (all sub-items) | Section 3 - Investment Tracking Dashboard |
| PRD | Weather API for farm conditions | Technical Specifications - Key Integrations |
| PRD | Growth progress photos/updates from farms | Section 3 |
| AGENTS.md | Tree Status Enumeration | Section 7 - Domain Vocabulary |
| AGENTS.md | External: Weather API > Health Alerts > Notifications | Section 5 - Data Flows |

## Scope Definition
| In Scope | Out of Scope |
|----------|--------------|
| Farm owner health update submission (text + photos) | Harvest data reporting (EPIC-009) |
| Weather API integration for farm locations | Portfolio dashboard display (EPIC-007) |
| Weather impact alert generation | Notification delivery infrastructure (EPIC-013) |
| Pest/disease notification creation by farm owners | Admin health data review (EPIC-014) |
| Growth progress photo gallery per tree/crop | |
| Tree health status indicators | |
| Investor alert feed for their invested trees | |
| Historical health data timeline | |

## High-Level Acceptance Criteria
- [ ] Farm owners can submit health updates for their crops/trees (text + photos)
- [ ] Growth progress photos are displayed in a chronological gallery
- [ ] Weather data is fetched and displayed for each farm location
- [ ] Weather impact alerts are generated when conditions may affect crops
- [ ] Farm owners can create pest/disease notifications for affected crops
- [ ] Investors receive alerts for health events affecting their invested trees
- [ ] Health data is shown in a timeline/feed format
- [ ] Tree health status indicators are visible on tree detail and portfolio views
- [ ] Historical health data is accessible for each tree
- [ ] Health updates are filterable by farm, crop type, and severity

## Dependencies
- **Prerequisite EPICs:** EPIC-005 (Tree Catalog - trees must exist), EPIC-013 (Notifications - alert delivery)
- **External Dependencies:** Weather API service
- **Technical Prerequisites:** File upload infrastructure (from EPIC-004), notification system; Laravel filesystem (S3 or local) for photo uploads; Eloquent models for health updates; Laravel HTTP client for Weather API calls; Laravel scheduled commands for periodic weather checks

## Complexity Assessment
- **Size:** M
- **Technical Complexity:** Medium (weather API integration, photo management, alert logic)
- **Integration Complexity:** Medium (Weather API, notification system)
- **Estimated Story Count:** 7-10

## Risks & Assumptions
**Assumptions:**
- Weather API will provide data relevant to agricultural conditions (temperature, rainfall, humidity, wind)
- Farm owners are responsible for submitting health updates manually
- Weather alerts are generated automatically based on predefined thresholds
- Pest/disease notifications are manual submissions by farm owners, not automated detection
- Weather data fetched via Laravel HTTP client and cached using database cache driver
- Health update photos stored via Laravel filesystem (S3 or local)
- Weather check runs as a Laravel scheduled command (cron)

**Risks:**
- Weather API reliability and accuracy vary by provider and region
- Farm owner engagement in submitting regular health updates is not guaranteed
- Weather alert thresholds need agronomic expertise to define properly
- Photo storage costs could be significant with frequent updates across many farms/trees
- Alert fatigue: too many notifications could cause investors to ignore important alerts

## Related EPICs
- **Depends On:** EPIC-005 (Tree Catalog), EPIC-013 (Notifications)
- **Blocks:** None
- **Related:** EPIC-007 (Portfolio Dashboard - displays health indicators), EPIC-009 (Harvest - health affects yield)
