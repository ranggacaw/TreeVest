## ADDED Requirements

### Requirement: Tree Token ID
Each tree SHALL have a globally unique `token_id` display identifier that serves as the canonical ownership reference for investors and support queries.

#### Scenario: Token ID generated on tree creation
- **WHEN** a farm owner creates a tree inside a lot
- **THEN** the system generates and stores `tree.token_id` in the format `TRX-{lot_id_zero_padded_5}-{tree_number_zero_padded_3}`
- **AND** `tree_number` is the 1-based sequence of this tree within its lot (e.g., the 12th tree in lot 1 = `TRX-00001-012`)
- **AND** `token_id` is unique across all trees in the system (enforced by unique index)

#### Scenario: Token ID is immutable after creation
- **WHEN** any field on a tree record is updated
- **THEN** the system does NOT allow `token_id` to be changed
- **AND** any attempt to update `token_id` via the API is rejected with HTTP 422

#### Scenario: Token ID displayed in investor portfolio
- **WHEN** an investor views their portfolio holdings list
- **THEN** each investment row shows the `token_id` of the tree(s) purchased
- **AND** the token ID is displayed as a monospace reference label (e.g., `TRX-00001-012`)

#### Scenario: Token ID displayed on investment detail page
- **WHEN** an investor views an investment detail page
- **THEN** the page shows: "Tree Token: TRX-00001-012" in the tree details section
- **AND** the token ID can be copied to clipboard via a copy icon

#### Scenario: Existing trees backfilled with token IDs
- **WHEN** the `add_token_id_to_trees_table` migration runs
- **THEN** all existing tree records are backfilled with a generated `token_id` derived from their `lot_id` and their 1-based position (ordered by `id ASC` within each lot)
- **AND** all backfilled values are unique
