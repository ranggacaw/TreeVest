<?php

namespace App\Listeners;

use App\Enums\InvestmentStatus;
use App\Events\HarvestCompleted;
use App\Jobs\SendHarvestReminderNotification;
use App\Models\Investment;

class NotifyInvestorsOfHarvestCompletion
{
    public function handle(HarvestCompleted $event): void
    {
        $investments = Investment::where('tree_id', $event->harvest->tree_id)
            ->where('status', InvestmentStatus::Active)
            ->get();

        foreach ($investments as $investment) {
            SendHarvestReminderNotification::dispatch(
                $event->harvest,
                $investment->user,
                'completed'
            );
        }
    }
}
