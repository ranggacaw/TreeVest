<?php

$files = [
    'FruitCropCreated' => 'FruitCrop',
    'FruitCropUpdated' => 'FruitCrop',
    'FruitCropDeleted' => 'FruitCrop',
    'TreeCreated' => 'Tree',
    'TreeUpdated' => 'Tree',
    'TreeDeleted' => 'Tree',
];

foreach ($files as $class => $model) {
    $var = lcfirst($model);
    $code = "<?php\n\nnamespace App\Events;\n\nuse App\Models\$model;\nuse Illuminate\Broadcasting\InteractsWithSockets;\nuse Illuminate\Broadcasting\PrivateChannel;\nuse Illuminate\Foundation\Events\Dispatchable;\nuse Illuminate\Queue\SerializesModels;\n\nclass $class\n{\n    use Dispatchable, InteractsWithSockets, SerializesModels;\n\n    public function __construct(public $model \$$var)\n    {\n    }\n\n    public function broadcastOn(): array\n    {\n        return [\n            new PrivateChannel('channel-name'),\n        ];\n    }\n}\n";
    file_put_contents("app/Events/$class.php", $code);
}

echo "Fixed\n";
