# Epic: Farm Owner Management

## 🧠 Epic: Farm Owner Tree Inventory, Geolocation & Agrotourism Management

### 🎯 Epic Goal
We need to provide Farm Owners with a comprehensive farm setup and management experience — covering per-tree investment configuration, productive tree classification, GPS-based geolocation, agrotourism registration, and a transparent 60/40 profit-sharing calculation — in order for **Farm Owners** to accurately represent their farm's investment capacity and for **Investors** to make confident, location-aware investment decisions and engage directly with the farms they support.

---

### 🚀 Definition of Done
- A Farm Owner can define the **total number of trees** per species on their farm and mark how many are **productive** (eligible for investment returns).
- Investment ROI displayed to investors is computed exclusively against the **productive tree count**, not total tree count.
- Each farm has a mandatory **GPS coordinate field** (latitude + longitude) that is rendered on an interactive map (Google Maps or Mapbox) on the farm profile and marketplace.
- A Farm Owner can create and manage **Agrotourism events** (online or offline registration), visible to investors on the farm profile.
- Investors can **register for agrotourism events** (online via the platform or mark offline intent).
- The platform enforces and displays the **60% Farm Owner / 40% Investor profit split** for all harvest-based payout calculations.
- All payout calculations incorporate the 60/40 split rule and produce auditable records.
- Unit and feature tests cover tree inventory logic, productive-tree ROI calculation, agrotourism registration, and profit-split calculations.
- Admin can view and moderate agrotourism events.

---

### 📌 High-Level Scope (Included)

**Tree Inventory & Productive Tree Management**
- Farm Owner can input total tree count per species (`FruitCrop`) on a farm.
- Farm Owner can designate a subset as **productive trees** (e.g., 8 of 10 are productive).
- ROI estimation shown to investors is based solely on productive tree count.
- System validates: `productive_trees <= total_trees` at all times.
- Harvest yield and payout calculations reference productive trees only.

**Geolocation (GPS + Map)**
- `farms` table stores `latitude` and `longitude` (decimal precision, nullable with validation on publish).
- Farm profile page renders an interactive map pin using the stored coordinates.
- Marketplace farm cards display a mini-map or "View on Map" link.
- Farm Owner can set/update coordinates via a map picker UI or manual lat/lng input.
- GPS coordinates are validated on submission (valid range: lat −90 to +90, lng −180 to +180).

**Agrotourism Features**
- Farm Owner can create **Agrotourism Events**: title, description, date/time, max capacity, location notes, event type (online / offline / hybrid).
- Events are listed on the public farm profile page, visible to authenticated investors.
- Investors can **register** for agrotourism events:
  - **Online:** Platform-managed registration with confirmation notification.
  - **Offline:** Expression of interest recorded; Farm Owner contacts investor directly.
- Farm Owner can manage event registrations: view attendees, close registrations, cancel events.
- Admin can view all agrotourism events across farms; can moderate/suspend events.
- Notifications sent to investor upon registration confirmation or event cancellation.

**Profit & Loss Calculation — 60/40 Split**
- Platform enforces a fixed profit split: **60% to Farm Owner, 40% to Investor** per harvest.
- `Payout` model calculates investor share as: `net_harvest_revenue * 0.40 * (investor_trees / total_productive_trees)`.
- Farm Owner's 60% share is tracked in financial records but not paid out through the investor payout pipeline.
- The profit split ratio is displayed on investment detail pages, farm profiles, and payout summaries.
- Split configuration is stored as a platform-level constant (not per-farm configurable in this epic).

---

### ❌ Out of Scope
- Native mobile app UI for agrotourism or map features (web-only in current phase).
- Dynamic / per-farm configurable profit split ratios (fixed 60/40 only in this epic).
- Virtual 360° farm tours (deferred per project non-goals).
- Gamification or rewards tied to agrotourism attendance.
- Payment collection for agrotourism event tickets (events are free-to-register in this epic).
- Multi-currency payout in agrotourism-related transactions.
- Geofencing or proximity-based push notifications.
- Farm Owner receiving a direct payout from the platform for their 60% share (tracked only; payout channel to be defined in a separate financial epic).

---

### 📁 Deliverables

**Backend**
- Migration: add `latitude`, `longitude` to `farms` table.
- Migration: add `total_trees`, `productive_trees` to `fruit_crops` table.
- Migration: new `agrotourism_events` table (id, farm_id, title, description, event_date, event_type enum, max_capacity, is_registration_open, cancelled_at, timestamps).
- Migration: new `agrotourism_registrations` table (id, event_id, user_id, registration_type enum online/offline, status, confirmed_at, cancelled_at, timestamps).
- `FruitCrop` model update: `total_trees`, `productive_trees` attributes with `productive_trees <= total_trees` validation.
- `Farm` model update: `latitude`, `longitude` with coordinate accessors.
- `AgrotourismEvent` Eloquent model with relationships (`farm`, `registrations`).
- `AgrotourismRegistration` Eloquent model with relationships (`event`, `investor`).
- `AgrotourismService`: create/update/cancel events, register investor, close registrations.
- `ProfitCalculationService`: updated with 60/40 split logic, isolated and unit-tested.
- FormRequests: `StoreAgrotourismEventRequest`, `UpdateAgrotourismEventRequest`, `StoreAgrotourismRegistrationRequest`.
- Controllers: `FarmOwner\AgrotourismController`, `Investor\AgrotourismController`, `Admin\AgrotourismController`.
- Enums: `AgrotourismEventType` (online, offline, hybrid), `AgrotourismRegistrationStatus` (pending, confirmed, cancelled).
- Events/Listeners: `AgrotourismRegistrationConfirmed`, `AgrotourismEventCancelled` → notify investors.

**Frontend (React/TypeScript/Inertia)**
- `FarmOwner/Farms/Edit.tsx`: add tree inventory fields (`total_trees`, `productive_trees` per crop) and GPS map picker.
- `FarmOwner/Agrotourism/Index.tsx`: list and manage events.
- `FarmOwner/Agrotourism/Create.tsx` / `Edit.tsx`: create/edit agrotourism event form.
- `FarmOwner/Agrotourism/Show.tsx`: event detail with attendee list.
- `Farms/Show.tsx` (public): add GPS map embed, agrotourism events section.
- `Investor/Agrotourism/Index.tsx`: discover and register for events.
- `Components/MapPicker.tsx`: reusable map coordinate picker (Google Maps / Mapbox JS SDK).
- `Components/AgrotourismEventCard.tsx`: event summary card for farm profile and investor discovery.
- Profit split (60/40) label displayed on `Investments/Show.tsx` and payout summary views.

---

### 🧩 Dependencies

- **Google Maps JS SDK or Mapbox GL JS** — must be selected and integrated for map picker and farm profile map embed (currently listed as `High` priority external dependency in project.md).
- **`FruitCrop` model** — must already exist with `farm_id` FK before adding tree inventory fields.
- **`Farm` model** — must already exist before adding geolocation fields.
- **`ProfitCalculationService`** — may already exist (listed in AGENTS.md); must be updated or created to enforce 60/40 split.
- **`PayoutService`** — downstream consumer of `ProfitCalculationService`; must be updated to use new split logic.
- **Notification infrastructure** — required for agrotourism event confirmation/cancellation emails (Laravel Mail + notification channels).
- **KYC Verification** — investors must be authenticated (but KYC enforcement for agrotourism registration is TBD — may allow non-KYC investors to register for events).
- **`Investment` model and investor-tree relationship** — needed to correctly calculate each investor's proportional 40% share.

---

### ⚠️ Risks / Assumptions

- **Assumption:** The 60/40 profit split is a fixed platform-wide rule and does not vary per farm or investment contract in this epic. If this changes, the `ProfitCalculationService` will need a configurable rate model.
- **Assumption:** "Productive trees" is defined per `FruitCrop` (species × farm combination), not per individual `Tree` record. This must be validated against ERD when it is created.
- **Risk:** Map provider selection (Google Maps vs Mapbox) is not finalized. If the choice changes mid-implementation, the `MapPicker` component will need to be re-built. Decision should be locked before frontend development begins.
- **Risk:** Agrotourism events with offline registration have no payment or contract mechanism — this is intentional in scope, but may create support overhead if investors no-show.
- **Assumption:** Farm Owners can only manage agrotourism events for farms they own. Cross-farm event management is not supported.
- **Risk:** GPS coordinates entered manually or via map picker may be inaccurate for large farms. A tolerance/accuracy note should be displayed in the UI.
- **Risk:** Payout calculation changes (60/40 split) are a **breaking change** to existing `ProfitCalculationService` if it currently assumes 100% goes to investor. All downstream consumers must be audited before deployment.
- **Assumption:** Agrotourism events are informational only (no ticketing fee) in this epic. Paid events are out of scope.

---

### 🎯 Success Metrics

- 100% of productive farm listings have valid GPS coordinates before being published to the marketplace.
- Investor-facing ROI projections are always derived from `productive_trees`, never `total_trees`.
- Profit split (60/40) is applied on 100% of completed harvest payouts with no manual overrides.
- Agrotourism event registration confirmation notification delivered within 60 seconds of sign-up.
- Farm Owner can create an agrotourism event end-to-end in < 5 minutes from the dashboard.
- Zero payout calculation discrepancies in regression tests after 60/40 split rollout.
- Geolocation field validation rejects 100% of out-of-range coordinate inputs (e.g., lat > 90).
