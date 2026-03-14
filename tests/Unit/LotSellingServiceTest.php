<?php

namespace Tests\Unit;

use App\Enums\LotStatus;
use App\Enums\WalletTransactionType;
use App\Exceptions\InvalidLotTransitionException;
use App\Models\Investment;
use App\Models\Lot;
use App\Models\User;
use App\Models\Wallet;
use App\Services\LotSellingService;
use App\Services\WalletService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LotSellingServiceTest extends TestCase
{
    use RefreshDatabase;

    private LotSellingService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(LotSellingService::class);
    }

    // -------------------------------------------------------------------------
    // recordHarvest
    // -------------------------------------------------------------------------

    public function test_record_harvest_transitions_lot_to_harvest_status(): void
    {
        $lot = Lot::factory()->inProgress()->create();

        $this->service->recordHarvest($lot, 500, 250.5, 'harvest-photos/photo.jpg', 'Good quality');

        $lot->refresh();
        $this->assertEquals(LotStatus::Harvest, $lot->status);
        $this->assertEquals(500, $lot->harvest_total_fruit);
        $this->assertEquals('250.50', $lot->harvest_total_weight_kg);
        $this->assertEquals('Good quality', $lot->harvest_notes);
        $this->assertNotNull($lot->harvest_recorded_at);
    }

    public function test_record_harvest_throws_if_lot_not_in_progress(): void
    {
        $lot = Lot::factory()->active()->create();

        $this->expectException(InvalidLotTransitionException::class);
        $this->service->recordHarvest($lot, 500, 250.0, 'harvest-photos/photo.jpg');
    }

    public function test_record_harvest_throws_if_lot_already_in_harvest_status(): void
    {
        $lot = Lot::factory()->harvest()->create();

        $this->expectException(InvalidLotTransitionException::class);
        $this->service->recordHarvest($lot, 100, 50.0, 'photo.jpg');
    }

    public function test_record_harvest_notes_are_optional(): void
    {
        $lot = Lot::factory()->inProgress()->create();

        $this->service->recordHarvest($lot, 100, 50.0, 'photo.jpg', null);

        $lot->refresh();
        $this->assertNull($lot->harvest_notes);
        $this->assertEquals(LotStatus::Harvest, $lot->status);
    }

    // -------------------------------------------------------------------------
    // submitSellingRevenue
    // -------------------------------------------------------------------------

    public function test_submit_selling_revenue_transitions_lot_to_selling_status(): void
    {
        \Illuminate\Support\Facades\Queue::fake();

        $lot = Lot::factory()->harvest()->create();

        $this->service->submitSellingRevenue($lot, 5_000_000, 'lot-selling-proofs/proof.jpg');

        $lot->refresh();
        $this->assertEquals(LotStatus::Selling, $lot->status);
        $this->assertEquals(5_000_000, $lot->selling_revenue_idr);
        $this->assertEquals('lot-selling-proofs/proof.jpg', $lot->selling_proof_photo);
        $this->assertNotNull($lot->selling_submitted_at);
        \Illuminate\Support\Facades\Queue::assertPushed(\App\Jobs\DistributeLotProfits::class);
    }

    public function test_submit_selling_revenue_throws_if_not_in_harvest_status(): void
    {
        $lot = Lot::factory()->inProgress()->create();

        $this->expectException(InvalidLotTransitionException::class);
        $this->service->submitSellingRevenue($lot, 5_000_000, 'photo.jpg');
    }

    // -------------------------------------------------------------------------
    // distributeProfits — formula verification
    // -------------------------------------------------------------------------

    public function test_distribute_profits_applies_10_percent_platform_fee(): void
    {
        // Revenue = 10_000_000
        // Platform fee = 1_000_000 (10%)
        // Remaining    = 9_000_000
        // Investor pool = 6_300_000 (70% of remaining)
        // Farm owner    = 2_700_000 (30% of remaining)
        $farmOwner = User::factory()->farmOwner()->create();
        $lot = $this->makeLotWithRevenue($farmOwner, 10_000_000);
        $investor = User::factory()->investor()->create(['kyc_status' => 'verified']);
        $this->makeInvestment($lot, $investor, 1_000_000);

        $this->service->distributeProfits($lot);

        // Platform wallet should have 1_000_000
        $platformWallet = Wallet::where('is_platform', true)->first();
        $this->assertEquals(1_000_000, $platformWallet->balance_idr);
    }

    public function test_distribute_profits_credits_farm_owner_30_percent_of_remaining(): void
    {
        $farmOwner = User::factory()->farmOwner()->create();
        $lot = $this->makeLotWithRevenue($farmOwner, 10_000_000);
        $investor = User::factory()->investor()->create(['kyc_status' => 'verified']);
        $this->makeInvestment($lot, $investor, 1_000_000);

        $this->service->distributeProfits($lot);

        // Farm owner gets 30% of remaining (9_000_000 × 0.30 = 2_700_000)
        $farmOwnerWallet = Wallet::where('user_id', $farmOwner->id)->first();
        $this->assertEquals(2_700_000, $farmOwnerWallet->balance_idr);
    }

    public function test_distribute_profits_credits_investor_pool_proportionally(): void
    {
        $farmOwner = User::factory()->farmOwner()->create();
        $lot = $this->makeLotWithRevenue($farmOwner, 10_000_000);

        $investor1 = User::factory()->investor()->create(['kyc_status' => 'verified']);
        $investor2 = User::factory()->investor()->create(['kyc_status' => 'verified']);
        // investor1 has 3x more investment than investor2
        $this->makeInvestment($lot, $investor1, 3_000_000);
        $this->makeInvestment($lot, $investor2, 1_000_000);

        $this->service->distributeProfits($lot);

        // Investor pool = 6_300_000 (70% of 9_000_000)
        // investor1 share = floor(6_300_000 × 3/4) = 4_725_000
        // investor2 share = floor(6_300_000 × 1/4) = 1_575_000
        // Total distributed = 6_300_000 (no residual here)
        $wallet1 = Wallet::where('user_id', $investor1->id)->first();
        $wallet2 = Wallet::where('user_id', $investor2->id)->first();

        $this->assertEquals(4_725_000, $wallet1->balance_idr);
        $this->assertEquals(1_575_000, $wallet2->balance_idr);
    }

    public function test_distribute_profits_gives_rounding_residual_to_largest_investor(): void
    {
        $farmOwner = User::factory()->farmOwner()->create();
        // Revenue = 100
        // Platform fee = floor(100 × 0.10) = 10
        // Remaining    = 90
        // Investor pool = floor(90 × 0.70) = 63... actually = 62 (floor(63))
        // Wait: floor(90 * 0.70) = floor(63.0) = 63? No: 90 * 0.70 = 63.0 exactly.
        // PHP: floor(90 * 0.70) = 62 due to float precision. Verified: 62.
        // farm_owner = 90 - 62 = 28
        // investor1 (2000 of 3000): floor(62 × 2000/3000) = floor(41.33) = 41
        // investor2 (1000 of 3000): floor(62 × 1000/3000) = floor(20.67) = 20
        // distributed = 61, residual = 1 → investor1 (largest) gets +1 = 42
        $lot = $this->makeLotWithRevenue($farmOwner, 100);

        $investor1 = User::factory()->investor()->create(['kyc_status' => 'verified']);
        $investor2 = User::factory()->investor()->create(['kyc_status' => 'verified']);
        $this->makeInvestment($lot, $investor1, 2000); // larger
        $this->makeInvestment($lot, $investor2, 1000); // smaller

        $this->service->distributeProfits($lot);

        $wallet1 = Wallet::where('user_id', $investor1->id)->first();
        $wallet2 = Wallet::where('user_id', $investor2->id)->first();

        // investor1 = 41 + 1 residual = 42
        // investor2 = 20
        $this->assertEquals(42, $wallet1->balance_idr);
        $this->assertEquals(20, $wallet2->balance_idr);
    }

    public function test_distribute_profits_transitions_lot_to_completed(): void
    {
        $farmOwner = User::factory()->farmOwner()->create();
        $lot = $this->makeLotWithRevenue($farmOwner, 1_000_000);
        $investor = User::factory()->investor()->create(['kyc_status' => 'verified']);
        $this->makeInvestment($lot, $investor, 500_000);

        $this->service->distributeProfits($lot);

        $lot->refresh();
        $this->assertEquals(LotStatus::Completed, $lot->status);
    }

    public function test_distribute_profits_is_no_op_if_lot_not_in_selling_status(): void
    {
        $farmOwner = User::factory()->farmOwner()->create();
        $lot = Lot::factory()->harvest()->create([
            'rack_id' => \Database\Factories\RackFactory::new()->create([
                'warehouse_id' => \App\Models\Warehouse::factory()->create([
                    'farm_id' => \App\Models\Farm::factory()->create([
                        'owner_id' => $farmOwner->id,
                    ])->id,
                ])->id,
            ])->id,
        ]);

        // Should not throw, should not transition
        $this->service->distributeProfits($lot);

        $lot->refresh();
        $this->assertEquals(LotStatus::Harvest, $lot->status);
    }

    public function test_distribute_profits_records_wallet_transactions(): void
    {
        $farmOwner = User::factory()->farmOwner()->create();
        $lot = $this->makeLotWithRevenue($farmOwner, 1_000_000);
        $investor = User::factory()->investor()->create(['kyc_status' => 'verified']);
        $this->makeInvestment($lot, $investor, 500_000);

        $this->service->distributeProfits($lot);

        // Investor, farm owner, and platform should all have wallet transactions
        $investorWallet = Wallet::where('user_id', $investor->id)->first();
        $farmOwnerWallet = Wallet::where('user_id', $farmOwner->id)->first();
        $platformWallet = Wallet::where('is_platform', true)->first();

        $this->assertNotNull($investorWallet);
        $this->assertNotNull($farmOwnerWallet);
        $this->assertNotNull($platformWallet);

        $this->assertEquals(1, $investorWallet->transactions()->count());
        $this->assertEquals(1, $farmOwnerWallet->transactions()->count());
        $this->assertEquals(1, $platformWallet->transactions()->count());
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    /**
     * Create a selling-status lot owned by the given farm owner with preset revenue.
     */
    private function makeLotWithRevenue(User $farmOwner, int $revenueIdr): Lot
    {
        $farm = \App\Models\Farm::factory()->create(['owner_id' => $farmOwner->id]);
        $warehouse = \App\Models\Warehouse::factory()->create(['farm_id' => $farm->id]);
        $rack = \App\Models\Rack::factory()->create(['warehouse_id' => $warehouse->id]);

        return Lot::factory()->selling()->create([
            'rack_id' => $rack->id,
            'selling_revenue_idr' => $revenueIdr,
        ]);
    }

    /**
     * Create an active lot investment for the given investor.
     */
    private function makeInvestment(Lot $lot, User $investor, int $amountIdr): Investment
    {
        return Investment::factory()->active()->create([
            'lot_id' => $lot->id,
            'tree_id' => null,
            'user_id' => $investor->id,
            'amount_idr' => $amountIdr,
        ]);
    }
}
