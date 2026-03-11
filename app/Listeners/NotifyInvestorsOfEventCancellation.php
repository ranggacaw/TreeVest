<?php

namespace App\Listeners;

use App\Enums\AgrotourismRegistrationStatus;
use App\Events\AgrotourismEventCancelled;
use Illuminate\Contracts\Queue\ShouldQueue;

class NotifyInvestorsOfEventCancellation implements ShouldQueue
{
    public function handle(AgrotourismEventCancelled $event): void
    {
        $agrotourismEvent = $event->event;

        $agrotourismEvent->registrations()
            ->whereNotIn('status', [AgrotourismRegistrationStatus::Cancelled->value])
            ->with('investor')
            ->get()
            ->each(function ($registration) use ($agrotourismEvent): void {
                $registration->investor->notify(
                    new \App\Notifications\AgrotourismEventCancelledNotification($agrotourismEvent)
                );
            });
    }
}
