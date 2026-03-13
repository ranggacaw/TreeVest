<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Wallet>
 */
class WalletFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'balance_cents' => fake()->numberBetween(0, 10_000_000),
            'currency' => 'IDR',
            'is_platform' => false,
        ];
    }

    public function platform(): static
    {
        return $this->state(fn (array $attrs) => [
            'user_id' => null,
            'is_platform' => true,
        ]);
    }

    public function funded(int $amountCents = 1_000_000): static
    {
        return $this->state(fn (array $attrs) => [
            'balance_cents' => $amountCents,
        ]);
    }

    public function empty(): static
    {
        return $this->state(fn (array $attrs) => [
            'balance_cents' => 0,
        ]);
    }
}
