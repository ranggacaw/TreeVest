<?php

namespace App\Jobs;

use App\Models\AuditLog;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class LogAuditEvent implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public array $auditData
    ) {}

    public function handle(): void
    {
        AuditLog::create($this->auditData);
    }
}
