<?php

namespace App\Events;

use App\Models\HealthAlert;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class WeatherAlertGenerated
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public HealthAlert $healthAlert
    ) {}
}
