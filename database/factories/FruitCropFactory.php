<?php

namespace Database\Factories;

use App\Models\Farm;
use App\Models\FruitType;
use Illuminate\Database\Eloquent\Factories\Factory;

class FruitCropFactory extends Factory
{
    public function definition(): array
    {
        return [
            'farm_id' => Farm::factory(),
            'fruit_type_id' => FruitType::factory(),
            'variant' => $this->faker->word(),
            'description' => $this->faker->sentence(),
            'harvest_cycle' => 'annual',
        ];
    }
}
