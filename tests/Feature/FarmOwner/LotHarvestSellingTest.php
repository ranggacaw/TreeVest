<?php

namespace Tests\Feature\FarmOwner;

use App\Enums\LotStatus;
use App\Jobs\DistributeLotProfits;
use App\Models\Farm;
use App\Models\Lot;
use App\Models\Rack;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class LotHarvestSellingTest extends TestCase
{
    use RefreshDatabase;

    private function makeLotForOwner(User $farmOwner, string $status = 'in_progress'): Lot
    {
        $farm = Farm::factory()->create(['owner_id' => $farmOwner->id]);
        $warehouse = Warehouse::factory()->create(['farm_id' => $farm->id]);
        $rack = Rack::factory()->create(['warehouse_id' => $warehouse->id]);

        $factoryState = match ($status) {
            'active' => 'active',
            'in_progress' => 'inProgress',
            'harvest' => 'harvest',
            'selling' => 'selling',
            default => 'inProgress',
        };

        return Lot::factory()->{$factoryState}()->create(['rack_id' => $rack->id]);
    }

    // -------------------------------------------------------------------------
    // POST farm-owner/lots/{lot}/record-harvest
    // -------------------------------------------------------------------------

    public function test_farm_owner_can_record_harvest_on_in_progress_lot(): void
    {
        Storage::fake('public');

        $farmOwner = User::factory()->farmOwner()->create();
        $lot = $this->makeLotForOwner($farmOwner, 'in_progress');
        $photo = UploadedFile::fake()->image('harvest.jpg');

        $response = $this->actingAs($farmOwner)->post(
            route('farm-owner.lots.record-harvest', $lot),
            [
                'total_fruit' => 500,
                'total_weight_kg' => 250.5,
                'notes' => 'Very good quality this season',
                'proof_photo' => $photo,
            ]
        );

        $response->assertRedirect(route('farm-owner.lots.show', $lot));

        $lot->refresh();
        $this->assertEquals(LotStatus::Harvest, $lot->status);
        $this->assertEquals(500, $lot->harvest_total_fruit);
        $this->assertNotNull($lot->harvest_recorded_at);
    }

    public function test_record_harvest_requires_proof_photo(): void
    {
        $farmOwner = User::factory()->farmOwner()->create();
        $lot = $this->makeLotForOwner($farmOwner, 'in_progress');

        $response = $this->actingAs($farmOwner)->post(
            route('farm-owner.lots.record-harvest', $lot),
            [
                'total_fruit' => 500,
                'total_weight_kg' => 250.5,
            ]
        );

        $response->assertSessionHasErrors('proof_photo');
        $lot->refresh();
        $this->assertEquals(LotStatus::InProgress, $lot->status);
    }

    public function test_record_harvest_requires_total_fruit_and_weight(): void
    {
        $farmOwner = User::factory()->farmOwner()->create();
        $lot = $this->makeLotForOwner($farmOwner, 'in_progress');
        $photo = UploadedFile::fake()->image('harvest.jpg');

        $response = $this->actingAs($farmOwner)->post(
            route('farm-owner.lots.record-harvest', $lot),
            ['proof_photo' => $photo]
        );

        $response->assertSessionHasErrors(['total_fruit', 'total_weight_kg']);
    }

    public function test_farm_owner_cannot_record_harvest_on_active_lot(): void
    {
        Storage::fake('public');
        $farmOwner = User::factory()->farmOwner()->create();
        $lot = $this->makeLotForOwner($farmOwner, 'active');
        $photo = UploadedFile::fake()->image('harvest.jpg');

        $response = $this->actingAs($farmOwner)->post(
            route('farm-owner.lots.record-harvest', $lot),
            [
                'total_fruit' => 500,
                'total_weight_kg' => 250.0,
                'proof_photo' => $photo,
            ]
        );

        $response->assertStatus(500); // InvalidLotTransitionException
        $lot->refresh();
        $this->assertEquals(LotStatus::Active, $lot->status);
    }

    public function test_farm_owner_cannot_record_harvest_on_lot_belonging_to_another_owner(): void
    {
        Storage::fake('public');
        $farmOwner1 = User::factory()->farmOwner()->create();
        $farmOwner2 = User::factory()->farmOwner()->create();
        $lot = $this->makeLotForOwner($farmOwner1, 'in_progress');
        $photo = UploadedFile::fake()->image('harvest.jpg');

        $response = $this->actingAs($farmOwner2)->post(
            route('farm-owner.lots.record-harvest', $lot),
            [
                'total_fruit' => 500,
                'total_weight_kg' => 250.0,
                'proof_photo' => $photo,
            ]
        );

        $response->assertStatus(403);
    }

    public function test_unauthenticated_user_cannot_record_harvest(): void
    {
        $farmOwner = User::factory()->farmOwner()->create();
        $lot = $this->makeLotForOwner($farmOwner, 'in_progress');
        $photo = UploadedFile::fake()->image('harvest.jpg');

        $response = $this->post(
            route('farm-owner.lots.record-harvest', $lot),
            [
                'total_fruit' => 500,
                'total_weight_kg' => 250.0,
                'proof_photo' => $photo,
            ]
        );

        $response->assertRedirect(route('login'));
    }

    // -------------------------------------------------------------------------
    // POST farm-owner/lots/{lot}/submit-selling
    // -------------------------------------------------------------------------

    public function test_farm_owner_can_submit_selling_revenue_on_harvested_lot(): void
    {
        Storage::fake('public');
        Queue::fake();

        $farmOwner = User::factory()->farmOwner()->create();
        $lot = $this->makeLotForOwner($farmOwner, 'harvest');
        $photo = UploadedFile::fake()->image('proof.jpg');

        $response = $this->actingAs($farmOwner)->post(
            route('farm-owner.lots.submit-selling', $lot),
            [
                'selling_revenue_cents' => 5_000_000,
                'proof_photo' => $photo,
            ]
        );

        $response->assertRedirect(route('farm-owner.lots.show', $lot));

        $lot->refresh();
        $this->assertEquals(LotStatus::Selling, $lot->status);
        $this->assertEquals(5_000_000, $lot->selling_revenue_cents);
        Queue::assertPushed(DistributeLotProfits::class);
    }

    public function test_submit_selling_requires_revenue_and_proof_photo(): void
    {
        $farmOwner = User::factory()->farmOwner()->create();
        $lot = $this->makeLotForOwner($farmOwner, 'harvest');

        $response = $this->actingAs($farmOwner)->post(
            route('farm-owner.lots.submit-selling', $lot),
            []
        );

        $response->assertSessionHasErrors(['selling_revenue_cents', 'proof_photo']);
    }

    public function test_farm_owner_cannot_submit_selling_on_lot_not_in_harvest_status(): void
    {
        Storage::fake('public');
        $farmOwner = User::factory()->farmOwner()->create();
        $lot = $this->makeLotForOwner($farmOwner, 'in_progress');
        $photo = UploadedFile::fake()->image('proof.jpg');

        $response = $this->actingAs($farmOwner)->post(
            route('farm-owner.lots.submit-selling', $lot),
            [
                'selling_revenue_cents' => 5_000_000,
                'proof_photo' => $photo,
            ]
        );

        $response->assertStatus(500); // InvalidLotTransitionException
    }

    public function test_farm_owner_cannot_submit_selling_on_another_owners_lot(): void
    {
        Storage::fake('public');
        $farmOwner1 = User::factory()->farmOwner()->create();
        $farmOwner2 = User::factory()->farmOwner()->create();
        $lot = $this->makeLotForOwner($farmOwner1, 'harvest');
        $photo = UploadedFile::fake()->image('proof.jpg');

        $response = $this->actingAs($farmOwner2)->post(
            route('farm-owner.lots.submit-selling', $lot),
            [
                'selling_revenue_cents' => 5_000_000,
                'proof_photo' => $photo,
            ]
        );

        $response->assertStatus(403);
    }

    public function test_proof_photo_is_stored_on_submit_selling(): void
    {
        Storage::fake('public');
        Queue::fake();

        $farmOwner = User::factory()->farmOwner()->create();
        $lot = $this->makeLotForOwner($farmOwner, 'harvest');
        $photo = UploadedFile::fake()->image('revenue-proof.jpg');

        $this->actingAs($farmOwner)->post(
            route('farm-owner.lots.submit-selling', $lot),
            [
                'selling_revenue_cents' => 3_000_000,
                'proof_photo' => $photo,
            ]
        );

        $lot->refresh();
        $this->assertNotNull($lot->selling_proof_photo);
        Storage::disk('public')->assertExists($lot->selling_proof_photo);
    }
}
