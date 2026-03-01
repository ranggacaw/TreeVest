<?php

namespace App\Events;

use App\Models\Tree;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TreeDeleted
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Tree $tree) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('channel-name'),
        ];
    }
}
