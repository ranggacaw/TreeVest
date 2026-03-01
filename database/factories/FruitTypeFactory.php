<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class FruitTypeFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => $this->faker->word(),
            'slug' => $this->faker->slug(),
            'description' => $this->faker->sentence(),
            'is_active' => true,
        ];
    }
}
