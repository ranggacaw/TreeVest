<?php

namespace Tests\Feature\FarmOwner;

use App\Models\Farm;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Inertia\Testing\AssertableInertia as Assert;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_farm_owner_can_access_dashboard()
    {
        $owner = User::factory()->create(['role' => 'farm_owner']);

        $response = $this->actingAs($owner)->get(route('farm-owner.dashboard'));

        $response->assertStatus(200);
        $response->assertInertia(
            fn(Assert $page) => $page
                ->component('FarmOwner/Dashboard')
        );
    }

    public function test_non_farm_owner_cannot_access_dashboard()
    {
        $investor = User::factory()->create(['role' => 'investor']);

        $response = $this->actingAs($investor)->get(route('farm-owner.dashboard'));

        $response->assertStatus(403);
    }

    public function test_response_includes_correct_farm_count_for_authenticated_user()
    {
        $owner = User::factory()->create(['role' => 'farm_owner']);
        Farm::factory()->count(2)->create(['owner_id' => $owner->id]);

        // Another owner's farm
        $anotherOwner = User::factory()->create(['role' => 'farm_owner']);
        Farm::factory()->create(['owner_id' => $anotherOwner->id]);

        $response = $this->actingAs($owner)->get(route('farm-owner.dashboard'));

        $response->assertStatus(200);
        $response->assertInertia(
            fn(Assert $page) => $page
                ->component('FarmOwner/Dashboard')
                ->where('metrics.total_farms', 2)
        );
    }

    public function test_metrics_do_not_leak_across_users()
    {
        $owner1 = User::factory()->create(['role' => 'farm_owner']);
        $owner2 = User::factory()->create(['role' => 'farm_owner']);

        Farm::factory()->create(['owner_id' => $owner1->id]);

        $response = $this->actingAs($owner2)->get(route('farm-owner.dashboard'));

        $response->assertInertia(
            fn(Assert $page) => $page
                ->component('FarmOwner/Dashboard')
                ->where('metrics.total_farms', 0)
        );
    }
}
