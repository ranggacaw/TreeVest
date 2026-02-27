# Capability: Encryption at Rest

## ADDED Requirements

### Requirement: Sensitive Data Field Encryption
The system SHALL encrypt sensitive user data fields at rest using Laravel's built-in encryption (AES-256-CBC with `APP_KEY`) to protect PII and financial information from database breaches.

#### Scenario: User phone number encrypted
- **WHEN** a `User` model is created or updated with a `phone` value
- **THEN** the `phone` field is automatically encrypted before storage
- **AND** when the `phone` attribute is accessed, it is automatically decrypted
- **AND** the encrypted value in the database is not human-readable

#### Scenario: User KYC document URL encrypted
- **WHEN** a `User` model stores a `kyc_document_url` value
- **THEN** the `kyc_document_url` field is automatically encrypted before storage
- **AND** unauthorized database access does not reveal the document location

#### Scenario: Transaction amount encrypted
- **WHEN** a `Transaction` model is created with an `amount` value
- **THEN** the `amount` field is encrypted before storage
- **AND** when accessed, the encrypted value is decrypted and cast to an integer

#### Scenario: Transaction account number encrypted
- **WHEN** a `Transaction` model stores an `account_number` value (if applicable)
- **THEN** the `account_number` field is encrypted before storage
- **AND** sensitive financial account details are protected from database breaches

### Requirement: Eloquent Encrypted Casting
The system SHALL use Laravel's `encrypted` cast in Eloquent models to declaratively specify which fields should be encrypted, ensuring encryption is transparent to application logic.

#### Scenario: Encrypted casting declared in model
- **WHEN** a `User` model declares `protected $casts = ['phone' => 'encrypted']`
- **THEN** all reads and writes to the `phone` attribute automatically handle encryption/decryption
- **AND** no manual encrypt/decrypt calls are required in application code

#### Scenario: Encrypted casting with type coercion
- **WHEN** a `Transaction` model declares `protected $casts = ['amount' => 'encrypted:integer']`
- **THEN** the `amount` value is encrypted on storage and decrypted + cast to integer on retrieval
- **AND** type safety is maintained throughout the application

### Requirement: Encryption Service for Manual Operations
The system SHALL provide an `EncryptionService` helper for manual encrypt/decrypt operations when Eloquent casting is not applicable (e.g., encrypting JSON payloads, temporary values).

#### Scenario: Manual encryption of arbitrary data
- **WHEN** application code needs to encrypt a value not stored in an Eloquent model (e.g., API response payload)
- **THEN** `EncryptionService::encrypt($value)` encrypts the value using the `APP_KEY`
- **AND** the encrypted string can be safely stored or transmitted

#### Scenario: Manual decryption of encrypted data
- **WHEN** application code receives an encrypted value
- **THEN** `EncryptionService::decrypt($encryptedValue)` decrypts the value using the `APP_KEY`
- **AND** the original plaintext value is returned

#### Scenario: Decryption failure handling
- **WHEN** `EncryptionService::decrypt()` is called with an invalid or corrupted encrypted value
- **THEN** a `DecryptException` is thrown
- **AND** the exception is logged for investigation

### Requirement: APP_KEY Backup and Rotation Procedures
The system SHALL document procedures for backing up and rotating the `APP_KEY` to ensure encrypted data recoverability and support key rotation for security compliance.

#### Scenario: APP_KEY backup documented
- **WHEN** the application is deployed to production
- **THEN** the `APP_KEY` value is backed up to a secure encrypted vault (e.g., 1Password, AWS Secrets Manager)
- **AND** the backup location and recovery procedure are documented in `docs/security.md`

#### Scenario: APP_KEY rotation procedure documented
- **WHEN** a security audit requires key rotation
- **THEN** the documented procedure includes: (1) back up current key, (2) decrypt all encrypted fields with old key, (3) generate new key, (4) re-encrypt all fields with new key, (5) update `.env` with new key
- **AND** the procedure is tested in staging before production execution

#### Scenario: Key loss prevents decryption
- **WHEN** the `APP_KEY` is lost or corrupted
- **THEN** all encrypted data becomes unrecoverable
- **AND** the documented backup procedure prevents this scenario

### Requirement: Encryption Performance Optimization
The system SHALL minimize encryption overhead by encrypting only sensitive fields (not entire records) and caching decrypted values within PHP object lifecycle to avoid redundant decryption operations.

#### Scenario: Selective field encryption
- **WHEN** a model contains both sensitive and non-sensitive fields
- **THEN** only fields explicitly cast as `encrypted` are encrypted
- **AND** non-sensitive fields (e.g., `created_at`, `status`) are stored in plaintext for efficient querying

#### Scenario: Decrypted value cached in model instance
- **WHEN** an encrypted field is accessed multiple times within a single request
- **THEN** Laravel's attribute casting caches the decrypted value after the first access
- **AND** subsequent accesses do not trigger redundant decrypt operations

#### Scenario: Encryption overhead benchmarked
- **WHEN** the application is deployed
- **THEN** encryption/decryption performance is benchmarked with realistic data volumes (e.g., 10K users, 100K transactions)
- **AND** performance impact is < 5ms per request on average
