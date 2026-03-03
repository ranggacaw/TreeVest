<?php

namespace Tests\Unit;

use App\Enums\PayoutStatus;
use App\Models\Farm;
use App\Models\FruitCrop;
use App\Models\FruitType;
use App\Models\Investment;
use App\Models\Payout;
use App\Models\Tree;
use App\Models\User;
use App\Services\ReportDataService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReportDataServiceTest extends TestCase
{
    use RefreshDatabase;

    protected User $investor;

    protected FruitType $fruitType;

    protected Farm $farm;

    protected FruitCrop $fruitCrop;

    protected Tree $tree;

    protected function setUp(): void
    {
        parent::setUp();

        $this->investor = User::factory()->investor()->create();
        $this->fruitType = FruitType::factory()->create();
        $this->farm = Farm::factory()->create();
        $this->fruitCrop = FruitCrop::factory()->create([
            'farm_id' => $this->farm->id,
            'fruit_type_id' => $this->fruitType->id,
        ]);
        $this->tree = Tree::factory()->create([
            'fruit_crop_id' => $this->fruitCrop->id,
        ]);
    }

    public function test_get_profit_loss_data_correctly_aggregates_payouts(): void
    {
        $investment = Investment::factory()->create([
            'user_id' => $this->investor->id,
            'tree_id' => $this->tree->id,
            'amount_cents' => 1000000, // Rp 10,000
        ]);

        Payout::factory()->create([
            'investment_id' => $investment->id,
            'gross_amount_cents' => 500000, // Rp 5,000
            'platform_fee_cents' => 50000, // Rp 500
            'net_amount_cents' => 450000, // Rp 4,500
            'status' => PayoutStatus::Completed,
        ]);

        Payout::factory()->create([
            'investment_id' => $investment->id,
            'gross_amount_cents' => 600000, // Rp 6,000
            'platform_fee_cents' => 60000, // Rp 600
            'net_amount_cents' => 540000, // Rp 5,400
            'status' => PayoutStatus::Completed,
        ]);

        $service = new ReportDataService;
        $data = $service->getProfitLossData($this->investor);

        $this->assertCount(1, $data['rows']);
        $this->assertEquals(1000000, $data['rows'][0]['amountInvestedCents']);
        $this->assertEquals(990000, $data['rows'][0]['totalPayoutsCents']);
        $this->assertEquals(-10000, $data['rows'][0]['netCents']);
        $this->assertEquals(-1.0, $data['rows'][0]['actualRoiPercent']);
        $this->assertEquals(1000000, $data['summary']['totalInvestedCents']);
        $this->assertEquals(990000, $data['summary']['totalPayoutsCents']);
        $this->assertEquals(-10000, $data['summary']['netCents']);
    }

    public function test_get_profit_loss_data_applies_date_range_filters(): void
    {
        Investment::factory()->create([
            'user_id' => $this->investor->id,
            'tree_id' => $this->tree->id,
            'amount_cents' => 1000000,
            'purchase_date' => '2024-01-01',
        ]);

        Investment::factory()->create([
            'user_id' => $this->investor->id,
            'tree_id' => $this->tree->id,
            'amount_cents' => 2000000,
            'purchase_date' => '2025-01-01',
        ]);

        $service = new ReportDataService;
        $data = $service->getProfitLossData($this->investor, [
            'from' => '2024-01-01',
            'to' => '2024-12-31',
        ]);

        $this->assertCount(1, $data['rows']);
        $this->assertEquals(1000000, $data['summary']['totalInvestedCents']);
    }

    public function test_get_profit_loss_data_applies_farm_filter(): void
    {
        $otherFarm = Farm::factory()->create();
        $otherCrop = FruitCrop::factory()->create([
            'farm_id' => $otherFarm->id,
            'fruit_type_id' => $this->fruitType->id,
        ]);
        $otherTree = Tree::factory()->create([
            'fruit_crop_id' => $otherCrop->id,
        ]);

        Investment::factory()->create([
            'user_id' => $this->investor->id,
            'tree_id' => $this->tree->id,
            'amount_cents' => 1000000,
        ]);

        Investment::factory()->create([
            'user_id' => $this->investor->id,
            'tree_id' => $otherTree->id,
            'amount_cents' => 2000000,
        ]);

        $service = new ReportDataService;
        $data = $service->getProfitLossData($this->investor, [
            'farm_id' => $this->farm->id,
        ]);

        $this->assertCount(1, $data['rows']);
        $this->assertEquals(1000000, $data['summary']['totalInvestedCents']);
    }

    public function test_get_profit_loss_data_applies_investment_filter(): void
    {
        $investment1 = Investment::factory()->create([
            'user_id' => $this->investor->id,
            'tree_id' => $this->tree->id,
            'amount_cents' => 1000000,
        ]);

        Investment::factory()->create([
            'user_id' => $this->investor->id,
            'tree_id' => $this->tree->id,
            'amount_cents' => 2000000,
        ]);

        $service = new ReportDataService;
        $data = $service->getProfitLossData($this->investor, [
            'investment_id' => $investment1->id,
        ]);

        $this->assertCount(1, $data['rows']);
        $this->assertEquals($investment1->id, $data['rows'][0]['investmentId']);
    }

    public function test_get_profit_loss_data_handles_zero_payouts(): void
    {
        Investment::factory()->create([
            'user_id' => $this->investor->id,
            'tree_id' => $this->tree->id,
            'amount_cents' => 1000000,
        ]);

        $service = new ReportDataService;
        $data = $service->getProfitLossData($this->investor);

        $this->assertCount(1, $data['rows']);
        $this->assertEquals(0, $data['rows'][0]['totalPayoutsCents']);
        $this->assertEquals(-1000000, $data['rows'][0]['netCents']);
        $this->assertEquals(-100.0, $data['rows'][0]['actualRoiPercent']);
    }

    public function test_get_profit_loss_data_excludes_non_user_investments(): void
    {
        $otherInvestor = User::factory()->investor()->create();

        Investment::factory()->create([
            'user_id' => $this->investor->id,
            'tree_id' => $this->tree->id,
            'amount_cents' => 1000000,
        ]);

        Investment::factory()->create([
            'user_id' => $otherInvestor->id,
            'tree_id' => $this->tree->id,
            'amount_cents' => 2000000,
        ]);

        $service = new ReportDataService;
        $data = $service->getProfitLossData($this->investor);

        $this->assertCount(1, $data['rows']);
        $this->assertEquals(1000000, $data['summary']['totalInvestedCents']);
    }

    public function test_get_tax_summary_data_filters_by_year(): void
    {
        $investment = Investment::factory()->create([
            'user_id' => $this->investor->id,
            'tree_id' => $this->tree->id,
            'amount_cents' => 1000000,
            'purchase_date' => '2024-06-15',
        ]);

        Investment::factory()->create([
            'user_id' => $this->investor->id,
            'tree_id' => $this->tree->id,
            'amount_cents' => 2000000,
            'purchase_date' => '2023-06-15',
        ]);

        Payout::factory()->create([
            'investment_id' => $investment->id,
            'investor_id' => $this->investor->id,
            'net_amount_cents' => 500000,
            'status' => PayoutStatus::Completed,
            'completed_at' => '2024-12-01',
        ]);

        $service = new ReportDataService;
        $data = $service->getTaxSummaryData($this->investor, 2024);

        $this->assertEquals(2024, $data['year']);
        $this->assertCount(1, $data['investments']['rows']);
        $this->assertCount(1, $data['income']['rows']);
        $this->assertEquals(1000000, $data['summary']['totalInvestedCents']);
        $this->assertEquals(500000, $data['summary']['totalIncomeCents']);
    }

    public function test_get_tax_summary_data_includes_only_completed_payouts(): void
    {
        $investment = Investment::factory()->create([
            'user_id' => $this->investor->id,
            'tree_id' => $this->tree->id,
            'amount_cents' => 1000000,
        ]);

        Payout::factory()->create([
            'investment_id' => $investment->id,
            'investor_id' => $this->investor->id,
            'net_amount_cents' => 500000,
            'status' => PayoutStatus::Completed,
            'completed_at' => '2024-12-01',
        ]);

        Payout::factory()->create([
            'investment_id' => $investment->id,
            'investor_id' => $this->investor->id,
            'net_amount_cents' => 600000,
            'status' => PayoutStatus::Pending,
            'completed_at' => '2024-12-01',
        ]);

        $service = new ReportDataService;
        $data = $service->getTaxSummaryData($this->investor, 2024);

        $this->assertCount(1, $data['income']['rows']);
        $this->assertEquals(500000, $data['summary']['totalIncomeCents']);
    }

    public function test_get_tax_summary_data_calculates_correct_totals(): void
    {
        Investment::factory()->create([
            'user_id' => $this->investor->id,
            'tree_id' => $this->tree->id,
            'amount_cents' => 1000000,
            'purchase_date' => '2024-06-15',
        ]);

        Investment::factory()->create([
            'user_id' => $this->investor->id,
            'tree_id' => $this->tree->id,
            'amount_cents' => 2000000,
            'purchase_date' => '2024-06-15',
        ]);

        $investment1 = Investment::factory()->create([
            'user_id' => $this->investor->id,
            'tree_id' => $this->tree->id,
            'amount_cents' => 1500000,
            'purchase_date' => '2024-06-15',
        ]);

        Payout::factory()->create([
            'investment_id' => $investment1->id,
            'investor_id' => $this->investor->id,
            'net_amount_cents' => 750000,
            'status' => PayoutStatus::Completed,
            'completed_at' => '2024-12-01',
        ]);

        $service = new ReportDataService;
        $data = $service->getTaxSummaryData($this->investor, 2024);

        $this->assertEquals(4500000, $data['summary']['totalInvestedCents']);
        $this->assertEquals(750000, $data['summary']['totalIncomeCents']);
        $this->assertEquals(-3750000, $data['summary']['netCents']);
    }

    public function test_get_performance_data_aggregates_by_month(): void
    {
        $investment = Investment::factory()->create([
            'user_id' => $this->investor->id,
            'tree_id' => $this->tree->id,
            'amount_cents' => 1000000,
            'purchase_date' => '2024-06-15',
        ]);

        Payout::factory()->create([
            'investment_id' => $investment->id,
            'investor_id' => $this->investor->id,
            'net_amount_cents' => 500000,
            'status' => PayoutStatus::Completed,
            'completed_at' => '2024-12-01',
        ]);

        $service = new ReportDataService;
        $data = $service->getPerformanceData($this->investor);

        $this->assertIsArray($data);
        $this->assertGreaterThan(0, count($data));
        $this->assertArrayHasKey('month', $data[0]);
        $this->assertArrayHasKey('investedCents', $data[0]);
        $this->assertArrayHasKey('payoutsCents', $data[0]);
        $this->assertArrayHasKey('cumulativeCents', $data[0]);
    }
}
