<?php

namespace App\Notifications;

use App\Models\AgrotourismRegistration;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AgrotourismRegistrationRejectedNotification extends Notification implements ShouldQueue
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

        $mail = (new MailMessage)
            ->subject(__('Your agrotourism registration was not accepted'))
            ->greeting(__('Hello :name!', ['name' => $notifiable->name]))
            ->line(__('Unfortunately, your registration for the agrotourism event ":title" has been rejected.', [
                'title' => $event->title,
            ]));

        if ($this->registration->rejection_reason) {
            $mail->line(__('Reason: :reason', ['reason' => $this->registration->rejection_reason]));
        }

        $mail->action(__('Browse Events'), url('/investor/agrotourism'))
             ->line(__('You may register for other upcoming events on our platform.'));

        return $mail;
    }

    public function toArray(object $notifiable): array
    {
        $event = $this->registration->event;

        return [
            'type' => 'agrotourism_registration_rejected',
            'registration_id' => $this->registration->id,
            'event_id' => $event->id,
            'event_title' => $event->title,
            'rejection_reason' => $this->registration->rejection_reason,
        ];
    }
}
