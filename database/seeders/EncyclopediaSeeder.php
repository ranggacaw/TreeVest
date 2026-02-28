<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class EncyclopediaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $author = \App\Models\User::where('role', 'admin')->first() ?? \App\Models\User::factory()->create(['role' => 'admin']);

        $fruitTypes = [
            [
                'title' => 'Durian',
                'slug' => 'durian-encyclopedia',
                'content' => '<h2>Durian Fruit Guide</h2><p>Durian is known as the "King of Fruits" in Southeast Asia. It\'s prized for its unique flavor and creamy texture.</p><h3>Popular Varieties</h3><ul><li><strong>Musang King:</strong> Premium variety from Malaysia, golden yellow flesh, intense aroma</li><li><strong>D24:</strong> Classic Malaysian variety, balanced sweetness and bitterness</li><li><strong>Black Thorn:</strong> Darker flesh, complex flavor profile</li><li><strong>Red Prawn:</strong> Reddish-orange flesh, sweet and mild</li></ul><h3>Seasonality</h3><p>Main harvest season: June-August<br>Secondary season: December-February</p>',
                'excerpt' => 'Everything you need to know about durian varieties, cultivation, and market demand.',
                'category_slug' => 'durian',
                'tags' => ['premium', 'exotic', 'tropical'],
            ],
            [
                'title' => 'Mango',
                'slug' => 'mango-encyclopedia',
                'content' => '<h2>Mango Fruit Guide</h2><p>Mangoes are among the most widely cultivated fruits in the tropics, prized for their sweetness and versatility.</p><h3>Popular Varieties</h3><ul><li><strong>Alphonso:</strong> Indian variety, rich sweet flavor, fiberless flesh</li><li><strong>Nam Doc Mai:</strong> Thai variety, elongated shape, very sweet</li><li><strong>Carabao:</strong> Philippine variety, commonly exported</li><li><strong>Kent:</strong> Florida variety, good for export, mild flavor</li></ul><h3>Seasonality</h3><p>Main harvest season: April-June<br>Varies by variety and region</p>',
                'excerpt' => 'Comprehensive guide to mango varieties, growing conditions, and market trends.',
                'category_slug' => 'mango',
                'tags' => ['popular', 'tropical', 'seasonal'],
            ],
            [
                'title' => 'Grapes',
                'slug' => 'grapes-encyclopedia',
                'content' => '<h2>Grape Cultivation Guide</h2><p>Grapes are versatile fruits used for fresh consumption, wine making, and dried products.</p><h3>Popular Varieties</h3><ul><li><strong>Thompson Seedless:</strong> Classic table grape, sweet and seedless</li><li><strong>Concord:</strong> American variety, distinct flavor, used for juice</li><li><strong>Shine Muscat:</strong> Japanese variety, extremely sweet, aromatic</li></ul><h3>Seasonality</h3><p>Harvest season: July-September (varies by variety)</p>',
                'excerpt' => 'Learn about grape varieties, vineyard management, and market opportunities.',
                'category_slug' => 'grapes',
                'tags' => ['cultivation', 'popular', 'seasonal'],
            ],
            [
                'title' => 'Melon',
                'slug' => 'melon-encyclopedia',
                'content' => '<h2>Melon Fruit Guide</h2><p>Melons are refreshing fruits grown in warm climates worldwide.</p><h3>Popular Varieties</h3><ul><li><strong>Honeydew:</strong> Sweet, pale green flesh, smooth rind</li><li><strong>Cantaloupe:</strong> Orange flesh, netted rind, aromatic</li><li><strong>Yubari King:</strong> Premium Japanese melon, very high value</li></ul><h3>Seasonality</h3><p>Harvest season: June-August (varies by variety)</p>',
                'excerpt' => 'Guide to melon varieties, cultivation requirements, and premium markets.',
                'category_slug' => 'melon',
                'tags' => ['premium', 'seasonal', 'popular'],
            ],
            [
                'title' => 'Citrus',
                'slug' => 'citrus-encyclopedia',
                'content' => '<h2>Citrus Fruit Guide</h2><p>Citrus fruits are among the most popular fruits globally, valued for their vitamin C content and refreshing flavor.</p><h3>Popular Varieties</h3><ul><li><strong>Valencia Orange:</strong> Juicing orange, excellent flavor</li><li><strong>Meyer Lemon:</strong> Sweeter than traditional lemons, thin skin</li><li><strong>Pomelo:</strong> Largest citrus fruit, mild sweet flavor</li></ul><h3>Seasonality</h3><p>Harvest season: Varies by variety, year-round production possible in tropical climates</p>',
                'excerpt' => 'Comprehensive guide to citrus varieties and cultivation.',
                'category_slug' => 'citrus',
                'tags' => ['popular', 'cultivation'],
            ],
            [
                'title' => 'Other Tropical Fruits',
                'slug' => 'other-tropical-fruits-encyclopedia',
                'content' => '<h2>Tropical Fruit Collection</h2><p>Explore other valuable tropical fruits available for investment.</p><h3>Featured Fruits</h3><ul><li><strong>Avocado:</strong> High demand superfood, premium varieties command high prices</li><li><strong>Longan:</strong> Sweet, translucent flesh, popular in Asian markets</li><li><strong>Rambutan:</strong> Hairy exterior, sweet juicy flesh</li><li><strong>Mangosteen:</strong> "Queen of Fruits", sweet-tangy flavor</li></ul><h3>Investment Potential</h3><p>Many of these fruits show strong growth potential as global demand for tropical fruits increases.</p>',
                'excerpt' => 'Guide to avocado, longan, rambutan, mangosteen and other tropical fruits.',
                'category_slug' => 'other-fruits',
                'tags' => ['exotic', 'tropical', 'premium'],
            ],
        ];

        foreach ($fruitTypes as $fruit) {
            $category = \App\Models\Category::where('slug', $fruit['category_slug'])->first();
            $tagModels = \App\Models\Tag::whereIn('slug', $fruit['tags'])->get()->pluck('id');

            $article = \App\Models\Article::firstOrCreate(
                ['slug' => $fruit['slug']],
                [
                    'title' => $fruit['title'],
                    'content' => $fruit['content'],
                    'excerpt' => $fruit['excerpt'],
                    'status' => 'published',
                    'published_at' => now(),
                    'author_id' => $author->id,
                ]
            );
            $article->categories()->sync([$category->id]);
            $article->tags()->sync($tagModels);
        }
    }
}
