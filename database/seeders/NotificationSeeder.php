<?php

namespace Database\Seeders;

use App\Enums\NotificationChannel;
use App\Enums\NotificationDeliveryStatus;
use App\Enums\NotificationType;
use App\Models\NotificationDeliveryLog;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class NotificationSeeder extends Seeder
{
    public function run(): void
    {
        // Guard: skip if notifications already exist
        if (DB::table('notifications')->count() > 0) {
            $this->command->info('NotificationSeeder: data already exists, skipping.');
            return;
        }

        $users = User::all();

        foreach ($users as $user) {
            $numNotifications = rand(10, 30);

            for ($i = 0; $i < $numNotifications; $i++) {
                $type = $this->getRandomNotificationType();
                $createdAt = now()->subDays(rand(1, 180));
                $readAt = rand(0, 100) > 40 ? $createdAt->copy()->addHours(rand(1, 72)) : null;

                $notificationId = (string) Str::uuid();

                DB::table('notifications')->insert([
                    'id' => $notificationId,
                    'type' => 'App\\Notifications\\' . $this->getNotificationClass($type),
                    'notifiable_type' => User::class,
                    'notifiable_id' => $user->id,
                    'data' => json_encode([
                        'message' => $this->getNotificationMessage($type),
                        'notification_type' => $type->value,
                    ]),
                    'read_at' => $readAt,
                    'created_at' => $createdAt,
                    'updated_at' => $createdAt,
                ]);

                // Delivery log
                $channels = $this->getChannelsForNotification($type);
                foreach ($channels as $channel) {
                    $status = $this->getRandomDeliveryStatus();
                    NotificationDeliveryLog::create([
                        'notification_id' => $notificationId,
                        'user_id' => $user->id,
                        'channel' => $channel,
                        'status' => $status,
                        'provider_id' => 'msg_' . fake()->unique()->lexify('???????????????'),
                        'error_message' => $status === NotificationDeliveryStatus::Failed ? $this->getDeliveryError() : null,
                        'sent_at' => $createdAt->copy()->addMinutes(rand(1, 5)),
                        'delivered_at' => $status === NotificationDeliveryStatus::Delivered ? $createdAt->copy()->addMinutes(rand(5, 10)) : null,
                        'failed_at' => $status === NotificationDeliveryStatus::Failed ? $createdAt->copy()->addMinutes(rand(2, 5)) : null,
                    ]);
                }
            }
        }

        $this->command->info('Notifications seeded successfully!');
    }

    private function getRandomNotificationType(): NotificationType
    {
        $types = [
            ['type' => NotificationType::Investment, 'weight' => 30],
            ['type' => NotificationType::Harvest, 'weight' => 25],
            ['type' => NotificationType::Payment, 'weight' => 20],
            ['type' => NotificationType::Market, 'weight' => 10],
            ['type' => NotificationType::System, 'weight' => 15],
        ];

        $total = array_sum(array_column($types, 'weight'));
        $random = rand(1, $total);
        $current = 0;

        foreach ($types as $item) {
            $current += $item['weight'];
            if ($random <= $current) {
                return $item['type'];
            }
        }

        return NotificationType::System;
    }

    private function getNotificationClass(NotificationType $type): string
    {
        return match ($type) {
            NotificationType::Investment => 'InvestmentNotification',
            NotificationType::Harvest => 'HarvestNotification',
            NotificationType::Payment => 'PaymentNotification',
            NotificationType::Market => 'MarketAlertNotification',
            NotificationType::System => 'SystemNotification',
            default => 'SystemNotification',
        };
    }

    private function getNotificationMessage(NotificationType $type): string
    {
        return match ($type) {
            NotificationType::Investment => 'Your investment in a premium fruit tree has been confirmed. View your portfolio for details.',
            NotificationType::Harvest => "Harvest update: Your tree's harvest has been completed with excellent yield quality.",
            NotificationType::Payment => 'Payment processed successfully. Your account balance has been updated.',
            NotificationType::Market => 'Market alert: Premium fruit prices showing positive trend. Consider new investment opportunities.',
            NotificationType::System => 'System update: New features added to your dashboard. Check out the latest improvements.',
            default => 'You have a new notification.',
        };
    }

    private function getChannelsForNotification(NotificationType $type): array
    {
        $allChannels = [
            NotificationChannel::Email,
            NotificationChannel::Sms,
            NotificationChannel::Database,
        ];

        $numChannels = rand(1, 3);

        return collect($allChannels)->random($numChannels)->toArray();
    }

    private function getRandomDeliveryStatus(): NotificationDeliveryStatus
    {
        $statuses = [
            ['status' => NotificationDeliveryStatus::Sent, 'weight' => 5],
            ['status' => NotificationDeliveryStatus::Delivered, 'weight' => 90],
            ['status' => NotificationDeliveryStatus::Failed, 'weight' => 5],
        ];

        $total = array_sum(array_column($statuses, 'weight'));
        $random = rand(1, $total);
        $current = 0;

        foreach ($statuses as $item) {
            $current += $item['weight'];
            if ($random <= $current) {
                return $item['status'];
            }
        }

        return NotificationDeliveryStatus::Delivered;
    }

    private function getDeliveryError(): string
    {
        $errors = [
            'Provider temporarily unavailable',
            'Invalid recipient address',
            'Rate limit exceeded',
            'Network timeout',
            'Email bounced',
        ];

        return $errors[array_rand($errors)];
    }
}
