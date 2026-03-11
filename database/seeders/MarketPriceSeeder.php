<?php

namespace Database\Seeders;

use App\Models\FruitType;
use App\Models\MarketPrice;
use App\Models\User;
use Illuminate\Database\Seeder;

class MarketPriceSeeder extends Seeder
{
    public function run(): void
    {
        // Guard: skip if market prices already exist
        if (MarketPrice::count() > 0) {
            $this->command->info('MarketPriceSeeder: data already exists, skipping.');

            return;
        }

        $admin = User::where('email', 'admin@treevest.com')->first();
        $fruitTypes = FruitType::all();

        $priceRanges = [
            'durian' => [4000, 6000],
            'mango' => [1200, 2500],
            'grapes' => [2500, 4500],
            'melon' => [800, 1500],
            'citrus' => [300, 800],
            'others' => [500, 2000],
        ];

        foreach ($fruitTypes as $fruitType) {
            $range = $priceRanges[$fruitType->slug] ?? [500, 2000];

            for ($i = 0; $i < 60; $i++) {
                $pricePerKgCents = rand($range[0] * 10, $range[1] * 10);
                $effectiveDate = now()->subDays($i);

                MarketPrice::create([
                    'fruit_type_id' => $fruitType->id,
                    'price_per_kg_cents' => $pricePerKgCents,
                    'currency' => 'IDR',
                    'effective_date' => $effectiveDate->toDateString(),
                    'created_by' => $admin->id,
                    'notes' => $this->getPriceNote($fruitType->name, $pricePerKgCents),
                ]);
            }
        }

        $this->command->info('Market prices seeded successfully!');
    }

    private function getPriceNote(string $fruitName, int $pricePerKgCents): string
    {
        $pricePerKg = $pricePerKgCents / 100;
        $trend = rand(0, 100);

        if ($trend < 35) {
            return "{$fruitName} prices showing upward trend. Current: Rp {$pricePerKg}/kg";
        } elseif ($trend < 70) {
            return "{$fruitName} prices stable. Current: Rp {$pricePerKg}/kg";
        } else {
            return "{$fruitName} prices slightly down. Current: Rp {$pricePerKg}/kg";
        }
    }
}
