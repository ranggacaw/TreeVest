<?php

namespace Tests\Unit;

use App\Models\Lot;
use App\Services\DynamicPricingService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DynamicPricingServiceTest extends TestCase
{
    use RefreshDatabase;

    private DynamicPricingService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new DynamicPricingService();
    }

    // ── priceForMonth ─────────────────────────────────────────────

    public function test_price_for_month_1_equals_base_price(): void
    {
        $lot = Lot::factory()->make([
            'base_price_per_tree_cents' => 100_000,
            'monthly_increase_rate' => '0.0500',
        ]);

        $this->assertSame(100_000, $this->service->priceForMonth($lot, 1));
    }

    public function test_price_for_month_2_applies_compound_rate(): void
    {
        $lot = Lot::factory()->make([
            'base_price_per_tree_cents' => 100_000,
            'monthly_increase_rate' => '0.0500',
        ]);

        // 100000 × 1.05^1 = 105000
        $this->assertSame(105_000, $this->service->priceForMonth($lot, 2));
    }

    public function test_price_for_month_3_compounds_correctly(): void
    {
        $lot = Lot::factory()->make([
            'base_price_per_tree_cents' => 100_000,
            'monthly_increase_rate' => '0.0500',
        ]);

        // 100000 × 1.05^2 = 110250
        $this->assertSame(110_250, $this->service->priceForMonth($lot, 3));
    }

    public function test_price_for_month_with_zero_rate_stays_flat(): void
    {
        $lot = Lot::factory()->make([
            'base_price_per_tree_cents' => 200_000,
            'monthly_increase_rate' => '0.0000',
        ]);

        $this->assertSame(200_000, $this->service->priceForMonth($lot, 1));
        $this->assertSame(200_000, $this->service->priceForMonth($lot, 6));
    }

    // ── currentCycleMonth ─────────────────────────────────────────

    public function test_current_cycle_month_is_1_when_no_start_date(): void
    {
        $lot = Lot::factory()->make([
            'cycle_started_at' => null,
            'cycle_months' => 6,
        ]);

        $this->assertSame(1, $this->service->currentCycleMonth($lot));
    }

    public function test_current_cycle_month_is_1_on_start_day(): void
    {
        $lot = Lot::factory()->make([
            'cycle_started_at' => now()->toDateString(),
            'cycle_months' => 6,
        ]);

        $this->assertSame(1, $this->service->currentCycleMonth($lot));
    }

    public function test_current_cycle_month_increments_after_30_days(): void
    {
        $lot = Lot::factory()->make([
            'cycle_started_at' => now()->subDays(30)->toDateString(),
            'cycle_months' => 6,
        ]);

        $this->assertSame(2, $this->service->currentCycleMonth($lot));
    }

    public function test_current_cycle_month_is_capped_at_cycle_months(): void
    {
        $lot = Lot::factory()->make([
            'cycle_started_at' => now()->subDays(300)->toDateString(),
            'cycle_months' => 6,
        ]);

        $this->assertSame(6, $this->service->currentCycleMonth($lot));
    }

    // ── isInvestmentOpen ──────────────────────────────────────────

    public function test_investment_is_open_when_active_and_within_window(): void
    {
        $lot = Lot::factory()->cycleOpen()->make();

        $this->assertTrue($this->service->isInvestmentOpen($lot));
    }

    public function test_investment_is_closed_when_cycle_month_exceeds_last_investment_month(): void
    {
        $lot = Lot::factory()->cycleClosed()->make();

        $this->assertFalse($this->service->isInvestmentOpen($lot));
    }

    public function test_investment_is_closed_when_lot_not_active(): void
    {
        $lot = Lot::factory()->inProgress()->make([
            'cycle_started_at' => now()->subDays(5)->toDateString(),
            'last_investment_month' => 5,
        ]);

        $this->assertFalse($this->service->isInvestmentOpen($lot));
    }

    // ── getPriceTable ─────────────────────────────────────────────

    public function test_price_table_has_correct_number_of_entries(): void
    {
        $lot = Lot::factory()->make([
            'cycle_months' => 4,
            'last_investment_month' => 3,
            'base_price_per_tree_cents' => 100_000,
            'monthly_increase_rate' => '0.0500',
            'cycle_started_at' => now()->toDateString(),
        ]);

        $table = $this->service->getPriceTable($lot);

        $this->assertCount(4, $table);
    }

    public function test_price_table_marks_current_month(): void
    {
        $lot = Lot::factory()->make([
            'cycle_months' => 4,
            'last_investment_month' => 3,
            'base_price_per_tree_cents' => 100_000,
            'monthly_increase_rate' => '0.0500',
            'cycle_started_at' => now()->toDateString(), // month 1
        ]);

        $table = $this->service->getPriceTable($lot);

        $this->assertTrue($table[1]['is_current']);
        $this->assertFalse($table[2]['is_current']);
    }

    public function test_price_table_marks_open_months(): void
    {
        $lot = Lot::factory()->make([
            'cycle_months' => 4,
            'last_investment_month' => 2,
            'base_price_per_tree_cents' => 100_000,
            'monthly_increase_rate' => '0.0500',
            'cycle_started_at' => now()->toDateString(),
        ]);

        $table = $this->service->getPriceTable($lot);

        $this->assertTrue($table[1]['is_open']);
        $this->assertTrue($table[2]['is_open']);
        $this->assertFalse($table[3]['is_open']);
        $this->assertFalse($table[4]['is_open']);
    }

    // ── recalculateCurrentPrice ───────────────────────────────────

    public function test_recalculate_updates_lot_price_and_creates_snapshot(): void
    {
        $lot = Lot::factory()->cycleOpen()->create();

        $this->service->recalculateCurrentPrice($lot);

        $expectedPrice = $this->service->priceForMonth($lot, $this->service->currentCycleMonth($lot));

        $lot->refresh();
        $this->assertSame($expectedPrice, $lot->current_price_per_tree_cents);
        $this->assertDatabaseHas('lot_price_snapshots', [
            'lot_id' => $lot->id,
            'cycle_month' => $this->service->currentCycleMonth($lot),
        ]);
    }

    public function test_recalculate_does_not_duplicate_snapshot_for_same_month(): void
    {
        $lot = Lot::factory()->cycleOpen()->create();

        $this->service->recalculateCurrentPrice($lot);
        $this->service->recalculateCurrentPrice($lot);

        $this->assertDatabaseCount('lot_price_snapshots', 1);
    }
}
