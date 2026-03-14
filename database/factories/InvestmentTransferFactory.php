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
        $transferPriceIdr = $this->faker->numberBetween(1000, 100000);
        $platformFeeIdr = (int) ceil($transferPriceIdr * config('treevest.secondary_market_fee_rate', 0.02));

        return [
            'investment_id' => Investment::factory(),
            'listing_id' => MarketListing::factory(),
            'from_user_id' => User::factory(),
            'to_user_id' => User::factory(),
            'transfer_price_idr' => $transferPriceIdr,
            'platform_fee_idr' => $platformFeeIdr,
            'transaction_id' => null,
            'transferred_at' => now(),
        ];
    }
}
