<?php

namespace App\Events;

use App\Models\Harvest;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class HarvestFailed
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Harvest $harvest
    ) {}
}
