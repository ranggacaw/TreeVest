<?php

namespace Database\Factories;

use App\Models\Farm;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Warehouse>
 */
class WarehouseFactory extends Factory
{
    public function definition(): array
    {
        return [
            'farm_id' => Farm::factory()->active(),
            'name' => 'Warehouse ' . fake()->randomLetter(),
            'description' => fake()->optional(0.6)->sentence(),
        ];
    }
}
