<?php

namespace App\Events;

use App\Models\Harvest;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class HarvestScheduled
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Harvest $harvest
    ) {}
}
