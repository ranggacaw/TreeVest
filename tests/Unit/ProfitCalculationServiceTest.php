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
 * Snapshot of OLD calculation (pre-60/40 split) kept for regression reference:
 *
 *   OLD: grossAmountIdr = ROUND((investmentIdr / totalInvestedIdr) * totalYieldIdr)
 *
 * NEW calculation with 60/40 split:
 *
 *   investorPoolIdr   = ROUND(totalYieldIdr * 0.40)
 *   grossAmountIdr    = ROUND((investmentIdr / totalInvestedIdr) * investorPoolIdr)
 *   farmOwnerShareIdr = totalYieldIdr - investorPoolIdr  (stored on harvest, not paid out here)
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
    public function it_distributes_40_percent_of_yield_to_investors(): void
    {
        // totalYieldIdr = 100 kg * 1000 cents = 100_000 cents ($1,000)
        // investorPoolIdr = ROUND(100_000 * 0.40) = 40_000 cents ($400)

        $investment = Investment::factory()->create([
            'user_id' => $this->investor->id,
            'tree_id' => $this->tree->id,
            'amount_idr' => 100_000,
            'status' => InvestmentStatus::Active,
        ]);

        $payouts = $this->service->calculate($this->harvest);

        $this->assertCount(1, $payouts);

        $payout = $payouts->first();
        // Single investor owns 100% of invested capital → receives 100% of investorPool
        // gross = 40_000; platform fee = ROUND(40_000 * 0.05) = 2_000; net = 38_000
        $this->assertEquals(40_000, $payout->gross_amount_idr);
        $this->assertEquals(2_000, $payout->platform_fee_idr);
        $this->assertEquals(38_000, $payout->net_amount_idr);
    }

    /** @test */
    public function it_stores_farm_owner_share_idr_on_harvest(): void
    {
        // totalYieldIdr = 100_000; investorPool = 40_000; farmOwner = 60_000
        Investment::factory()->create([
            'user_id' => $this->investor->id,
            'tree_id' => $this->tree->id,
            'amount_idr' => 100_000,
            'status' => InvestmentStatus::Active,
        ]);

        $this->service->calculate($this->harvest);

        $this->harvest->refresh();
        $this->assertEquals(60_000, $this->harvest->farm_owner_share_idr);
    }

    /** @test */
    public function it_splits_investor_pool_proportionally_among_multiple_investors(): void
    {
        // totalYieldIdr = 100_000; investorPool = 40_000
        // Investor A: 75_000 / 100_000 = 75% → 30_000 gross
        // Investor B: 25_000 / 100_000 = 25% → 10_000 gross

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

        $this->assertEquals(30_000, $payoutA->gross_amount_idr);
        $this->assertEquals(10_000, $payoutB->gross_amount_idr);
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
