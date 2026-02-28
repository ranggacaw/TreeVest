<?php

namespace App\Notifications;

use App\Models\KycVerification;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class KycSubmittedNotification extends Notification
{
    use Queueable;

    public function __construct(
        public KycVerification $verification
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('KYC Verification Submitted')
            ->greeting('Hello '.$notifiable->name)
            ->line('Your KYC verification has been submitted successfully.')
            ->line('Our team will review your documents within 1-3 business days.')
            ->line('You will receive a notification once the review is complete.')
            ->action('View Status', route('kyc.show', $this->verification->id))
            ->line('Thank you for using Treevest!');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'verification_id' => $this->verification->id,
            'status' => $this->verification->status->value,
            'message' => 'Your KYC verification has been submitted and is pending review.',
        ];
    }
}
