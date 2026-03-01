<?php

namespace App\Events;

use App\Models\GeneratedReport;
use App\Models\User;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ReportReady
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public GeneratedReport $report,
        public User $user
    ) {}
}
