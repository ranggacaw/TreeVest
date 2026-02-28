<?php

namespace App\Notifications;

use App\Models\KycVerification;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class KycExpiryReminderNotification extends Notification
{
    use Queueable;

    public function __construct(
        public KycVerification $verification,
        public int $daysUntilExpiry
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('KYC Verification Expiring Soon')
            ->greeting('Hello '.$notifiable->name)
            ->line('Your KYC verification will expire in '.$this->daysUntilExpiry.' day(s).')
            ->line('To continue investing on Treevest, please re-verify your identity before the expiration date.')
            ->line('Expiration date: '.$this->verification->expires_at->format('F j, Y'))
            ->action('Re-verify Identity', route('kyc.upload'))
            ->line('Thank you for using Treevest!');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'verification_id' => $this->verification->id,
            'expires_at' => $this->verification->expires_at?->toIso8601String(),
            'days_until_expiry' => $this->daysUntilExpiry,
            'message' => 'Your KYC verification expires in '.$this->daysUntilExpiry.' day(s).',
        ];
    }
}
