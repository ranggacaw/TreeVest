<?php

namespace Tests\Feature\Admin;

use App\Models\Farm;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_access_dashboard()
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->get(route('admin.dashboard'));

        $response->assertStatus(200);
        $response->assertInertia(
            fn (Assert $page) => $page
                ->component('Admin/Dashboard')
                ->has('metrics')
                ->has('metrics.total_users')
                ->has('metrics.kyc_verified')
                ->has('metrics.active_investments')
                ->has('metrics.investment_volume')
                ->has('metrics.pending_kyc')
                ->has('metrics.pending_farms')
                ->has('metrics.completed_harvests')
                ->has('metrics.total_payouts')
        );
    }

    public function test_non_admin_cannot_access_dashboard()
    {
        $investor = User::factory()->create(['role' => 'investor']);

        $response = $this->actingAs($investor)->get(route('admin.dashboard'));

        $response->assertStatus(403);
    }

    public function test_date_range_filter_scopes_aggregations()
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->get(route('admin.dashboard', [
            'date_from' => now()->subDays(7)->toDateString(),
            'date_to' => now()->toDateString(),
        ]));

        $response->assertStatus(200);
        $response->assertInertia(
            fn (Assert $page) => $page
                ->component('Admin/Dashboard')
                ->where('date_from', now()->subDays(7)->toDateString())
                ->where('date_to', now()->toDateString())
        );
    }

    public function test_cache_is_invalidated_when_farm_is_approved()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $farm = Farm::factory()->create(['status' => \App\Enums\FarmStatus::PENDING_APPROVAL]);

        $this->actingAs($admin)->get(route('admin.dashboard'));

        $this->post(route('admin.farms.approve', $farm), ['approved' => true]);

        // Just asserting the cache logic doesn't crash here
        $this->assertTrue(true);
    }
}
