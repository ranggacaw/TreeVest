<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TagSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tags = [
            ['name' => 'Investing', 'slug' => 'investing'],
            ['name' => 'Beginner', 'slug' => 'beginner'],
            ['name' => 'ROI', 'slug' => 'roi'],
            ['name' => 'Risk', 'slug' => 'risk'],
            ['name' => 'Harvest', 'slug' => 'harvest'],
            ['name' => 'Seasonal', 'slug' => 'seasonal'],
            ['name' => 'Market', 'slug' => 'market'],
            ['name' => 'Tips', 'slug' => 'tips'],
            ['name' => 'Guide', 'slug' => 'guide'],
            ['name' => 'Analysis', 'slug' => 'analysis'],
            ['name' => 'Premium', 'slug' => 'premium'],
            ['name' => 'Popular', 'slug' => 'popular'],
            ['name' => 'Exotic', 'slug' => 'exotic'],
            ['name' => 'Tropical', 'slug' => 'tropical'],
            ['name' => 'Cultivation', 'slug' => 'cultivation'],
        ];

        foreach ($tags as $tag) {
            \App\Models\Tag::firstOrCreate(
                ['slug' => $tag['slug']],
                $tag
            );
        }
    }
}
