<?php

namespace App\Notifications;

use App\Models\AgrotourismRegistration;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AgrotourismRegistrationConfirmedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly AgrotourismRegistration $registration
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $event = $this->registration->event;

        return (new MailMessage)
            ->subject(__('Your registration has been confirmed'))
            ->greeting(__('Hello :name!', ['name' => $notifiable->name]))
            ->line(__('Your registration for the agrotourism event ":title" has been confirmed.', [
                'title' => $event->title,
            ]))
            ->line(__('Event Date: :date', ['date' => $event->event_date->format('d M Y, H:i')]))
            ->line(__('Registration Type: :type', ['type' => ucfirst($this->registration->registration_type->value)]))
            ->action(__('View Event'), url('/investor/agrotourism'))
            ->line(__('Thank you for your interest in Treevest agrotourism events!'));
    }

    public function toArray(object $notifiable): array
    {
        $event = $this->registration->event;

        return [
            'type'            => 'agrotourism_registration_confirmed',
            'registration_id' => $this->registration->id,
            'event_id'        => $event->id,
            'event_title'     => $event->title,
            'event_date'      => $event->event_date->toIso8601String(),
        ];
    }
}
