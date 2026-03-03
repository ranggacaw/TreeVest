<?php

namespace Database\Factories;

use App\Enums\PayoutStatus;
use App\Models\Harvest;
use App\Models\Investment;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class PayoutFactory extends Factory
{
    public function definition(): array
    {
        $investment = Investment::factory()->create();
        $harvest = Harvest::factory()->forTree($investment->tree)->create();

        return [
            'investment_id' => $investment->id,
            'harvest_id' => $harvest->id,
            'investor_id' => $investment->user_id,
            'gross_amount_cents' => $this->faker->numberBetween(10000, 1000000),
            'platform_fee_cents' => $this->faker->numberBetween(1000, 100000),
            'net_amount_cents' => $this->faker->numberBetween(9000, 900000),
            'currency' => 'IDR',
            'status' => PayoutStatus::Pending,
            'payout_method' => null,
            'transaction_id' => null,
            'notes' => null,
            'processing_started_at' => null,
            'completed_at' => null,
            'failed_at' => null,
            'failed_reason' => null,
        ];
    }

    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => PayoutStatus::Completed,
            'completed_at' => now(),
        ]);
    }

    public function forInvestment(Investment $investment): static
    {
        $harvest = Harvest::factory()->forTree($investment->tree)->create();

        return $this->state(fn (array $attributes) => [
            'investment_id' => $investment->id,
            'harvest_id' => $harvest->id,
            'investor_id' => $investment->user_id,
        ]);
    }
}
