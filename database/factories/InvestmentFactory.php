<?php

namespace Database\Factories;

use App\Enums\InvestmentStatus;
use App\Models\Transaction;
use App\Models\Tree;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class InvestmentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'tree_id' => Tree::factory(),
            'amount_cents' => $this->faker->numberBetween(1000, 100000),
            'currency' => 'MYR',
            'purchase_date' => now()->toDateString(),
            'status' => InvestmentStatus::PendingPayment,
            'transaction_id' => null,
            'metadata' => [
                'source' => 'web',
            ],
        ];
    }

    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => InvestmentStatus::Active,
        ]);
    }

    public function cancelled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => InvestmentStatus::Cancelled,
        ]);
    }

    public function matured(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => InvestmentStatus::Matured,
        ]);
    }

    public function withTransaction(int|Transaction $transactionId): static
    {
        $id = $transactionId instanceof Transaction ? $transactionId->id : $transactionId;

        return $this->state(fn (array $attributes) => [
            'transaction_id' => $id,
        ]);
    }
}
