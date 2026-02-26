# EPIC-009: Build Harvest & Returns System

> **Status:** DRAFT (PRD-based, pending FSD/TDD-Lite refinement)

## Business Value Statement
Complete the investment lifecycle by managing harvest cycles, calculating actual returns based on real agricultural yields and market prices, and distributing profits to investors. This is the system that delivers on the platform's core promise: returns tied to actual agricultural production.

## Description
This EPIC implements the complete harvest-to-payout lifecycle. It includes harvest schedule management with automated notifications, yield estimation and actual yield recording, market price tracking for each fruit type, transparent profit calculation, and multiple payout distribution methods (bank transfer, digital wallet, reinvestment). Farm owners report harvest data, the system calculates profit per investment, and distributes returns to investors. This is the most business-critical EPIC as it directly affects investor trust and platform credibility.

## Source Traceability
| Document | Reference | Section/Page |
|----------|-----------|--------------|
| PRD | Harvest Schedule Management (all sub-items) | Section 4 - Harvest & Returns System |
| PRD | Profit Distribution (all sub-items) | Section 4 - Harvest & Returns System |
| PRD | Market price tracking for each fruit type | Section 4 |
| PRD | Reinvestment option | Section 4 - Profit Distribution |
| PRD | Tax documentation/reports | Section 4 - Profit Distribution |
| AGENTS.md | Harvest Entity | Section 6 - Data Models |
| AGENTS.md | Payout Entity | Section 6 - Data Models |
| AGENTS.md | Harvest & Returns Flow | Section 5 - Core Business Logic |
| AGENTS.md | Harvest Status Enumeration | Section 7 |
| AGENTS.md | Payout Status Enumeration | Section 7 |

## Scope Definition
| In Scope | Out of Scope |
|----------|--------------|
| Harvest schedule creation and management | Payment gateway integration (EPIC-010) |
| Automated harvest date notifications | Portfolio dashboard display (EPIC-007) |
| Yield estimation creation and updates | Financial reporting/export (EPIC-011) |
| Actual yield recording by farm owners | Tree health monitoring (EPIC-008) |
| Market price tracking per fruit type | Tax report generation (EPIC-011) |
| Harvest completion confirmation workflow | |
| Profit calculation methodology (transparent) | |
| Profit distribution to investors per investment | |
| Multiple payout methods: bank transfer, digital wallet, reinvestment | |
| Payout status tracking (pending, processing, completed, failed) | |
| Reinvestment option (auto-purchase new tree investment) | |
| Detailed transaction history for each payout | |
| Harvest data confirmation by farm owner before distribution | |

## High-Level Acceptance Criteria
- [ ] Harvest schedules can be created for each tree/crop based on harvest cycle
- [ ] Automated notifications are sent as harvest dates approach
- [ ] Farm owners can submit yield estimates and update them
- [ ] Farm owners can record actual yield after harvest
- [ ] Market prices for each fruit type are tracked and available
- [ ] Harvest completion is confirmed by farm owner before profit distribution
- [ ] Profit is calculated transparently with visible methodology
- [ ] Profit is distributed proportionally to all investors in the harvested tree
- [ ] Investors can choose payout method: bank transfer, digital wallet, or reinvestment
- [ ] Reinvestment option automatically purchases new tree investments
- [ ] Payout status is tracked and visible to investors
- [ ] Failed payouts are retried or flagged for manual resolution
- [ ] All harvest and payout events create audit trail entries
- [ ] Detailed transaction history is available for each payout

## Dependencies
- **Prerequisite EPICs:** EPIC-005 (Tree Catalog - harvest data ties to trees), EPIC-006 (Investment - payouts go to investments), EPIC-010 (Payments - payout processing)
- **External Dependencies:** Market price data source (TBD), payment gateway for payouts (via EPIC-010)
- **Technical Prerequisites:** Investment data, tree/crop data, payment infrastructure; Laravel scheduled commands for harvest reminders; Laravel queue jobs for payout distribution processing; Eloquent transactions for atomic profit distribution; Inertia::render() pages for harvest management UI (farm owner) and payout tracking (investor); FormRequest classes for harvest data validation; MySQL transactions for financial calculations

## Complexity Assessment
- **Size:** XL
- **Technical Complexity:** Very High (financial calculations, multi-party distribution, state machines)
- **Integration Complexity:** High (payment gateway for payouts, market price data, notification system)
- **Estimated Story Count:** 15-20

## Risks & Assumptions
**Assumptions:**
- Profit calculation formula will be defined by business team (not invented by engineering)
- Market prices are sourced from an external data provider or manually entered by admins
- Harvest confirmation by farm owner is a mandatory gate before distribution
- Reinvestment uses the standard investment purchase flow internally
- Platform fee/commission is deducted before investor payout (revenue model TBD)
- Harvest reminder notifications dispatched via Laravel queue jobs using database driver
- Yield estimation and actual yield recorded via Inertia/React forms with FormRequest validation
- Market price data cached using Laravel's database cache driver
- Profit calculation runs as a Laravel queue job to avoid HTTP timeout
- Payout status tracked via Eloquent model state transitions
- Harvest confirmation workflow built as Inertia page components

**Risks:**
- **Harvest failure handling is undefined** — what happens when a harvest fails or underperforms? This is a critical business rule gap
- Profit calculation errors directly impact investor trust and may have legal implications
- Market price data reliability and freshness affect accuracy of returns
- Payout processing failures need robust retry and reconciliation
- Reinvestment logic creates a dependency loop with EPIC-006
- Tax documentation requirements vary by jurisdiction
- **Insurance/guarantee** — platform liability for crop failure is undefined
- MySQL-level database transactions must ensure atomicity of profit calculations and payout creation
- Laravel queue worker must be reliable — failed payout jobs require retry logic with exponential backoff

## Related EPICs
- **Depends On:** EPIC-005 (Tree Catalog), EPIC-006 (Investment Purchase), EPIC-010 (Payments)
- **Blocks:** EPIC-011 (Financial Reporting)
- **Related:** EPIC-007 (Portfolio - actual returns display), EPIC-008 (Health Monitoring - health affects yield), EPIC-013 (Notifications - harvest alerts)
