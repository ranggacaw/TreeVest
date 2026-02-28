<?php

namespace Tests\Feature;

use App\Enums\FarmStatus;
use App\Models\Farm;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class FarmCrudTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
    }

    public function test_farm_owner_can_create_farm(): void
    {
        $owner = User::factory()->create(['role' => 'farm_owner']);

        $response = $this->actingAs($owner)->post('/farm-owner/farms', [
            'name' => 'Test Farm',
            'description' => 'A beautiful test farm',
            'address' => '123 Farm Road',
            'city' => 'Kuala Lumpur',
            'state' => 'Selangor',
            'country' => 'Malaysia',
            'postal_code' => '50000',
            'latitude' => 3.1390,
            'longitude' => 101.6869,
            'size_hectares' => 10.5,
            'capacity_trees' => 500,
            'soil_type' => 'Clay',
            'climate' => 'Tropical',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('farms', [
            'owner_id' => $owner->id,
            'name' => 'Test Farm',
            'city' => 'Kuala Lumpur',
            'status' => FarmStatus::PENDING_APPROVAL,
        ]);
    }

    public function test_farm_owner_can_view_own_farms(): void
    {
        $owner = User::factory()->create(['role' => 'farm_owner']);
        Farm::factory()->count(3)->create(['owner_id' => $owner->id]);

        $response = $this->actingAs($owner)->get('/farm-owner/farms');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Farms/Manage/Index'));
    }

    public function test_farm_owner_can_view_single_farm(): void
    {
        $owner = User::factory()->create(['role' => 'farm_owner']);
        $farm = Farm::factory()->create(['owner_id' => $owner->id]);

        $response = $this->actingAs($owner)->get("/farm-owner/farms/{$farm->id}");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Farms/Manage/Edit'));
    }

    public function test_farm_owner_can_update_own_farm(): void
    {
        $owner = User::factory()->create(['role' => 'farm_owner']);
        $farm = Farm::factory()->create(['owner_id' => $owner->id, 'status' => FarmStatus::PENDING_APPROVAL]);

        $response = $this->actingAs($owner)->put("/farm-owner/farms/{$farm->id}", [
            'name' => 'Updated Farm Name',
            'description' => $farm->description,
            'address' => $farm->address,
            'city' => $farm->city,
            'state' => $farm->state,
            'country' => $farm->country,
            'postal_code' => $farm->postal_code,
            'latitude' => $farm->latitude,
            'longitude' => $farm->longitude,
            'size_hectares' => $farm->size_hectares,
            'capacity_trees' => $farm->capacity_trees,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('farms', [
            'id' => $farm->id,
            'name' => 'Updated Farm Name',
        ]);
    }

    public function test_farm_owner_can_delete_own_farm(): void
    {
        $owner = User::factory()->create(['role' => 'farm_owner']);
        $farm = Farm::factory()->create(['owner_id' => $owner->id]);

        $response = $this->actingAs($owner)->delete("/farm-owner/farms/{$farm->id}");

        $response->assertRedirect('/farm-owner/farms');
        $this->assertSoftDeleted('farms', ['id' => $farm->id]);
    }

    public function test_farm_owner_cannot_access_other_owner_farm(): void
    {
        $owner1 = User::factory()->create(['role' => 'farm_owner']);
        $owner2 = User::factory()->create(['role' => 'farm_owner']);
        $farm = Farm::factory()->create(['owner_id' => $owner1->id]);

        $response = $this->actingAs($owner2)->get("/farm-owner/farms/{$farm->id}");

        $response->assertStatus(403);
    }

    public function test_farm_owner_cannot_update_other_owner_farm(): void
    {
        $owner1 = User::factory()->create(['role' => 'farm_owner']);
        $owner2 = User::factory()->create(['role' => 'farm_owner']);
        $farm = Farm::factory()->create(['owner_id' => $owner1->id]);

        $response = $this->actingAs($owner2)->put("/farm-owner/farms/{$farm->id}", [
            'name' => 'Hacked Name',
            'description' => 'Hacked',
            'address' => 'Hacked',
            'city' => 'Hacked',
            'state' => 'Hacked',
            'country' => 'Hacked',
            'postal_code' => '00000',
            'latitude' => 0,
            'longitude' => 0,
            'size_hectares' => 1,
            'capacity_trees' => 1,
        ]);

        $response->assertStatus(403);
    }

    public function test_farm_owner_cannot_delete_other_owner_farm(): void
    {
        $owner1 = User::factory()->create(['role' => 'farm_owner']);
        $owner2 = User::factory()->create(['role' => 'farm_owner']);
        $farm = Farm::factory()->create(['owner_id' => $owner1->id]);

        $response = $this->actingAs($owner2)->delete("/farm-owner/farms/{$farm->id}");

        $response->assertStatus(403);
    }

    public function test_investor_cannot_access_farm_owner_routes(): void
    {
        $investor = User::factory()->create(['role' => 'investor']);

        $response = $this->actingAs($investor)->get('/farm-owner/farms');

        $response->assertStatus(403);
    }

    public function test_guest_cannot_access_farm_owner_routes(): void
    {
        $response = $this->get('/farm-owner/farms');

        $response->assertRedirect('/login');
    }

    public function test_create_farm_validates_required_fields(): void
    {
        $owner = User::factory()->create(['role' => 'farm_owner']);

        $response = $this->actingAs($owner)->post('/farm-owner/farms', []);

        $response->assertSessionHasErrors(['name', 'address', 'city', 'country', 'latitude', 'longitude', 'size_hectares', 'capacity_trees']);
    }

    public function test_create_farm_validates_coordinates(): void
    {
        $owner = User::factory()->create(['role' => 'farm_owner']);

        $response = $this->actingAs($owner)->post('/farm-owner/farms', [
            'name' => 'Test Farm',
            'address' => '123 Test',
            'city' => 'Test City',
            'country' => 'Malaysia',
            'latitude' => 100, // Invalid
            'longitude' => 200, // Invalid
            'size_hectares' => 10,
            'capacity_trees' => 100,
        ]);

        $response->assertSessionHasErrors(['latitude', 'longitude']);
    }

    public function test_create_farm_with_images(): void
    {
        $owner = User::factory()->create(['role' => 'farm_owner']);
        $image = UploadedFile::fake()->image('farm.jpg', 800, 600);

        $response = $this->actingAs($owner)->post('/farm-owner/farms', [
            'name' => 'Test Farm',
            'description' => 'Test',
            'address' => '123 Test',
            'city' => 'Test City',
            'state' => 'Test State',
            'country' => 'Malaysia',
            'postal_code' => '12345',
            'latitude' => 3.1390,
            'longitude' => 101.6869,
            'size_hectares' => 10,
            'capacity_trees' => 100,
            'images' => [$image],
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('farm_images', [
            'farm_id' => Farm::where('name', 'Test Farm')->first()->id,
        ]);
    }

    public function test_updating_active_farm_triggers_reapproval(): void
    {
        $owner = User::factory()->create(['role' => 'farm_owner']);
        $farm = Farm::factory()->create(['owner_id' => $owner->id, 'status' => FarmStatus::ACTIVE]);

        $response = $this->actingAs($owner)->put("/farm-owner/farms/{$farm->id}", [
            'name' => 'Updated Farm Name',
            'description' => $farm->description,
            'address' => $farm->address,
            'city' => $farm->city,
            'state' => $farm->state,
            'country' => $farm->country,
            'postal_code' => $farm->postal_code,
            'latitude' => $farm->latitude,
            'longitude' => $farm->longitude,
            'size_hectares' => $farm->size_hectares,
            'capacity_trees' => $farm->capacity_trees,
        ]);

        $response->assertRedirect();
        $this->assertEquals(FarmStatus::PENDING_APPROVAL, $farm->fresh()->status);
        $this->assertNull($farm->fresh()->approved_at);
    }

    public function test_updating_pending_farm_does_not_trigger_reapproval(): void
    {
        $owner = User::factory()->create(['role' => 'farm_owner']);
        $farm = Farm::factory()->create(['owner_id' => $owner->id, 'status' => FarmStatus::PENDING_APPROVAL]);

        $response = $this->actingAs($owner)->put("/farm-owner/farms/{$farm->id}", [
            'name' => 'Updated Farm Name',
            'description' => $farm->description,
            'address' => $farm->address,
            'city' => $farm->city,
            'state' => $farm->state,
            'country' => $farm->country,
            'postal_code' => $farm->postal_code,
            'latitude' => $farm->latitude,
            'longitude' => $farm->longitude,
            'size_hectares' => $farm->size_hectares,
            'capacity_trees' => $farm->capacity_trees,
        ]);

        $response->assertRedirect();
        $this->assertEquals(FarmStatus::PENDING_APPROVAL, $farm->fresh()->status);
    }
}
