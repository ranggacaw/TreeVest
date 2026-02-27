<?php

namespace App\Services;

use App\Enums\AuditEventType;
use App\Jobs\LogAuditEvent;
use Illuminate\Support\Facades\Request;

class AuditLogService
{
    /**
     * Log a generic event asynchronously.
     */
    public function logEvent(AuditEventType $eventType, ?int $userId = null, array $data = []): void
    {
        $auditData = [
            'user_id' => $userId,
            'event_type' => $eventType->value,
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
            'event_data' => $data,
            'created_at' => now(),
        ];

        LogAuditEvent::dispatch($auditData);
    }

    /**
     * Log an authentication event.
     */
    public function logAuthentication(?int $userId, bool $success): void
    {
        $eventType = $success ? AuditEventType::LOGIN : AuditEventType::FAILED_LOGIN;
        
        $this->logEvent($eventType, $userId, [
            'success' => $success,
        ]);
    }

    /**
     * Log a transaction event.
     */
    public function logTransaction(int $transactionId, array $details, ?int $userId = null): void
    {
        $this->logEvent(AuditEventType::INVESTMENT_PURCHASED, $userId, [
            'transaction_id' => $transactionId,
            'details' => $details,
        ]);
    }
}
