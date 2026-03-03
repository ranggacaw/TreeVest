<?php

namespace Tests\Unit\Resources;

use App\Http\Resources\InvestmentResource;
use App\Models\Investment;
use App\Models\Tree;
use App\Models\FruitCrop;
use App\Models\Farm;
use App\Models\FruitType;
use App\Models\Transaction;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InvestmentResourceTest extends TestCase
{
    use RefreshDatabase;

    public function test_investment_resource_transforms_basic_data()
    {
        $investment = Investment::factory()->create([
            'amount_cents' => 150000, // Rp 1,500
            'currency' => 'IDR',
        ]);

        $resource = new InvestmentResource($investment);
        $array = $resource->toArray(request());

        $this->assertEquals($investment->id, $array['id']);
        $this->assertEquals(150000, $array['amount_cents']);
        $this->assertEquals('Rp 1,500.00', $array['formatted_amount']);
        $this->assertEquals('IDR', $array['currency']);
        $this->assertEquals($investment->status->value, $array['status']);
        $this->assertEquals($investment->purchase_date->toIso8601String(), $array['purchase_date']);
    }

    public function test_basic_static_method_returns_simplified_data()
    {
        $tree = Tree::factory()->create([
            'tree_identifier' => 'TREE001',
            'price_cents' => 200000,
            'expected_roi_percent' => 15,
        ]);

        $investment = Investment::factory()->create([
            'tree_id' => $tree->id,
            'amount_cents' => 150000,
        ]);
        
        $investment->load('tree');

        $result = InvestmentResource::basic($investment);

        $this->assertEquals($investment->id, $result['id']);
        $this->assertEquals(150000, $result['amount_cents']);
        $this->assertEquals('Rp 1,500.00', $result['formatted_amount']);
        $this->assertEquals('TREE001', $result['tree']['identifier']);
    }

    public function test_for_confirmation_method_includes_transaction_data()
    {
        $fruitType = FruitType::factory()->create(['name' => 'Durian']);
        $farm = Farm::factory()->create(['name' => 'Green Valley Farm']);
        $fruitCrop = FruitCrop::factory()->create([
            'variant' => 'Musang King',
            'fruit_type_id' => $fruitType->id,
            'farm_id' => $farm->id,
        ]);
        $tree = Tree::factory()->create([
            'tree_identifier' => 'TREE001',
            'fruit_crop_id' => $fruitCrop->id,
        ]);
        $transaction = Transaction::factory()->create([
            'metadata' => ['client_secret' => 'pi_test_123_secret_456']
        ]);
        
        $investment = Investment::factory()->create([
            'tree_id' => $tree->id,
            'transaction_id' => $transaction->id,
            'amount_cents' => 250000,
        ]);
        
        $investment->load(['tree.fruitCrop.farm', 'tree.fruitCrop.fruitType', 'transaction']);

        $resource = new InvestmentResource($investment);
        $result = $resource->forConfirmation();

        $this->assertEquals($investment->id, $result['id']);
        $this->assertEquals('TREE001', $result['tree']['identifier']);
        $this->assertEquals('Musang King', $result['tree']['fruit_crop']['variant']);
        $this->assertEquals('Durian', $result['tree']['fruit_crop']['fruit_type']);
        $this->assertEquals('Green Valley Farm', $result['tree']['farm']['name']);
        $this->assertEquals('pi_test_123_secret_456', $result['transaction']['client_secret']);
    }

    public function test_for_top_up_method_includes_tree_limits()
    {
        $tree = Tree::factory()->create([
            'tree_identifier' => 'TREE002',
            'max_investment_cents' => 1000000, // Rp 10,000
        ]);
        
        $investment = Investment::factory()->create([
            'tree_id' => $tree->id,
            'amount_cents' => 500000, // Rp 5,000
        ]);
        
        $investment->load('tree');

        $resource = new InvestmentResource($investment);
        $result = $resource->forTopUp();

        $this->assertEquals($investment->id, $result['id']);
        $this->assertEquals(500000, $result['amount_cents']);
        $this->assertEquals('Rp 5,000.00', $result['formatted_amount']);
        $this->assertEquals('TREE002', $result['tree']['identifier']);
        $this->assertEquals(1000000, $result['tree']['max_investment_cents']);
    }

    public function test_resource_calculates_projected_return()
    {
        $tree = Tree::factory()->create([
            'expected_roi_percent' => 20,
        ]);
        
        $investment = Investment::factory()->create([
            'tree_id' => $tree->id,
            'amount_cents' => 100000, // Rp 1,000
        ]);
        
        $investment->load('tree');

        $resource = new InvestmentResource($investment);
        $array = $resource->toArray(request());

        // 20% of 100,000 = 20,000
        $this->assertEquals(20000, $array['projected_return_cents']);
    }
}