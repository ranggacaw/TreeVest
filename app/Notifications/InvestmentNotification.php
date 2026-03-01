<?php

namespace App\Notifications;

use App\Enums\NotificationType;
use App\Models\User;

class InvestmentNotification extends BaseNotification
{
    protected function getNotificationType(): NotificationType
    {
        return NotificationType::Investment;
    }

    protected function getDefaultSubject(): string
    {
        return 'Investment Opportunity';
    }

    protected function getDefaultBody(): string
    {
        $treeName = $this->data['tree_name'] ?? 'a new opportunity';
        return "A new investment opportunity is available: {$treeName}";
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
