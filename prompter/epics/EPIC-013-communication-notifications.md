# EPIC-013: Implement Communication & Notifications

> **Status:** DRAFT (PRD-based, pending FSD/TDD-Lite refinement)

## Business Value Statement
Keep users informed and engaged through timely, multi-channel communications including push notifications, email, in-app messaging, and customer support chat. Effective communication drives investor confidence, platform engagement, and operational efficiency.

## Description
This EPIC implements the full communication stack: push notifications (mobile and web), email notifications, in-app messaging between users, and customer support chat. Notifications cover investment opportunities, harvest updates, payment confirmations, market alerts, and system messages. The EPIC establishes the notification infrastructure that other EPICs consume to deliver alerts and updates.

## Source Traceability
| Document | Reference | Section/Page |
|----------|-----------|--------------|
| PRD | In-app messaging system | Section 7 - Communication Features |
| PRD | Push notifications (all types) | Section 7 - Communication Features |
| PRD | Email notifications | Section 7 - Communication Features |
| PRD | Customer support chat | Section 7 - Communication Features |
| PRD | SMS/Email notification services | Technical Specifications - Key Integrations |
| AGENTS.md | Notification Entity | Section 6 - Data Models |
| AGENTS.md | Message Entity | Section 6 - Data Models |

## Scope Definition
| In Scope | Out of Scope |
|----------|--------------|
| Push notification infrastructure (mobile + web) | Specific notification content/triggers from other EPICs |
| Email notification infrastructure | Automated notification rules for harvests (EPIC-009) |
| SMS notification infrastructure | Weather alert generation (EPIC-008) |
| In-app notification center (read/unread, history) | |
| In-app messaging between users | |
| Customer support chat system | |
| Notification preference management (opt-in/out per channel) | |
| Notification templates and management | |
| Notification delivery status tracking | |
| Notification API for other services to consume | |

## High-Level Acceptance Criteria
- [ ] Web push notifications are supported (mobile push deferred — native apps are future scope)
- [ ] Email notifications are sent for key platform events
- [ ] SMS notifications are supported as a fallback/optional channel
- [ ] In-app notification center shows all notifications with read/unread status
- [ ] Users can manage notification preferences (enable/disable per channel per type)
- [ ] In-app messaging allows direct communication between users
- [ ] Customer support chat is accessible from all platform areas
- [ ] Notification templates are configurable by admins
- [ ] Notification delivery status is tracked (sent, delivered, failed)
- [ ] Notification API is available for other services to trigger notifications
- [ ] Notifications support the following event types: investment opportunities, harvest updates, payment confirmations, market alerts

## Dependencies
- **Prerequisite EPICs:** EPIC-001 (User Auth - notifications linked to users)
- **External Dependencies:** Push notification service (FCM/APNs), email service provider, SMS gateway
- **Technical Prerequisites:**
  - Laravel Notification system (mail, database, broadcast channels)
  - Laravel Broadcasting with Pusher or Soketi for real-time WebSocket notifications
  - Laravel Mail with transactional email provider (SendGrid, Mailgun, or SES)
  - Laravel queue jobs (database driver) for async notification dispatch
  - Eloquent models for Notification, Message entities
  - Inertia::render() pages for notification center, messaging UI, and preference management
  - React components for real-time notification badges and toasts via Laravel Echo

## Complexity Assessment
- **Size:** M
- **Technical Complexity:** Medium (multi-channel delivery, message queuing)
- **Integration Complexity:** High (push services, email/SMS providers, support chat)
- **Estimated Story Count:** 8-12

## Risks & Assumptions
**Assumptions:**
- Notifications dispatched via Laravel's built-in Notification system with database, mail, and broadcast channels
- Real-time in-app notifications use Laravel Broadcasting (Pusher/Soketi) + Laravel Echo on the React frontend
- Email notifications use Laravel Mail with Blade/Markdown mail templates
- In-app messaging stored in MySQL via Eloquent models
- Notification preferences stored per-user in MySQL
- Customer support chat is a third-party widget (Intercom, Zendesk, Crisp) embedded in the React layout — not built from scratch
- Push notifications to mobile deferred (mobile apps are future scope)
- In-app messaging is simple direct messaging (not group chat)

**Risks:**
- Push notification delivery rates vary by device and OS
- SMS costs can be significant, especially for international numbers
- Notification fatigue from too many alerts could drive users away
- In-app messaging could be abused (spam, scams between users)
- Customer support chat selection affects cost and integration complexity
- Real-time messaging requires WebSocket infrastructure
- WebSocket infrastructure (Pusher/Soketi) adds operational complexity beyond the database-backed queue/cache stack

## Related EPICs
- **Depends On:** EPIC-001 (User Auth)
- **Blocks:** EPIC-008 (Health Monitoring - uses notification delivery)
- **Related:** EPIC-006 (Investment - purchase confirmations), EPIC-009 (Harvest - harvest alerts), EPIC-010 (Payments - payment confirmations)
