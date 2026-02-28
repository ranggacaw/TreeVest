<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class KycMiddlewareTest extends TestCase
{
    use RefreshDatabase;

    public function test_verified_user_can_access_kyc_protected_route()
    {
        $user = User::factory()->create(['kyc_status' => 'verified']);

        $response = $this->actingAs($user)
            ->get('/test-kyc-protected');

        $response->assertStatus(200);
    }

    public function test_unverified_user_redirected_when_accessing_kyc_protected_route()
    {
        $user = User::factory()->create(['kyc_status' => 'pending']);

        $response = $this->actingAs($user)
            ->get('/test-kyc-protected');

        $response->assertRedirect('/profile/kyc');
    }

    public function test_rejected_user_redirected_when_accessing_kyc_protected_route()
    {
        $user = User::factory()->create(['kyc_status' => 'rejected']);

        $response = $this->actingAs($user)
            ->get('/test-kyc-protected');

        $response->assertRedirect('/profile/kyc');
    }

    public function test_submitted_user_can_access_kyc_protected_route()
    {
        $user = User::factory()->create(['kyc_status' => 'submitted']);

        $response = $this->actingAs($user)
            ->get('/test-kyc-protected');

        $response->assertStatus(200);
    }

    public function test_expired_kyc_user_redirected()
    {
        $user = User::factory()->create([
            'kyc_status' => 'verified',
            'kyc_expires_at' => now()->subDay(),
        ]);

        $response = $this->actingAs($user)
            ->get('/test-kyc-protected');

        $response->assertRedirect('/profile/kyc');
    }

    public function test_guest_redirected_to_login()
    {
        $response = $this->get('/test-kyc-protected');

        $response->assertRedirect('/login');
    }

    public function test_admin_can_bypass_kyc_check()
    {
        $admin = User::factory()->create(['role' => 'admin', 'kyc_status' => 'pending']);

        $response = $this->actingAs($admin)
            ->get('/test-kyc-protected');

        $response->assertStatus(200);
    }
}
