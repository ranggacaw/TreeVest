<?php

namespace Tests\Unit;

use App\Models\Tree;
use App\Services\TreePricingService;
use PHPUnit\Framework\TestCase;

class TreePricingServiceTest extends TestCase
{
    public function test_calculate_price()
    {
        $service = new TreePricingService();

        $tree = new Tree([
            'age_years' => 5,
            'pricing_config_json' => [
                'base_price' => 10000,
                'age_coefficient' => 0.1,
                'crop_premium' => 1.5,
                'risk_multiplier' => 1.2,
            ]
        ]);

        $price = $service->calculatePrice($tree);

        $this->assertEquals(27000, $price);
    }
}
