<?php

namespace Database\Factories;

use App\Enums\FarmStatus;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\DB;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Farm>
 */
class FarmFactory extends Factory
{
    public function definition(): array
    {
        return [
            'owner_id' => User::factory(),
            'name' => fake()->company() . ' Farm',
            'description' => fake()->paragraphs(rand(2, 5), true),
            'address' => fake()->streetAddress(),
            'city' => fake()->city(),
            'state' => fake()->state(),
            'country' => fake()->country(),
            'postal_code' => fake()->postcode(),
            'latitude' => fake()->latitude(),
            'longitude' => fake()->longitude(),
            'size_hectares' => fake()->randomFloat(2, 1, 100),
            'capacity_trees' => fake()->numberBetween(100, 10000),
            'status' => FarmStatus::PENDING_APPROVAL,
            'soil_type' => fake()->randomElement(['Clay', 'Sandy', 'Loam', 'Silt', 'Peat']),
            'climate' => fake()->randomElement(['Tropical', 'Subtropical', 'Mediterranean', 'Temperate']),
            'historical_performance' => fake()->optional(0.7)->paragraph(),
            'virtual_tour_url' => fake()->optional(0.3)->url(),
            'rejection_reason' => null,
            'approved_at' => null,
            'approved_by' => null,
        ];
    }

    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => FarmStatus::ACTIVE,
            'approved_at' => now(),
            'approved_by' => User::factory(),
        ]);
    }

    public function suspended(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => FarmStatus::SUSPENDED,
        ]);
    }

    public function deactivated(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => FarmStatus::DEACTIVATED,
        ]);
    }

    public function withCoordinates(float $lat = 3.1390, float $lng = 101.6869): static
    {
        return $this->state(fn (array $attributes) => [
            'latitude' => (string) $lat,
            'longitude' => (string) $lng,
        ]);
    }
}
