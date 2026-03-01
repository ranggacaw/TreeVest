<?php

namespace App\Notifications;

use App\Enums\NotificationType;

/**
 * Notification sent when an investment payment is confirmed and investment becomes active.
 */
class InvestmentConfirmedNotification extends BaseNotification
{
    protected function getNotificationType(): NotificationType
    {
        return NotificationType::Investment;
    }

    protected function getDefaultSubject(): string
    {
        return 'Investment Confirmed Successfully';
    }

    protected function getDefaultBody(): string
    {
        $treeName = $this->data['tree_identifier'] ?? 'Tree';
        $amount = $this->data['formatted_amount'] ?? '';

        return "Great news! Your investment of {$amount} in {$treeName} has been confirmed. You can now track your investment in your portfolio.";
    }

    protected function getIcon(): string
    {
        return '✅';
    }

    protected function getActionUrl(): ?string
    {
        return $this->data['investment_url'] ?? route('investments.index');
    }
}
