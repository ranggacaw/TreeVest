<?php

namespace Tests\Unit;

use App\Enums\InvestmentStatus;
use App\Enums\PayoutStatus;
use App\Models\Farm;
use App\Models\FruitCrop;
use App\Models\FruitType;
use App\Models\Harvest;
use App\Models\Investment;
use App\Models\MarketPrice;
use App\Models\Tree;
use App\Models\User;
use App\Services\ProfitCalculationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * NEW calculation (10% platform fee → 70/30 investor/farm-owner split):
 *
 *   platformFeeIdr    = ROUND(totalYieldIdr * 0.10)           // 10% of total
 *   remainingIdr      = totalYieldIdr - platformFeeIdr          // 90%
 *   investorPoolIdr   = ROUND(remainingIdr * 0.70)             // 70% of 90% = 63% of total
 *   farmOwnerShareIdr = remainingIdr - investorPoolIdr          // 30% of 90% = 27% of total
 *
 *   Per payout: platform_fee_idr = 0, net_amount_idr == gross_amount_idr
 *   (platform fee deducted at pool level, not per-payout)
 */
class ProfitCalculationServiceTest extends TestCase
{
    use RefreshDatabase;

    private ProfitCalculationService $service;

    private User $investor;

    private Tree $tree;

    private Harvest $harvest;

    private MarketPrice $marketPrice;

    protected function setUp(): void
    {
        parent::setUp();

        $this->service = new ProfitCalculationService;

        $this->investor = User::factory()->investor()->create();
        $fruitType = FruitType::factory()->create();
        $farm = Farm::factory()->create();
        $fruitCrop = FruitCrop::factory()->create([
            'farm_id' => $farm->id,
            'fruit_type_id' => $fruitType->id,
        ]);
        $this->tree = Tree::factory()->create([
            'fruit_crop_id' => $fruitCrop->id,
        ]);

        $this->marketPrice = MarketPrice::factory()->create([
            'fruit_type_id' => $fruitType->id,
            'price_per_kg_idr' => 1000, // $10.00 per kg
            'currency' => 'USD',
            'created_by' => User::factory()->create()->id,
        ]);

        $this->harvest = Harvest::factory()->forTree($this->tree)->create([
            'actual_yield_kg' => 100,
            'market_price_id' => $this->marketPrice->id,
            'platform_fee_rate' => 0.0500, // 5%
            'status' => \App\Enums\HarvestStatus::Completed,
        ]);
    }

    /** @test */
    public function it_distributes_63_percent_of_yield_to_investors(): void
    {
        // totalYieldIdr = 100 kg * 1000 cents = 100_000 cents
        // platformFeeIdr = ROUND(100_000 * 0.10) = 10_000
        // remainingIdr   = 90_000
        // investorPoolIdr = ROUND(90_000 * 0.70) = 63_000
        // Single investor → gross = 63_000; platform_fee_idr = 0; net = 63_000

        $investment = Investment::factory()->create([
            'user_id' => $this->investor->id,
            'tree_id' => $this->tree->id,
            'amount_idr' => 100_000,
            'status' => InvestmentStatus::Active,
        ]);

        $payouts = $this->service->calculate($this->harvest);

        $this->assertCount(1, $payouts);

        $payout = $payouts->first();
        $this->assertEquals(63_000, $payout->gross_amount_idr);
        $this->assertEquals(0, $payout->platform_fee_idr);
        $this->assertEquals(63_000, $payout->net_amount_idr);
    }

    /** @test */
    public function it_stores_farm_owner_share_idr_on_harvest(): void
    {
        // totalYieldIdr = 100_000; platformFee = 10_000; remaining = 90_000
        // investorPool = 63_000; farmOwner = 90_000 - 63_000 = 27_000
        Investment::factory()->create([
            'user_id' => $this->investor->id,
            'tree_id' => $this->tree->id,
            'amount_idr' => 100_000,
            'status' => InvestmentStatus::Active,
        ]);

        $this->service->calculate($this->harvest);

        $this->harvest->refresh();
        $this->assertEquals(27_000, $this->harvest->farm_owner_share_idr);
    }

    /** @test */
    public function it_splits_investor_pool_proportionally_among_multiple_investors(): void
    {
        // totalYieldIdr = 100_000; investorPoolIdr = 63_000
        // Investor A: 75_000 / 100_000 = 75% → ROUND(63_000 * 0.75) = 47_250
        // Investor B: 25_000 / 100_000 = 25% → ROUND(63_000 * 0.25) = 15_750

        $investorA = $this->investor;
        $investorB = User::factory()->investor()->create();

        Investment::factory()->create([
            'user_id' => $investorA->id,
            'tree_id' => $this->tree->id,
            'amount_idr' => 75_000,
            'status' => InvestmentStatus::Active,
        ]);
        Investment::factory()->create([
            'user_id' => $investorB->id,
            'tree_id' => $this->tree->id,
            'amount_idr' => 25_000,
            'status' => InvestmentStatus::Active,
        ]);

        $payouts = $this->service->calculate($this->harvest);

        $this->assertCount(2, $payouts);

        $payoutA = $payouts->firstWhere('investor_id', $investorA->id);
        $payoutB = $payouts->firstWhere('investor_id', $investorB->id);

        $this->assertEquals(47_250, $payoutA->gross_amount_idr);
        $this->assertEquals(15_750, $payoutB->gross_amount_idr);
    }

    /** @test */
    public function it_returns_existing_payouts_when_already_calculated(): void
    {
        Investment::factory()->create([
            'user_id' => $this->investor->id,
            'tree_id' => $this->tree->id,
            'amount_idr' => 100_000,
            'status' => InvestmentStatus::Active,
        ]);

        $firstResult = $this->service->calculate($this->harvest);
        $secondResult = $this->service->calculate($this->harvest);

        // No new payouts created on second call
        $this->assertCount(1, $firstResult);
        $this->assertCount(1, $secondResult);
        $this->assertEquals($firstResult->first()->id, $secondResult->first()->id);
    }

    /** @test */
    public function it_returns_empty_collection_when_no_active_investments(): void
    {
        // No investments → nothing to distribute
        $payouts = $this->service->calculate($this->harvest);

        $this->assertTrue($payouts->isEmpty());
    }

    /** @test */
    public function it_throws_when_harvest_missing_yield(): void
    {
        $this->expectException(\InvalidArgumentException::class);

        $incompleteHarvest = Harvest::factory()->forTree($this->tree)->create([
            'actual_yield_kg' => null,
            'market_price_id' => $this->marketPrice->id,
            'status' => \App\Enums\HarvestStatus::Completed,
        ]);

        $this->service->calculate($incompleteHarvest);
    }

    /** @test */
    public function it_throws_when_harvest_missing_market_price(): void
    {
        $this->expectException(\InvalidArgumentException::class);

        $incompleteHarvest = Harvest::factory()->forTree($this->tree)->create([
            'actual_yield_kg' => 100,
            'market_price_id' => null,
            'status' => \App\Enums\HarvestStatus::Completed,
        ]);

        $this->service->calculate($incompleteHarvest);
    }

    /** @test */
    public function it_sets_correct_payout_status_and_currency(): void
    {
        Investment::factory()->create([
            'user_id' => $this->investor->id,
            'tree_id' => $this->tree->id,
            'amount_idr' => 100_000,
            'status' => InvestmentStatus::Active,
        ]);

        $payouts = $this->service->calculate($this->harvest);
        $payout = $payouts->first();

        $this->assertEquals(PayoutStatus::Pending, $payout->status);
        $this->assertEquals('USD', $payout->currency);
    }
}
