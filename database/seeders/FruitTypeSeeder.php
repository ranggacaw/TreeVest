<?php

namespace Database\Seeders;

use App\Models\FruitType;
use Illuminate\Database\Seeder;

class FruitTypeSeeder extends Seeder
{
    public function run(): void
    {
        $fruitTypes = [
            [
                'name' => 'Durian',
                'slug' => 'durian',
                'description' => 'The "King of Fruits" - known for its distinctive spiky exterior and creamy, aromatic flesh. Popular variants include Musang King, D24, Black Thorn, and Red Prawn.',
                'is_active' => true,
            ],
            [
                'name' => 'Mango',
                'slug' => 'mango',
                'description' => 'Tropical stone fruit known for its sweet flavor and rich aroma. Popular variants include Alphonso, Nam Doc Mai, Carabao, and Kent.',
                'is_active' => true,
            ],
            [
                'name' => 'Grapes',
                'slug' => 'grapes',
                'description' => 'Versatile fruit used for fresh consumption and wine production. Popular variants include Thompson Seedless, Concord, and Shine Muscat.',
                'is_active' => true,
            ],
            [
                'name' => 'Melon',
                'slug' => 'melon',
                'description' => 'Refreshing tropical and subtropical fruits known for their high water content and sweet flesh. Popular variants include Honeydew, Cantaloupe, and Yubari King.',
                'is_active' => true,
            ],
            [
                'name' => 'Citrus',
                'slug' => 'citrus',
                'description' => 'Family of tropical and subtropical fruits known for their acidic juice and aromatic peel. Popular variants include Valencia Orange, Meyer Lemon, and Pomelo.',
                'is_active' => true,
            ],
            [
                'name' => 'Others',
                'slug' => 'others',
                'description' => 'Other tropical and subtropical fruits including Avocado, Longan, Rambutan, and Mangosteen.',
                'is_active' => true,
            ],
        ];

        foreach ($fruitTypes as $fruitType) {
            FruitType::updateOrCreate(
                ['slug' => $fruitType['slug']],
                $fruitType
            );
        }
    }
}
