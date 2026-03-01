<?php

namespace Database\Factories;

use App\Models\Investment;
use App\Models\MarketListing;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class InvestmentTransferFactory extends Factory
{
    public function definition(): array
    {
        $transferPriceCents = $this->faker->numberBetween(1000, 100000);
        $platformFeeCents = (int) ceil($transferPriceCents * config('treevest.secondary_market_fee_rate', 0.02));

        return [
            'investment_id' => Investment::factory(),
            'listing_id' => MarketListing::factory(),
            'from_user_id' => User::factory(),
            'to_user_id' => User::factory(),
            'transfer_price_cents' => $transferPriceCents,
            'platform_fee_cents' => $platformFeeCents,
            'transaction_id' => null,
            'transferred_at' => now(),
        ];
    }
}
