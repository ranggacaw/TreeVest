## MODIFIED Requirements

### Requirement: Investment List Display on Dashboard
The portfolio dashboard SHALL display a holdings list where each investment row shows lot details, quantity of trees purchased (with token IDs), current value, and per-investment gain/loss.

#### Scenario: Holdings list displayed
- **WHEN** an investor views the portfolio dashboard "Holdings" tab
- **THEN** the system displays a scrollable list of investment rows, each showing:
  - Lot thumbnail (farm featured image)
  - Lot name and fruit type/variant (e.g., "LOT-DURIAN-001 — Durian Musang King")
  - **Quantity** (number of trees purchased, e.g., "3 trees")
  - **Tree tokens** (compact display of token IDs, e.g., `TRX-00001-001, TRX-00001-002, TRX-00001-003`)
  - Amount invested (`amount_cents` at purchase time, formatted)
  - Total payouts received for this investment
  - Gain/Loss (total payouts − amount invested, with +/− prefix, green/red colouring)
  - Gain/Loss % ((gain/loss ÷ amount invested) × 100, 2 d.p.)
  - Lot lifecycle stage badge
  - "View Details" link to `/investments/{id}`
- **AND** rows are ordered by `purchase_date DESC` by default
- **AND** a sort control allows sorting by: Date (default), Gain/Loss %, Investment Amount

#### Scenario: Performance sparkline per holding
- **WHEN** a holding row is rendered and the investment has ≥ 2 completed payouts
- **THEN** a mini sparkline chart is rendered on the row showing cumulative payout value over time
- **AND** the sparkline uses green colour if total payouts > 0, gray if no payouts yet
- **AND** the sparkline is rendered using a lightweight Recharts `LineChart` (no axes, no labels, 60×24 px)

#### Scenario: Holdings list empty state
- **WHEN** an investor has no investments
- **THEN** the holdings list displays: "No holdings yet. Browse available trees to start investing."
- **AND** a "Browse Marketplace" button is shown linking to `/trees`

#### Scenario: Holdings list pagination
- **WHEN** an investor has more than 20 holdings
- **THEN** the holdings list paginates at 20 items per page
- **AND** pagination controls are displayed at the bottom of the list
