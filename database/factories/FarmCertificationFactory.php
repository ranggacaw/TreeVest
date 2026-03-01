<?php

namespace Database\Factories;

use App\Models\Farm;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\FarmCertification>
 */
class FarmCertificationFactory extends Factory
{
    public function definition(): array
    {
        return [
            'farm_id' => Farm::factory(),
            'name' => fake()->randomElement([
                'Organic Certification',
                'GlobalGAP',
                'Fair Trade',
                'Rainforest Alliance',
                'ISO 14001',
                'HACCP',
            ]),
            'issuer' => fake()->company(),
            'certificate_number' => strtoupper(fake()->bothify('???-######')),
            'issued_date' => fake()->date('Y-m-d', '-1 year'),
            'expiry_date' => fake()->date('Y-m-d', '+2 years'),
            'file_path' => fake()->optional(0.7)->uuid().'.pdf',
            'notes' => fake()->optional(0.3)->sentence(),
        ];
    }

    public function expired(): static
    {
        return $this->state(fn (array $attributes) => [
            'expiry_date' => fake()->date('Y-m-d', '-1 month'),
        ]);
    }

    public function expiringSoon(): static
    {
        return $this->state(fn (array $attributes) => [
            'expiry_date' => now()->addDays(rand(15, 45))->format('Y-m-d'),
        ]);
    }
}
