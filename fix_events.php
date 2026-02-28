<?php
$events = [
    'FruitCropCreated' => 'FruitCrop',
    'FruitCropUpdated' => 'FruitCrop',
    'FruitCropDeleted' => 'FruitCrop',
    'TreeCreated' => 'Tree',
    'TreeUpdated' => 'Tree',
    'TreeDeleted' => 'Tree',
];

foreach ($events as $event => $model) {
    $file = "app/Events/{$event}.php";
    $content = file_get_contents($file);
    $content = str_replace('App\Models$model', "App\Models\$model", $content);
    file_put_contents($file, $content);
}
echo "Fixed\n";
