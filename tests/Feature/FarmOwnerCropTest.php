<?php

namespace Tests\Feature;

use App\Models\Farm;
use App\Models\FruitCrop;
use App\Models\FruitType;
use App\Models\Tree;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FarmOwnerCropTest extends TestCase
{
    use RefreshDatabase;

    public function test_farm_owner_can_create_crop()
    {
        $user = User::factory()->create(['role' => 'farm_owner']);
        $farm = Farm::factory()->create(['owner_id' => $user->id]);
        $fruitType = FruitType::factory()->create();

        $response = $this->actingAs($user)->post(route('farm-owner.crops.store'), [
            'farm_id' => $farm->id,
            'fruit_type_id' => $fruitType->id,
            'variant' => 'Test Variant',
            'harvest_cycle' => 'annual',
            'description' => 'Test crop',
        ]);

        $response->assertRedirect(route('farm-owner.crops.index'));
        $this->assertDatabaseHas('fruit_crops', [
            'farm_id' => $farm->id,
            'variant' => 'Test Variant',
        ]);
    }

    public function test_crop_cannot_be_deleted_if_trees_exist()
    {
        $user = User::factory()->create(['role' => 'farm_owner']);
        $farm = Farm::factory()->create(['owner_id' => $user->id]);
        $fruitType = FruitType::factory()->create();
        $crop = FruitCrop::factory()->create(['farm_id' => $farm->id, 'fruit_type_id' => $fruitType->id]);

        $tree = Tree::factory()->create(['fruit_crop_id' => $crop->id]);

        $response = $this->actingAs($user)->from(route('farm-owner.crops.index'))
            ->delete(route('farm-owner.crops.destroy', $crop));

        $response->assertRedirect(route('farm-owner.crops.index'));
        $response->assertSessionHas('error', 'Cannot delete fruit crop with existing trees.');

        $this->assertDatabaseHas('fruit_crops', [
            'id' => $crop->id,
        ]);
    }
}
