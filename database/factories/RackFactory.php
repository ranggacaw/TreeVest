<?php

namespace Database\Factories;

use App\Models\Warehouse;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Rack>
 */
class RackFactory extends Factory
{
    public function definition(): array
    {
        return [
            'warehouse_id' => Warehouse::factory(),
            'name' => 'R' . fake()->numberBetween(1, 99),
            'description' => fake()->optional(0.5)->sentence(),
        ];
    }
}
