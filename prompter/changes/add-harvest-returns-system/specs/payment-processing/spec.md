## ADDED Requirements

### Requirement: Payout Transaction Type
The Transaction Ledger System SHALL support a `payout` transaction type, created by EPIC-010 (Payment Gateway) when a payout disbursement is initiated. This requirement establishes the type definition and foreign key linkage so the payment-processing and payout-distribution capabilities remain consistently mapped.

#### Scenario: Payout transaction record created on disbursement
- **WHEN** EPIC-010 initiates disbursement for a `Payout` record
- **THEN** a `Transaction` record is created with `type = payout`, `related_payout_id = payout.id`, `amount_cents = payout.net_amount_cents`, `currency = payout.currency`, `status = pending`
- **AND** the `Transaction.id` is stored in `Payout.transaction_id`
- **AND** the transaction follows the standard lifecycle: `pending → completed / failed`

#### Scenario: Payout transaction type included in transaction history
- **WHEN** a user views their transaction history
- **THEN** transactions with `type = payout` are included in the results
- **AND** each payout transaction displays: type label "Payout", amount, harvest date, fruit type, farm name, and link to `/investor/payouts/{payout_id}`
