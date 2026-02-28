<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class EducationContentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $author = \App\Models\User::where('role', 'admin')->first() ?? \App\Models\User::factory()->create(['role' => 'admin']);
        $category = \App\Models\Category::where('slug', 'getting-started')->first();
        $tags = \App\Models\Tag::whereIn('slug', ['investing', 'beginner', 'guide'])->get();

        $articles = [
            [
                'title' => 'How Fruit Tree Investing Works',
                'slug' => 'how-fruit-tree-investing-works',
                'content' => '<h2>Understanding Fruit Tree Investments</h2><p>Fruit tree investing allows you to purchase ownership shares in individual fruit trees on partner farms. Unlike traditional investments, your returns are tied to actual agricultural harvests, not market speculation.</p><h3>The Investment Process</h3><p>1. Browse available trees on our marketplace<br>2. Select trees based on fruit type, ROI projections, and risk ratings<br>3. Complete your purchase through our secure payment system<br>4. Monitor your tree\'s growth through regular updates<br>5. Receive returns when harvests are sold</p><h3>Key Benefits</h3><p>- Real asset ownership<br>- Predictable harvest cycles<br>- Diversification from traditional markets<br>- Transparency in tree growth and health</p>',
                'excerpt' => 'Learn how fruit tree investing works and how you can earn returns from real agricultural harvests.',
                'status' => 'published',
                'published_at' => now(),
            ],
            [
                'title' => 'Understanding Risk Factors',
                'slug' => 'understanding-risk-factors',
                'content' => '<h2>Investment Risks Explained</h2><p>Like all investments, fruit tree investing carries certain risks. Understanding these risks helps you make informed decisions.</p><h3>Common Risk Factors</h3><p><strong>Weather Risks:</strong> Adverse weather conditions can affect harvest yields.<br><strong>Pest and Disease:</strong> Crops may be impacted by pests or diseases.<br><strong>Market Fluctuations:</strong> Fruit prices may vary based on supply and demand.<br><strong>Tree Health:</strong> Trees may experience health issues affecting production.</p><h3>Risk Mitigation</h3><p>Our platform implements several risk mitigation strategies: professional farm management, crop insurance where available, diversified portfolio recommendations, and regular health monitoring.</p>',
                'excerpt' => 'Understand the risks associated with fruit tree investing and how we help mitigate them.',
                'status' => 'published',
                'published_at' => now(),
            ],
            [
                'title' => 'Harvest Cycles Explained',
                'slug' => 'harvest-cycles-explained',
                'content' => '<h2>Understanding Harvest Cycles</h2><p>Different fruit types have different harvest patterns. Understanding these cycles helps you plan your investment returns.</p><h3>Common Harvest Patterns</h3><p><strong>Annual:</strong> One harvest per year (e.g., citrus)<br><strong>Bi-annual:</strong> Two harvests per year (e.g., some mango varieties)<br><strong>Seasonal:</strong> Specific harvest windows based on climate</p><h3>Expected Harvest Timeline</h3><p>Most fruit trees begin producing within 1-3 years after planting, with full productivity reached in 5-7 years. Your investment details will show expected harvest schedules for each tree.</p>',
                'excerpt' => 'Learn about different fruit harvest cycles and when to expect returns from your investments.',
                'status' => 'published',
                'published_at' => now(),
            ],
            [
                'title' => 'ROI Calculation Guide',
                'slug' => 'roi-calculation-guide',
                'content' => '<h2>Calculating Your Returns</h2><p>Return on Investment (ROI) in fruit tree investing is calculated based on actual harvest proceeds minus costs.</p><h3>ROI Formula</h3><p>ROI = (Harvest Proceeds - Initial Investment) / Initial Investment × 100%</p><h3>Example Calculation</h3><p>If you invest $1,000 in a durian tree:<br>- Annual harvest proceeds: $200<br>- 5-year total: $1,000<br>- ROI after 5 years: 0% (break even)<br>- Year 6 onward: Profit</p><h3>Factors Affecting ROI</h3><p>Fruit quality, market prices, harvest yield, tree health, and maintenance costs all impact your actual returns.</p>',
                'excerpt' => 'A comprehensive guide to calculating ROI for your fruit tree investments.',
                'status' => 'published',
                'published_at' => now(),
            ],
            [
                'title' => 'Market Trends Analysis',
                'slug' => 'market-trends-analysis',
                'content' => '<h2>Current Market Trends</h2><p>Stay informed about the latest trends in fruit markets and how they might affect your investments.</p><h3>Premium Fruit Demand</h3><p>Premium fruit varieties like Musang King durian and Shine Muscat grapes continue to see strong demand, particularly in Asian markets. Prices have shown steady growth over the past 5 years.</p><h3>Supply Chain Developments</h3><p>Improved cold chain logistics and export capabilities are expanding market reach for tropical fruits, creating new opportunities for investors.</p><h3>Sustainability Focus</h3><p>Consumers increasingly prioritize sustainably grown fruits, which may command premium prices in the future.</p>',
                'excerpt' => 'Analysis of current market trends in the fruit industry and their impact on investments.',
                'status' => 'published',
                'published_at' => now(),
            ],
        ];

        foreach ($articles as $articleData) {
            $article = \App\Models\Article::firstOrCreate(
                ['slug' => $articleData['slug']],
                array_merge($articleData, ['author_id' => $author->id])
            );
            $article->categories()->sync([$category->id]);
            $article->tags()->sync($tags->pluck('id'));
        }
    }
}
