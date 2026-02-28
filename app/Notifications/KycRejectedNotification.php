<?php

namespace App\Notifications;

use App\Models\KycVerification;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class KycRejectedNotification extends Notification
{
    use Queueable;

    public function __construct(
        public KycVerification $verification,
        public string $reason
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('KYC Verification Requires Attention')
            ->greeting('Hello '.$notifiable->name)
            ->line('Your KYC verification could not be approved at this time.')
            ->line('Reason: '.$this->reason)
            ->line('Please review the requirements and submit your documents again.')
            ->action('Resubmit Documents', route('kyc.upload'))
            ->line('If you believe this is an error, please contact our support team.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'verification_id' => $this->verification->id,
            'status' => $this->verification->status->value,
            'rejection_reason' => $this->reason,
            'message' => 'Your KYC verification was rejected. Reason: '.$this->reason,
        ];
    }
}
