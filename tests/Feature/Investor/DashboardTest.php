<?php

namespace Tests\Feature\Investor;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Inertia\Testing\AssertableInertia as Assert;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_investor_can_access_dashboard()
    {
        $investor = User::factory()->create(['role' => 'investor']);

        $response = $this->actingAs($investor)->get(route('investor.dashboard'));

        $response->assertStatus(200);
        $response->assertInertia(
            fn(Assert $page) => $page
                ->component('Investor/Dashboard')
        );
    }

    public function test_non_investor_cannot_access_dashboard()
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->get(route('investor.dashboard'));

        $response->assertStatus(403);
    }

    public function test_response_includes_total_invested_cents()
    {
        $investor = User::factory()->create(['role' => 'investor']);

        $response = $this->actingAs($investor)->get(route('investor.dashboard'));

        $response->assertStatus(200);
        $response->assertInertia(
            fn(Assert $page) => $page
                ->component('Investor/Dashboard')
                ->has('metrics.total_invested_cents')
        );
    }

    public function test_kyc_status_is_included()
    {
        $investor = User::factory()->create(['role' => 'investor', 'kyc_status' => 'verified']);

        $response = $this->actingAs($investor)->get(route('investor.dashboard'));

        $response->assertInertia(
            fn(Assert $page) => $page
                ->component('Investor/Dashboard')
                ->where('kyc_status', 'verified')
        );
    }
}
