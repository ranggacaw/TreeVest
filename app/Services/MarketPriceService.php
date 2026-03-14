<?php

namespace App\Services;

use App\Models\MarketPrice;
use App\Models\User;
use Carbon\Carbon;

class MarketPriceService
{
    public function createPrice(array $data, User $admin): MarketPrice
    {
        return MarketPrice::create([
            'fruit_type_id' => $data['fruit_type_id'],
            'price_per_kg_idr' => $data['price_per_kg_idr'],
            'currency' => $data['currency'] ?? 'IDR',
            'effective_date' => Carbon::parse($data['effective_date']),
            'created_by' => $admin->id,
            'notes' => $data['notes'] ?? null,
        ]);
    }

    public function updatePrice(MarketPrice $price, array $data, User $admin): MarketPrice
    {
        $price->update([
            'price_per_kg_idr' => $data['price_per_kg_idr'],
            'notes' => $data['notes'] ?? $price->notes,
        ]);

        return $price->fresh();
    }

    public function getEffectivePrice(int $fruitTypeId, Carbon $referenceDate): ?MarketPrice
    {
        return MarketPrice::where('fruit_type_id', $fruitTypeId)
            ->where('effective_date', '<=', $referenceDate)
            ->orderBy('effective_date', 'desc')
            ->first();
    }
}
