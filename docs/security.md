# Security & Procedures

## Application Key (APP_KEY) Management

The `APP_KEY` is a critical secret used for all symmetric encryption in Laravel, including sessions, signed cookies, and encrypted model attributes (e.g., user PII, transaction amounts).

### Backup Procedures
1. Ensure `APP_KEY` is securely stored in a secrets manager (e.g., AWS Secrets Manager, HashiCorp Vault, 1Password).
2. The key should never be committed to source control.
3. Keep an offline, encrypted backup of the `APP_KEY` accessible only to key stakeholders.

### Key Rotation Procedures
Rotating the `APP_KEY` requires careful coordination to prevent data loss, as previously encrypted data will become unreadable with a new key.

1. Generate a new key using `php artisan key:generate --show` (do not replace the current key yet).
2. For all models with encrypted fields (e.g., `User`, `Transaction`), create a command or job to read every record, decrypt its values using the old key, and re-encrypt them with the new key. (Laravel supports multiple keys in the `APP_PREVIOUS_KEYS` env variable starting in Laravel 11, which makes this easier).
3. If using `APP_PREVIOUS_KEYS`:
   - Add the old `APP_KEY` to `APP_PREVIOUS_KEYS` in the environment.
   - Update `APP_KEY` to the new key.
   - Laravel will automatically use the new key for new encryption and fall back to previous keys for decryption.
4. Schedule a job to systematically touch and re-save all records containing encrypted data to migrate them to the new key over time.

## Security Incident Response
*(To be completed after post-implementation tasks)*

## Security Incident Response

In the event of a suspected or confirmed security breach, the following protocol must be activated immediately:

### 1. Verification & Classification
- **Confirm Incident:** Analyze logs (AuditLog, SecurityLog) to verify anomaly is real (not false positive).
- **Classify Severity:**
  - **Critical:** Data breach (PII/Financial), active exploit, system outage.
  - **High:** Service disruption, potential vulnerability exposure.
  - **Medium:** Suspicious activity without confirmable impact.
  - **Low:** Non-critical anomaly.

### 2. Containment
- **Disconnect Affected Systems:** Take offline or isolate infected components if necessary.
- **Revoke Access:** Reset passwords/sessions () for affected accounts or admins.
- **Block Traffic:** Update firewall rules or AWS WAF to block malicious IPs.
- **Preserve Evidence:** Do not reboot or wipe logs unless absolutely necessary for containment.

### 3. Eradication
- **Patch Vulnerabilities:** Deploy hotfixes for code vulnerabilities (SQLi, XSS, etc.).
- **Remove Backdoors:** Audit for unauthorized SSH keys, cron jobs, or admin accounts.
- **Rotate Credentials:** Rotate database passwords, API keys, and secret tokens.

### 4. Recovery
- **Restore Data:** Restore clean backups if data was corrupted or deleted.
- **Verify Integrity:** Run integrity checks on critical tables (users, transactions).
- **Monitor:** Enhanced monitoring for 24-48 hours post-incident.

### 5. Notification & Post-Mortem
- **Notify Stakeholders:** Inform management, legal team, and affected users (GDPR requirement: typically within 72 hours).
- **Post-Mortem Report:** Document timeline, root cause, impact, and preventive measures.
