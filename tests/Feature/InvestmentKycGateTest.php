<?php

namespace Tests\Feature;

use App\Enums\TreeLifecycleStage;
use App\Models\Tree;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InvestmentKycGateTest extends TestCase
{
    use RefreshDatabase;

    protected function createInvestableTree(): Tree
    {
        return Tree::factory()->create([
            'status' => TreeLifecycleStage::PRODUCTIVE,
            'min_investment_cents' => 10000,
            'max_investment_cents' => 100000,
        ]);
    }

    public function test_verified_user_can_access_investment_purchase_page()
    {
        $user = User::factory()->create([
            'kyc_status' => 'verified',
            'kyc_verified_at' => now(),
            'kyc_expires_at' => now()->addYear(),
        ]);

        $tree = $this->createInvestableTree();

        $response = $this->actingAs($user)
            ->get(route('investments.create', ['tree' => $tree->id]));

        $response->assertOk();
    }

    public function test_unverified_user_is_blocked_from_investment_purchase_page()
    {
        $user = User::factory()->create([
            'kyc_status' => 'pending',
            'kyc_verified_at' => null,
            'kyc_expires_at' => null,
        ]);

        $tree = $this->createInvestableTree();

        $response = $this->actingAs($user)
            ->get(route('investments.create', ['tree' => $tree->id]));

        $response->assertRedirect(route('kyc.verify'));
        $response->assertSessionHas('warning', 'You must complete KYC verification before investing.');
    }

    public function test_user_with_expired_kyc_is_blocked_from_investment()
    {
        $user = User::factory()->create([
            'kyc_status' => 'verified',
            'kyc_verified_at' => now()->subYears(2),
            'kyc_expires_at' => now()->subDay(),
        ]);

        $tree = $this->createInvestableTree();

        $response = $this->actingAs($user)
            ->get(route('investments.create', ['tree' => $tree->id]));

        $response->assertRedirect(route('kyc.verify'));
        $response->assertSessionHas('warning', 'You must complete KYC verification before investing.');
    }

    public function test_rejected_kyc_user_is_blocked_from_investment()
    {
        $user = User::factory()->create([
            'kyc_status' => 'rejected',
            'kyc_verified_at' => null,
            'kyc_expires_at' => null,
        ]);

        $tree = $this->createInvestableTree();

        $response = $this->actingAs($user)
            ->get(route('investments.create', ['tree' => $tree->id]));

        $response->assertRedirect(route('kyc.verify'));
    }

    public function test_unverified_user_cannot_submit_investment()
    {
        $user = User::factory()->create([
            'kyc_status' => 'pending',
        ]);

        $tree = $this->createInvestableTree();

        $response = $this->actingAs($user)
            ->post(route('investments.store'), [
                'tree_id' => $tree->id,
                'amount_cents' => 50000,
                'acceptance_risk_disclosure' => true,
                'acceptance_terms' => true,
            ]);

        $response->assertRedirect(route('kyc.verify'));
        $response->assertSessionHas('warning');

        // Verify no investment was created
        $this->assertDatabaseMissing('investments', [
            'user_id' => $user->id,
            'tree_id' => $tree->id,
        ]);
    }

    public function test_verified_user_can_submit_investment()
    {
        $user = User::factory()->create([
            'kyc_status' => 'verified',
            'kyc_verified_at' => now(),
            'kyc_expires_at' => now()->addYear(),
        ]);

        $tree = $this->createInvestableTree();

        $response = $this->actingAs($user)
            ->post(route('investments.store'), [
                'tree_id' => $tree->id,
                'amount_cents' => 50000,
                'acceptance_risk_disclosure' => true,
                'acceptance_terms' => true,
            ]);

        $response->assertRedirect(); // Should redirect to confirmation page
        $response->assertSessionHas('success');

        // Verify investment was created
        $this->assertDatabaseHas('investments', [
            'user_id' => $user->id,
            'tree_id' => $tree->id,
            'amount_cents' => 50000,
        ]);
    }

    public function test_kyc_middleware_redirects_to_correct_route()
    {
        $user = User::factory()->create([
            'kyc_status' => 'pending',
        ]);

        $tree = $this->createInvestableTree();

        $response = $this->actingAs($user)
            ->get(route('investments.create', ['tree' => $tree->id]));

        $response->assertRedirect(route('kyc.verify'));
        $this->assertEquals(route('kyc.verify'), $response->headers->get('Location'));
    }

    public function test_flash_message_content_is_correct()
    {
        $user = User::factory()->create([
            'kyc_status' => 'pending',
        ]);

        $tree = $this->createInvestableTree();

        $response = $this->actingAs($user)
            ->get(route('investments.create', ['tree' => $tree->id]));

        $response->assertSessionHas('warning');
        $warningMessage = session('warning');

        $this->assertStringContainsString('KYC', $warningMessage);
        $this->assertStringContainsString('verification', $warningMessage);
    }

    public function test_user_with_valid_kyc_about_to_expire_can_invest()
    {
        // KYC expires tomorrow but is still valid
        $user = User::factory()->create([
            'kyc_status' => 'verified',
            'kyc_verified_at' => now()->subMonths(11),
            'kyc_expires_at' => now()->addDay(),
        ]);

        $tree = $this->createInvestableTree();

        $response = $this->actingAs($user)
            ->get(route('investments.create', ['tree' => $tree->id]));

        $response->assertOk();
    }
}
