<?php

namespace Tests\Feature\FarmOwner;

use App\Models\Farm;
use App\Models\FruitCrop;
use App\Models\Lot;
use App\Models\Rack;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WarehouseRackLotTest extends TestCase
{
    use RefreshDatabase;

    private User $farmOwner;

    private Farm $farm;

    protected function setUp(): void
    {
        parent::setUp();

        $this->farmOwner = User::factory()->create(['role' => 'farm_owner']);
        $this->farm = Farm::factory()->active()->create(['owner_id' => $this->farmOwner->id]);
    }

    // ── Warehouse ─────────────────────────────────────────────────

    public function test_farm_owner_can_list_warehouses(): void
    {
        Warehouse::factory()->create(['farm_id' => $this->farm->id]);

        $response = $this->actingAs($this->farmOwner)
            ->get(route('farm-owner.warehouses.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('FarmOwner/Warehouses/Index'));
    }

    public function test_farm_owner_can_create_warehouse(): void
    {
        $response = $this->actingAs($this->farmOwner)
            ->post(route('farm-owner.warehouses.store'), [
                'farm_id' => $this->farm->id,
                'name' => 'Warehouse A',
                'description' => 'Main storage',
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('warehouses', [
            'farm_id' => $this->farm->id,
            'name' => 'Warehouse A',
        ]);
    }

    public function test_farm_owner_cannot_create_warehouse_for_another_owners_farm(): void
    {
        $otherFarm = Farm::factory()->active()->create(); // different owner

        $response = $this->actingAs($this->farmOwner)
            ->post(route('farm-owner.warehouses.store'), [
                'farm_id' => $otherFarm->id,
                'name' => 'Stealth Warehouse',
                'description' => null,
            ]);

        $response->assertNotFound();
        $this->assertDatabaseMissing('warehouses', ['farm_id' => $otherFarm->id]);
    }

    public function test_farm_owner_can_view_warehouse(): void
    {
        $warehouse = Warehouse::factory()->create(['farm_id' => $this->farm->id]);

        $response = $this->actingAs($this->farmOwner)
            ->get(route('farm-owner.warehouses.show', $warehouse));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('FarmOwner/Warehouses/Show'));
    }

    public function test_farm_owner_cannot_view_other_owners_warehouse(): void
    {
        $otherWarehouse = Warehouse::factory()->create(); // different farm/owner

        $response = $this->actingAs($this->farmOwner)
            ->get(route('farm-owner.warehouses.show', $otherWarehouse));

        $response->assertForbidden();
    }

    // ── Rack ──────────────────────────────────────────────────────

    public function test_farm_owner_can_add_rack_to_warehouse(): void
    {
        $warehouse = Warehouse::factory()->create(['farm_id' => $this->farm->id]);

        $response = $this->actingAs($this->farmOwner)
            ->post(route('farm-owner.warehouses.racks.store', $warehouse), [
                'name' => 'R1',
                'description' => null,
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('racks', [
            'warehouse_id' => $warehouse->id,
            'name' => 'R1',
        ]);
    }

    public function test_farm_owner_cannot_add_rack_to_other_owners_warehouse(): void
    {
        $otherWarehouse = Warehouse::factory()->create(); // different owner

        $response = $this->actingAs($this->farmOwner)
            ->post(route('farm-owner.warehouses.racks.store', $otherWarehouse), [
                'name' => 'R-illegal',
            ]);

        $response->assertForbidden();
        $this->assertDatabaseMissing('racks', ['warehouse_id' => $otherWarehouse->id]);
    }

    // ── Lot ───────────────────────────────────────────────────────

    public function test_farm_owner_can_create_lot(): void
    {
        $warehouse = Warehouse::factory()->create(['farm_id' => $this->farm->id]);
        $rack = Rack::factory()->create(['warehouse_id' => $warehouse->id]);
        $crop = FruitCrop::factory()->create(['farm_id' => $this->farm->id]);

        $response = $this->actingAs($this->farmOwner)
            ->post(route('farm-owner.lots.store'), [
                'rack_id' => $rack->id,
                'fruit_crop_id' => $crop->id,
                'name' => 'L001',
                'total_trees' => 10,
                'base_price_per_tree_idr' => 1000,
                'monthly_increase_rate' => 0.05,
                'cycle_months' => 6,
                'last_investment_month' => 5,
                'cycle_started_at' => now()->toDateString(),
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('lots', [
            'rack_id' => $rack->id,
            'name' => 'L001',
            'status' => 'active',
        ]);

        $lot = Lot::where('name', 'L001')->first();
        $this->assertEquals(1000, $lot->base_price_per_tree_idr);
        $this->assertEquals(1000, $lot->current_price_per_tree_idr);
    }

    public function test_base_price_converts_idr_to_idr(): void
    {
        $warehouse = Warehouse::factory()->create(['farm_id' => $this->farm->id]);
        $rack = Rack::factory()->create(['warehouse_id' => $warehouse->id]);
        $crop = FruitCrop::factory()->create(['farm_id' => $this->farm->id]);

        $response = $this->actingAs($this->farmOwner)
            ->post(route('farm-owner.lots.store'), [
                'rack_id' => $rack->id,
                'fruit_crop_id' => $crop->id,
                'name' => 'L003',
                'total_trees' => 10,
                'base_price_per_tree_idr' => 1500000,
                'monthly_increase_rate' => 0.05,
                'cycle_months' => 6,
                'last_investment_month' => 5,
            ]);

        $response->assertRedirect();
        $lot = Lot::where('name', 'L003')->first();
        $this->assertEquals(1500000, $lot->base_price_per_tree_idr);
        $this->assertEquals(1500000, $lot->current_price_per_tree_idr);
    }

    public function test_farm_owner_cannot_create_lot_with_invalid_last_investment_month(): void
    {
        $warehouse = Warehouse::factory()->create(['farm_id' => $this->farm->id]);
        $rack = Rack::factory()->create(['warehouse_id' => $warehouse->id]);
        $crop = FruitCrop::factory()->create(['farm_id' => $this->farm->id]);

        $response = $this->actingAs($this->farmOwner)
            ->post(route('farm-owner.lots.store'), [
                'rack_id' => $rack->id,
                'fruit_crop_id' => $crop->id,
                'name' => 'L002',
                'total_trees' => 10,
                'base_price_per_tree_idr' => 1000,
                'monthly_increase_rate' => 0.05,
                'cycle_months' => 6,
                'last_investment_month' => 6, // equal to cycle_months — invalid
            ]);

        $response->assertSessionHasErrors('last_investment_month');
    }

    public function test_farm_owner_cannot_create_lot_for_another_owners_rack(): void
    {
        $otherWarehouse = Warehouse::factory()->create(); // different owner
        $otherRack = Rack::factory()->create(['warehouse_id' => $otherWarehouse->id]);
        $crop = FruitCrop::factory()->create(['farm_id' => $this->farm->id]);

        $response = $this->actingAs($this->farmOwner)
            ->post(route('farm-owner.lots.store'), [
                'rack_id' => $otherRack->id,
                'fruit_crop_id' => $crop->id,
                'name' => 'L-illegal',
                'total_trees' => 10,
                'base_price_per_tree_idr' => 1000,
                'monthly_increase_rate' => 0.05,
                'cycle_months' => 6,
                'last_investment_month' => 5,
            ]);

        $response->assertForbidden();
    }

    public function test_farm_owner_can_view_own_lot(): void
    {
        $warehouse = Warehouse::factory()->create(['farm_id' => $this->farm->id]);
        $rack = Rack::factory()->create(['warehouse_id' => $warehouse->id]);
        $lot = Lot::factory()->active()->create(['rack_id' => $rack->id]);

        $response = $this->actingAs($this->farmOwner)
            ->get(route('farm-owner.lots.show', $lot));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('FarmOwner/Lots/Show'));
    }

    public function test_farm_owner_cannot_view_other_owners_lot(): void
    {
        $lot = Lot::factory()->active()->create(); // belongs to a different owner via factory chain

        $response = $this->actingAs($this->farmOwner)
            ->get(route('farm-owner.lots.show', $lot));

        $response->assertForbidden();
    }

    public function test_unauthenticated_user_cannot_access_warehouses(): void
    {
        $response = $this->get(route('farm-owner.warehouses.index'));
        $response->assertRedirect(route('login'));
    }

    public function test_investor_cannot_access_farm_owner_warehouse_routes(): void
    {
        $investor = User::factory()->create(['role' => 'investor']);

        $response = $this->actingAs($investor)
            ->get(route('farm-owner.warehouses.index'));

        $response->assertForbidden();
    }
}
