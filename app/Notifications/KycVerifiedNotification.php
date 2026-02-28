<?php

namespace App\Notifications;

use App\Models\KycVerification;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class KycVerifiedNotification extends Notification
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
            ->subject('KYC Verification Approved')
            ->greeting('Congratulations '.$notifiable->name.'!')
            ->line('Your KYC verification has been successfully approved.')
            ->line('You can now start investing in fruit trees on Treevest.')
            ->line('Your verification is valid until '.$this->verification->expires_at->format('F j, Y'))
            ->action('Start Investing', route('dashboard'))
            ->line('Thank you for using Treevest!');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'verification_id' => $this->verification->id,
            'status' => $this->verification->status->value,
            'expires_at' => $this->verification->expires_at?->toIso8601String(),
            'message' => 'Your KYC verification has been approved!',
        ];
    }
}
