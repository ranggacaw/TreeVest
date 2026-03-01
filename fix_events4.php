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

    $content = "<?php\n\nnamespace App\Events;\n\nuse App\Models\$modelName;\nuse Illuminate\Broadcasting\InteractsWithSockets;\nuse Illuminate\Broadcasting\PrivateChannel;\nuse Illuminate\Foundation\Events\Dispatchable;\nuse Illuminate\Queue\SerializesModels;\n\nclass $event\n{\n    use Dispatchable, InteractsWithSockets, SerializesModels;\n\n    public function __construct(public $modelName \$$varName)\n    {\n    }\n\n    public function broadcastOn(): array\n    {\n        return [\n            new PrivateChannel('channel-name'),\n        ];\n    }\n}\n";

    file_put_contents("app/Events/{$event}.php", $content);
}

echo "Fixed\n";
