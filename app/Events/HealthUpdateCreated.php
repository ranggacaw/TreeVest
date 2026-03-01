<?php

namespace App\Events;

use App\Models\TreeHealthUpdate;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class HealthUpdateCreated
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public TreeHealthUpdate $healthUpdate
    ) {}
}
