<?php

namespace App\Observers;

use App\Models\AuditLog;
use Exception;

class AuditLogObserver
{
    /**
     * Prevent updates to audit logs.
     */
    public function updating(AuditLog $auditLog): bool
    {
        throw new Exception('Audit logs are immutable and cannot be updated.');

        return false;
    }

    /**
     * Prevent deletion of audit logs.
     */
    public function deleting(AuditLog $auditLog): bool
    {
        throw new Exception('Audit logs are immutable and cannot be deleted.');

        return false;
    }
}
