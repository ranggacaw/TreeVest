## MODIFIED Requirements

### Requirement: Farm Owner Dashboard

Farm owners SHALL be able to view and manage all farms they own from a dedicated dashboard. **Farm owners SHALL also have access to health update management for their farms' crops from the dashboard.**

#### Scenario: Farm owner views owned farms
- **WHEN** a farm owner accesses their farm management dashboard
- **THEN** the system displays all farms owned by the user with status indicators, edit actions, and creation date

#### Scenario: Farm owner can only edit own farms
- **WHEN** a farm owner attempts to access or edit a farm not owned by them
- **THEN** the system returns a 403 Forbidden error

#### Scenario: Farm owner accesses health update management from dashboard
- **WHEN** a farm owner views their farm management dashboard
- **THEN** the system displays a "Health Updates" navigation link
- **AND** clicking the link navigates to `/farm-owner/health-updates`
- **AND** displays all health updates created by the farm owner for their farms' crops

#### Scenario: Farm owner sees health update stats on dashboard
- **WHEN** a farm owner views their dashboard
- **THEN** the system displays a summary card showing: total health updates count, recent updates (last 7 days), and pending alerts count
