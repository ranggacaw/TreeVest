<?php

namespace Database\Seeders;

use App\Models\PaymentMethod;
use App\Models\User;
use Illuminate\Database\Seeder;

class PaymentMethodSeeder extends Seeder
{
    public function run(): void
    {
        // Guard: skip if payment methods already exist
        if (PaymentMethod::count() > 0) {
            $this->command->info('PaymentMethodSeeder: data already exists, skipping.');
            return;
        }

        $users = User::whereIn('role', ['investor'])->get();

        foreach ($users as $user) {
            $numMethods = rand(1, 3);

            for ($i = 0; $i < $numMethods; $i++) {
                $isDefault = $i === 0;

                PaymentMethod::create([
                    'user_id' => $user->id,
                    'stripe_payment_method_id' => 'pm_' . fake()->unique()->lexify('??????????????????'),
                    'type' => $this->getRandomType(),
                    'last4' => fake()->randomNumber(4, true),
                    'brand' => $this->getRandomBrand(),
                    'exp_month' => rand(1, 12),
                    'exp_year' => rand(now()->year + 1, now()->year + 5),
                    'is_default' => $isDefault,
                    'created_at' => now()->subDays(rand(1, 365)),
                ]);
            }
        }

        $this->command->info('Payment methods seeded successfully!');
    }

    private function getRandomType(): string
    {
        $types = ['card', 'bank_account'];
        $weights = [90, 10];

        $total = array_sum($weights);
        $random = rand(1, $total);
        $current = 0;

        foreach ($types as $index => $type) {
            $current += $weights[$index];
            if ($random <= $current) {
                return $type;
            }
        }

        return 'card';
    }

    private function getRandomBrand(): string
    {
        $brands = ['visa', 'mastercard', 'amex', 'discover'];

        return $brands[array_rand($brands)];
    }
}
