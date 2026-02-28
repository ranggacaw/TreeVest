<?php

namespace Database\Factories;

use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class TransactionFactory extends Factory
{
    protected $model = Transaction::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'type' => TransactionType::InvestmentPurchase,
            'status' => TransactionStatus::Pending,
            'amount' => $this->faker->numberBetween(1000, 100000),
            'currency' => 'MYR',
            'stripe_payment_intent_id' => 'pi_test_' . $this->faker->uuid(),
            'metadata' => [],
            'stripe_metadata' => [],
        ];
    }
}
