<?php

namespace App\Notifications;

use App\Enums\NotificationType;

/**
 * Notification sent when an investment is initially purchased (payment initiated).
 */
class InvestmentPurchasedNotification extends BaseNotification
{
    protected function getNotificationType(): NotificationType
    {
        return NotificationType::Investment;
    }

    protected function getDefaultSubject(): string
    {
        return 'Investment Purchase Initiated';
    }

    protected function getDefaultBody(): string
    {
        $treeName = $this->data['tree_identifier'] ?? 'Tree';
        $amount = $this->data['formatted_amount'] ?? '';

        return "Your investment of {$amount} in {$treeName} has been initiated. Please complete the payment to confirm your investment.";
    }

    protected function getIcon(): string
    {
        return '🌳';
    }

    protected function getActionUrl(): ?string
    {
        return $this->data['investment_url'] ?? null;
    }
}
