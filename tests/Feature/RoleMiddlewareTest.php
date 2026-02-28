<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoleMiddlewareTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_access_admin_routes(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $response = $this->actingAs($admin)->get('/admin/dashboard');
        $response->assertStatus(200);
    }

    public function test_investor_cannot_access_admin_routes(): void
    {
        $investor = User::factory()->create(['role' => 'investor']);
        $response = $this->actingAs($investor)->get('/admin/dashboard');
        $response->assertStatus(403);
    }

    public function test_farm_owner_can_access_farm_owner_routes(): void
    {
        $farmOwner = User::factory()->create(['role' => 'farm_owner']);
        $response = $this->actingAs($farmOwner)->get('/farm-owner/dashboard');
        $response->assertStatus(200);
    }

    public function test_investor_cannot_access_farm_owner_routes(): void
    {
        $investor = User::factory()->create(['role' => 'investor']);
        $response = $this->actingAs($investor)->get('/farm-owner/dashboard');
        $response->assertStatus(403);
    }

    public function test_investor_can_access_investor_routes(): void
    {
        $investor = User::factory()->create(['role' => 'investor']);
        $response = $this->actingAs($investor)->get('/investor/dashboard');
        $response->assertStatus(200);
    }

    public function test_unauthenticated_user_redirected_to_login(): void
    {
        $response = $this->get('/admin/dashboard');
        $response->assertRedirect('/login');
    }
}

