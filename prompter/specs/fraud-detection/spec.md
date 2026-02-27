# fraud-detection Specification

## Purpose
TBD - created by archiving change add-security-compliance-infrastructure. Update Purpose after archive.
## Requirements
### Requirement: Rule-Based Fraud Detection Engine
The system SHALL implement a pluggable rule-based fraud detection engine that evaluates transactions against configurable rules and generates fraud alerts for administrator review.

#### Scenario: Transaction evaluated against fraud rules
- **WHEN** an investment purchase transaction is created
- **THEN** the `FraudDetectionService` evaluates the transaction against all active fraud rules
- **AND** if any rule is triggered, a `FraudAlert` record is created

#### Scenario: Multiple fraud rules evaluated
- **WHEN** a transaction is submitted for fraud detection
- **THEN** all registered rules (`RapidInvestmentRule`, `UnusualAmountRule`, `MultipleFailedAuthRule`) are evaluated
- **AND** the first rule that triggers generates an alert (short-circuit evaluation optional based on configuration)

#### Scenario: No fraud detected
- **WHEN** a transaction is evaluated and no rules are triggered
- **THEN** no `FraudAlert` is created
- **AND** the transaction proceeds normally without delay

### Requirement: Rapid Investment Rule
The system SHALL detect and flag users who make an unusually high number of investment purchases within a short time window (e.g., more than 5 investments in 1 hour) as potential fraud or account compromise.

#### Scenario: Rapid investment pattern detected
- **WHEN** a user makes their 6th investment purchase within a 1-hour window
- **THEN** a `FraudAlert` is created with rule type `RAPID_INVESTMENTS` and severity `medium`
- **AND** the alert includes context: user ID, investment IDs, timestamps of all purchases in the window

#### Scenario: Threshold configurable
- **WHEN** `config('fraud-detection.rapid_investment_threshold')` is set to `10`
- **THEN** the rule triggers only when a user makes more than 10 investments in 1 hour
- **AND** the threshold can be tuned without code changes

#### Scenario: Time window configurable
- **WHEN** `config('fraud-detection.rapid_investment_window_minutes')` is set to `30`
- **THEN** the rule evaluates investments within a 30-minute window instead of 1 hour
- **AND** the detection window can be adjusted based on observed attack patterns

### Requirement: Unusual Amount Rule
The system SHALL detect and flag transactions with amounts significantly above a user's historical average (e.g., 3x higher than median investment) as potentially fraudulent or erroneous.

#### Scenario: Unusually large investment detected
- **WHEN** a user with a median investment of RM 1,000 attempts to invest RM 5,000
- **THEN** a `FraudAlert` is created with rule type `UNUSUAL_AMOUNT` and severity `high`
- **AND** the alert includes context: current amount, user's historical median, threshold multiplier

#### Scenario: First investment not flagged
- **WHEN** a new user makes their first investment (no historical data)
- **THEN** the `UnusualAmountRule` does not trigger (insufficient data)
- **AND** the transaction proceeds normally

#### Scenario: Threshold multiplier configurable
- **WHEN** `config('fraud-detection.unusual_amount_multiplier')` is set to `5`
- **THEN** the rule triggers only when the investment amount is 5x the user's median
- **AND** the sensitivity can be adjusted to reduce false positives

### Requirement: Multiple Failed Authentication Rule
The system SHALL detect and flag users or IP addresses with an excessive number of failed login attempts (e.g., more than 10 failures in 5 minutes) as potential brute-force attacks.

#### Scenario: Multiple failed login attempts detected
- **WHEN** an IP address has 11 failed login attempts within 5 minutes
- **THEN** a `FraudAlert` is created with rule type `MULTIPLE_FAILED_AUTH` and severity `high`
- **AND** the alert includes context: IP address, attempted usernames/emails, timestamps

#### Scenario: Successful login resets counter
- **WHEN** a user successfully logs in after 3 failed attempts
- **THEN** the failed attempt counter for that user is reset to zero
- **AND** subsequent failed attempts restart the counter

#### Scenario: Failed auth threshold configurable
- **WHEN** `config('fraud-detection.failed_auth_threshold')` is set to `15`
- **THEN** the rule triggers only after 15 failed attempts in the configured time window
- **AND** the threshold can be tuned to balance security and user experience

### Requirement: Fraud Alert Model and Tracking
The system SHALL store fraud alerts in a `fraud_alerts` table with fields for user ID, rule type, severity, detection timestamp, resolution timestamp, and administrator notes for review and resolution tracking.

#### Scenario: Fraud alert created with full context
- **WHEN** a fraud rule is triggered
- **THEN** a `FraudAlert` record is created with fields: `user_id`, `rule_type` enum, `severity` enum, `context` JSON, `detected_at` timestamp
- **AND** the alert is initially unresolved (`resolved_at` is null)

#### Scenario: Administrator reviews fraud alert
- **WHEN** an administrator views the fraud alert dashboard
- **THEN** all unresolved fraud alerts are displayed with user details, rule type, severity, and detection time
- **AND** the administrator can mark an alert as resolved with optional notes

#### Scenario: Fraud alert resolved
- **WHEN** an administrator marks a fraud alert as resolved
- **THEN** the `resolved_at` timestamp is set to the current time
- **AND** `resolution_notes` are saved (e.g., "False positive - legitimate bulk purchase for portfolio diversification")

### Requirement: Fraud Detection Configuration
The system SHALL provide a `config/fraud-detection.php` configuration file with tunable thresholds and rule toggles to allow runtime adjustment of fraud detection sensitivity.

#### Scenario: Fraud rules configurable
- **WHEN** `config('fraud-detection.rules.rapid_investment.enabled')` is set to `false`
- **THEN** the `RapidInvestmentRule` is not evaluated during transaction processing
- **AND** specific rules can be toggled without code changes

#### Scenario: Global fraud detection mode
- **WHEN** `config('fraud-detection.mode')` is set to `monitor`
- **THEN** fraud alerts are created but do NOT block transactions
- **AND** alerts are logged for administrator review and threshold tuning

#### Scenario: Blocking mode for high-severity fraud
- **WHEN** `config('fraud-detection.mode')` is set to `block`
- **THEN** transactions that trigger high-severity fraud rules are rejected
- **AND** users receive an error message: "Transaction flagged for review. Please contact support."

### Requirement: Fraud Detection Integration in Transaction Flow
The system SHALL integrate fraud detection into the investment purchase flow, evaluating transactions before payment processing to enable early detection and optional blocking.

#### Scenario: Fraud detection evaluated before payment
- **WHEN** a user submits an investment purchase request
- **THEN** the transaction is evaluated by `FraudDetectionService` BEFORE payment is processed
- **AND** if monitoring mode is enabled, the transaction proceeds regardless of fraud flag
- **AND** if blocking mode is enabled and a high-severity rule triggers, the transaction is rejected before payment

#### Scenario: Fraud alert logged in audit trail
- **WHEN** a fraud alert is generated
- **THEN** an audit log entry is created with event type `fraud_alert_generated`
- **AND** the audit log includes the fraud alert ID, user ID, rule type, and severity
- **AND** administrators have a complete audit trail of all fraud detection events

### Requirement: Admin Dashboard for Fraud Alert Review
The system SHALL provide an admin dashboard page (`/admin/fraud-alerts`) displaying all unresolved fraud alerts with filtering, sorting, and resolution capabilities.

#### Scenario: Admin views unresolved fraud alerts
- **WHEN** an administrator navigates to `/admin/fraud-alerts`
- **THEN** all unresolved fraud alerts are displayed in a table with columns: user, rule type, severity, detection time, actions
- **AND** alerts are sorted by detection time descending (most recent first)

#### Scenario: Admin filters fraud alerts by severity
- **WHEN** an administrator filters by severity `high`
- **THEN** only fraud alerts with severity `high` are displayed
- **AND** low and medium severity alerts are hidden

#### Scenario: Admin resolves fraud alert
- **WHEN** an administrator clicks "Resolve" on a fraud alert and enters resolution notes
- **THEN** the alert's `resolved_at` timestamp is set and `resolution_notes` are saved
- **AND** the alert is removed from the unresolved list
- **AND** a success notification is displayed: "Fraud alert resolved"

