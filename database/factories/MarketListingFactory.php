<?php

namespace Database\Factories;

use App\Enums\ListingStatus;
use App\Models\Investment;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class MarketListingFactory extends Factory
{
    public function definition(): array
    {
        $askPriceIdr = $this->faker->numberBetween(1000, 100000);
        $feeRate = config('treevest.secondary_market_fee_rate', 0.02);
        $platformFeeIdr = (int) ceil($askPriceIdr * $feeRate);

        return [
            'investment_id' => Investment::factory(),
            'seller_id' => User::factory(),
            'ask_price_idr' => $askPriceIdr,
            'currency' => 'IDR',
            'platform_fee_rate' => $feeRate,
            'platform_fee_idr' => $platformFeeIdr,
            'net_proceeds_idr' => $askPriceIdr - $platformFeeIdr,
            'status' => ListingStatus::Active,
            'buyer_id' => null,
            'purchased_at' => null,
            'cancelled_at' => null,
            'expires_at' => null,
            'notes' => $this->faker->optional()->sentence(),
            'metadata' => null,
        ];
    }

    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => ListingStatus::Active,
        ]);
    }

    public function sold(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => ListingStatus::Sold,
            'buyer_id' => User::factory(),
            'purchased_at' => now(),
        ]);
    }

    public function cancelled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => ListingStatus::Cancelled,
            'cancelled_at' => now(),
        ]);
    }

    public function expired(): static
    {
        return $this->state(fn (array $attributes) => [
            'expires_at' => now()->subDay(),
        ]);
    }
}
