<?php

namespace App\Events;

use App\Models\AgrotourismRegistration;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AgrotourismRegistrationConfirmed
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public AgrotourismRegistration $registration
    ) {}
}
