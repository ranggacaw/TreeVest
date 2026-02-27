<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class TwoFactorRecoveryCodeFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'code' => fake()->regexify('[A-Z0-9]{20}'),
            'used_at' => fake()->optional(0.2)->dateTimeBetween('-30 days', 'now'),
        ];
    }
}
