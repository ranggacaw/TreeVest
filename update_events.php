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
    
    // add model import
    $content = str_replace('use Illuminate\Queue\SerializesModels;', "use Illuminate\Queue\SerializesModels;\nuse App\Models\$model;", $content);
    
    // add property and constructor
    $modelVar = lcfirst($model);
    if ($model == 'FruitCrop') {
        $modelVar = 'fruitCrop';
    }
    
    $replacement = "public function __construct(public \App\Models\$model \$$modelVar)\n    {\n    }";
    $content = preg_replace('/public function __construct\(\)\n    \{\n        \/\/\n    \}/', $replacement, $content);
    
    file_put_contents($file, $content);
}

// TreeStatusChanged has old and new status
$file = "app/Events/TreeStatusChanged.php";
$content = file_get_contents($file);
$content = str_replace('use Illuminate\Queue\SerializesModels;', "use Illuminate\Queue\SerializesModels;\nuse App\Models\Tree;\nuse App\Enums\TreeLifecycleStage;", $content);
$constructor = "public function __construct(public Tree \$tree, public \$oldStatus, public \$newStatus)\n    {\n    }";
$content = preg_replace('/public function __construct\(\)\n    \{\n        \/\/\n    \}/', $constructor, $content);
file_put_contents($file, $content);

echo "Done\n";
