## ADDED Requirements

### Requirement: Secondary Market Audit Events
The system SHALL log all secondary market lifecycle events in the audit log for compliance, traceability, and dispute resolution.

#### Scenario: Listing created audit log
- **WHEN** `SecondaryMarketService::createListing()` is called
- **THEN** an audit log entry is created with `event_type = listing_created`
- **AND** `event_data` includes: `listing_id`, `investment_id`, `seller_id`, `ask_price_cents`, `platform_fee_cents`, `net_proceeds_cents`, `platform_fee_rate`, `ip_address`, `user_agent`

#### Scenario: Listing cancelled audit log
- **WHEN** `SecondaryMarketService::cancelListing()` is called by the seller
- **THEN** an audit log entry is created with `event_type = listing_cancelled`
- **AND** `event_data` includes: `listing_id`, `investment_id`, `seller_id`, `cancelled_at`, `ip_address`

#### Scenario: Listing force-cancelled by admin audit log
- **WHEN** an admin cancels a listing via the admin panel
- **THEN** an audit log entry is created with `event_type = admin_listing_cancelled`
- **AND** `event_data` includes: `listing_id`, `investment_id`, `seller_id`, `admin_user_id`, `reason`, `cancelled_at`

#### Scenario: Listing purchased audit log
- **WHEN** `SecondaryMarketService::confirmPurchase()` completes successfully
- **THEN** an audit log entry is created with `event_type = listing_purchased`
- **AND** `event_data` includes: `listing_id`, `investment_id`, `seller_id`, `buyer_id`, `ask_price_cents`, `platform_fee_cents`, `transaction_id`, `purchased_at`

#### Scenario: Ownership transferred audit log
- **WHEN** `investment.user_id` is updated as part of a confirmed secondary market purchase
- **THEN** an audit log entry is created with `event_type = ownership_transferred`
- **AND** `event_data` includes: `investment_id`, `from_user_id`, `to_user_id`, `transfer_price_cents`, `transfer_id` (InvestmentTransfer id), `transferred_at`

#### Scenario: Unauthorized listing cancellation attempt audit log
- **WHEN** a user who is not the listing seller attempts to cancel a listing
- **THEN** an audit log entry is created with `event_type = unauthorized_listing_cancellation_attempt`
- **AND** `event_data` includes: `listing_id`, `attempted_by_user_id`, `ip_address`
