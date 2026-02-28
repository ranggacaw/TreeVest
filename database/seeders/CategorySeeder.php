<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Getting Started',
                'slug' => 'getting-started',
                'description' => 'Introduction to fruit tree investing basics',
            ],
            [
                'name' => 'Risk Management',
                'slug' => 'risk-management',
                'description' => 'Understanding and managing investment risks',
            ],
            [
                'name' => 'Harvest Cycles',
                'slug' => 'harvest-cycles',
                'description' => 'Information about fruit harvest patterns and timing',
            ],
            [
                'name' => 'Market Analysis',
                'slug' => 'market-analysis',
                'description' => 'Market trends and fruit price analysis',
            ],
            [
                'name' => 'Investment Strategies',
                'slug' => 'investment-strategies',
                'description' => 'Strategies for successful fruit tree investments',
            ],
            [
                'name' => 'Durian',
                'slug' => 'durian',
                'description' => 'All about durian fruit varieties and cultivation',
            ],
            [
                'name' => 'Mango',
                'slug' => 'mango',
                'description' => 'Mango varieties and growing information',
            ],
            [
                'name' => 'Grapes',
                'slug' => 'grapes',
                'description' => 'Grape varieties and vineyard management',
            ],
            [
                'name' => 'Melon',
                'slug' => 'melon',
                'description' => 'Melon varieties and cultivation guide',
            ],
            [
                'name' => 'Citrus',
                'slug' => 'citrus',
                'description' => 'Citrus fruit varieties and care',
            ],
            [
                'name' => 'Other Fruits',
                'slug' => 'other-fruits',
                'description' => 'Avocado, Longan, Rambutan, Mangosteen and more',
            ],
        ];

        foreach ($categories as $category) {
            \App\Models\Category::firstOrCreate(
                ['slug' => $category['slug']],
                $category
            );
        }
    }
}
