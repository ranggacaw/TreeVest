<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$tree = \App\Models\Tree::first();
if (! $tree) {
    echo "NO TREE FOUND\n";
    exit;
}

echo 'Tree fruit_crop_id: '.$tree->fruit_crop_id."\n";
$relation = $tree->hasOneThrough(
    \App\Models\FruitType::class,
    \App\Models\FruitCrop::class,
    'id',            // Foreign key on FruitCrop
    'id',            // Foreign key on FruitType
    'fruit_crop_id', // Local key on Tree
    'fruit_type_id'  // Local key on FruitCrop
);
echo 'SQL: '.$relation->toSql()."\n";
echo 'Bindings: '.json_encode($relation->getBindings())."\n";
$result = $relation->first();
var_dump($result ? $result->toArray() : null);
