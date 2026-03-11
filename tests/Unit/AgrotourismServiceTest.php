<?php

namespace Tests\Unit;

use App\Enums\AgrotourismEventType;
use App\Enums\AgrotourismRegistrationStatus;
use App\Models\AgrotourismEvent;
use App\Models\Farm;
use App\Models\User;
use App\Services\AgrotourismService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class AgrotourismServiceTest extends TestCase
{
    use RefreshDatabase;

    private AgrotourismService $service;

    private Farm $farm;

    private AgrotourismEvent $event;

    private User $investor;

    private User $farmOwner;

    protected function setUp(): void
    {
        parent::setUp();

        $this->service = app(AgrotourismService::class);

        $this->farmOwner = User::factory()->create(['role' => 'farm_owner']);
        $this->investor = User::factory()->create(['role' => 'investor']);

        $this->farm = Farm::factory()->create(['owner_id' => $this->farmOwner->id]);

        $this->event = AgrotourismEvent::create([
            'farm_id' => $this->farm->id,
            'title' => 'Test Event',
            'description' => 'Test Description',
            'event_date' => now()->addDays(10),
            'event_type' => AgrotourismEventType::Hybrid,
            'max_capacity' => 2,
            'is_registration_open' => true,
        ]);

        Event::fake();
    }

    public function test_can_register_investor()
    {
        $registration = $this->service->registerInvestor($this->event, $this->investor, 'online');

        $this->assertNotNull($registration);
        $this->assertEquals($this->investor->id, $registration->user_id);
        $this->assertEquals(AgrotourismRegistrationStatus::Confirmed, $registration->status);
    }

    public function test_cannot_register_duplicate_investor()
    {
        $this->service->registerInvestor($this->event, $this->investor, 'online');

        $this->expectException(ValidationException::class);

        $this->service->registerInvestor($this->event, $this->investor, 'offline');
    }

    public function test_cannot_register_if_cancelled()
    {
        $this->service->cancelEvent($this->event);

        $this->expectException(ValidationException::class);

        $this->service->registerInvestor($this->event, $this->investor, 'online');
    }

    public function test_cannot_register_if_registrations_closed()
    {
        // Need to set is_registration_open = false;
        $this->event->update(['is_registration_open' => false]);

        $this->expectException(ValidationException::class);

        $this->service->registerInvestor($this->event, $this->investor, 'online');
    }

    public function test_cannot_register_if_capacity_reached()
    {
        // max_capacity is 2
        $investor2 = User::factory()->create(['role' => 'investor']);
        $investor3 = User::factory()->create(['role' => 'investor']);

        $this->service->registerInvestor($this->event, $this->investor, 'online');
        $this->service->registerInvestor($this->event, $investor2, 'online');

        $this->expectException(ValidationException::class);

        $this->service->registerInvestor($this->event, $investor3, 'online');
    }

    public function test_can_cancel_registration()
    {
        $registration = $this->service->registerInvestor($this->event, $this->investor, 'online');

        $this->service->cancelRegistration($registration);

        $this->assertEquals(AgrotourismRegistrationStatus::Cancelled, $registration->fresh()->status);
        $this->assertNotNull($registration->fresh()->cancelled_at);
    }
}
