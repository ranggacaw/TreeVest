<?php

namespace Tests\Feature\Investor;

use App\Enums\AgrotourismEventType;
use App\Models\AgrotourismEvent;
use App\Models\AgrotourismRegistration;
use App\Models\Farm;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AgrotourismControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $investor;
    private AgrotourismEvent $event;

    protected function setUp(): void
    {
        parent::setUp();

        $this->investor = User::factory()->create(['role' => 'investor']);

        $farmOwner = User::factory()->create(['role' => 'farm_owner']);
        $farm = Farm::factory()->create(['owner_id' => $farmOwner->id]);

        $this->event = AgrotourismEvent::create([
            'farm_id' => $farm->id,
            'title' => 'Open Farm Day',
            'description' => 'Visit us!',
            'event_date' => now()->addDays(5),
            'event_type' => AgrotourismEventType::Offline,
            'max_capacity' => 10,
            'is_registration_open' => true,
        ]);
    }

    public function test_can_view_agrotourism_index()
    {
        $response = $this->actingAs($this->investor)
            ->get(route('investor.agrotourism.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn($page) => $page->component('Investor/Agrotourism/Index'));
    }

    public function test_can_register_for_event()
    {
        $response = $this->actingAs($this->investor)
            ->post(route('investor.agrotourism.register', $this->event), [
                'registration_type' => 'offline',
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('agrotourism_registrations', [
            'event_id' => $this->event->id,
            'user_id' => $this->investor->id,
        ]);
    }

    public function test_cannot_register_twice()
    {
        AgrotourismRegistration::create([
            'event_id' => $this->event->id,
            'user_id' => $this->investor->id,
            'registration_type' => AgrotourismEventType::Offline,
        ]);

        $response = $this->actingAs($this->investor)
            ->post(route('investor.agrotourism.register', $this->event), [
                'registration_type' => 'offline',
            ]);

        $response->assertSessionHasErrors();
    }

    public function test_can_cancel_registration()
    {
        $registration = AgrotourismRegistration::create([
            'event_id' => $this->event->id,
            'user_id' => $this->investor->id,
            'registration_type' => AgrotourismEventType::Offline,
        ]);

        $response = $this->actingAs($this->investor)
            ->delete(route('investor.agrotourism.registrations.cancel', $registration));

        $response->assertRedirect();
        $this->assertNotNull($registration->fresh()->cancelled_at);
    }

    public function test_cannot_cancel_others_registration()
    {
        $otherInvestor = User::factory()->create(['role' => 'investor']);

        $registration = AgrotourismRegistration::create([
            'event_id' => $this->event->id,
            'user_id' => $otherInvestor->id,
            'registration_type' => AgrotourismEventType::Offline,
        ]);

        $response = $this->actingAs($this->investor)
            ->delete(route('investor.agrotourism.registrations.cancel', $registration));

        $response->assertForbidden();
    }
}
