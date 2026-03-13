# investor-wallet Spec Delta

## Change: implement-farm-owner-core-platform

## ADDED Requirements

### Requirement: Wallet Creation and Balance Tracking
Each user SHALL have exactly one in-platform wallet that tracks their available balance across all payout credits and debits.

#### Scenario: Wallet auto-created on first credit
- **WHEN** a payout is first credited to a user who has no wallet record
- **THEN** the system creates a `Wallet` record with `balance_cents = 0, currency = MYR` and then credits the amount
- **AND** subsequent operations use the same wallet record

#### Scenario: Investor views wallet balance
- **WHEN** an investor navigates to `/investor/wallet`
- **THEN** the system displays: current balance (RM formatted), currency, recent transaction history (last 20 entries)
- **AND** each transaction shows: type badge, amount (credit/debit), reference (lot name or "Withdrawal"), date

#### Scenario: Wallet balance cannot go negative
- **WHEN** a debit operation would reduce `balance_cents` below 0
- **THEN** the system throws `InsufficientWalletBalanceException`
- **AND** the wallet record remains unchanged

#### Scenario: Concurrent debits do not cause negative balance
- **WHEN** two simultaneous withdrawal requests are submitted for the same wallet
- **THEN** the system uses `lockForUpdate()` inside a `DB::transaction()` to serialise writes
- **AND** the second debit fails if the balance would become negative

---

### Requirement: Automatic Profit Credit to Wallets
The system SHALL automatically credit investor and farm owner wallets when lot profit distribution completes.

#### Scenario: Investor wallet credited after lot completion
- **WHEN** `LotSellingService::distributeProfits()` completes for a lot
- **THEN** `WalletService::credit()` is called for each investor with their proportional share
- **AND** a `WalletTransaction` record is created with `transaction_type = payout_credit`, `reference_type = 'Lot'`, `reference_id = lot_id`
- **AND** `wallet.balance_cents` increases by `net_investor_payout_cents`

#### Scenario: Farm owner wallet credited after lot completion
- **WHEN** `LotSellingService::distributeProfits()` completes
- **THEN** `WalletService::credit()` is called for the farm owner with their 30% share
- **AND** a `WalletTransaction` record is created with `transaction_type = payout_credit`

#### Scenario: Platform fee credited to platform wallet
- **WHEN** `LotSellingService::distributeProfits()` completes
- **THEN** the 10% platform fee is credited to the platform's system wallet (user_id = null or a designated system user)
- **AND** a `WalletTransaction` record is created with `transaction_type = platform_fee`

---

### Requirement: Profit Sharing Formula
The system SHALL distribute lot revenue using the defined percentage split formula.

#### Scenario: Platform fee calculated at 10%
- **WHEN** a lot has `selling_revenue_cents = 1000000` (RM 10,000)
- **THEN** `platform_fee_cents = floor(1000000 × 0.10) = 100000`

#### Scenario: Remaining revenue split 70% investors / 30% farm owner
- **WHEN** `remaining_cents = 1000000 - 100000 = 900000`
- **THEN** `investor_pool_cents = floor(900000 × 0.70) = 630000`
- **AND** `farm_owner_payout_cents = 900000 - 630000 = 270000`

#### Scenario: Investor shares distributed proportionally by investment amount
- **WHEN** investor A has `investment.amount_cents = 20000` and investor B has `investment.amount_cents = 30000` and `investor_pool_cents = 630000`  
- **THEN** investor A receives `floor(630000 × 20000 / 50000) = 252000` cents
- **AND** investor B receives `floor(630000 × 30000 / 50000) = 378000` cents
- **AND** if rounding residual exists, it is credited to the investor with the largest investment

---

### Requirement: Wallet Withdrawal
Investors and farm owners SHALL be able to withdraw available wallet balance to their registered bank account.

#### Scenario: User initiates withdrawal
- **WHEN** an investor submits a withdrawal request for `amount_cents` ≤ `wallet.balance_cents`
- **THEN** the system debits the wallet: balance decreases by `amount_cents`
- **AND** creates a `WalletTransaction` with `transaction_type = withdrawal`
- **AND** queues a bank transfer job (EPIC-010 integration) for the amount
- **AND** displays: "Withdrawal of RM [amount] submitted. Processing time: 1–3 business days."

#### Scenario: Withdrawal exceeding balance rejected
- **WHEN** an investor submits a withdrawal request exceeding their balance
- **THEN** the system returns error: "Insufficient wallet balance. Available: RM [balance]."

#### Scenario: Minimum withdrawal amount enforced
- **WHEN** an investor submits a withdrawal for `amount_cents < 1000` (RM 10.00)
- **THEN** the system returns validation error: "Minimum withdrawal amount is RM 10.00."

---

### Requirement: Wallet Reinvestment
Investors SHALL be able to use their wallet balance to purchase new lot investments without an external payment.

#### Scenario: Investor reinvests wallet balance into a lot
- **WHEN** an investor selects a lot and chooses "Pay from Wallet" with sufficient balance
- **THEN** the system debits the wallet for `lot.current_price_per_tree_cents × lot.total_trees`
- **AND** creates a `WalletTransaction` with `transaction_type = reinvestment`, `reference_type = 'Lot'`
- **AND** creates an `Investment` record with `status = active` (no payment gateway needed — immediate activation)

#### Scenario: Reinvestment with insufficient wallet balance rejected
- **WHEN** wallet balance is less than lot total cost
- **THEN** the system returns error: "Insufficient wallet balance for this investment. Balance: RM [X]. Required: RM [Y]. You can top up via bank transfer."

#### Scenario: Reinvestment bypasses KYC payment gateway check but still requires KYC
- **WHEN** an investor with verified KYC reinvests from wallet
- **THEN** the system does NOT route through Stripe payment flow
- **AND** KYC status is still validated before allowing reinvestment
