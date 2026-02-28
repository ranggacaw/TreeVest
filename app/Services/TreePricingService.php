<?php

namespace App\Services;

use App\Enums\RiskRating;
use App\Models\Tree;

class TreePricingService
{
    public function calculatePrice(Tree $tree): int
    {
        $config = $tree->pricing_config_json ?? $this->getDefaultConfig();

        $basePrice = $config['base_price'] ?? 100000;
        $ageCoefficient = $config['age_coefficient'] ?? 0.05;
        $cropPremium = $config['crop_premium'] ?? 1.0;
        $riskMultiplier = $config['risk_multiplier'] ?? $tree->risk_rating->getMultiplier();

        $price = $basePrice * (1 + $ageCoefficient * $tree->age_years) * $cropPremium * $riskMultiplier;

        return (int) round($price);
    }

    public function updateTreePrice(Tree $tree): void
    {
        $tree->price_cents = $this->calculatePrice($tree);
        $tree->save();
    }

    private function getDefaultConfig(): array
    {
        return [
            'base_price' => config('treevest.tree_pricing.default_base_price', 100000),
            'age_coefficient' => config('treevest.tree_pricing.default_age_coefficient', 0.05),
            'crop_premium' => config('treevest.tree_pricing.default_crop_premium', 1.0),
            'risk_multiplier' => RiskRating::LOW->getMultiplier(),
        ];
    }
}
