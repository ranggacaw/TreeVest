<?php

namespace App\Notifications;

use App\Enums\NotificationType;
use App\Models\User;

class PaymentNotification extends BaseNotification
{
    protected function getNotificationType(): NotificationType
    {
        return NotificationType::Payment;
    }

    protected function getDefaultSubject(): string
    {
        return 'Payment Confirmation';
    }

    protected function getDefaultBody(): string
    {
        $amount = $this->data['amount'] ?? '';
        $type = $this->data['payment_type'] ?? 'payment';

        return "Your {$type} of {$amount} has been processed successfully.";
    }

    protected function getIcon(): string
    {
        return '💳';
    }

    protected function getActionUrl(): ?string
    {
        return $this->data['transaction_url'] ?? null;
    }
}
