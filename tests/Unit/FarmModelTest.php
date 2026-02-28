<?php

namespace Tests\Unit;

use App\Enums\FarmStatus;
use App\Models\Farm;
use App\Models\FarmCertification;
use App\Models\FarmImage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FarmModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_farm_belongs_to_owner(): void
    {
        $owner = User::factory()->create();
        $farm = Farm::factory()->create(['owner_id' => $owner->id]);

        $this->assertInstanceOf(User::class, $farm->owner);
        $this->assertEquals($owner->id, $farm->owner->id);
    }

    public function test_farm_has_many_images(): void
    {
        $farm = Farm::factory()->create();
        FarmImage::factory()->count(3)->create(['farm_id' => $farm->id]);

        $this->assertCount(3, $farm->images);
    }

    public function test_farm_has_many_certifications(): void
    {
        $farm = Farm::factory()->create();
        FarmCertification::factory()->count(2)->create(['farm_id' => $farm->id]);

        $this->assertCount(2, $farm->certifications);
    }

    public function test_farm_active_scope(): void
    {
        Farm::factory()->create(['status' => FarmStatus::ACTIVE]);
        Farm::factory()->create(['status' => FarmStatus::PENDING_APPROVAL]);
        Farm::factory()->create(['status' => FarmStatus::SUSPENDED]);

        $activeFarms = Farm::active()->get();

        $this->assertCount(1, $activeFarms);
    }

    public function test_farm_pending_approval_scope(): void
    {
        Farm::factory()->create(['status' => FarmStatus::ACTIVE]);
        Farm::factory()->create(['status' => FarmStatus::PENDING_APPROVAL]);

        $pendingFarms = Farm::pendingApproval()->get();

        $this->assertCount(1, $pendingFarms);
    }

    public function test_farm_suspended_scope(): void
    {
        Farm::factory()->create(['status' => FarmStatus::SUSPENDED]);
        Farm::factory()->create(['status' => FarmStatus::ACTIVE]);

        $suspendedFarms = Farm::suspended()->get();

        $this->assertCount(1, $suspendedFarms);
    }

    public function test_farm_for_owner_scope(): void
    {
        $owner1 = User::factory()->create();
        $owner2 = User::factory()->create();

        Farm::factory()->count(3)->create(['owner_id' => $owner1->id]);
        Farm::factory()->count(2)->create(['owner_id' => $owner2->id]);

        $owner1Farms = Farm::forOwner($owner1->id)->get();

        $this->assertCount(3, $owner1Farms);
    }

    public function test_farm_is_active_method(): void
    {
        $activeFarm = Farm::factory()->create(['status' => FarmStatus::ACTIVE]);
        $pendingFarm = Farm::factory()->create(['status' => FarmStatus::PENDING_APPROVAL]);

        $this->assertTrue($activeFarm->isActive());
        $this->assertFalse($pendingFarm->isActive());
    }

    public function test_farm_is_pending_approval_method(): void
    {
        $pendingFarm = Farm::factory()->create(['status' => FarmStatus::PENDING_APPROVAL]);
        $activeFarm = Farm::factory()->create(['status' => FarmStatus::ACTIVE]);

        $this->assertTrue($pendingFarm->isPendingApproval());
        $this->assertFalse($activeFarm->isPendingApproval());
    }

    public function test_farm_is_suspended_method(): void
    {
        $suspendedFarm = Farm::factory()->create(['status' => FarmStatus::SUSPENDED]);
        $activeFarm = Farm::factory()->create(['status' => FarmStatus::ACTIVE]);

        $this->assertTrue($suspendedFarm->isSuspended());
        $this->assertFalse($activeFarm->isSuspended());
    }

    public function test_farm_full_address_attribute(): void
    {
        $farm = Farm::factory()->create([
            'address' => '123 Test St',
            'city' => 'Test City',
            'state' => 'Test State',
            'postal_code' => '12345',
            'country' => 'Malaysia',
        ]);

        $this->assertEquals('123 Test St, Test City, Test State, 12345, Malaysia', $farm->full_address);
    }

    public function test_farm_can_transition_to_valid_status(): void
    {
        $farm = Farm::factory()->create(['status' => FarmStatus::PENDING_APPROVAL]);

        $this->assertTrue($farm->canTransitionTo(FarmStatus::ACTIVE));
        $this->assertTrue($farm->canTransitionTo(FarmStatus::DEACTIVATED));
        $this->assertFalse($farm->canTransitionTo(FarmStatus::SUSPENDED));
    }

    public function test_deactivated_farm_cannot_transition(): void
    {
        $farm = Farm::factory()->create(['status' => FarmStatus::DEACTIVATED]);

        $this->assertFalse($farm->canTransitionTo(FarmStatus::ACTIVE));
        $this->assertFalse($farm->canTransitionTo(FarmStatus::PENDING_APPROVAL));
        $this->assertFalse($farm->canTransitionTo(FarmStatus::SUSPENDED));
    }

    public function test_farm_approve_sets_status_and_timestamp(): void
    {
        $adminId = 1;
        $farm = Farm::factory()->create(['status' => FarmStatus::PENDING_APPROVAL]);

        $farm->approve($adminId);

        $this->assertEquals(FarmStatus::ACTIVE, $farm->fresh()->status);
        $this->assertNotNull($farm->fresh()->approved_at);
        $this->assertEquals($adminId, $farm->fresh()->approved_by);
    }

    public function test_farm_reject_sets_status_and_reason(): void
    {
        $farm = Farm::factory()->create(['status' => FarmStatus::PENDING_APPROVAL]);

        $farm->reject(1, 'Not compliant');

        $this->assertEquals(FarmStatus::DEACTIVATED, $farm->fresh()->status);
        $this->assertEquals('Not compliant', $farm->fresh()->rejection_reason);
    }

    public function test_farm_suspend_sets_status(): void
    {
        $farm = Farm::factory()->create(['status' => FarmStatus::ACTIVE]);

        $farm->suspend();

        $this->assertEquals(FarmStatus::SUSPENDED, $farm->fresh()->status);
    }

    public function test_farm_reinstate_sets_status_to_active(): void
    {
        $farm = Farm::factory()->create(['status' => FarmStatus::SUSPENDED]);

        $farm->reinstate();

        $this->assertEquals(FarmStatus::ACTIVE, $farm->fresh()->status);
    }

    public function test_farm_require_reapproval_sets_pending(): void
    {
        $farm = Farm::factory()->create(['status' => FarmStatus::ACTIVE]);

        $farm->requireReapproval();

        $this->assertEquals(FarmStatus::PENDING_APPROVAL, $farm->fresh()->status);
        $this->assertNull($farm->fresh()->approved_at);
    }

    public function test_farm_require_reapproval_does_nothing_if_not_active(): void
    {
        $farm = Farm::factory()->create(['status' => FarmStatus::PENDING_APPROVAL]);

        $farm->requireReapproval();

        $this->assertEquals(FarmStatus::PENDING_APPROVAL, $farm->fresh()->status);
    }

    public function test_farm_soft_deletes(): void
    {
        $farm = Farm::factory()->create();

        $farm->delete();

        $this->assertSoftDeleted('farms', ['id' => $farm->id]);
    }
}
