<?php

namespace Tests\Feature;

use App\Enums\InvestmentStatus;
use App\Enums\TreeLifecycleStage;
use App\Models\Investment;
use App\Models\Tree;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InvestmentPurchaseFlowTest extends TestCase
{
    use RefreshDatabase;

    protected function createVerifiedUserWithKyc(): User
    {
        return User::factory()->create([
            'kyc_status' => 'verified',
            'kyc_verified_at' => now(),
            'kyc_expires_at' => now()->addYear(),
        ]);
    }

    protected function createInvestableTree(): Tree
    {
        return Tree::factory()->create([
            'status' => TreeLifecycleStage::PRODUCTIVE,
            'min_investment_cents' => 10000,
            'max_investment_cents' => 100000,
            'price_cents' => 50000,
        ]);
    }

    public function test_authenticated_user_can_view_investment_purchase_page()
    {
        $user = $this->createVerifiedUserWithKyc();
        $tree = $this->createInvestableTree();

        $response = $this->actingAs($user)
            ->get(route('investments.create', ['tree' => $tree->id]));

        $response->assertOk();
        $response->assertInertia(
            fn ($page) => $page
                ->component('Investments/Purchase/Configure')
                ->has('tree')
                ->where('tree.id', $tree->id)
        );
    }

    public function test_guest_cannot_view_investment_purchase_page()
    {
        $tree = $this->createInvestableTree();

        $response = $this->get(route('investments.create', ['tree' => $tree->id]));

        $response->assertRedirect(route('login'));
    }

    public function test_user_without_kyc_is_redirected_from_purchase_page()
    {
        $user = User::factory()->create([
            'kyc_status' => 'pending',
        ]);
        $tree = $this->createInvestableTree();

        $response = $this->actingAs($user)
            ->get(route('investments.create', ['tree' => $tree->id]));

        $response->assertRedirect(route('kyc.verify'));
        $response->assertSessionHas('warning', 'You must complete KYC verification before investing.');
    }

    public function test_user_cannot_purchase_non_investable_tree()
    {
        $user = $this->createVerifiedUserWithKyc();
        $tree = Tree::factory()->create([
            'status' => TreeLifecycleStage::RETIRED,
            'min_investment_cents' => 10000,
            'max_investment_cents' => 100000,
        ]);

        $response = $this->actingAs($user)
            ->get(route('investments.create', ['tree' => $tree->id]));

        $response->assertRedirect(route('marketplace.trees'));
        $response->assertSessionHas('error', 'This tree is not currently available for investment.');
    }

    public function test_user_can_initiate_investment_with_valid_data()
    {
        $user = $this->createVerifiedUserWithKyc();
        $tree = $this->createInvestableTree();

        $response = $this->actingAs($user)
            ->post(route('investments.store'), [
                'tree_id' => $tree->id,
                'amount_cents' => 50000,
                'acceptance_risk_disclosure' => true,
                'acceptance_terms' => true,
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('investments', [
            'user_id' => $user->id,
            'tree_id' => $tree->id,
            'amount_cents' => 50000,
            'status' => InvestmentStatus::PendingPayment->value,
        ]);
    }

    public function test_investment_creation_validates_required_fields()
    {
        $user = $this->createVerifiedUserWithKyc();

        $response = $this->actingAs($user)
            ->post(route('investments.store'), []);

        $response->assertSessionHasErrors(['tree_id', 'amount_cents', 'acceptance_risk_disclosure', 'acceptance_terms']);
    }

    public function test_investment_creation_validates_minimum_amount()
    {
        $user = $this->createVerifiedUserWithKyc();
        $tree = $this->createInvestableTree();

        $response = $this->actingAs($user)
            ->post(route('investments.store'), [
                'tree_id' => $tree->id,
                'amount_cents' => 5000, // Below min of 10000
                'acceptance_risk_disclosure' => true,
                'acceptance_terms' => true,
            ]);

        $response->assertSessionHasErrors('amount_cents');
    }

    public function test_investment_creation_validates_maximum_amount()
    {
        $user = $this->createVerifiedUserWithKyc();
        $tree = $this->createInvestableTree();

        $response = $this->actingAs($user)
            ->post(route('investments.store'), [
                'tree_id' => $tree->id,
                'amount_cents' => 150000, // Above max of 100000
                'acceptance_risk_disclosure' => true,
                'acceptance_terms' => true,
            ]);

        $response->assertSessionHasErrors('amount_cents');
    }

    public function test_investment_creation_requires_risk_disclosure_acceptance()
    {
        $user = $this->createVerifiedUserWithKyc();
        $tree = $this->createInvestableTree();

        $response = $this->actingAs($user)
            ->post(route('investments.store'), [
                'tree_id' => $tree->id,
                'amount_cents' => 50000,
                'acceptance_risk_disclosure' => false,
                'acceptance_terms' => true,
            ]);

        $response->assertSessionHasErrors('acceptance_risk_disclosure');
    }

    public function test_investment_creation_requires_terms_acceptance()
    {
        $user = $this->createVerifiedUserWithKyc();
        $tree = $this->createInvestableTree();

        $response = $this->actingAs($user)
            ->post(route('investments.store'), [
                'tree_id' => $tree->id,
                'amount_cents' => 50000,
                'acceptance_risk_disclosure' => true,
                'acceptance_terms' => false,
            ]);

        $response->assertSessionHasErrors('acceptance_terms');
    }

    public function test_user_can_view_their_investments()
    {
        $user = $this->createVerifiedUserWithKyc();
        $tree = $this->createInvestableTree();

        $investment = Investment::factory()
            ->for($user)
            ->for($tree)
            ->create();

        $response = $this->actingAs($user)
            ->get(route('investments.index'));

        $response->assertOk();
        $response->assertInertia(
            fn ($page) => $page
                ->component('Investments/Index')
                ->has('investments')
        );
    }

    public function test_user_can_view_specific_investment()
    {
        $user = $this->createVerifiedUserWithKyc();
        $tree = $this->createInvestableTree();

        $investment = Investment::factory()
            ->for($user)
            ->for($tree)
            ->create();

        $response = $this->actingAs($user)
            ->get(route('investments.show', $investment->id));

        $response->assertOk();
        $response->assertInertia(
            fn ($page) => $page
                ->component('Investments/Show')
                ->where('investment.id', $investment->id)
        );
    }

    public function test_user_cannot_view_another_users_investment()
    {
        $user = $this->createVerifiedUserWithKyc();
        $otherUser = $this->createVerifiedUserWithKyc();
        $tree = $this->createInvestableTree();

        $investment = Investment::factory()
            ->for($otherUser)
            ->for($tree)
            ->create();

        $response = $this->actingAs($user)
            ->get(route('investments.show', $investment->id));

        $response->assertForbidden();
    }

    public function test_user_can_view_investment_confirmation_page()
    {
        $user = $this->createVerifiedUserWithKyc();
        $tree = $this->createInvestableTree();

        $investment = Investment::factory()
            ->for($user)
            ->for($tree)
            ->create([
                'status' => InvestmentStatus::PendingPayment,
            ]);

        $response = $this->actingAs($user)
            ->get(route('investments.confirmation', $investment->id));

        $response->assertOk();
        $response->assertInertia(
            fn ($page) => $page
                ->component('Investments/Purchase/Confirmation')
                ->where('investment.id', $investment->id)
        );
    }

    public function test_user_can_cancel_pending_investment()
    {
        $user = $this->createVerifiedUserWithKyc();
        $tree = $this->createInvestableTree();

        $investment = Investment::factory()
            ->for($user)
            ->for($tree)
            ->create([
                'status' => InvestmentStatus::PendingPayment,
            ]);

        $response = $this->actingAs($user)
            ->delete(route('investments.cancel', $investment->id));

        $response->assertRedirect(route('investments.index'));
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('investments', [
            'id' => $investment->id,
            'status' => InvestmentStatus::Cancelled->value,
        ]);
    }

    public function test_user_cannot_cancel_active_investment()
    {
        $user = $this->createVerifiedUserWithKyc();
        $tree = $this->createInvestableTree();

        $investment = Investment::factory()
            ->for($user)
            ->for($tree)
            ->create([
                'status' => InvestmentStatus::Active,
            ]);

        $response = $this->actingAs($user)
            ->delete(route('investments.cancel', $investment->id));

        $response->assertSessionHas('error');

        $this->assertDatabaseHas('investments', [
            'id' => $investment->id,
            'status' => InvestmentStatus::Active->value,
        ]);
    }

    public function test_user_cannot_cancel_another_users_investment()
    {
        $user = $this->createVerifiedUserWithKyc();
        $otherUser = $this->createVerifiedUserWithKyc();
        $tree = $this->createInvestableTree();

        $investment = Investment::factory()
            ->for($otherUser)
            ->for($tree)
            ->create([
                'status' => InvestmentStatus::PendingPayment,
            ]);

        $response = $this->actingAs($user)
            ->delete(route('investments.cancel', $investment->id));

        $response->assertForbidden();
    }

    public function test_user_can_top_up_active_investment()
    {
        $user = $this->createVerifiedUserWithKyc();
        $tree = $this->createInvestableTree();

        $investment = Investment::factory()
            ->for($user)
            ->for($tree)
            ->create([
                'status' => InvestmentStatus::Active,
                'amount_cents' => 50000,
            ]);

        $response = $this->actingAs($user)
            ->post(route('investments.topUp', $investment->id), [
                'top_up_cents' => 20000,
            ]);

        $response->assertSessionHas('success');

        $this->assertDatabaseHas('investments', [
            'id' => $investment->id,
            'amount_cents' => 70000,
        ]);
    }

    public function test_user_cannot_top_up_pending_investment()
    {
        $user = $this->createVerifiedUserWithKyc();
        $tree = $this->createInvestableTree();

        $investment = Investment::factory()
            ->for($user)
            ->for($tree)
            ->create([
                'status' => InvestmentStatus::PendingPayment,
                'amount_cents' => 50000,
            ]);

        $response = $this->actingAs($user)
            ->post(route('investments.topUp', $investment->id), [
                'top_up_cents' => 20000,
            ]);

        $response->assertSessionHas('error');
    }

    public function test_user_cannot_top_up_beyond_tree_maximum()
    {
        $user = $this->createVerifiedUserWithKyc();
        $tree = $this->createInvestableTree();

        $investment = Investment::factory()
            ->for($user)
            ->for($tree)
            ->create([
                'status' => InvestmentStatus::Active,
                'amount_cents' => 90000,
            ]);

        $response = $this->actingAs($user)
            ->post(route('investments.topUp', $investment->id), [
                'top_up_cents' => 20000, // Would exceed 100000 max
            ]);

        $response->assertSessionHas('error');

        $this->assertDatabaseHas('investments', [
            'id' => $investment->id,
            'amount_cents' => 90000,
        ]);
    }
}
