<?php

namespace Tests\Unit;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserRolesTest extends TestCase
{
    use RefreshDatabase;

    public function test_is_investor_returns_true_for_investor(): void
    {
        $user = User::factory()->create(['role' => 'investor']);
        $this->assertTrue($user->isInvestor());
    }

    public function test_is_investor_returns_false_for_non_investor(): void
    {
        $user = User::factory()->create(['role' => 'admin']);
        $this->assertFalse($user->isInvestor());
    }

    public function test_is_farm_owner_returns_true_for_farm_owner(): void
    {
        $user = User::factory()->create(['role' => 'farm_owner']);
        $this->assertTrue($user->isFarmOwner());
    }

    public function test_is_farm_owner_returns_false_for_non_farm_owner(): void
    {
        $user = User::factory()->create(['role' => 'investor']);
        $this->assertFalse($user->isFarmOwner());
    }

    public function test_is_admin_returns_true_for_admin(): void
    {
        $user = User::factory()->create(['role' => 'admin']);
        $this->assertTrue($user->isAdmin());
    }

    public function test_is_admin_returns_false_for_non_admin(): void
    {
        $user = User::factory()->create(['role' => 'investor']);
        $this->assertFalse($user->isAdmin());
    }

    public function test_has_role_returns_true_for_matching_role(): void
    {
        $user = User::factory()->create(['role' => 'admin']);
        $this->assertTrue($user->hasRole('admin'));
    }

    public function test_has_role_returns_false_for_non_matching_role(): void
    {
        $user = User::factory()->create(['role' => 'investor']);
        $this->assertFalse($user->hasRole('admin'));
    }
}
