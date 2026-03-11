<?php

namespace Tests\Feature\FarmOwner;

use App\Enums\AgrotourismEventType;
use App\Models\AgrotourismEvent;
use App\Models\Farm;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AgrotourismControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $farmOwner;

    private Farm $farm;

    protected function setUp(): void
    {
        parent::setUp();

        $this->farmOwner = User::factory()->create(['role' => 'farm_owner']);
        $this->farm = Farm::factory()->create(['owner_id' => $this->farmOwner->id]);
    }

    public function test_can_view_agrotourism_index()
    {
        AgrotourismEvent::create([
            'farm_id' => $this->farm->id,
            'title' => 'Test',
            'description' => 'A great description',
            'event_date' => now()->addDays(5),
            'event_type' => AgrotourismEventType::Online,
            'is_registration_open' => true,
        ]);

        $response = $this->actingAs($this->farmOwner)
            ->get(route('farm-owner.agrotourism.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('FarmOwner/Agrotourism/Index'));
    }

    public function test_can_create_event()
    {
        $response = $this->actingAs($this->farmOwner)
            ->post(route('farm-owner.agrotourism.store'), [
                'farm_id' => $this->farm->id,
                'title' => 'Harvest Festival',
                'description' => 'A great festival.',
                'event_date' => now()->addDays(5)->format('Y-m-d H:i:s'),
                'event_type' => 'offline',
                'max_capacity' => 50,
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('agrotourism_events', [
            'farm_id' => $this->farm->id,
            'title' => 'Harvest Festival',
        ]);
    }

    public function test_cannot_create_event_for_others_farm()
    {
        $otherFarm = Farm::factory()->create(); // belongs to another user

        $response = $this->actingAs($this->farmOwner)
            ->post(route('farm-owner.agrotourism.store'), [
                'farm_id' => $otherFarm->id,
                'title' => 'Invalid Event',
                'description' => 'Desc',
                'event_date' => now()->addDays(5)->format('Y-m-d H:i:s'),
                'event_type' => 'online',
            ]);

        $response->assertNotFound();
    }

    public function test_can_update_event()
    {
        $event = AgrotourismEvent::create([
            'farm_id' => $this->farm->id,
            'title' => 'Old Title',
            'description' => 'Old Desc',
            'event_date' => now()->addDays(5),
            'event_type' => AgrotourismEventType::Online,
            'is_registration_open' => true,
        ]);

        $response = $this->actingAs($this->farmOwner)
            ->put(route('farm-owner.agrotourism.update', $event), [
                'title' => 'Updated Title',
                'event_date' => now()->addDays(10)->format('Y-m-d H:i:s'),
            ]);

        $response->assertRedirect();
        $this->assertEquals('Updated Title', $event->fresh()->title);
    }

    public function test_can_cancel_event()
    {
        $event = AgrotourismEvent::create([
            'farm_id' => $this->farm->id,
            'title' => 'Old Title',
            'description' => 'Old Desc',
            'event_date' => now()->addDays(5),
            'event_type' => AgrotourismEventType::Online,
            'is_registration_open' => true,
        ]);

        $response = $this->actingAs($this->farmOwner)
            ->post(route('farm-owner.agrotourism.cancel', $event));

        $response->assertRedirect();
        $this->assertNotNull($event->fresh()->cancelled_at);
    }
}
