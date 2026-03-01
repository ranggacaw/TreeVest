<?php

namespace App\Notifications;

use App\Enums\NotificationType;
use App\Models\User;

class HarvestNotification extends BaseNotification
{
    protected function getNotificationType(): NotificationType
    {
        return NotificationType::Harvest;
    }

    protected function getDefaultSubject(): string
    {
        return 'Harvest Update';
    }

    protected function getDefaultBody(): string
    {
        $treeName = $this->data['tree_name'] ?? 'your investment';
        $status = $this->data['status'] ?? 'has been updated';

        return "Harvest for {$treeName} {$status}";
    }

    protected function getIcon(): string
    {
        return '🌾';
    }

    protected function getActionUrl(): ?string
    {
        return $this->data['harvest_url'] ?? null;
    }
}
