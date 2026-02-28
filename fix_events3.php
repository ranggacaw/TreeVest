<?php
$events = [
    'FruitCropCreated' => ['FruitCrop', 'fruitCrop'],
    'FruitCropUpdated' => ['FruitCrop', 'fruitCrop'],
    'FruitCropDeleted' => ['FruitCrop', 'fruitCrop'],
    'TreeCreated' => ['Tree', 'tree'],
    'TreeUpdated' => ['Tree', 'tree'],
    'TreeDeleted' => ['Tree', 'tree'],
];

foreach ($events as $event => $models) {
    $modelName = $models[0];
    $varName = $models[1];
    
    $content = <<<PHP
<?php

namespace App\Events;

use App\Models\{$modelName};
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class {$event}
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public {$modelName} \${$varName})
    {
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('channel-name'),
        ];
    }
}
PHP;

    file_put_contents("app/Events/{$event}.php", $content);
}

// Fix TreeStatusChanged specifically
$treeStatusContent = <<<PHP
<?php

namespace App\Events;

use App\Models\Tree;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TreeStatusChanged
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Tree \$tree,
        public string \$oldStatus,
        public string \$newStatus
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('channel-name'),
        ];
    }
}
PHP;
file_put_contents("app/Events/TreeStatusChanged.php", $treeStatusContent);

echo "Fixed\n";
