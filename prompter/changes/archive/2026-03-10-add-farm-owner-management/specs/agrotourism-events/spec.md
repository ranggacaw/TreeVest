## ADDED Requirements

### Requirement: Agrotourism Event Management by Farm Owners
Farm owners SHALL be able to create, edit, and cancel agrotourism events for farms they own.

#### Scenario: Farm owner creates an agrotourism event
- **WHEN** a farm owner submits an agrotourism event form with title, description, event_date (future datetime), event_type (online/offline/hybrid), optional max_capacity, and optional location_notes
- **THEN** the system creates an `AgrotourismEvent` record linked to the farm with `is_registration_open = true`
- **AND** the event appears on the public farm profile page
- **AND** the system creates an audit log entry

#### Scenario: Farm owner cannot create event for another owner's farm
- **WHEN** a farm owner attempts to create an event for a farm they do not own
- **THEN** the system returns HTTP 403 Forbidden

#### Scenario: Event date must be in the future
- **WHEN** a farm owner submits an event with `event_date` in the past
- **THEN** the system returns a validation error "Event date must be in the future"

#### Scenario: Farm owner cancels an event
- **WHEN** a farm owner cancels an agrotourism event with existing registrations
- **THEN** the system sets `cancelled_at` on the event
- **AND** the system dispatches `AgrotourismEventCancelled` to notify all registered investors
- **AND** the event is shown as cancelled on the farm profile (not deleted)

#### Scenario: Farm owner closes registrations
- **WHEN** a farm owner closes registrations for an event
- **THEN** the system sets `is_registration_open = false` on the event
- **AND** new investor registrations are rejected for that event

### Requirement: Agrotourism Event Registration by Investors
Authenticated investors SHALL be able to register for agrotourism events (online or offline) and view their registrations.

#### Scenario: Investor registers for an online event
- **WHEN** an authenticated investor submits a registration request with `registration_type = online` for an open event that is not full
- **THEN** the system creates an `AgrotourismRegistration` record with `status = confirmed`, `confirmed_at = now()`
- **AND** the system dispatches `AgrotourismRegistrationConfirmed` to notify the investor
- **AND** the investor's registration appears in their upcoming events

#### Scenario: Investor registers for an offline event
- **WHEN** an authenticated investor submits a registration request with `registration_type = offline` for an open event
- **THEN** the system creates an `AgrotourismRegistration` record with `status = pending`
- **AND** the farm owner can review and confirm the registration
- **AND** no automatic confirmation notification is sent

#### Scenario: Investor cannot register twice for the same event
- **WHEN** an investor attempts to register for an event they are already registered for
- **THEN** the system returns a validation error "You are already registered for this event"

#### Scenario: Registration rejected when event is at full capacity
- **WHEN** an investor attempts to register for an event where confirmed registration count equals `max_capacity`
- **THEN** the system returns a validation error "This event has reached maximum capacity"

#### Scenario: Registration rejected when event is closed
- **WHEN** an investor attempts to register for an event with `is_registration_open = false`
- **THEN** the system returns a validation error "Registration for this event is closed"

#### Scenario: Registration rejected when event is cancelled
- **WHEN** an investor attempts to register for a cancelled event (`cancelled_at` is not null)
- **THEN** the system returns a validation error "This event has been cancelled"

#### Scenario: Unauthenticated user cannot register
- **WHEN** an unauthenticated user attempts to submit a registration for an event
- **THEN** the system returns HTTP 401 Unauthorized and redirects to login

#### Scenario: Investor cancels their registration
- **WHEN** an investor cancels their own registration for an event
- **THEN** the system sets `status = cancelled` and `cancelled_at = now()` on the registration
- **AND** the registration slot is freed for other investors if the event has a capacity limit

### Requirement: Agrotourism Event Visibility on Farm Profile
Upcoming and open agrotourism events SHALL be visible to all authenticated users on the public farm profile page.

#### Scenario: Investor views upcoming events on farm profile
- **WHEN** an investor views a farm profile for a farm with upcoming events
- **THEN** the system displays all non-cancelled events with `event_date >= now()`, ordered by `event_date` ascending
- **AND** each event card shows: title, date/time, event type badge, remaining capacity, registration button (if authenticated and not already registered)

#### Scenario: No events section shown when farm has no upcoming events
- **WHEN** an investor views a farm profile with no upcoming non-cancelled events
- **THEN** the system displays an empty state message "No upcoming agrotourism events scheduled"

### Requirement: Agrotourism Event Notifications
The system SHALL notify investors of agrotourism registration confirmation and event cancellation.

#### Scenario: Investor notified on online registration confirmed
- **WHEN** an online `AgrotourismRegistrationConfirmed` event is dispatched
- **THEN** the `NotifyInvestorOfRegistrationConfirmation` listener dispatches a notification to the investor
- **AND** the notification type is `general` with message: "Your registration for [Event Title] at [Farm Name] on [Date] has been confirmed."
- **AND** the notification action links to the farm profile

#### Scenario: Investors notified when event is cancelled
- **WHEN** an `AgrotourismEventCancelled` event is dispatched
- **THEN** the `NotifyInvestorsOfEventCancellation` listener dispatches notifications to all registered investors with `status != cancelled`
- **AND** the notification type is `general` with message: "[Event Title] at [Farm Name] scheduled for [Date] has been cancelled."

### Requirement: Admin Agrotourism Event Oversight
Admins SHALL be able to view all agrotourism events across farms and suspend events that violate platform policies.

#### Scenario: Admin views all agrotourism events
- **WHEN** an admin navigates to `/admin/agrotourism`
- **THEN** the system displays all events with filters: farm, event_type, status (upcoming, past, cancelled), date range
- **AND** each row shows: event title, farm name, event type, date, registration count, status

#### Scenario: Admin suspends an event
- **WHEN** an admin suspends an agrotourism event
- **THEN** the system sets `cancelled_at = now()` on the event
- **AND** the system dispatches `AgrotourismEventCancelled` to notify registered investors
- **AND** the system creates an audit log entry with admin user ID
