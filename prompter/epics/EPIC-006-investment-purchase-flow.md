# EPIC-006: Implement Investment Purchase Flow

> **Status:** DRAFT (PRD-based, pending FSD/TDD-Lite refinement)

## Business Value Statement
Enable investors to purchase fruit tree investments through a secure, transparent, multi-step flow that is the core revenue-generating action of the platform. This is the central business transaction that connects investors to agricultural assets and generates platform activity.

## Description
This EPIC implements the end-to-end investment purchase flow: from tree selection on the marketplace through payment confirmation to portfolio update. It includes the multi-step purchase wizard with risk disclosure, investment amount validation (min/max limits), KYC verification gate, payment initiation, purchase confirmation, and automatic portfolio update. This is the highest-value user journey on the platform and must balance conversion optimization with regulatory compliance (risk disclosure, KYC enforcement).

## Source Traceability
| Document | Reference | Section/Page |
|----------|-----------|--------------|
| PRD | Investment Details Per Tree (min/max limits) | Section 2 - Investment Marketplace |
| PRD | Investment top-up functionality | Section 5 - Financial Features |
| AGENTS.md | Investment Entity | Section 6 - Data Models |
| AGENTS.md | Investment Purchase Flow | Section 5 - Core Business Logic |
| AGENTS.md | Investment Status Enumeration | Section 7 - Domain Vocabulary |
| AGENTS.md | Validation Rules (KYC, min/max, payment confirmation) | Section 5 |

## Scope Definition
| In Scope | Out of Scope |
|----------|--------------|
| Tree selection and investment detail review | Payment gateway integration details (EPIC-010) |
| Investment amount input with min/max validation | KYC verification process itself (EPIC-002) |
| KYC verification gate (block if not verified) | Tree catalog and search (EPIC-005) |
| Risk disclosure acceptance step | Portfolio dashboard display (EPIC-007) |
| Investment terms and conditions acceptance | Harvest returns processing (EPIC-009) |
| Payment method selection and initiation | Secondary market selling (EPIC-016) |
| Purchase confirmation and receipt | |
| Investment status tracking (pending_payment, active, matured, sold, cancelled) | |
| Investment top-up (additional investment in same tree) | |
| Portfolio update upon successful payment | |
| Investment confirmation notification trigger | |
| Transaction audit trail creation | |
| Investment cancellation (before payment confirmation) | |

## High-Level Acceptance Criteria
- [ ] Investors can select a tree and initiate an investment purchase
- [ ] Investment amount is validated against tree's min/max limits
- [ ] Unverified KYC users are blocked and redirected to KYC flow
- [ ] Risk disclosure statement is presented and must be accepted
- [ ] Terms and conditions must be accepted before purchase
- [ ] Users can select a payment method and initiate payment
- [ ] Investment enters "pending_payment" status until payment is confirmed
- [ ] Upon payment confirmation, investment transitions to "active" status
- [ ] Investor's portfolio is automatically updated with new investment
- [ ] Confirmation notification is sent (email and/or push)
- [ ] Complete audit trail is created for the transaction
- [ ] Investors can cancel a pending investment before payment confirmation
- [ ] Investment top-up allows additional investment in an already-owned tree
- [ ] All financial amounts are displayed with correct currency formatting

## Dependencies
- **Prerequisite EPICs:** EPIC-002 (KYC - verification gate), EPIC-005 (Tree Catalog - trees to invest in), EPIC-010 (Payments - payment processing)
- **External Dependencies:** Payment gateway (via EPIC-010)
- **Technical Prerequisites:** KYC status API, Tree data API, Payment processing API; Laravel controllers returning Inertia::render() for purchase flow pages; FormRequest validation for investment amounts (min/max); Eloquent transactions for atomic investment creation; Laravel queue jobs for post-purchase processing (notifications, audit trail)

## Complexity Assessment
- **Size:** XL
- **Technical Complexity:** High (multi-step flow, state management, financial transactions, compliance gates)
- **Integration Complexity:** High (KYC service, payment service, notification service, portfolio service)
- **Estimated Story Count:** 12-18

## Risks & Assumptions
**Assumptions:**
- Investment is in a single tree per transaction (bulk investment is not in initial scope)
- Payment must be confirmed (not just initiated) before investment becomes active; Stripe webhooks processed via Laravel controller + queue job
- Risk disclosure content is provided by legal/compliance team
- Investment cancellation is only possible before payment confirmation
- Platform fee/commission handling will be defined when revenue model is clarified
- Multi-step purchase wizard built as Inertia/React page components with Ziggy route helpers

**Risks:**
- Payment failure handling and retry logic add significant complexity
- Concurrent investment attempts on the same tree need conflict resolution (is there limited capacity per tree?)
- Risk disclosure requirements may vary by jurisdiction
- Investment top-up logic needs careful handling to avoid accounting errors
- The flow must be atomic: no partial investments or inconsistent states between payment and portfolio
- Database transactions (MySQL) ensure atomicity between payment confirmation and investment status update

## Related EPICs
- **Depends On:** EPIC-002 (KYC), EPIC-005 (Tree Catalog), EPIC-010 (Payments)
- **Blocks:** EPIC-007 (Portfolio Dashboard), EPIC-009 (Harvest & Returns), EPIC-011 (Financial Reporting), EPIC-016 (Secondary Market)
- **Related:** EPIC-013 (Notifications - purchase confirmation), EPIC-015 (Security - fraud detection)
