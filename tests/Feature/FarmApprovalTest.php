<?php

namespace Tests\Feature;

use App\Enums\FarmStatus;
use App\Models\Farm;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FarmApprovalTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_pending_farms(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Farm::factory()->count(3)->create(['status' => FarmStatus::PENDING_APPROVAL]);

        $response = $this->actingAs($admin)->get('/admin/farms');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Admin/Farms/Index'));
    }

    public function test_admin_can_view_suspended_farms(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Farm::factory()->count(2)->create(['status' => FarmStatus::SUSPENDED]);

        $response = $this->actingAs($admin)->get('/admin/farms?status=suspended');

        $response->assertStatus(200);
    }

    public function test_admin_can_approve_pending_farm(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $farm = Farm::factory()->create(['status' => FarmStatus::PENDING_APPROVAL]);

        $response = $this->actingAs($admin)->post("/admin/farms/{$farm->id}/approve");

        $response->assertRedirect();
        $this->assertDatabaseHas('farms', [
            'id' => $farm->id,
            'status' => FarmStatus::ACTIVE,
        ]);
    }

    public function test_admin_can_reject_pending_farm(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $farm = Farm::factory()->create(['status' => FarmStatus::PENDING_APPROVAL]);

        $response = $this->actingAs($admin)->post("/admin/farms/{$farm->id}/reject", [
            'reason' => 'Does not meet our standards',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('farms', [
            'id' => $farm->id,
            'status' => FarmStatus::DEACTIVATED,
            'rejection_reason' => 'Does not meet our standards',
        ]);
    }

    public function test_admin_can_suspend_active_farm(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $farm = Farm::factory()->create(['status' => FarmStatus::ACTIVE]);

        $response = $this->actingAs($admin)->post("/admin/farms/{$farm->id}/suspend");

        $response->assertRedirect();
        $this->assertDatabaseHas('farms', [
            'id' => $farm->id,
            'status' => FarmStatus::SUSPENDED,
        ]);
    }

    public function test_admin_can_reinstate_suspended_farm(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $farm = Farm::factory()->create(['status' => FarmStatus::SUSPENDED]);

        $response = $this->actingAs($admin)->post("/admin/farms/{$farm->id}/reinstate");

        $response->assertRedirect();
        $this->assertDatabaseHas('farms', [
            'id' => $farm->id,
            'status' => FarmStatus::ACTIVE,
        ]);
    }

    public function test_farm_owner_cannot_approve_farms(): void
    {
        $farmOwner = User::factory()->create(['role' => 'farm_owner']);
        $farm = Farm::factory()->create(['status' => FarmStatus::PENDING_APPROVAL]);

        $response = $this->actingAs($farmOwner)->post("/admin/farms/{$farm->id}/approve");

        $response->assertStatus(403);
    }

    public function test_investor_cannot_approve_farms(): void
    {
        $investor = User::factory()->create(['role' => 'investor']);
        $farm = Farm::factory()->create(['status' => FarmStatus::PENDING_APPROVAL]);

        $response = $this->actingAs($investor)->post("/admin/farms/{$farm->id}/approve");

        $response->assertStatus(403);
    }

    public function test_reject_requires_reason(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $farm = Farm::factory()->create(['status' => FarmStatus::PENDING_APPROVAL]);

        $response = $this->actingAs($admin)->post("/admin/farms/{$farm->id}/reject", []);

        $response->assertSessionHasErrors('reason');
    }

    public function test_admin_can_view_farm_details(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $farm = Farm::factory()->create();

        $response = $this->actingAs($admin)->get("/admin/farms/{$farm->id}");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Admin/Farms/Show'));
    }

    public function test_active_farm_can_be_suspended(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $farm = Farm::factory()->create(['status' => FarmStatus::ACTIVE]);

        $response = $this->actingAs($admin)->post("/admin/farms/{$farm->id}/suspend");

        $response->assertRedirect();
        $this->assertEquals(FarmStatus::SUSPENDED, $farm->fresh()->status);
    }
}
