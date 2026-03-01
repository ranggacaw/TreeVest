<?php

namespace App\Events;

use App\Models\Farm;
use App\Models\User;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Foundation\Events\Dispatchable;

class FarmSuspended
{
    use Dispatchable;

    public function __construct(
        public Farm $farm,
        public User $suspendedBy
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('farm.'.$this->farm->id),
        ];
    }
}
