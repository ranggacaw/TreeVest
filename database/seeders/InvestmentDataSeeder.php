<?php

namespace Database\Seeders;

use App\Enums\HarvestCycle;
use App\Enums\InvestmentStatus;
use App\Enums\RiskRating;
use App\Enums\TreeLifecycleStage;
use App\Models\Farm;
use App\Models\FruitCrop;
use App\Models\FruitType;
use App\Models\Investment;
use App\Models\Tree;
use App\Models\TreeHarvest;
use App\Models\User;
use Illuminate\Database\Seeder;

class InvestmentDataSeeder extends Seeder
{
    public function run(): void
    {
        // Get existing users
        $investor = User::where('email', 'investor@treevest.com')->first();
        $johnInvestor = User::where('email', 'john.investor@example.com')->first();

        // Get existing farms
        $farms = Farm::all();
        $fruitTypes = FruitType::all();

        if ($farms->isEmpty() || $fruitTypes->isEmpty()) {
            $this->command->error('Please run FarmSeeder and FruitTypeSeeder first!');
            return;
        }

        // Create fruit crops for each farm
        $durianType = $fruitTypes->where('slug', 'durian')->first();
        $mangoType = $fruitTypes->where('slug', 'mango')->first();
        $grapesType = $fruitTypes->where('slug', 'grapes')->first();
        $citrusType = $fruitTypes->where('slug', 'citrus')->first();

        // Musang King Durian Orchard crops
        $farm1 = $farms->where('name', 'Musang King Durian Orchard')->first();
        if ($farm1 && $durianType) {
            $crop1 = FruitCrop::create([
                'farm_id' => $farm1->id,
                'fruit_type_id' => $durianType->id,
                'variant' => 'Musang King',
                'description' => 'Premium Musang King durian with distinctive creamy texture and rich aroma',
                'harvest_cycle' => HarvestCycle::ANNUAL,
                'planted_date' => now()->subYears(8),
            ]);

            $crop2 = FruitCrop::create([
                'farm_id' => $farm1->id,
                'fruit_type_id' => $durianType->id,
                'variant' => 'Black Thorn',
                'description' => 'Sweet Black Thorn durian with unique chocolate undertones',
                'harvest_cycle' => HarvestCycle::ANNUAL,
                'planted_date' => now()->subYears(6),
            ]);

            // Create trees for crop1 (Musang King)
            for ($i = 1; $i <= 20; $i++) {
                $tree = Tree::create([
                    'fruit_crop_id' => $crop1->id,
                    'tree_identifier' => 'MK-DUR-' . str_pad($i, 4, '0', STR_PAD_LEFT),
                    'price_cents' => rand(150000, 250000), // RM 1,500 - RM 2,500
                    'expected_roi_percent' => rand(12, 18) + (rand(0, 99) / 100),
                    'age_years' => 8,
                    'productive_lifespan_years' => 25,
                    'risk_rating' => $i <= 10 ? RiskRating::LOW : RiskRating::MEDIUM,
                    'min_investment_cents' => 50000, // RM 500
                    'max_investment_cents' => 250000, // RM 2,500
                    'status' => TreeLifecycleStage::PRODUCTIVE,
                    'historical_yield_json' => [
                        'average_fruits_per_year' => rand(400, 600),
                        'average_weight_kg' => rand(150, 250),
                        'last_3_years' => [
                            ['year' => 2023, 'fruits' => rand(450, 550), 'weight_kg' => rand(180, 220)],
                            ['year' => 2024, 'fruits' => rand(480, 580), 'weight_kg' => rand(190, 230)],
                            ['year' => 2025, 'fruits' => rand(500, 600), 'weight_kg' => rand(200, 250)],
                        ],
                    ],
                    'pricing_config_json' => [
                        'base_price_per_kg' => 4500, // RM 45/kg in cents
                        'premium_multiplier' => 1.2,
                    ],
                ]);

                // Create some past harvests for productive trees
                if ($i <= 5) {
                    TreeHarvest::create([
                        'tree_id' => $tree->id,
                        'harvest_date' => now()->subYear(),
                        'estimated_yield_kg' => rand(180, 220),
                        'actual_yield_kg' => rand(180, 220),
                        'quality_grade' => 'A',
                        'notes' => 'Excellent harvest quality',
                    ]);
                }
            }

            // Create trees for crop2 (Black Thorn)
            for ($i = 1; $i <= 15; $i++) {
                Tree::create([
                    'fruit_crop_id' => $crop2->id,
                    'tree_identifier' => 'BT-DUR-' . str_pad($i, 4, '0', STR_PAD_LEFT),
                    'price_cents' => rand(120000, 200000), // RM 1,200 - RM 2,000
                    'expected_roi_percent' => rand(10, 16) + (rand(0, 99) / 100),
                    'age_years' => 6,
                    'productive_lifespan_years' => 25,
                    'risk_rating' => RiskRating::MEDIUM,
                    'min_investment_cents' => 50000, // RM 500
                    'max_investment_cents' => 200000, // RM 2,000
                    'status' => TreeLifecycleStage::GROWING,
                    'historical_yield_json' => [
                        'average_fruits_per_year' => rand(300, 450),
                        'average_weight_kg' => rand(120, 180),
                    ],
                    'pricing_config_json' => [
                        'base_price_per_kg' => 3800, // RM 38/kg in cents
                        'premium_multiplier' => 1.15,
                    ],
                ]);
            }
        }

        // Tropical Mango Paradise crops
        $farm2 = $farms->where('name', 'Tropical Mango Paradise')->first();
        if ($farm2 && $mangoType) {
            $crop3 = FruitCrop::create([
                'farm_id' => $farm2->id,
                'fruit_type_id' => $mangoType->id,
                'variant' => 'Alphonso',
                'description' => 'Premium Alphonso mango with sweet, fiberless flesh',
                'harvest_cycle' => HarvestCycle::ANNUAL,
                'planted_date' => now()->subYears(7),
            ]);

            $crop4 = FruitCrop::create([
                'farm_id' => $farm2->id,
                'fruit_type_id' => $mangoType->id,
                'variant' => 'Nam Doc Mai',
                'description' => 'Sweet Thai mango variety with smooth texture',
                'harvest_cycle' => HarvestCycle::ANNUAL,
                'planted_date' => now()->subYears(5),
            ]);

            // Create trees for Alphonso
            for ($i = 1; $i <= 25; $i++) {
                Tree::create([
                    'fruit_crop_id' => $crop3->id,
                    'tree_identifier' => 'ALP-MAN-' . str_pad($i, 4, '0', STR_PAD_LEFT),
                    'price_cents' => rand(80000, 150000), // RM 800 - RM 1,500
                    'expected_roi_percent' => rand(10, 15) + (rand(0, 99) / 100),
                    'age_years' => 7,
                    'productive_lifespan_years' => 20,
                    'risk_rating' => RiskRating::LOW,
                    'min_investment_cents' => 30000, // RM 300
                    'max_investment_cents' => 150000, // RM 1,500
                    'status' => TreeLifecycleStage::PRODUCTIVE,
                    'historical_yield_json' => [
                        'average_fruits_per_year' => rand(250, 350),
                        'average_weight_kg' => rand(80, 120),
                    ],
                    'pricing_config_json' => [
                        'base_price_per_kg' => 1500, // RM 15/kg in cents
                    ],
                ]);
            }

            // Create trees for Nam Doc Mai
            for ($i = 1; $i <= 20; $i++) {
                Tree::create([
                    'fruit_crop_id' => $crop4->id,
                    'tree_identifier' => 'NDM-MAN-' . str_pad($i, 4, '0', STR_PAD_LEFT),
                    'price_cents' => rand(70000, 130000), // RM 700 - RM 1,300
                    'expected_roi_percent' => rand(9, 14) + (rand(0, 99) / 100),
                    'age_years' => 5,
                    'productive_lifespan_years' => 20,
                    'risk_rating' => RiskRating::MEDIUM,
                    'min_investment_cents' => 30000, // RM 300
                    'max_investment_cents' => 130000, // RM 1,300
                    'status' => TreeLifecycleStage::PRODUCTIVE,
                    'historical_yield_json' => [
                        'average_fruits_per_year' => rand(220, 300),
                        'average_weight_kg' => rand(70, 100),
                    ],
                    'pricing_config_json' => [
                        'base_price_per_kg' => 1200, // RM 12/kg in cents
                    ],
                ]);
            }
        }

        // Royal Grape Vineyard crops
        $farm3 = $farms->where('name', 'Royal Grape Vineyard')->first();
        if ($farm3 && $grapesType) {
            $crop5 = FruitCrop::create([
                'farm_id' => $farm3->id,
                'fruit_type_id' => $grapesType->id,
                'variant' => 'Shine Muscat',
                'description' => 'Premium Japanese green grape variety with exceptional sweetness',
                'harvest_cycle' => HarvestCycle::BIANNUAL,
                'planted_date' => now()->subYears(4),
            ]);

            // Create trees for Shine Muscat
            for ($i = 1; $i <= 30; $i++) {
                Tree::create([
                    'fruit_crop_id' => $crop5->id,
                    'tree_identifier' => 'SM-GRP-' . str_pad($i, 4, '0', STR_PAD_LEFT),
                    'price_cents' => rand(50000, 100000), // RM 500 - RM 1,000
                    'expected_roi_percent' => rand(15, 22) + (rand(0, 99) / 100),
                    'age_years' => 4,
                    'productive_lifespan_years' => 15,
                    'risk_rating' => RiskRating::MEDIUM,
                    'min_investment_cents' => 20000, // RM 200
                    'max_investment_cents' => 100000, // RM 1,000
                    'status' => TreeLifecycleStage::PRODUCTIVE,
                    'historical_yield_json' => [
                        'average_kg_per_cycle' => rand(12, 18),
                        'cycles_per_year' => 2,
                    ],
                    'pricing_config_json' => [
                        'base_price_per_kg' => 3000, // RM 30/kg in cents
                    ],
                ]);
            }
        }

        // Citrus Grove Estate crops
        $farm4 = $farms->where('name', 'Citrus Grove Estate')->first();
        if ($farm4 && $citrusType) {
            $crop6 = FruitCrop::create([
                'farm_id' => $farm4->id,
                'fruit_type_id' => $citrusType->id,
                'variant' => 'Valencia Orange',
                'description' => 'Sweet Valencia oranges perfect for juicing and fresh consumption',
                'harvest_cycle' => HarvestCycle::BIANNUAL,
                'planted_date' => now()->subYears(6),
            ]);

            // Create trees for Valencia Orange
            for ($i = 1; $i <= 20; $i++) {
                Tree::create([
                    'fruit_crop_id' => $crop6->id,
                    'tree_identifier' => 'VO-CIT-' . str_pad($i, 4, '0', STR_PAD_LEFT),
                    'price_cents' => rand(60000, 110000), // RM 600 - RM 1,100
                    'expected_roi_percent' => rand(11, 16) + (rand(0, 99) / 100),
                    'age_years' => 6,
                    'productive_lifespan_years' => 18,
                    'risk_rating' => RiskRating::LOW,
                    'min_investment_cents' => 25000, // RM 250
                    'max_investment_cents' => 110000, // RM 1,100
                    'status' => TreeLifecycleStage::PRODUCTIVE,
                    'historical_yield_json' => [
                        'average_kg_per_cycle' => rand(40, 60),
                        'cycles_per_year' => 2,
                    ],
                    'pricing_config_json' => [
                        'base_price_per_kg' => 500, // RM 5/kg in cents
                    ],
                ]);
            }
        }

        // Create sample investments for the investor users
        if ($investor && $johnInvestor) {
            $investableTrees = Tree::investable()->limit(10)->get();

            foreach ($investableTrees->take(5) as $index => $tree) {
                Investment::create([
                    'user_id' => $investor->id,
                    'tree_id' => $tree->id,
                    'amount_cents' => $tree->price_cents,
                    'currency' => 'MYR',
                    'purchase_date' => now()->subDays(rand(30, 180)),
                    'status' => InvestmentStatus::Active,
                    'metadata' => [
                        'purchase_method' => 'credit_card',
                        'expected_roi' => $tree->expected_roi_percent,
                    ],
                ]);
            }

            foreach ($investableTrees->skip(5)->take(3) as $tree) {
                Investment::create([
                    'user_id' => $johnInvestor->id,
                    'tree_id' => $tree->id,
                    'amount_cents' => $tree->price_cents,
                    'currency' => 'MYR',
                    'purchase_date' => now()->subDays(rand(10, 90)),
                    'status' => InvestmentStatus::Active,
                    'metadata' => [
                        'purchase_method' => 'bank_transfer',
                        'expected_roi' => $tree->expected_roi_percent,
                    ],
                ]);
            }
        }

        $this->command->info('Investment data seeded successfully!');
        $this->command->info('Created fruit crops, trees, and sample investments.');
    }
}
