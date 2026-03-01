<?php

namespace App\Listeners;

use App\Events\HarvestCompleted;
use App\Jobs\CalculateProfitAndCreatePayouts;

class CalculateProfitAndCreatePayoutsListener
{
    public function handle(HarvestCompleted $event): void
    {
        CalculateProfitAndCreatePayouts::dispatch($event->harvest);
    }
}
