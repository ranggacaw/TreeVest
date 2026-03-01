<?php

$events = [
    'FruitCropCreated', 'FruitCropUpdated', 'FruitCropDeleted',
    'TreeCreated', 'TreeUpdated', 'TreeDeleted',
];

foreach ($events as $event) {
    $file = "app/Events/{$event}.php";
    $content = file_get_contents($file);
    if (strpos($event, 'FruitCrop') !== false) {
        $model = 'FruitCrop';
    } else {
        $model = 'Tree';
    }
    $content = str_replace('use App\Models$modelName;', "use App\Models\$model;", $content);
    file_put_contents($file, $content);
}
echo "Fixed\n";
