<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class TwoFactorSecretFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'type' => fake()->randomElement(['totp', 'sms']),
            'secret' => fake()->asciify('****************************************'),
            'enabled_at' => fake()->dateTimeBetween('-30 days', 'now'),
            'last_used_at' => fake()->optional()->dateTimeBetween('-30 days', 'now'),
        ];
    }
}
