<?php

namespace Tests\Feature;

use App\Enums\InvestmentStatus;
use App\Enums\LotStatus;
use App\Models\Investment;
use App\Models\Lot;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LotInvestmentTest extends TestCase
{
    use RefreshDatabase;

    private User $investor;

    protected function setUp(): void
    {
        parent::setUp();

        $this->investor = User::factory()->create([
            'role' => 'investor',
            'kyc_status' => 'verified',
        ]);
    }

    // ── invest (POST /investor/lots/{lot}/invest) ─────────────────

    public function test_verified_investor_can_invest_in_open_lot(): void
    {
        $lot = Lot::factory()->cycleOpen()->create();

        $response = $this->actingAs($this->investor)
            ->post(route('investor.lots.invest', $lot));

        $response->assertRedirect();
        $this->assertDatabaseHas('investments', [
            'user_id' => $this->investor->id,
            'lot_id' => $lot->id,
            'status' => InvestmentStatus::Active->value,
        ]);
    }

    public function test_investment_amount_matches_lot_price_times_trees(): void
    {
        $lot = Lot::factory()->cycleOpen()->create([
            'current_price_per_tree_idr' => 100_000,
            'total_trees' => 5,
        ]);

        $this->actingAs($this->investor)
            ->post(route('investor.lots.invest', $lot));

        $this->assertDatabaseHas('investments', [
            'user_id' => $this->investor->id,
            'lot_id' => $lot->id,
            'amount_idr' => 500_000,
        ]);
    }

    public function test_investor_cannot_invest_in_closed_lot(): void
    {
        $lot = Lot::factory()->cycleClosed()->create();

        $response = $this->actingAs($this->investor)
            ->post(route('investor.lots.invest', $lot));

        $response->assertRedirect();
        $response->assertSessionHasErrors('lot');
        $this->assertDatabaseMissing('investments', [
            'user_id' => $this->investor->id,
            'lot_id' => $lot->id,
        ]);
    }

    public function test_investor_cannot_invest_in_in_progress_lot(): void
    {
        $lot = Lot::factory()->inProgress()->create();

        $response = $this->actingAs($this->investor)
            ->post(route('investor.lots.invest', $lot));

        $response->assertRedirect();
        $response->assertSessionHasErrors('lot');
    }

    public function test_unverified_investor_is_redirected_to_kyc(): void
    {
        $unverified = User::factory()->create([
            'role' => 'investor',
            'kyc_status' => 'pending',
        ]);
        $lot = Lot::factory()->cycleOpen()->create();

        $response = $this->actingAs($unverified)
            ->post(route('investor.lots.invest', $lot));

        $response->assertRedirect(route('kyc.index'));
    }

    public function test_unauthenticated_user_is_redirected_to_login(): void
    {
        $lot = Lot::factory()->cycleOpen()->create();

        $response = $this->post(route('investor.lots.invest', $lot));

        $response->assertRedirect(route('login'));
    }

    public function test_farm_owner_cannot_access_investor_invest_route(): void
    {
        $farmOwner = User::factory()->create(['role' => 'farm_owner']);
        $lot = Lot::factory()->cycleOpen()->create();

        $response = $this->actingAs($farmOwner)
            ->post(route('investor.lots.invest', $lot));

        $response->assertForbidden();
    }

    // ── reinvest (POST /investor/lots/{lot}/reinvest) ─────────────

    public function test_investor_can_reinvest_from_wallet(): void
    {
        $lot = Lot::factory()->cycleOpen()->create([
            'current_price_per_tree_idr' => 100_000,
            'total_trees' => 2,
        ]);

        // Fund the wallet
        Wallet::factory()->create([
            'user_id' => $this->investor->id,
            'balance_idr' => 500_000,
        ]);

        $response = $this->actingAs($this->investor)
            ->post(route('investor.lots.reinvest', $lot));

        $response->assertRedirect();
        $this->assertDatabaseHas('investments', [
            'user_id' => $this->investor->id,
            'lot_id' => $lot->id,
            'amount_idr' => 200_000,
        ]);
    }

    public function test_reinvest_fails_with_insufficient_wallet_balance(): void
    {
        $lot = Lot::factory()->cycleOpen()->create([
            'current_price_per_tree_idr' => 500_000,
            'total_trees' => 10,
        ]);

        // Wallet with too little balance
        Wallet::factory()->create([
            'user_id' => $this->investor->id,
            'balance_idr' => 1_000,
        ]);

        $response = $this->actingAs($this->investor)
            ->post(route('investor.lots.reinvest', $lot));

        $response->assertRedirect();
        $response->assertSessionHasErrors('wallet');
        $this->assertDatabaseMissing('investments', [
            'user_id' => $this->investor->id,
            'lot_id' => $lot->id,
        ]);
    }
}
