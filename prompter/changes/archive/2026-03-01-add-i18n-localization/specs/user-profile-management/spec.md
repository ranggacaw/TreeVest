## ADDED Requirements

### Requirement: Language Preference Management

The system SHALL allow authenticated users to set and persist their preferred display language via a dedicated `/profile/locale` endpoint, separate from the general profile update form.

#### Scenario: User updates language preference via language switcher
- **WHEN** an authenticated user selects a supported locale (e.g., `id`) from the `LanguageSwitcher` component
- **THEN** the system sends a PATCH to `/profile/locale` with `{ locale: 'id' }`
- **AND** the system validates that `locale` is one of the values in `APP_AVAILABLE_LOCALES`
- **AND** sets `users.locale = 'id'` for the authenticated user
- **AND** logs a `user.locale.changed` audit event (old locale, new locale, user ID, IP, timestamp)
- **AND** the Inertia page reloads with `locale = 'id'` in the shared props

#### Scenario: User cannot set an unsupported locale
- **WHEN** an authenticated user submits a PATCH to `/profile/locale` with `{ locale: 'fr' }` (unsupported)
- **THEN** the system rejects the request with a validation error
- **AND** returns the error "The selected language is not supported."

#### Scenario: Language preference visible on profile page
- **WHEN** an authenticated user views their profile at `/profile`
- **THEN** the system displays their current preferred language (e.g., "Bahasa Indonesia")
- **AND** a link or control is provided to change the preference

#### Scenario: Language preference persists across sessions
- **WHEN** an authenticated user has `locale = 'id'` stored in the database
- **AND** they log out and log back in
- **THEN** the system restores the `id` locale for their new session
- **AND** all UI strings are displayed in Bahasa Indonesia

## MODIFIED Requirements

### Requirement: Update Basic Profile Information
The system SHALL allow authenticated users to update their name and contact information. The profile page SHALL also display the user's current preferred language.

#### Scenario: User updates their name
- **WHEN** an authenticated user submits the profile update form with a new name
- **THEN** the system updates the `name` field
- **AND** displays a success message using the active locale's translation (e.g., "Profile updated successfully." in English or the Indonesian equivalent)
- **AND** logs the `user.profile.updated` audit event

#### Scenario: User cannot set name to empty
- **WHEN** an authenticated user attempts to update their name to an empty value
- **THEN** the system rejects the update
- **AND** displays a validation error using the active locale's translation (e.g., "Name is required." or Indonesian equivalent)

#### Scenario: Profile page shows language preference section
- **WHEN** an authenticated user views their profile at `/profile`
- **THEN** the system displays a "Language / Bahasa" section showing the current preferred language
- **AND** the section contains a control to change the preferred language (delegates to the language switcher flow)
