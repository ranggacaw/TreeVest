<?php

namespace Tests\Unit\Resources;

use App\Http\Resources\TreeResource;
use App\Models\Tree;
use App\Models\FruitCrop;
use App\Models\Farm;
use App\Models\FruitType;
use App\Enums\RiskRating;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TreeResourceTest extends TestCase
{
    use RefreshDatabase;

    public function test_tree_resource_transforms_basic_data()
    {
        $tree = Tree::factory()->create([
            'tree_identifier' => 'DUR001',
            'price_cents' => 500000, // Rp 5,000
            'expected_roi_percent' => 18,
            'risk_rating' => RiskRating::MEDIUM,
            'age_years' => 5,
            'productive_lifespan_years' => 25,
            'min_investment_cents' => 100000,
            'max_investment_cents' => 1000000,
        ]);

        $resource = new TreeResource($tree);
        $array = $resource->toArray(request());

        $this->assertEquals('DUR001', $array['identifier']);
        $this->assertEquals(500000, $array['price_cents']);
        $this->assertEquals('Rp 5,000.00', $array['price_formatted']);
        $this->assertEquals(18, $array['expected_roi']);
        $this->assertEquals('18%', $array['expected_roi_formatted']);
        $this->assertEquals('medium', $array['risk_rating']);
        $this->assertEquals(5, $array['age_years']);
        $this->assertEquals(25, $array['productive_lifespan_years']);
        $this->assertEquals(100000, $array['min_investment_cents']);
        $this->assertEquals(1000000, $array['max_investment_cents']);
        $this->assertEquals('Rp 1,000.00', $array['min_investment_formatted']);
        $this->assertEquals('Rp 10,000.00', $array['max_investment_formatted']);
    }

    public function test_basic_static_method_returns_essential_data()
    {
        $tree = Tree::factory()->create([
            'tree_identifier' => 'MAN001',
            'price_cents' => 300000,
            'expected_roi_percent' => 15,
        ]);

        $result = TreeResource::basic($tree);

        $this->assertEquals($tree->id, $result['id']);
        $this->assertEquals('MAN001', $result['identifier']);
        $this->assertEquals('Rp 3,000.00', $result['price_formatted']);
        $this->assertEquals(15, $result['expected_roi']);
    }

    public function test_basic_method_handles_null_tree()
    {
        $result = TreeResource::basic(null);

        $this->assertEquals([], $result);
    }

    public function test_marketplace_method_includes_crop_and_farm_data()
    {
        $fruitType = FruitType::factory()->create(['name' => 'Mango']);
        $farm = Farm::factory()->create([
            'name' => 'Tropical Paradise Farm',
            'city' => 'Bogor',
            'state' => 'West Java',
        ]);
        $fruitCrop = FruitCrop::factory()->create([
            'variant' => 'Harum Manis',
            'fruit_type_id' => $fruitType->id,
            'farm_id' => $farm->id,
        ]);
        $tree = Tree::factory()->create([
            'tree_identifier' => 'MAN002',
            'price_cents' => 250000,
            'expected_roi_percent' => 16,
            'risk_rating' => RiskRating::LOW,
            'min_investment_cents' => 50000,
            'max_investment_cents' => 500000,
            'fruit_crop_id' => $fruitCrop->id,
        ]);
        
        $tree->load(['fruitCrop.fruitType', 'fruitCrop.farm']);

        $resource = new TreeResource($tree);
        $result = $resource->marketplace();

        $this->assertEquals('MAN002', $result['identifier']);
        $this->assertEquals(250000, $result['price_cents']);
        $this->assertEquals('low', $result['risk_rating']);
        $this->assertEquals('Harum Manis', $result['fruit_crop']['variant']);
        $this->assertEquals('Mango', $result['fruit_crop']['fruit_type']);
        $this->assertEquals('Tropical Paradise Farm', $result['farm']['name']);
        $this->assertEquals('Bogor, West Java', $result['farm']['location']);
    }

    public function test_for_purchase_method_includes_complete_tree_data()
    {
        $fruitType = FruitType::factory()->create(['name' => 'Durian']);
        $farm = Farm::factory()->create([
            'name' => 'Durian Valley Farm',
            'city' => 'Medan',
            'state' => 'North Sumatra',
        ]);
        $fruitCrop = FruitCrop::factory()->create([
            'variant' => 'Musang King',
            'fruit_type_id' => $fruitType->id,
            'farm_id' => $farm->id,
        ]);
        $tree = Tree::factory()->create([
            'tree_identifier' => 'DUR003',
            'price_cents' => 800000,
            'expected_roi_percent' => 22,
            'risk_rating' => RiskRating::HIGH,
            'min_investment_cents' => 200000,
            'max_investment_cents' => 2000000,
            'fruit_crop_id' => $fruitCrop->id,
        ]);
        
        $tree->load(['fruitCrop.fruitType', 'fruitCrop.farm']);

        $resource = new TreeResource($tree);
        $result = $resource->forPurchase();

        $this->assertEquals('DUR003', $result['identifier']);
        $this->assertEquals(800000, $result['price_cents']);
        $this->assertEquals('Rp 8,000.00', $result['price_formatted']);
        $this->assertEquals(22, $result['expected_roi']);
        $this->assertEquals('22%', $result['expected_roi_formatted']);
        $this->assertEquals('high', $result['risk_rating']);
        $this->assertEquals(200000, $result['min_investment_cents']);
        $this->assertEquals(2000000, $result['max_investment_cents']);
        $this->assertEquals('Rp 2,000.00', $result['min_investment_formatted']);
        $this->assertEquals('Rp 20,000.00', $result['max_investment_formatted']);
        $this->assertEquals('Musang King', $result['fruit_crop']['variant']);
        $this->assertEquals('Durian', $result['fruit_crop']['fruit_type']);
        $this->assertEquals('Durian Valley Farm', $result['farm']['name']);
        $this->assertEquals('Medan, North Sumatra', $result['farm']['location']);
    }
}