<?php

namespace Tests\Feature;

use App\Exceptions\InsufficientTreesException;
use App\Models\Lot;
use App\Models\User;
use App\Services\LotInvestmentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TreeAvailabilityTest extends TestCase
{
    use RefreshDatabase;

    private LotInvestmentService $service;

    private User $investor;

    protected function setUp(): void
    {
        parent::setUp();

        $this->service = app(LotInvestmentService::class);

        $this->investor = User::factory()->create([
            'role' => 'investor',
            'kyc_status' => 'verified',
        ]);
    }

    /** @test */
    public function purchasing_n_trees_decrements_available_trees(): void
    {
        $lot = Lot::factory()->cycleOpen()->create([
            'total_trees' => 10,
            'available_trees' => 10,
            'current_price_per_tree_idr' => 100_000,
        ]);

        $this->service->purchase($this->investor, $lot, 3);

        $this->assertDatabaseHas('lots', [
            'id' => $lot->id,
            'available_trees' => 7,
        ]);
    }

    /** @test */
    public function purchasing_single_tree_decrements_available_trees_by_one(): void
    {
        $lot = Lot::factory()->cycleOpen()->create([
            'total_trees' => 5,
            'available_trees' => 5,
            'current_price_per_tree_idr' => 50_000,
        ]);

        $this->service->purchase($this->investor, $lot, 1);

        $this->assertDatabaseHas('lots', [
            'id' => $lot->id,
            'available_trees' => 4,
        ]);
    }

    /** @test */
    public function purchasing_all_remaining_trees_leaves_available_trees_at_zero(): void
    {
        $lot = Lot::factory()->cycleOpen()->create([
            'total_trees' => 3,
            'available_trees' => 3,
            'current_price_per_tree_idr' => 100_000,
        ]);

        $this->service->purchase($this->investor, $lot, 3);

        $this->assertDatabaseHas('lots', [
            'id' => $lot->id,
            'available_trees' => 0,
        ]);
    }

    /** @test */
    public function purchasing_more_trees_than_available_throws_insufficient_trees_exception(): void
    {
        $this->expectException(InsufficientTreesException::class);

        $lot = Lot::factory()->cycleOpen()->create([
            'total_trees' => 5,
            'available_trees' => 2,
            'current_price_per_tree_idr' => 100_000,
        ]);

        $this->service->purchase($this->investor, $lot, 3);
    }

    /** @test */
    public function purchasing_when_no_trees_available_throws_insufficient_trees_exception(): void
    {
        $this->expectException(InsufficientTreesException::class);

        $lot = Lot::factory()->cycleOpen()->create([
            'total_trees' => 5,
            'available_trees' => 0,
            'current_price_per_tree_idr' => 100_000,
        ]);

        $this->service->purchase($this->investor, $lot, 1);
    }

    /** @test */
    public function investment_amount_equals_price_per_tree_times_quantity(): void
    {
        $lot = Lot::factory()->cycleOpen()->create([
            'total_trees' => 10,
            'available_trees' => 10,
            'current_price_per_tree_idr' => 200_000,
        ]);

        $investment = $this->service->purchase($this->investor, $lot, 4);

        $this->assertEquals(800_000, $investment->amount_idr);
    }

    /** @test */
    public function failed_purchase_does_not_decrement_available_trees(): void
    {
        $lot = Lot::factory()->cycleOpen()->create([
            'total_trees' => 5,
            'available_trees' => 1,
            'current_price_per_tree_idr' => 100_000,
        ]);

        try {
            $this->service->purchase($this->investor, $lot, 2);
        } catch (InsufficientTreesException) {
            // expected
        }

        $this->assertDatabaseHas('lots', [
            'id' => $lot->id,
            'available_trees' => 1,
        ]);
    }
}
