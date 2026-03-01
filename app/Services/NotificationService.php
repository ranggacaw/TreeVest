<?php

namespace App\Services;

use App\Enums\NotificationChannel;
use App\Enums\NotificationType;
use App\Models\User;
use App\Notifications\HarvestNotification;
use App\Notifications\InvestmentNotification;
use App\Notifications\MarketAlertNotification;
use App\Notifications\PaymentNotification;
use App\Notifications\SystemNotification;
use Illuminate\Support\Facades\Notification;

class NotificationService
{
    public function send(User $user, NotificationType|string $type, array $data = [], ?array $channels = null): void
    {
        if (is_string($type)) {
            $type = NotificationType::from($type);
        }

        $notification = $this->createNotification($type, $data);

        Notification::send($user, $notification);
    }

    public function sendToMultiple(array $users, NotificationType|string $type, array $data = [], ?array $channels = null): void
    {
        if (is_string($type)) {
            $type = NotificationType::from($type);
        }

        $notification = $this->createNotification($type, $data);

        Notification::send($users, $notification);
    }

    protected function createNotification(NotificationType $type, array $data)
    {
        return match ($type) {
            NotificationType::Investment => new InvestmentNotification($data),
            NotificationType::Harvest => new HarvestNotification($data),
            NotificationType::Payment => new PaymentNotification($data),
            NotificationType::Market => new MarketAlertNotification($data),
            NotificationType::System => new SystemNotification($data),
        };
    }

    public function sendInvestmentNotification(User $user, array $data): void
    {
        $this->send($user, NotificationType::Investment, $data);
    }

    public function sendHarvestNotification(User $user, array $data): void
    {
        $this->send($user, NotificationType::Harvest, $data);
    }

    public function sendPaymentNotification(User $user, array $data): void
    {
        $this->send($user, NotificationType::Payment, $data);
    }

    public function sendMarketAlert(User $user, array $data): void
    {
        $this->send($user, NotificationType::Market, $data);
    }

    public function sendSystemNotification(User $user, array $data): void
    {
        $this->send($user, NotificationType::System, $data);
    }

    public function hasEnabledChannel(User $user, NotificationType|string $type, NotificationChannel|string $channel): bool
    {
        if (is_string($type)) {
            $type = NotificationType::from($type);
        }

        if (is_string($channel)) {
            $channel = NotificationChannel::from($channel);
        }

        return $user->notificationPreferences()
            ->forType($type)
            ->forChannel($channel)
            ->enabled()
            ->exists();
    }

    public function markAsRead(User $user, ?int $notificationId = null): void
    {
        if ($notificationId) {
            $user->notifications()
                ->where('id', $notificationId)
                ->update(['read_at' => now()]);
        } else {
            $user->unreadNotifications->markAsRead();
        }
    }

    public function deleteNotification(User $user, int $notificationId): void
    {
        $user->notifications()
            ->where('id', $notificationId)
            ->delete();
    }

    public function getUnreadCount(User $user): int
    {
        return $user->unreadNotifications()->count();
    }
}
