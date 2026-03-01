<?php

namespace App\Events;

use App\Models\Farm;
use App\Models\User;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Foundation\Events\Dispatchable;

class FarmReinstated
{
    use Dispatchable;

    public function __construct(
        public Farm $farm,
        public User $reinstatedBy
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('farm.'.$this->farm->id),
        ];
    }
}
