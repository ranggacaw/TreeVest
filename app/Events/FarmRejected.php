<?php

namespace App\Events;

use App\Models\Farm;
use App\Models\User;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Foundation\Events\Dispatchable;

class FarmRejected
{
    use Dispatchable;

    public function __construct(
        public Farm $farm,
        public User $rejectedBy,
        public string $reason
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('farm.' . $this->farm->id),
        ];
    }
}
