<?php

namespace App\Listeners;

use App\Enums\AuditEventType;
use App\Events\RoleChanged;

class LogRoleChange
{
    public function handle(RoleChanged $event): void
    {
        $event->user->auditLogs()->create([
            'event_type' => AuditEventType::ROLE_CHANGED,
            'event_data' => [
                'old_role' => $event->oldRole,
                'new_role' => $event->newRole,
                'changed_by' => $event->changedBy?->id,
                'changed_by_name' => $event->changedBy?->name,
            ],
            'ip_address' => request()?->ip(),
            'user_agent' => request()?->userAgent(),
            'created_at' => now(),
        ]);
    }
}
