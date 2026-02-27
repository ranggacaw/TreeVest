<?php

namespace App\Jobs;

use App\Services\SecurityMonitoringService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class ScanForSuspiciousActivity implements ShouldQueue
{
    use Queueable;

    /**
     * Execute the job.
     */
    public function handle(SecurityMonitoringService $monitoringService): void
    {
        $monitoringService->detectAnomalies();
    }
}
