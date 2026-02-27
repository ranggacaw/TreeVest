# legal-documents Specification

## Purpose
TBD - created by archiving change add-security-compliance-infrastructure. Update Purpose after archive.
## Requirements
### Requirement: Versioned Legal Document Management
The system SHALL maintain versioned legal documents (privacy policy, terms of service, investment disclaimer, risk disclosure) with explicit version numbers, effective dates, and active status tracking to ensure users are presented with the correct version and acceptance is auditable.

#### Scenario: Legal document published with version number
- **WHEN** an administrator publishes a new privacy policy
- **THEN** a `LegalDocument` record is created with type `privacy_policy`, auto-incremented version number, title, content (HTML/Markdown), and effective date
- **AND** the new version is marked as active (`is_active = true`)
- **AND** the previous version is marked as inactive (`is_active = false`)

#### Scenario: Only one active version per document type
- **WHEN** a new version of a legal document is published
- **THEN** all previous versions of that document type are automatically marked as inactive
- **AND** the system enforces a unique active version per document type at any given time

#### Scenario: Legal document retrieved by type
- **WHEN** the system needs to display the privacy policy to users
- **THEN** the active version of the privacy policy is retrieved via `LegalDocument::where('type', 'privacy_policy')->where('is_active', true)->first()`
- **AND** users always see the current effective version

#### Scenario: Historical versions retained
- **WHEN** a legal document is updated with a new version
- **THEN** all previous versions remain in the database with their original content and metadata
- **AND** administrators can view historical versions for audit and compliance purposes

### Requirement: User Acceptance Tracking
The system SHALL track user acceptance of legal documents with timestamps, IP addresses, and user agent information to provide proof of consent for compliance and legal purposes.

#### Scenario: User accepts terms of service
- **WHEN** a user completes registration and checks "I agree to the Terms of Service"
- **THEN** a `UserDocumentAcceptance` record is created linking the user to the active version of the terms of service
- **AND** the acceptance record includes: `user_id`, `legal_document_id`, `accepted_at` timestamp, `ip_address`, `user_agent`

#### Scenario: User accepts privacy policy
- **WHEN** a user accepts the privacy policy (e.g., during registration or after a policy update)
- **THEN** a `UserDocumentAcceptance` record is created for the active privacy policy version
- **AND** the acceptance is uniquely tracked (user can only accept each specific version once)

#### Scenario: User acceptance verified before critical actions
- **WHEN** a user attempts to make an investment purchase
- **THEN** the system verifies the user has accepted the latest version of the risk disclosure statement
- **AND** if not accepted, the user is prompted to review and accept before proceeding

#### Scenario: User re-accepts updated documents
- **WHEN** a legal document is updated with a new version
- **THEN** existing users who previously accepted an older version have NOT accepted the new version
- **AND** the system prompts users to review and accept the updated document on their next critical action (e.g., login, investment purchase)

### Requirement: Legal Document Service Interface
The system SHALL provide a `LegalDocumentService` that encapsulates operations for publishing new versions, retrieving active documents, checking user acceptance, and tracking acceptance events.

#### Scenario: Publish new document version
- **WHEN** `LegalDocumentService::publishNewVersion($type, $title, $content, $effectiveDate)` is called
- **THEN** the service deactivates the current active version (if exists) and creates a new version with incremented version number
- **AND** the entire operation is wrapped in a database transaction for atomicity

#### Scenario: Get active document by type
- **WHEN** `LegalDocumentService::getActiveDocument(LegalDocumentType::PRIVACY_POLICY)` is called
- **THEN** the currently active privacy policy document is returned
- **AND** if no active document exists, an exception is thrown

#### Scenario: Check if user accepted latest version
- **WHEN** `LegalDocumentService::hasUserAcceptedLatest($userId, LegalDocumentType::RISK_DISCLOSURE)` is called
- **THEN** the service queries `UserDocumentAcceptance` to verify the user has accepted the current active version
- **AND** returns `true` if accepted, `false` otherwise

#### Scenario: Track user acceptance
- **WHEN** `LegalDocumentService::trackAcceptance($userId, $documentId, $ipAddress, $userAgent)` is called
- **THEN** a `UserDocumentAcceptance` record is created with the provided data
- **AND** duplicate acceptance of the same document version by the same user is prevented (unique constraint)

### Requirement: Legal Document Display Pages
The system SHALL provide Inertia.js page components for displaying privacy policy, terms of service, and risk disclosure statements with clear version information and acceptance mechanisms.

#### Scenario: Privacy policy page displays active version
- **WHEN** a user navigates to `/legal/privacy`
- **THEN** the active privacy policy is displayed with version number and effective date
- **AND** the page is rendered via Inertia.js with React component `Pages/Legal/PrivacyPolicy.tsx`

#### Scenario: Terms of service page displays active version
- **WHEN** a user navigates to `/legal/terms`
- **THEN** the active terms of service are displayed with version number and effective date
- **AND** the page is rendered via Inertia.js with React component `Pages/Legal/TermsOfService.tsx`

#### Scenario: Risk disclosure modal before investment
- **WHEN** a user proceeds to purchase an investment
- **THEN** a modal displays the active risk disclosure statement
- **AND** the user must check "I have read and accept the risk disclosure" and click "I Agree" to proceed
- **AND** acceptance is tracked before the investment transaction is created

#### Scenario: Legal document acceptance logged
- **WHEN** a user accepts a legal document
- **THEN** an audit log entry is created with event type `legal_document_accepted`
- **AND** the log includes the user ID, document type, version, and acceptance timestamp

### Requirement: Legal Document Types Enumeration
The system SHALL define legal document types as a PHP enum (`LegalDocumentType`) with values: `TERMS_OF_SERVICE`, `PRIVACY_POLICY`, `INVESTMENT_DISCLAIMER`, `RISK_DISCLOSURE` for type safety and consistency.

#### Scenario: Legal document type enum defined
- **WHEN** a legal document is created or queried
- **THEN** the `type` field uses the `LegalDocumentType` enum
- **AND** invalid types are rejected at the PHP level (type safety)

#### Scenario: Database stores enum values
- **WHEN** a `LegalDocument` record is persisted to the database
- **THEN** the `type` column stores the enum value as a string (e.g., `'privacy_policy'`)
- **AND** Eloquent automatically casts the column to the `LegalDocumentType` enum on retrieval

### Requirement: Legal Document Seeder for Initial Content
The system SHALL provide a database seeder (`LegalDocumentSeeder`) that populates initial versions of privacy policy, terms of service, investment disclaimer, and risk disclosure for testing and initial deployment.

#### Scenario: Seeder creates initial legal documents
- **WHEN** `php artisan db:seed --class=LegalDocumentSeeder` is run
- **THEN** initial versions of all legal document types are created with version 1 and placeholder content
- **AND** all documents are marked as active

#### Scenario: Seeder is idempotent
- **WHEN** the seeder is run multiple times
- **THEN** it does not create duplicate documents (checks for existing active versions first)
- **AND** existing documents are not modified

### Requirement: Investment Disclaimer Display Requirement
The system SHALL display the investment disclaimer at appropriate points in the user flow (e.g., before first investment, on investment listing pages) to ensure users are informed of investment risks.

#### Scenario: Investment disclaimer shown on marketplace
- **WHEN** a user browses the investment marketplace
- **THEN** a disclaimer banner is displayed at the top of the page: "Investments in fruit trees carry risk. See full Risk Disclosure for details."
- **AND** clicking the banner opens the full risk disclosure modal

#### Scenario: Investment disclaimer required before purchase
- **WHEN** a user initiates an investment purchase
- **THEN** the system verifies the user has accepted the current risk disclosure version
- **AND** if not accepted, the user is shown the risk disclosure modal and must accept before proceeding

#### Scenario: Disclaimer acceptance persists
- **WHEN** a user accepts the risk disclosure once
- **THEN** they are not prompted to accept it again for subsequent investments (unless the version is updated)
- **AND** the system checks acceptance status based on the active version

### Requirement: Legal Document Update Notification
The system SHALL notify users via email when legal documents (privacy policy, terms of service) are updated with new versions, prompting them to review the changes.

#### Scenario: Email sent when privacy policy updated
- **WHEN** a new version of the privacy policy is published
- **THEN** all active users receive an email notification: "Our Privacy Policy has been updated. Please review the changes."
- **AND** the email includes a link to the updated policy and highlights what changed

#### Scenario: Email sent when terms of service updated
- **WHEN** a new version of the terms of service is published
- **THEN** all active users receive an email notification: "Our Terms of Service have been updated. Continued use of the platform constitutes acceptance."
- **AND** the email includes a link to the updated terms

#### Scenario: Notification does not block user access
- **WHEN** a user receives a legal document update notification
- **THEN** they are encouraged to review the changes but not blocked from using the platform
- **AND** critical documents (e.g., risk disclosure) may require re-acceptance before specific actions (e.g., new investments)

