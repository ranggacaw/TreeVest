<?php

namespace App\Services;

use App\Enums\AgrotourismRegistrationStatus;
use App\Events\AgrotourismEventCancelled;
use App\Events\AgrotourismRegistrationConfirmed;
use App\Models\AgrotourismEvent;
use App\Models\AgrotourismRegistration;
use App\Models\Farm;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AgrotourismService
{
    /**
     * Create a new agrotourism event for a farm.
     */
    public function createEvent(Farm $farm, array $data): AgrotourismEvent
    {
        return AgrotourismEvent::create(array_merge($data, [
            'farm_id' => $farm->id,
        ]));
    }

    /**
     * Update an existing agrotourism event.
     */
    public function updateEvent(AgrotourismEvent $event, array $data): AgrotourismEvent
    {
        $event->update($data);

        return $event->fresh();
    }

    /**
     * Cancel an agrotourism event and notify registered investors.
     */
    public function cancelEvent(AgrotourismEvent $event): AgrotourismEvent
    {
        if ($event->isCancelled()) {
            throw new \InvalidArgumentException('Event is already cancelled.');
        }

        $event->update(['cancelled_at' => now()]);

        event(new AgrotourismEventCancelled($event->fresh()));

        return $event->fresh();
    }

    /**
     * Register an investor for an agrotourism event.
     *
     * Capacity is enforced with a pessimistic lock to prevent over-registration
     * under concurrent requests.
     */
    public function registerInvestor(AgrotourismEvent $event, User $investor, string $type): AgrotourismRegistration
    {
        return DB::transaction(function () use ($event, $investor, $type) {
            // Re-fetch with lock to serialise concurrent registrations
            $lockedEvent = AgrotourismEvent::lockForUpdate()->findOrFail($event->id);

            if ($lockedEvent->isCancelled()) {
                throw ValidationException::withMessages([
                    'event' => [__('This event has been cancelled.')],
                ]);
            }

            if (! $lockedEvent->is_registration_open) {
                throw ValidationException::withMessages([
                    'event' => [__('Registrations for this event are closed.')],
                ]);
            }

            if ($lockedEvent->isFull()) {
                throw ValidationException::withMessages([
                    'event' => [__('This event has reached its maximum capacity.')],
                ]);
            }

            // Guard against duplicate registrations
            $existing = AgrotourismRegistration::where('event_id', $lockedEvent->id)
                ->where('user_id', $investor->id)
                ->whereNotIn('status', [AgrotourismRegistrationStatus::Cancelled->value])
                ->first();

            if ($existing) {
                throw ValidationException::withMessages([
                    'event' => [__('You are already registered for this event.')],
                ]);
            }

            $registration = AgrotourismRegistration::create([
                'event_id' => $lockedEvent->id,
                'user_id' => $investor->id,
                'registration_type' => $type,
                'status' => AgrotourismRegistrationStatus::Confirmed,
                'confirmed_at' => now(),
            ]);

            event(new AgrotourismRegistrationConfirmed($registration));

            return $registration;
        });
    }

    /**
     * Cancel a specific registration.
     */
    public function cancelRegistration(AgrotourismRegistration $registration): AgrotourismRegistration
    {
        if ($registration->status === AgrotourismRegistrationStatus::Cancelled) {
            throw new \InvalidArgumentException('Registration is already cancelled.');
        }

        $registration->update([
            'status' => AgrotourismRegistrationStatus::Cancelled,
            'cancelled_at' => now(),
        ]);

        return $registration->fresh();
    }

    /**
     * Close registrations for an event (no new sign-ups allowed).
     */
    public function closeRegistrations(AgrotourismEvent $event): AgrotourismEvent
    {
        $event->update(['is_registration_open' => false]);

        return $event->fresh();
    }
}
