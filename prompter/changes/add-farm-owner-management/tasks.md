# Tasks: Farm Owner Tree Inventory, Geolocation, Agrotourism & Profit Split

## 1. Database Migrations

- [ ] 1.1 Create migration: add `total_trees` (unsignedInteger, default 0) and `productive_trees` (unsignedInteger, default 0) to `fruit_crops` table
- [ ] 1.2 Create migration: `create_agrotourism_events_table` — `id, farm_id (FK farms cascade), title, description (text), event_date (datetime), event_type (enum: online|offline|hybrid), max_capacity (unsignedInteger nullable), location_notes (text nullable), is_registration_open (boolean, default true), cancelled_at (timestamp nullable), timestamps, softDeletes`
- [ ] 1.3 Create migration: `create_agrotourism_registrations_table` — `id, event_id (FK agrotourism_events cascade), user_id (FK users cascade), registration_type (enum: online|offline), status (enum: pending|confirmed|cancelled, default pending), confirmed_at (timestamp nullable), cancelled_at (timestamp nullable), timestamps`; add unique index `(event_id, user_id)`

## 2. Backend Enums

- [ ] 2.1 Create `app/Enums/AgrotourismEventType.php` — backed string enum: `Online`, `Offline`, `Hybrid`
- [ ] 2.2 Create `app/Enums/AgrotourismRegistrationStatus.php` — backed string enum: `Pending`, `Confirmed`, `Cancelled`

## 3. Backend Models

- [ ] 3.1 Update `FruitCrop` model: add `total_trees`, `productive_trees` to `$fillable`; add integer casts; add `Validator` boot hook enforcing `productive_trees <= total_trees`
- [ ] 3.2 Create `app/Models/AgrotourismEvent.php` — fillable, casts (`event_type` → enum, `event_date` → datetime, `cancelled_at` → datetime), relationships: `farm()`, `registrations()`, `confirmedRegistrations()`; scopes: `scopeUpcoming()`, `scopeOpen()`; methods: `isCancelled()`, `isFull()`
- [ ] 3.3 Create `app/Models/AgrotourismRegistration.php` — fillable, casts (`registration_type` → enum, `status` → enum), relationships: `event()`, `investor()`

## 4. Backend Events & Listeners

- [ ] 4.1 Create `app/Events/AgrotourismRegistrationConfirmed.php`
- [ ] 4.2 Create `app/Events/AgrotourismEventCancelled.php`
- [ ] 4.3 Create `app/Listeners/NotifyInvestorOfRegistrationConfirmation.php`
- [ ] 4.4 Create `app/Listeners/NotifyInvestorsOfEventCancellation.php`
- [ ] 4.5 Register events + listeners in `EventServiceProvider`

## 5. AgrotourismService

- [ ] 5.1 Create `app/Services/AgrotourismService.php` with methods:
  - `createEvent(Farm $farm, array $data): AgrotourismEvent`
  - `updateEvent(AgrotourismEvent $event, array $data): AgrotourismEvent`
  - `cancelEvent(AgrotourismEvent $event): AgrotourismEvent` — sets `cancelled_at`, dispatches `AgrotourismEventCancelled`
  - `registerInvestor(AgrotourismEvent $event, User $investor, string $type): AgrotourismRegistration` — enforces capacity, guards duplicates, dispatches `AgrotourismRegistrationConfirmed` for online registrations
  - `cancelRegistration(AgrotourismRegistration $registration): AgrotourismRegistration`
  - `closeRegistrations(AgrotourismEvent $event): AgrotourismEvent`

## 6. ProfitCalculationService Update (BREAKING)

- [ ] 6.1 Update `ProfitCalculationService::calculate()`:
  - Add constant `INVESTOR_SHARE_RATE = 0.40`
  - Calculate `investorPoolCents = ROUND(totalYieldCents * INVESTOR_SHARE_RATE)`
  - Replace `totalYieldCents` with `investorPoolCents` in all per-investor proportional calculations
  - Store `farm_owner_share_cents` in the harvest record (or a dedicated audit field) for financial records
  - Update docblock and log context with split details
- [ ] 6.2 Update all unit tests for `ProfitCalculationService` to use the new 40% base

## 7. FormRequests

- [ ] 7.1 Create `StoreAgrotourismEventRequest` — rules: `title` required string max:255 NoXss, `description` required string NoXss, `event_date` required date after:now, `event_type` required in enum values, `max_capacity` nullable integer min:1, `location_notes` nullable string NoXss
- [ ] 7.2 Create `UpdateAgrotourismEventRequest` — same rules, all optional except event_date; `authorize()` checks farm ownership
- [ ] 7.3 Create `StoreAgrotourismRegistrationRequest` — rules: `registration_type` required in (online, offline)
- [ ] 7.4 Update `StoreFruitCropRequest` / `UpdateFruitCropRequest` to include `total_trees` (integer min:0) and `productive_trees` (integer min:0, lte:total_trees)
- [ ] 7.5 Ensure GPS validation is enforced in `StoreFarmRequest` / `UpdateFarmRequest`: `latitude` numeric between:-90,90; `longitude` numeric between:-180,180 (already stored but may lack range validation)

## 8. Controllers

- [ ] 8.1 Create `app/Http/Controllers/FarmOwner/AgrotourismController.php` — CRUD + cancel actions (`index`, `create`, `store`, `show`, `edit`, `update`, `cancel`, `closeRegistrations`)
- [ ] 8.2 Create `app/Http/Controllers/Investor/AgrotourismController.php` — `index` (discover events), `register` (POST), `cancelRegistration` (DELETE)
- [ ] 8.3 Create `app/Http/Controllers/Admin/AgrotourismController.php` — `index` (all events), `suspend` (POST)

## 9. Routes

- [ ] 9.1 Add farm owner agrotourism routes under `role:farm_owner` middleware group: standard resource routes + `POST /farm-owner/agrotourism/{event}/cancel`, `POST /farm-owner/agrotourism/{event}/close-registrations`
- [ ] 9.2 Add investor agrotourism routes under `role:investor` middleware group: `GET /investor/agrotourism`, `POST /investor/agrotourism/{event}/register`, `DELETE /investor/agrotourism/registrations/{registration}`
- [ ] 9.3 Add admin agrotourism routes under `role:admin` middleware group: `GET /admin/agrotourism`, `POST /admin/agrotourism/{event}/suspend`

## 10. Frontend Pages & Components

- [ ] 10.1 Create `resources/js/Components/MapPicker.tsx` — Google Maps JS SDK, accepts `lat`/`lng` props, emits `onChange({lat, lng})`, displays draggable marker
- [ ] 10.2 Create `resources/js/Components/AgrotourismEventCard.tsx` — card displaying event title, date, type badge, capacity indicator, registration status/button
- [ ] 10.3 Create `resources/js/Pages/FarmOwner/Agrotourism/Index.tsx` — list of farm's events with status badges and management actions
- [ ] 10.4 Create `resources/js/Pages/FarmOwner/Agrotourism/Create.tsx` — event creation form
- [ ] 10.5 Create `resources/js/Pages/FarmOwner/Agrotourism/Edit.tsx` — event edit form
- [ ] 10.6 Create `resources/js/Pages/FarmOwner/Agrotourism/Show.tsx` — event detail with attendee list and management controls
- [ ] 10.7 Create `resources/js/Pages/Investor/Agrotourism/Index.tsx` — discover events, filter by farm/type, register
- [ ] 10.8 Update `resources/js/Pages/FarmOwner/Farms/Edit.tsx` — add `total_trees`/`productive_trees` fields per crop, add `MapPicker` for GPS coordinates
- [ ] 10.9 Update `resources/js/Pages/Farms/Show.tsx` (public) — add Google Maps embed with farm pin, add agrotourism events section
- [ ] 10.10 Update `resources/js/Pages/Investments/Show.tsx` — add 60/40 profit split label in payout breakdown section
- [ ] 10.11 Add TypeScript interfaces: `AgrotourismEvent`, `AgrotourismRegistration`, `AgrotourismEventType`, `AgrotourismRegistrationStatus` to `resources/js/types/index.d.ts`

## 11. Tests

- [ ] 11.1 Unit test: `ProfitCalculationServiceTest` — update existing scenarios with 60/40 split; verify `investorPoolCents = ROUND(totalYieldCents * 0.40)` as the base for proportional distribution
- [ ] 11.2 Unit test: `AgrotourismServiceTest` — event creation, investor registration (happy path, capacity full, duplicate registration), event cancellation, close registrations
- [ ] 11.3 Feature test: `FarmOwner/AgrotourismControllerTest` — CRUD actions, authorization (farm owner can only manage their own farms' events), cancel event, close registrations
- [ ] 11.4 Feature test: `Investor/AgrotourismControllerTest` — discover events, register online/offline, cancel registration
- [ ] 11.5 Feature test: `Admin/AgrotourismControllerTest` — view all events, suspend event
- [ ] 11.6 Feature test: `FruitCropControllerTest` — tree inventory fields stored correctly, `productive_trees > total_trees` rejected
- [ ] 11.7 Feature test: GPS coordinate validation — lat/lng out of range rejected, valid range accepted

## Post-Implementation

- [ ] Update `AGENTS.md` in the project root to reflect: new models (`AgrotourismEvent`, `AgrotourismRegistration`), new service (`AgrotourismService`), updated `ProfitCalculationService`, new enums, new controllers and routes
