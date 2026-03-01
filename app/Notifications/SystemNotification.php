<?php

namespace App\Notifications;

use App\Enums\NotificationType;

class SystemNotification extends BaseNotification
{
    protected function getNotificationType(): NotificationType
    {
        return NotificationType::System;
    }

    protected function getDefaultSubject(): string
    {
        return $this->data['subject'] ?? 'System Notification';
    }

    protected function getDefaultBody(): string
    {
        return $this->data['message'] ?? 'You have a new system notification.';
    }

    protected function getIcon(): string
    {
        return '🔔';
    }

    protected function getActionUrl(): ?string
    {
        return $this->data['action_url'] ?? null;
    }
}
