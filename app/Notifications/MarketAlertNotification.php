<?php

namespace App\Notifications;

use App\Enums\NotificationType;

class MarketAlertNotification extends BaseNotification
{
    protected function getNotificationType(): NotificationType
    {
        return NotificationType::Market;
    }

    protected function getDefaultSubject(): string
    {
        return 'Market Alert';
    }

    protected function getDefaultBody(): string
    {
        $alert = $this->data['alert'] ?? 'market update';

        return "New market alert: {$alert}";
    }

    protected function getIcon(): string
    {
        return '📈';
    }

    protected function getActionUrl(): ?string
    {
        return $this->data['market_url'] ?? null;
    }
}
