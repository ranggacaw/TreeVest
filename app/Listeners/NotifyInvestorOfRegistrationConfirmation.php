<?php

namespace App\Listeners;

use App\Events\AgrotourismRegistrationConfirmed;
use Illuminate\Contracts\Queue\ShouldQueue;

class NotifyInvestorOfRegistrationConfirmation implements ShouldQueue
{
    public function handle(AgrotourismRegistrationConfirmed $event): void
    {
        $registration = $event->registration;
        $investor = $registration->investor;

        $investor->notify(new \App\Notifications\AgrotourismRegistrationConfirmedNotification($registration));
    }
}
