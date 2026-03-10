<?php

namespace App\Events;

use App\Models\AgrotourismEvent;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AgrotourismEventCancelled
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public AgrotourismEvent $event
    ) {}
}
