<?php

namespace Database\Factories;

use App\Models\PaymentMethod;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class PaymentMethodFactory extends Factory
{
    protected $model = PaymentMethod::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'stripe_payment_method_id' => 'pm_test_' . $this->faker->uuid(),
            'type' => 'card',
            'last4' => $this->faker->randomNumber(4, true),
            'brand' => $this->faker->randomElement(['visa', 'mastercard', 'amex']),
            'exp_month' => str_pad($this->faker->numberBetween(1, 12), 2, '0'),
            'exp_year' => $this->faker->numberBetween(2025, 2030),
            'is_default' => false,
        ];
    }
}
