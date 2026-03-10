<?php

namespace App\Notifications;

use App\Models\AgrotourismEvent;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AgrotourismEventCancelledNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly AgrotourismEvent $event
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject(__('Agrotourism event cancelled'))
            ->greeting(__('Hello :name!', ['name' => $notifiable->name]))
            ->line(__('We regret to inform you that the agrotourism event ":title" has been cancelled.', [
                'title' => $this->event->title,
            ]))
            ->line(__('Event Date: :date', ['date' => $this->event->event_date->format('d M Y, H:i')]))
            ->line(__('Your registration has been automatically cancelled. We apologise for any inconvenience.'))
            ->action(__('Browse Other Events'), url('/investor/agrotourism'))
            ->line(__('Thank you for your understanding.'));
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type'        => 'agrotourism_event_cancelled',
            'event_id'    => $this->event->id,
            'event_title' => $this->event->title,
            'event_date'  => $this->event->event_date->toIso8601String(),
        ];
    }
}
