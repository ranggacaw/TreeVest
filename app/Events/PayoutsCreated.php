<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Collection;

class PayoutsCreated
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Collection $payouts
    ) {}
}
