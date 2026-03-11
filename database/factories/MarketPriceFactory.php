<?php

namespace Database\Factories;

use App\Models\FruitType;
use Illuminate\Database\Eloquent\Factories\Factory;

class MarketPriceFactory extends Factory
{
    public function definition(): array
    {
        return [
            'fruit_type_id' => FruitType::factory(),
            'price_per_kg_cents' => $this->faker->numberBetween(500, 5000),
            'currency' => 'USD',
            'effective_date' => $this->faker->dateTimeBetween('-1 month', 'now')->format('Y-m-d'),
            'created_by' => null,
            'notes' => null,
        ];
    }
}
