<?php

namespace Database\Factories;

use App\Enums\HarvestStatus;
use App\Models\Tree;
use Illuminate\Database\Eloquent\Factories\Factory;

class HarvestFactory extends Factory
{
    public function definition(): array
    {
        $tree = Tree::factory()->create();

        return [
            'tree_id' => $tree->id,
            'fruit_crop_id' => $tree->fruit_crop_id,
            'scheduled_date' => $this->faker->dateTimeBetween('-1 year', '+1 year')->format('Y-m-d'),
            'status' => HarvestStatus::Scheduled,
            'estimated_yield_kg' => $this->faker->randomFloat(2, 10, 500),
            'actual_yield_kg' => null,
            'quality_grade' => null,
            'market_price_id' => null,
            'platform_fee_rate' => 0.1000,
            'notes' => null,
            'confirmed_by' => null,
            'confirmed_at' => null,
            'completed_at' => null,
            'failed_at' => null,
            'reminders_sent' => null,
        ];
    }

    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => HarvestStatus::Completed,
            'actual_yield_kg' => $this->faker->randomFloat(2, 10, 500),
            'quality_grade' => $this->faker->randomElement(['A', 'B', 'C']),
            'completed_at' => now(),
        ]);
    }

    public function forTree(Tree $tree): static
    {
        return $this->state(fn (array $attributes) => [
            'tree_id' => $tree->id,
            'fruit_crop_id' => $tree->fruit_crop_id,
        ]);
    }
}
