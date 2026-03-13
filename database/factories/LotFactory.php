<?php

namespace Database\Factories;

use App\Enums\LotStatus;
use App\Models\FruitCrop;
use App\Models\Rack;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Lot>
 */
class LotFactory extends Factory
{
    public function definition(): array
    {
        $cycleMonths = fake()->numberBetween(4, 12);
        $lastInvestmentMonth = fake()->numberBetween(1, $cycleMonths - 1);

        return [
            'rack_id' => Rack::factory(),
            'fruit_crop_id' => FruitCrop::factory(),
            'name' => 'L' . str_pad((string) fake()->numberBetween(1, 999), 3, '0', STR_PAD_LEFT),
            'total_trees' => fake()->numberBetween(5, 50),
            'base_price_per_tree_cents' => fake()->numberBetween(50000, 500000),
            'monthly_increase_rate' => '0.0500',
            'current_price_per_tree_cents' => fake()->numberBetween(50000, 500000),
            'cycle_started_at' => now()->subMonths(1)->toDateString(),
            'cycle_months' => $cycleMonths,
            'last_investment_month' => $lastInvestmentMonth,
            'status' => LotStatus::Active,
        ];
    }

    public function active(): static
    {
        return $this->state(fn (array $attrs) => [
            'status' => LotStatus::Active,
            'cycle_started_at' => now()->subDays(5)->toDateString(),
        ]);
    }

    public function inProgress(): static
    {
        return $this->state(fn (array $attrs) => [
            'status' => LotStatus::InProgress,
        ]);
    }

    public function harvest(): static
    {
        return $this->state(fn (array $attrs) => [
            'status' => LotStatus::Harvest,
            'harvest_total_fruit' => fake()->numberBetween(100, 2000),
            'harvest_total_weight_kg' => fake()->randomFloat(2, 50, 1000),
            'harvest_recorded_at' => now(),
        ]);
    }

    public function selling(): static
    {
        return $this->state(fn (array $attrs) => [
            'status' => LotStatus::Selling,
            'selling_revenue_cents' => fake()->numberBetween(1000000, 50000000),
            'selling_proof_photo' => 'lot-selling-proofs/proof.jpg',
            'selling_submitted_at' => now(),
        ]);
    }

    public function completed(): static
    {
        return $this->state(fn (array $attrs) => [
            'status' => LotStatus::Completed,
        ]);
    }

    /**
     * Lot with investment window clearly open (month 1 of a 6-month cycle).
     */
    public function cycleOpen(): static
    {
        return $this->state(fn (array $attrs) => [
            'status' => LotStatus::Active,
            'cycle_started_at' => now()->subDays(5)->toDateString(),
            'cycle_months' => 6,
            'last_investment_month' => 5,
            'base_price_per_tree_cents' => 100000,
            'current_price_per_tree_cents' => 100000,
            'monthly_increase_rate' => '0.0500',
        ]);
    }

    /**
     * Lot whose investment window is closed (started > last_investment_month months ago).
     */
    public function cycleClosed(): static
    {
        return $this->state(fn (array $attrs) => [
            'status' => LotStatus::Active,
            'cycle_started_at' => now()->subDays(200)->toDateString(),
            'cycle_months' => 6,
            'last_investment_month' => 2,
        ]);
    }
}
