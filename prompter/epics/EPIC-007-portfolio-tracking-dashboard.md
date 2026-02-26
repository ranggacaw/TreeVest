# EPIC-007: Build Portfolio Tracking Dashboard

> **Status:** DRAFT (PRD-based, pending FSD/TDD-Lite refinement)

## Business Value Statement
Provide investors with a comprehensive, real-time view of their investment portfolio, enabling them to monitor performance, track upcoming harvests, and make informed decisions about future investments. The dashboard is the primary daily-use interface for existing investors.

## Description
This EPIC builds the investor's portfolio dashboard, which serves as the home screen for authenticated investors. It displays total investment value, number of trees owned (broken down by farm and crop type), current growth stage indicators, expected harvest dates in a calendar view, projected vs. actual returns, and portfolio diversification visualization. The dashboard pulls data from investments, trees, farms, and harvests to present a unified portfolio view.

## Source Traceability
| Document | Reference | Section/Page |
|----------|-----------|--------------|
| PRD | Real-Time Portfolio Management (all sub-items) | Section 3 - Investment Tracking Dashboard |
| PRD | Portfolio diversification visualization | Section 3 |
| PRD | Expected harvest dates (calendar view) | Section 3 |
| PRD | Projected returns vs. actual returns | Section 3 |
| AGENTS.md | Portfolio (Glossary) | Section 7 - Domain Vocabulary |

## Scope Definition
| In Scope | Out of Scope |
|----------|--------------|
| Total investment value calculation and display | Tree health monitoring details (EPIC-008) |
| Tree count by farm and crop type | Harvest management operations (EPIC-009) |
| Current growth stage indicators per tree | Financial reporting/export (EPIC-011) |
| Harvest date calendar view | Investment purchase flow (EPIC-006) |
| Projected vs. actual returns comparison | Payment/payout processing (EPIC-010) |
| Portfolio diversification charts (by fruit type, farm, risk) | |
| Investment performance summary (gains/losses) | |
| Individual investment detail view from dashboard | |
| Dashboard data refresh and real-time updates | |

## High-Level Acceptance Criteria
- [ ] Dashboard displays total portfolio value across all investments
- [ ] Tree count is shown broken down by farm and by crop type
- [ ] Current growth stage is indicated for each invested tree
- [ ] Calendar view shows expected harvest dates for all invested trees
- [ ] Projected returns are displayed alongside actual returns (where available)
- [ ] Diversification visualization shows allocation by fruit type, farm, and risk level
- [ ] Dashboard data updates in near-real-time (or on pull-to-refresh)
- [ ] Users can navigate from dashboard to individual investment details
- [ ] Dashboard performs well with portfolios of 50+ investments
- [ ] Empty state is handled for new investors with no investments

## Dependencies
- **Prerequisite EPICs:** EPIC-006 (Investment Purchase - investments must exist to display)
- **External Dependencies:** None (consumes internal data only)
- **Technical Prerequisites:** Investment, Tree, Farm, and Harvest data APIs; Inertia page component for dashboard; Eloquent eager loading for investment/tree/farm/harvest relationships; React charting library (e.g., recharts or chart.js) for visualizations

## Complexity Assessment
- **Size:** L
- **Technical Complexity:** Medium-High (data aggregation, visualizations, real-time updates)
- **Integration Complexity:** Low (internal APIs only, but multiple data sources)
- **Estimated Story Count:** 8-12

## Risks & Assumptions
**Assumptions:**
- "Real-time" means near-real-time (seconds to minutes), not sub-second latency
- Projected returns are calculated from expected ROI and harvest cycle data
- Actual returns are populated after harvest/payout events
- Dashboard is the default landing page for authenticated investors
- Charts built using a React charting library (e.g., recharts) within Inertia page components
- Dashboard data passed as Inertia props from a dedicated Laravel controller with optimized Eloquent queries

**Risks:**
- Data aggregation across multiple entities (investments, trees, farms, harvests) could be expensive
- Real-time updates may require WebSocket or SSE infrastructure; Laravel Broadcasting (WebSocket via Pusher/Soketi) or polling can provide near-real-time updates
- Portfolio diversification calculations need clear business rules for categorization
- Large portfolios could create performance/rendering challenges

## Related EPICs
- **Depends On:** EPIC-006 (Investment Purchase)
- **Blocks:** None
- **Related:** EPIC-008 (Health Monitoring), EPIC-009 (Harvest - populates actual returns), EPIC-011 (Reporting)
