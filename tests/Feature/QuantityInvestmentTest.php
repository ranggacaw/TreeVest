<?php

namespace Tests\Feature;

use App\Enums\InvestmentStatus;
use App\Models\Investment;
use App\Models\Tree;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class QuantityInvestmentTest extends TestCase
{
    use RefreshDatabase;

    // ─── Validation: min/max trees ────────────────────────────────────────────

    public function test_quantity_below_minimum_is_rejected(): void
    {
        $investor = User::factory()->create(['role' => 'investor', 'kyc_status' => 'verified']);
        // price=10000, min=20000 → minTrees=2
        $tree = Tree::factory()->create([
            'price_cents' => 10_000,
            'min_investment_cents' => 20_000,
            'max_investment_cents' => 100_000,
            'status' => 'productive',
        ]);

        $response = $this->actingAs($investor)->post('/investments', [
            'tree_id' => $tree->id,
            'quantity' => 1,
            'acceptance_risk_disclosure' => true,
            'acceptance_terms' => true,
        ]);

        $response->assertSessionHasErrors('quantity');
    }

    public function test_quantity_above_maximum_is_rejected(): void
    {
        $investor = User::factory()->create(['role' => 'investor', 'kyc_status' => 'verified']);
        // price=10000, max=50000 → maxTrees=5
        $tree = Tree::factory()->create([
            'price_cents' => 10_000,
            'min_investment_cents' => 10_000,
            'max_investment_cents' => 50_000,
            'status' => 'productive',
        ]);

        $response = $this->actingAs($investor)->post('/investments', [
            'tree_id' => $tree->id,
            'quantity' => 10,
            'acceptance_risk_disclosure' => true,
            'acceptance_terms' => true,
        ]);

        $response->assertSessionHasErrors('quantity');
    }

    public function test_valid_quantity_stores_investment_with_correct_amount(): void
    {
        $investor = User::factory()->create(['role' => 'investor', 'kyc_status' => 'verified']);
        $tree = Tree::factory()->create([
            'price_cents' => 10_000,
            'min_investment_cents' => 10_000,
            'max_investment_cents' => 50_000,
            'status' => 'productive',
        ]);

        $this->actingAs($investor)->post('/investments', [
            'tree_id' => $tree->id,
            'quantity' => 3,
            'acceptance_risk_disclosure' => true,
            'acceptance_terms' => true,
        ]);

        $this->assertDatabaseHas('investments', [
            'user_id' => $investor->id,
            'tree_id' => $tree->id,
            'quantity' => 3,
            'amount_cents' => 30_000, // 3 × 10_000
        ]);
    }

    public function test_amount_cents_is_derived_from_quantity_and_price(): void
    {
        $investor = User::factory()->create(['role' => 'investor', 'kyc_status' => 'verified']);
        $tree = Tree::factory()->create([
            'price_cents' => 25_000,
            'min_investment_cents' => 25_000,
            'max_investment_cents' => 250_000,
            'status' => 'productive',
        ]);

        $this->actingAs($investor)->post('/investments', [
            'tree_id' => $tree->id,
            'quantity' => 4,
            'acceptance_risk_disclosure' => true,
            'acceptance_terms' => true,
        ]);

        $investment = Investment::where('user_id', $investor->id)
            ->where('tree_id', $tree->id)
            ->first();

        $this->assertNotNull($investment);
        $this->assertEquals(4, $investment->quantity);
        $this->assertEquals(100_000, $investment->amount_cents); // 4 × 25_000
    }

    public function test_kyc_unverified_user_cannot_invest(): void
    {
        $investor = User::factory()->create(['role' => 'investor', 'kyc_status' => 'pending']);
        $tree = Tree::factory()->create([
            'price_cents' => 10_000,
            'min_investment_cents' => 10_000,
            'max_investment_cents' => 50_000,
            'status' => 'productive',
        ]);

        $response = $this->actingAs($investor)->post('/investments', [
            'tree_id' => $tree->id,
            'quantity' => 2,
            'acceptance_risk_disclosure' => true,
            'acceptance_terms' => true,
        ]);

        $response->assertSessionHasErrors();
        $this->assertDatabaseMissing('investments', [
            'user_id' => $investor->id,
            'tree_id' => $tree->id,
        ]);
    }

    public function test_investment_model_casts_quantity_to_integer(): void
    {
        $investor = User::factory()->create(['role' => 'investor']);
        $tree = Tree::factory()->create(['price_cents' => 10_000]);

        $investment = Investment::factory()->create([
            'user_id' => $investor->id,
            'tree_id' => $tree->id,
            'quantity' => 3,
            'amount_cents' => 30_000,
            'status' => InvestmentStatus::Active,
        ]);

        $fresh = $investment->fresh();
        $this->assertIsInt($fresh->quantity);
        $this->assertEquals(3, $fresh->quantity);
    }

    public function test_get_max_additional_trees_respects_max_limit(): void
    {
        $investor = User::factory()->create(['role' => 'investor']);
        $tree = Tree::factory()->create([
            'price_cents' => 10_000,
            'min_investment_cents' => 10_000,
            'max_investment_cents' => 50_000,
        ]);

        $investment = Investment::factory()->create([
            'user_id' => $investor->id,
            'tree_id' => $tree->id,
            'quantity' => 3,
            'amount_cents' => 30_000,
            'status' => InvestmentStatus::Active,
        ]);

        // Max is 5 trees, currently holds 3, so 2 more can be added
        $this->assertEquals(2, $investment->getMaxAdditionalTrees());
    }
}
