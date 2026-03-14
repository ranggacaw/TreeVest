<?php

namespace Tests\Feature;

use App\Enums\LotStatus;
use App\Models\Lot;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RecalculateLotPricesCommandTest extends TestCase
{
    use RefreshDatabase;

    public function test_command_updates_price_for_active_lot(): void
    {
        $lot = Lot::factory()->cycleOpen()->create([
            'base_price_per_tree_idr' => 100_000,
            'monthly_increase_rate' => '0.0500',
            // cycleOpen state sets cycle_started_at = now()-5 days, so month = 1
        ]);

        $this->artisan('app:recalculate-lot-prices')
            ->assertSuccessful();

        $lot->refresh();
        // month 1: price = 100000 × 1.05^0 = 100000
        $this->assertSame(100_000, $lot->current_price_per_tree_idr);
    }

    public function test_command_creates_price_snapshot(): void
    {
        $lot = Lot::factory()->cycleOpen()->create();

        $this->artisan('app:recalculate-lot-prices')
            ->assertSuccessful();

        $this->assertDatabaseHas('lot_price_snapshots', [
            'lot_id' => $lot->id,
        ]);
    }

    public function test_command_transitions_active_lot_to_in_progress_when_window_closes(): void
    {
        // cycleClosed: started 200 days ago, last_investment_month = 2, cycle_months = 6
        // currentCycleMonth ≈ floor(200/30)+1 = 7, capped at 6 > last_investment_month(2)
        $lot = Lot::factory()->cycleClosed()->create();

        $this->artisan('app:recalculate-lot-prices')
            ->assertSuccessful();

        $lot->refresh();
        $this->assertSame(LotStatus::InProgress, $lot->status);
    }

    public function test_command_does_not_process_completed_lots(): void
    {
        $lot = Lot::factory()->completed()->create(['cycle_started_at' => now()->subDays(10)->toDateString()]);

        $this->artisan('app:recalculate-lot-prices')
            ->assertSuccessful();

        // No snapshot should be created for completed lots
        $this->assertDatabaseMissing('lot_price_snapshots', ['lot_id' => $lot->id]);
    }

    public function test_command_does_not_process_lots_without_start_date(): void
    {
        Lot::factory()->active()->create(['cycle_started_at' => null]);

        $this->artisan('app:recalculate-lot-prices')
            ->assertSuccessful();

        $this->assertDatabaseEmpty('lot_price_snapshots');
    }

    public function test_command_outputs_summary(): void
    {
        Lot::factory()->cycleOpen()->count(3)->create();

        $this->artisan('app:recalculate-lot-prices')
            ->expectsOutputToContain('Processing 3 lots')
            ->assertSuccessful();
    }
}
