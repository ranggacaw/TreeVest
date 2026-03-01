<?php

namespace App\Notifications;

use App\Enums\NotificationType;

/**
 * Notification sent when an investment is cancelled by the user.
 */
class InvestmentCancelledNotification extends BaseNotification
{
    protected function getNotificationType(): NotificationType
    {
        return NotificationType::Investment;
    }

    protected function getDefaultSubject(): string
    {
        return 'Investment Cancelled';
    }

    protected function getDefaultBody(): string
    {
        $treeName = $this->data['tree_identifier'] ?? 'Tree';
        $amount = $this->data['formatted_amount'] ?? '';
        $reason = $this->data['cancellation_reason'] ?? 'User request';

        return "Your investment of {$amount} in {$treeName} has been cancelled. Reason: {$reason}.";
    }

    protected function getIcon(): string
    {
        return '❌';
    }

    protected function getActionUrl(): ?string
    {
        return route('investments.index');
    }
}
