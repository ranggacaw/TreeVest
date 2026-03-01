<?php

namespace Tests\Feature;

use App\Models\Farm;
use App\Models\FruitCrop;
use App\Models\FruitType;
use App\Models\Tree;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FarmOwnerTreeTest extends TestCase
{
    use RefreshDatabase;

    public function test_farm_owner_can_create_tree()
    {
        $user = User::factory()->create(['role' => 'farm_owner']);
        $farm = Farm::factory()->create(['owner_id' => $user->id]);
        $fruitType = FruitType::factory()->create();
        $crop = FruitCrop::factory()->create(['farm_id' => $farm->id, 'fruit_type_id' => $fruitType->id]);

        $response = $this->actingAs($user)->post(route('farm-owner.trees.store'), [
            'fruit_crop_id' => $crop->id,
            'tree_identifier' => 'TREE-001',
            'expected_roi_percent' => 12.5,
            'age_years' => 5,
            'productive_lifespan_years' => 20,
            'risk_rating' => 'medium',
            'min_investment_cents' => 1000,
            'max_investment_cents' => 10000,
            'status' => 'growing',
            'pricing_config' => [
                'base_price' => 10000,
                'age_coefficient' => 0.1,
                'crop_premium' => 1.0,
                'risk_multiplier' => 1.0,
            ],
        ]);

        $response->assertRedirect(route('farm-owner.trees.index'));
        $this->assertDatabaseHas('trees', [
            'fruit_crop_id' => $crop->id,
            'tree_identifier' => 'TREE-001',
            'price_cents' => 15000, // 10000 * 1.5 * 1 * 1
        ]);
    }

    public function test_tree_creation_fails_if_fruit_crop_belongs_to_different_farm()
    {
        $user1 = User::factory()->create(['role' => 'farm_owner']);
        $user2 = User::factory()->create(['role' => 'farm_owner']);

        $farm2 = Farm::factory()->create(['owner_id' => $user2->id]);
        $fruitType = FruitType::factory()->create();
        $crop2 = FruitCrop::factory()->create(['farm_id' => $farm2->id, 'fruit_type_id' => $fruitType->id]);

        $response = $this->actingAs($user1)->post(route('farm-owner.trees.store'), [
            'fruit_crop_id' => $crop2->id,
            'tree_identifier' => 'TREE-002',
            'expected_roi_percent' => 12.5,
            'age_years' => 5,
            'productive_lifespan_years' => 20,
            'risk_rating' => 'medium',
            'min_investment_cents' => 1000,
            'max_investment_cents' => 10000,
            'status' => 'growing',
            'pricing_config' => [
                'base_price' => 10000,
                'age_coefficient' => 0.1,
                'crop_premium' => 1.0,
                'risk_multiplier' => 1.0,
            ],
        ]);

        $response->assertForbidden();
    }

    public function test_tree_price_recalculation_on_age_years_update()
    {
        $user = User::factory()->create(['role' => 'farm_owner']);
        $farm = Farm::factory()->create(['owner_id' => $user->id]);
        $fruitType = FruitType::factory()->create();
        $crop = FruitCrop::factory()->create(['farm_id' => $farm->id, 'fruit_type_id' => $fruitType->id]);

        $tree = Tree::factory()->create([
            'fruit_crop_id' => $crop->id,
            'age_years' => 5,
            'pricing_config_json' => [
                'base_price' => 10000,
                'age_coefficient' => 0.1,
                'crop_premium' => 1.0,
                'risk_multiplier' => 1.0,
            ],
            'price_cents' => 15000,
        ]);

        $response = $this->actingAs($user)->put(route('farm-owner.trees.update', $tree), [
            'fruit_crop_id' => $crop->id,
            'tree_identifier' => $tree->tree_identifier,
            'expected_roi_percent' => $tree->expected_roi_percent,
            'age_years' => 10, // Changed age
            'productive_lifespan_years' => $tree->productive_lifespan_years,
            'risk_rating' => $tree->risk_rating->value,
            'min_investment_cents' => $tree->min_investment_cents,
            'max_investment_cents' => $tree->max_investment_cents,
            'status' => $tree->status->value,
            'pricing_config' => $tree->pricing_config_json,
        ]);

        $response->assertRedirect(route('farm-owner.trees.index'));
        $this->assertDatabaseHas('trees', [
            'id' => $tree->id,
            'age_years' => 10,
            'price_cents' => 20000, // 10000 * 2.0 * 1 * 1
        ]);
    }
}
