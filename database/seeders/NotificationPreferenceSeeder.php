<?php

namespace Database\Seeders;

use App\Enums\NotificationChannel;
use App\Enums\NotificationType;
use App\Models\User;
use Illuminate\Database\Seeder;

class NotificationPreferenceSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::all();

        foreach ($users as $user) {
            $this->createDefaultPreferences($user);
        }
    }

    public function createDefaultPreferences(User $user): void
    {
        foreach (NotificationType::cases() as $type) {
            foreach (NotificationChannel::cases() as $channel) {
                $enabled = $this->getDefaultEnabled($type, $channel);

                $user->notificationPreferences()->updateOrCreate(
                    [
                        'notification_type' => $type->value,
                        'channel' => $channel->value,
                    ],
                    [
                        'enabled' => $enabled,
                    ]
                );
            }
        }
    }

    private function getDefaultEnabled(NotificationType $type, NotificationChannel $channel): bool
    {
        if ($channel === NotificationChannel::Push) {
            return false;
        }

        if ($channel === NotificationChannel::Sms) {
            return $type === NotificationType::Payment;
        }

        return true;
    }
}
