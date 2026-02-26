# EPIC-016: Build Secondary Market (Optional)

> **Status:** DRAFT (PRD-based, pending FSD/TDD-Lite refinement)
> **Scope:** OPTIONAL — Marked as optional in PRD

## Business Value Statement
Provide investors with liquidity by allowing them to sell their tree investments to other investors on a secondary market, making the platform's investments more attractive by reducing lock-in risk. A secondary market increases platform activity and investor confidence.

## Description
This EPIC implements the optional secondary market feature that allows investors to list their active tree investments for sale to other investors. It includes investment listing for sale, price setting by the seller, buyer discovery and purchase flow, ownership transfer, transaction processing, and a marketplace interface for secondary market listings. The secondary market adds liquidity to what are otherwise illiquid agricultural investments.

## Source Traceability
| Document | Reference | Section/Page |
|----------|-----------|--------------|
| PRD | Secondary market (optional): Allow users to sell their tree investments | Section 5 - Financial Features |
| AGENTS.md | Secondary Market (Glossary) | Section 7 - Domain Vocabulary |
| AGENTS.md | Permission Matrix: Sell on secondary market (Investor only) | Section 8 |

## Scope Definition
| In Scope | Out of Scope |
|----------|--------------|
| Investment listing for sale by owner | Automated market-making or pricing algorithms |
| Seller price setting (ask price) | Short selling or derivatives |
| Secondary market browse/search for buyers | Margin trading |
| Purchase flow for secondary market listings | Real-time order book / exchange-style trading |
| Ownership transfer from seller to buyer | |
| Transaction processing for secondary sales | |
| Secondary market transaction fees | |
| Listing cancellation by seller | |
| Investment transfer history tracking | |

## High-Level Acceptance Criteria
- [ ] Investors can list their active investments for sale with a set price
- [ ] Listed investments are visible in a secondary market section
- [ ] Buyers can browse and filter secondary market listings
- [ ] Buyers can purchase listed investments through the standard payment flow
- [ ] Ownership is transferred from seller to buyer upon payment confirmation
- [ ] Transaction fees (if any) are deducted from the sale
- [ ] Sellers can cancel their listing before it is purchased
- [ ] Investment history shows the transfer event
- [ ] Both buyer and seller receive confirmation notifications
- [ ] Secondary market does not affect ongoing harvest/payout schedules for the tree
- [ ] Only KYC-verified users can buy/sell on the secondary market

## Dependencies
- **Prerequisite EPICs:** EPIC-006 (Investments must exist to be listed), EPIC-010 (Payment processing for secondary sales)
- **External Dependencies:** Same payment infrastructure as primary market
- **Technical Prerequisites:**
  - Investment ownership transfer logic
  - Eloquent transactions (MySQL) for atomic ownership transfer
  - MySQL row-level locking (SELECT FOR UPDATE) to prevent concurrent purchase of same listing
  - Inertia::render() pages for secondary market browse, listing creation, and purchase flow
  - FormRequest classes for listing and purchase validation
  - Laravel queue jobs for post-transfer processing (notifications, audit trail)

## Complexity Assessment
- **Size:** M
- **Technical Complexity:** Medium-High (ownership transfer, concurrent purchase prevention)
- **Integration Complexity:** Medium (payment system, notification system)
- **Estimated Story Count:** 8-12

## Risks & Assumptions
**Assumptions:**
- Secondary market is a simple listing-and-purchase model (not an exchange/order book)
- Pricing is set by the seller (no automated pricing)
- Only one buyer can purchase a listing (first-come, first-served)
- Harvest payouts continue to accrue to the current owner at time of harvest
- Platform may charge a transaction fee on secondary sales
- Secondary market UI built as Inertia/React page components with Tailwind CSS
- Ownership transfer uses MySQL transactions with row-level locking for atomicity
- Post-transfer notifications dispatched via Laravel queue jobs
- Listing and purchase flows reuse existing payment infrastructure from EPIC-010

**Risks:**
- Securities regulation implications — secondary market trading may trigger additional regulatory requirements
- Concurrent purchase attempts on the same listing need atomic handling
- Price manipulation and wash trading between accounts
- Tax implications of secondary sales for both buyer and seller
- Ownership transfer timing relative to harvest events needs clear rules
- MySQL row-level locking required to handle concurrent purchase attempts atomically — deadlock potential needs testing

## Related EPICs
- **Depends On:** EPIC-006 (Investments), EPIC-010 (Payments)
- **Blocks:** None
- **Related:** EPIC-009 (Harvest - payout recipient changes on transfer), EPIC-015 (Security - fraud detection for trading)
