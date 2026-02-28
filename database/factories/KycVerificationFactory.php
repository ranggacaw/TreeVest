<?php

namespace Database\Factories;

use App\Enums\KycStatus;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class KycVerificationFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'jurisdiction_code' => 'MY',
            'status' => KycStatus::PENDING,
            'submitted_at' => null,
            'verified_at' => null,
            'rejected_at' => null,
            'rejection_reason' => null,
            'verified_by_admin_id' => null,
            'expires_at' => null,
            'provider' => 'manual',
            'provider_reference_id' => null,
        ];
    }

    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => KycStatus::PENDING,
        ]);
    }

    public function submitted(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => KycStatus::SUBMITTED,
            'submitted_at' => now(),
            'provider_reference_id' => 'manual-'.fake()->randomNumber(),
        ]);
    }

    public function verified(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => KycStatus::VERIFIED,
            'submitted_at' => now()->subDays(2),
            'verified_at' => now(),
            'expires_at' => now()->addYear(),
            'provider_reference_id' => 'manual-'.fake()->randomNumber(),
        ]);
    }

    public function rejected(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => KycStatus::REJECTED,
            'submitted_at' => now()->subDays(3),
            'rejected_at' => now()->subDays(1),
            'rejection_reason' => fake()->sentence(),
            'provider_reference_id' => 'manual-'.fake()->randomNumber(),
        ]);
    }

    public function expired(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => KycStatus::VERIFIED,
            'submitted_at' => now()->subDays(400),
            'verified_at' => now()->subDays(398),
            'expires_at' => now()->subDays(33),
            'provider_reference_id' => 'manual-'.fake()->randomNumber(),
        ]);
    }
}
