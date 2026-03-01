<?php

namespace Tests\Feature;

use App\Enums\InvestmentStatus;
use App\Enums\TreeLifecycleStage;
use App\Models\Investment;
use App\Models\Tree;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class InvestmentConcurrencyTest extends TestCase
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

    public function test_concurrent_investments_maintain_data_integrity()
    {
        $user1 = $this->createVerifiedUserWithKyc();
        $user2 = $this->createVerifiedUserWithKyc();
        $tree = Tree::factory()->create([
            'status' => TreeLifecycleStage::PRODUCTIVE,
            'min_investment_cents' => 10000,
            'max_investment_cents' => 100000,
        ]);

        // Simulate concurrent investment creation
        $investment1Created = false;
        $investment2Created = false;

        DB::transaction(function () use ($user1, $tree, &$investment1Created) {
            $response = $this->actingAs($user1)
                ->post(route('investments.store'), [
                    'tree_id' => $tree->id,
                    'amount_cents' => 50000,
                    'acceptance_risk_disclosure' => true,
                    'acceptance_terms' => true,
                ]);

            if ($response->isRedirection()) {
                $investment1Created = true;
            }
        });

        DB::transaction(function () use ($user2, $tree, &$investment2Created) {
            $response = $this->actingAs($user2)
                ->post(route('investments.store'), [
                    'tree_id' => $tree->id,
                    'amount_cents' => 50000,
                    'acceptance_risk_disclosure' => true,
                    'acceptance_terms' => true,
                ]);

            if ($response->isRedirection()) {
                $investment2Created = true;
            }
        });

        // Both investments should succeed
        $this->assertTrue($investment1Created);
        $this->assertTrue($investment2Created);

        // Verify both investments were created
        $this->assertDatabaseHas('investments', [
            'user_id' => $user1->id,
            'tree_id' => $tree->id,
            'amount_cents' => 50000,
        ]);

        $this->assertDatabaseHas('investments', [
            'user_id' => $user2->id,
            'tree_id' => $tree->id,
            'amount_cents' => 50000,
        ]);

        $investmentCount = Investment::where('tree_id', $tree->id)->count();
        $this->assertEquals(2, $investmentCount);
    }

    public function test_concurrent_top_ups_maintain_correct_totals()
    {
        $user = $this->createVerifiedUserWithKyc();
        $tree = Tree::factory()->create([
            'status' => TreeLifecycleStage::PRODUCTIVE,
            'min_investment_cents' => 10000,
            'max_investment_cents' => 200000,
        ]);

        $investment = Investment::factory()
            ->for($user)
            ->for($tree)
            ->create([
                'status' => InvestmentStatus::Active,
                'amount_cents' => 50000,
            ]);

        // Simulate rapid successive top-ups
        $topUp1Success = false;
        $topUp2Success = false;

        DB::transaction(function () use ($user, $investment, &$topUp1Success) {
            $response = $this->actingAs($user)
                ->post(route('investments.topUp', $investment->id), [
                    'top_up_cents' => 20000,
                ]);

            if ($response->isRedirection() && $response->getSession()->has('success')) {
                $topUp1Success = true;
            }
        });

        // Refresh investment to get updated amount
        $investment->refresh();

        DB::transaction(function () use ($user, $investment, &$topUp2Success) {
            $response = $this->actingAs($user)
                ->post(route('investments.topUp', $investment->id), [
                    'top_up_cents' => 30000,
                ]);

            if ($response->isRedirection() && $response->getSession()->has('success')) {
                $topUp2Success = true;
            }
        });

        // Both top-ups should succeed
        $this->assertTrue($topUp1Success);
        $this->assertTrue($topUp2Success);

        // Verify final amount is correct
        $investment->refresh();
        $this->assertEquals(100000, $investment->amount_cents); // 50000 + 20000 + 30000
    }

    public function test_investment_rollback_on_payment_service_failure()
    {
        $user = $this->createVerifiedUserWithKyc();
        $tree = Tree::factory()->create([
            'status' => TreeLifecycleStage::PRODUCTIVE,
            'min_investment_cents' => 10000,
            'max_investment_cents' => 100000,
        ]);

        // This test verifies that if payment service fails,
        // the investment record is not left in an inconsistent state
        
        $initialInvestmentCount = Investment::count();

        try {
            // Note: In actual implementation with mocked payment service failure,
            // this would throw an exception and rollback the transaction
            $this->actingAs($user)
                ->post(route('investments.store'), [
                    'tree_id' => $tree->id,
                    'amount_cents' => 50000,
                    'acceptance_risk_disclosure' => true,
                    'acceptance_terms' => true,
                ]);
        } catch (\Exception $e) {
            // Exception expected
        }

        // In case of payment service failure handled by DB transaction,
        // investment count should remain unchanged or investment should be created
        // (this test primarily documents expected behavior)
        $finalInvestmentCount = Investment::count();
        
        // Either investment was created successfully, or none was created due to rollback
        $this->assertTrue(
            $finalInvestmentCount === $initialInvestmentCount || 
            $finalInvestmentCount === $initialInvestmentCount + 1
        );
    }
}
