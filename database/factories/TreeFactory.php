<?php

namespace Database\Factories;

use App\Models\FruitCrop;
use Illuminate\Database\Eloquent\Factories\Factory;

class TreeFactory extends Factory
{
    public function definition(): array
    {
        return [
            'fruit_crop_id' => FruitCrop::factory(),
            'tree_identifier' => $this->faker->unique()->word(),
            'price_cents' => 10000,
            'expected_roi_percent' => 12.5,
            'age_years' => 5,
            'productive_lifespan_years' => 20,
            'risk_rating' => 'medium',
            'min_investment_cents' => 1000,
            'max_investment_cents' => 10000,
            'status' => 'growing',
            'pricing_config_json' => [
                'base_price' => 10000,
                'age_coefficient' => 0.1,
                'crop_premium' => 1.0,
                'risk_multiplier' => 1.0,
            ],
        ];
    }
}
