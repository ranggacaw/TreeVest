<?php

namespace App\Events;

use App\Models\User;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Foundation\Events\Dispatchable;

class RoleChanged
{
    use Dispatchable;

    public function __construct(
        public User $user,
        public string $oldRole,
        public string $newRole,
        public ?User $changedBy = null
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('channel-name'),
        ];
    }
}
