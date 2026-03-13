<?php

namespace Tests\Feature;

use App\Enums\AgrotourismEventType;
use App\Enums\AgrotourismRegistrationStatus;
use App\Models\AgrotourismEvent;
use App\Models\AgrotourismRegistration;
use App\Models\Farm;
use App\Models\User;
use App\Notifications\AgrotourismRegistrationRejectedNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class AgrotourismEnhancementTest extends TestCase
{
    use RefreshDatabase;

    private User $farmOwner;

    private User $investor;

    private Farm $farm;

    private AgrotourismEvent $event;

    protected function setUp(): void
    {
        parent::setUp();

        $this->farmOwner = User::factory()->create(['role' => 'farm_owner']);
        $this->investor  = User::factory()->create(['role' => 'investor']);
        $this->farm      = Farm::factory()->create(['owner_id' => $this->farmOwner->id]);

        $this->event = AgrotourismEvent::create([
            'farm_id'              => $this->farm->id,
            'title'                => 'Farm Open Day',
            'description'          => 'Come visit!',
            'event_date'           => now()->addDays(7),
            'event_type'           => AgrotourismEventType::Offline,
            'max_capacity'         => 10,
            'is_registration_open' => true,
        ]);
    }

    // ------------------------------------------------------------------
    // participants_count in registration
    // ------------------------------------------------------------------

    public function test_registration_stores_participants_count(): void
    {
        $response = $this->actingAs($this->investor)
            ->post(route('investor.agrotourism.register', $this->event), [
                'registration_type'  => 'offline',
                'participants_count' => 3,
            ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('agrotourism_registrations', [
            'event_id'          => $this->event->id,
            'user_id'           => $this->investor->id,
            'participants_count' => 3,
        ]);
    }

    public function test_registration_defaults_to_one_participant_when_omitted(): void
    {
        $response = $this->actingAs($this->investor)
            ->post(route('investor.agrotourism.register', $this->event), [
                'registration_type'  => 'offline',
                'participants_count' => 1,
            ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('agrotourism_registrations', [
            'event_id'          => $this->event->id,
            'user_id'           => $this->investor->id,
            'participants_count' => 1,
        ]);
    }

    public function test_participants_count_must_be_at_least_one(): void
    {
        $response = $this->actingAs($this->investor)
            ->post(route('investor.agrotourism.register', $this->event), [
                'registration_type'  => 'offline',
                'participants_count' => 0,
            ]);

        $response->assertSessionHasErrors('participants_count');
    }

    // ------------------------------------------------------------------
    // Capacity enforced using SUM(participants_count)
    // ------------------------------------------------------------------

    public function test_capacity_is_enforced_using_sum_of_participants(): void
    {
        // max_capacity = 10; fill 8 spots with an existing investor
        $existingInvestor = User::factory()->create(['role' => 'investor']);
        AgrotourismRegistration::create([
            'event_id'          => $this->event->id,
            'user_id'           => $existingInvestor->id,
            'registration_type' => AgrotourismEventType::Offline,
            'participants_count' => 8,
            'status'            => AgrotourismRegistrationStatus::Confirmed,
            'confirmed_at'      => now(),
        ]);

        // New investor tries to register 3 more — total would be 11, exceeds max_capacity=10
        $response = $this->actingAs($this->investor)
            ->post(route('investor.agrotourism.register', $this->event), [
                'registration_type'  => 'offline',
                'participants_count' => 3,
            ]);

        $response->assertSessionHasErrors('event');
    }

    public function test_registration_succeeds_when_remaining_capacity_is_enough(): void
    {
        // max_capacity = 10; fill 7 spots
        $existingInvestor = User::factory()->create(['role' => 'investor']);
        AgrotourismRegistration::create([
            'event_id'          => $this->event->id,
            'user_id'           => $existingInvestor->id,
            'registration_type' => AgrotourismEventType::Offline,
            'participants_count' => 7,
            'status'            => AgrotourismRegistrationStatus::Confirmed,
            'confirmed_at'      => now(),
        ]);

        // New investor registers 3 — total = 10, exactly at capacity
        $response = $this->actingAs($this->investor)
            ->post(route('investor.agrotourism.register', $this->event), [
                'registration_type'  => 'offline',
                'participants_count' => 3,
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('agrotourism_registrations', [
            'event_id' => $this->event->id,
            'user_id'  => $this->investor->id,
        ]);
    }

    // ------------------------------------------------------------------
    // Farm owner approve registration
    // ------------------------------------------------------------------

    public function test_farm_owner_can_approve_registration(): void
    {
        $registration = AgrotourismRegistration::create([
            'event_id'          => $this->event->id,
            'user_id'           => $this->investor->id,
            'registration_type' => AgrotourismEventType::Offline,
            'participants_count' => 1,
            'status'            => AgrotourismRegistrationStatus::Pending,
        ]);

        $response = $this->actingAs($this->farmOwner)
            ->post(route('farm-owner.agrotourism.registrations.approve', [
                'event'        => $this->event,
                'registration' => $registration,
            ]));

        $response->assertRedirect();

        $this->assertDatabaseHas('agrotourism_registrations', [
            'id'     => $registration->id,
            'status' => AgrotourismRegistrationStatus::Confirmed->value,
        ]);
        $this->assertNotNull($registration->fresh()->confirmed_at);
    }

    public function test_non_owner_cannot_approve_registration(): void
    {
        $otherFarmOwner = User::factory()->create(['role' => 'farm_owner']);

        $registration = AgrotourismRegistration::create([
            'event_id'          => $this->event->id,
            'user_id'           => $this->investor->id,
            'registration_type' => AgrotourismEventType::Offline,
            'participants_count' => 1,
            'status'            => AgrotourismRegistrationStatus::Pending,
        ]);

        $response = $this->actingAs($otherFarmOwner)
            ->post(route('farm-owner.agrotourism.registrations.approve', [
                'event'        => $this->event,
                'registration' => $registration,
            ]));

        $response->assertForbidden();
    }

    // ------------------------------------------------------------------
    // Farm owner reject registration + notification
    // ------------------------------------------------------------------

    public function test_farm_owner_can_reject_registration_with_reason(): void
    {
        Notification::fake();

        $registration = AgrotourismRegistration::create([
            'event_id'          => $this->event->id,
            'user_id'           => $this->investor->id,
            'registration_type' => AgrotourismEventType::Offline,
            'participants_count' => 1,
            'status'            => AgrotourismRegistrationStatus::Confirmed,
            'confirmed_at'      => now(),
        ]);

        $response = $this->actingAs($this->farmOwner)
            ->post(route('farm-owner.agrotourism.registrations.reject', [
                'event'        => $this->event,
                'registration' => $registration,
            ]), [
                'rejection_reason' => 'Event fully booked by private group.',
            ]);

        $response->assertRedirect();

        $fresh = $registration->fresh();
        $this->assertSame(AgrotourismRegistrationStatus::Cancelled, $fresh->status);
        $this->assertNotNull($fresh->rejected_at);
        $this->assertSame('Event fully booked by private group.', $fresh->rejection_reason);

        Notification::assertSentTo(
            $this->investor,
            AgrotourismRegistrationRejectedNotification::class
        );
    }

    public function test_farm_owner_can_reject_without_reason(): void
    {
        Notification::fake();

        $registration = AgrotourismRegistration::create([
            'event_id'          => $this->event->id,
            'user_id'           => $this->investor->id,
            'registration_type' => AgrotourismEventType::Offline,
            'participants_count' => 1,
            'status'            => AgrotourismRegistrationStatus::Confirmed,
            'confirmed_at'      => now(),
        ]);

        $response = $this->actingAs($this->farmOwner)
            ->post(route('farm-owner.agrotourism.registrations.reject', [
                'event'        => $this->event,
                'registration' => $registration,
            ]));

        $response->assertRedirect();

        $this->assertSame(AgrotourismRegistrationStatus::Cancelled, $registration->fresh()->status);
        Notification::assertSentTo($this->investor, AgrotourismRegistrationRejectedNotification::class);
    }

    public function test_non_owner_cannot_reject_registration(): void
    {
        $otherFarmOwner = User::factory()->create(['role' => 'farm_owner']);

        $registration = AgrotourismRegistration::create([
            'event_id'          => $this->event->id,
            'user_id'           => $this->investor->id,
            'registration_type' => AgrotourismEventType::Offline,
            'participants_count' => 1,
            'status'            => AgrotourismRegistrationStatus::Confirmed,
            'confirmed_at'      => now(),
        ]);

        $response = $this->actingAs($otherFarmOwner)
            ->post(route('farm-owner.agrotourism.registrations.reject', [
                'event'        => $this->event,
                'registration' => $registration,
            ]));

        $response->assertForbidden();
    }
}
