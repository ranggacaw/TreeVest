<?php
$events = [
    'FruitCropCreated', 'FruitCropUpdated', 'FruitCropDeleted',
    'TreeCreated', 'TreeUpdated', 'TreeDeleted'
];

foreach ($events as $event) {
    $file = "app/Events/{$event}.php";
    $content = file_get_contents($file);
    $content = str_replace('use App\Models$modelName;', 'use App\Models\' . (str_contains($event, 'FruitCrop') ? 'FruitCrop' : 'Tree') . ';', $content);
    file_put_contents($file, $content);
}
echo "Fixed\n";
