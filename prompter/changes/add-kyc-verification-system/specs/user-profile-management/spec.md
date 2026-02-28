# User Profile Management Specification - Delta

## ADDED Requirements

### Requirement: View KYC Verification Status in Profile
The system SHALL display the user's KYC verification status in the profile section.

#### Scenario: User views KYC status in profile
- **WHEN** an authenticated user navigates to `/profile`
- **THEN** the system displays their current KYC status (pending, submitted, verified, rejected)
- **AND** displays a link to the full KYC verification page at `/profile/kyc`

#### Scenario: Unverified user sees KYC prompt in profile
- **WHEN** a user with kyc_status 'pending' views their profile
- **THEN** the system displays a prominent call-to-action "Verify Your Identity"
- **AND** explains that KYC verification is required before investing

#### Scenario: Verified user sees verification details in profile
- **WHEN** a user with kyc_status 'verified' views their profile
- **THEN** the system displays "Identity Verified" with a checkmark badge
- **AND** displays the verification date and expiry date

#### Scenario: Expired KYC shows re-verification prompt in profile
- **WHEN** a user with expired KYC (kyc_expires_at in past) views their profile
- **THEN** the system displays a warning "Your KYC verification has expired"
- **AND** displays a link to start re-verification
