<?php

namespace Tests\Feature;

use App\Enums\FarmStatus;
use App\Models\Farm;
use App\Models\FarmImage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FarmMarketplaceTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_view_marketplace_farms(): void
    {
        Farm::factory()->count(3)->create(['status' => FarmStatus::ACTIVE]);

        $response = $this->get('/farms');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Farms/Index'));
    }

    public function test_marketplace_shows_only_active_farms(): void
    {
        Farm::factory()->create(['status' => FarmStatus::ACTIVE, 'name' => 'Active Farm']);
        Farm::factory()->create(['status' => FarmStatus::PENDING_APPROVAL, 'name' => 'Pending Farm']);
        Farm::factory()->create(['status' => FarmStatus::SUSPENDED, 'name' => 'Suspended Farm']);

        $response = $this->get('/farms');

        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->has('farms.data', 1)
        );
    }

    public function test_marketplace_farms_have_images(): void
    {
        $farm = Farm::factory()->create(['status' => FarmStatus::ACTIVE]);
        FarmImage::factory()->create(['farm_id' => $farm->id, 'is_featured' => true]);

        $response = $this->get('/farms');

        $response->assertStatus(200);
    }

    public function test_guest_can_view_farm_details(): void
    {
        $farm = Farm::factory()->create(['status' => FarmStatus::ACTIVE]);

        $response = $this->get("/farms/{$farm->id}");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Farms/Show'));
    }

    public function test_marketplace_filters_by_country(): void
    {
        Farm::factory()->create(['status' => FarmStatus::ACTIVE, 'country' => 'Malaysia']);
        Farm::factory()->create(['status' => FarmStatus::ACTIVE, 'country' => 'Thailand']);

        $response = $this->get('/farms?country=Malaysia');

        $response->assertStatus(200);
    }

    public function test_marketplace_filters_by_climate(): void
    {
        Farm::factory()->create(['status' => FarmStatus::ACTIVE, 'climate' => 'Tropical']);
        Farm::factory()->create(['status' => FarmStatus::ACTIVE, 'climate' => 'Temperate']);

        $response = $this->get('/farms?climate=Tropical');

        $response->assertStatus(200);
    }

    public function test_marketplace_search(): void
    {
        Farm::factory()->create(['status' => FarmStatus::ACTIVE, 'name' => 'Durian Paradise']);
        Farm::factory()->create(['status' => FarmStatus::ACTIVE, 'name' => 'Mango Farm']);

        $response = $this->get('/farms?search=Durian');

        $response->assertStatus(200);
    }

    public function test_inactive_farms_not_visible_in_marketplace(): void
    {
        $farm = Farm::factory()->create(['status' => FarmStatus::PENDING_APPROVAL]);

        $response = $this->get("/farms/{$farm->id}");

        $response->assertStatus(404);
    }

    public function test_marketplace_pagination(): void
    {
        Farm::factory()->count(25)->create(['status' => FarmStatus::ACTIVE]);

        $response = $this->get('/farms');

        $response->assertStatus(200);
    }

    public function test_marketplace_shows_farm_details_with_all_info(): void
    {
        $farm = Farm::factory()->create([
            'status' => FarmStatus::ACTIVE,
            'name' => 'Test Farm',
            'description' => 'A great farm',
            'address' => '123 Test St',
            'city' => 'Test City',
            'country' => 'Malaysia',
            'size_hectares' => 10.5,
            'capacity_trees' => 500,
        ]);

        $response = $this->get("/farms/{$farm->id}");

        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->where('farm.name', 'Test Farm')
                ->where('farm.size_hectares', 10.5)
        );
    }
}
