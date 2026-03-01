<?php

namespace App\Events;

use App\Models\FruitCrop;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class FruitCropUpdated
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public FruitCrop $fruitCrop) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('channel-name'),
        ];
    }
}
