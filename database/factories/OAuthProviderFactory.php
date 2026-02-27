<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class OAuthProviderFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'provider' => fake()->randomElement(['google', 'facebook', 'apple']),
            'provider_user_id' => fake()->unique()->numerify('############'),
            'access_token' => fake()->sha256(),
            'refresh_token' => fake()->optional()->sha256(),
            'expires_at' => fake()->optional()->dateTimeBetween('now', '+1 year'),
        ];
    }
}
