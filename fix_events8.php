<?php

$files = [
    'FruitCropCreated' => 'FruitCrop',
    'FruitCropUpdated' => 'FruitCrop',
    'FruitCropDeleted' => 'FruitCrop',
    'TreeCreated' => 'Tree',
    'TreeUpdated' => 'Tree',
    'TreeDeleted' => 'Tree'
];

foreach ($files as $class => $model) {
    $var = lcfirst($model);
    $code = '<?php' . "\n\n" .
            'namespace App\Events;' . "\n\n" .
            'use App\Models\' . $model . ';' . "\n" .
            'use Illuminate\Broadcasting\InteractsWithSockets;' . "\n" .
            'use Illuminate\Broadcasting\PrivateChannel;' . "\n" .
            'use Illuminate\Foundation\Events\Dispatchable;' . "\n" .
            'use Illuminate\Queue\SerializesModels;' . "\n\n" .
            'class ' . $class . "\n" .
            "{\n" .
            '    use Dispatchable, InteractsWithSockets, SerializesModels;' . "\n\n" .
            '    public function __construct(public ' . $model . ' $' . $var . ')' . "\n" .
            "    {\n" .
            "    }\n\n" .
            '    public function broadcastOn(): array' . "\n" .
            "    {\n" .
            '        return [' . "\n" .
            "            new PrivateChannel('channel-name'),\n" .
            "        ];\n" .
            "    }\n" .
            "}\n";
    file_put_contents("app/Events/$class.php", $code);
}

echo "Fixed\n";
