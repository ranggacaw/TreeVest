<?php

namespace Database\Seeders;

use App\Enums\NotificationChannel;
use App\Enums\NotificationType;
use App\Models\NotificationTemplate;
use Illuminate\Database\Seeder;

class NotificationTemplateSeeder extends Seeder
{
    public function run(): void
    {
        $templates = $this->getTemplates();

        foreach ($templates as $template) {
            NotificationTemplate::updateOrCreate(
                [
                    'type' => $template['type'],
                    'channel' => $template['channel'],
                ],
                $template
            );
        }
    }

    private function getTemplates(): array
    {
        return [
            // Investment notifications
            [
                'type' => NotificationType::Investment->value,
                'channel' => NotificationChannel::Email->value,
                'subject' => 'New Investment: {{ $tree_name }}',
                'body' => "Hello {{ \$user->name }},\n\nYour investment has been confirmed!\n\n**Tree:** {{ \$tree_name }}\n**Farm:** {{ \$farm_name }}\n**Amount:** {{ \$amount }}\n\nThank you for investing with Treevest!",
                'is_active' => true,
            ],
            [
                'type' => NotificationType::Investment->value,
                'channel' => NotificationChannel::Sms->value,
                'subject' => null,
                'body' => 'Treevest: Your investment of {{ $amount }} in {{ $tree_name }} has been confirmed!',
                'is_active' => true,
            ],
            [
                'type' => NotificationType::Investment->value,
                'channel' => NotificationChannel::Database->value,
                'subject' => null,
                'body' => 'Your investment of {{ $amount }} in {{ $tree_name }} has been confirmed!',
                'is_active' => true,
            ],

            // Harvest notifications
            [
                'type' => NotificationType::Harvest->value,
                'channel' => NotificationChannel::Email->value,
                'subject' => 'Harvest Update: {{ $tree_name }}',
                'body' => "Hello {{ \$user->name }},\n\n**Harvest Update**\n\n**Tree:** {{ \$tree_name }}\n**Status:** {{ \$status }}\n**Yield:** {{ \$yield }}\n\nView details on your dashboard.",
                'is_active' => true,
            ],
            [
                'type' => NotificationType::Harvest->value,
                'channel' => NotificationChannel::Sms->value,
                'subject' => null,
                'body' => 'Treevest: Harvest update for {{ $tree_name }} - {{ $status }}',
                'is_active' => true,
            ],
            [
                'type' => NotificationType::Harvest->value,
                'channel' => NotificationChannel::Database->value,
                'subject' => null,
                'body' => 'Harvest for {{ $tree_name }} has been {{ $status }}',
                'is_active' => true,
            ],

            // Payment notifications
            [
                'type' => NotificationType::Payment->value,
                'channel' => NotificationChannel::Email->value,
                'subject' => 'Payment Confirmed: {{ $amount }}',
                'body' => "Hello {{ \$user->name }},\n\nYour payment has been processed successfully!\n\n**Amount:** {{ \$amount }}\n**Type:** {{ \$payment_type }}\n**Date:** {{ \$date }}\n\nThank you!",
                'is_active' => true,
            ],
            [
                'type' => NotificationType::Payment->value,
                'channel' => NotificationChannel::Sms->value,
                'subject' => null,
                'body' => 'Treevest: Payment of {{ $amount }} confirmed. Thank you!',
                'is_active' => true,
            ],
            [
                'type' => NotificationType::Payment->value,
                'channel' => NotificationChannel::Database->value,
                'subject' => null,
                'body' => 'Payment of {{ $amount }} has been processed',
                'is_active' => true,
            ],

            // Market alerts
            [
                'type' => NotificationType::Market->value,
                'channel' => NotificationChannel::Email->value,
                'subject' => 'Market Alert: {{ $alert }}',
                'body' => "Hello {{ \$user->name }},\n\n**Market Alert**\n\n{{ \$alert }}\n\nView details on your dashboard.",
                'is_active' => true,
            ],
            [
                'type' => NotificationType::Market->value,
                'channel' => NotificationChannel::Sms->value,
                'subject' => null,
                'body' => 'Treevest Market Alert: {{ $alert }}',
                'is_active' => true,
            ],
            [
                'type' => NotificationType::Market->value,
                'channel' => NotificationChannel::Database->value,
                'subject' => null,
                'body' => 'Market alert: {{ $alert }}',
                'is_active' => true,
            ],

            // System notifications
            [
                'type' => NotificationType::System->value,
                'channel' => NotificationChannel::Email->value,
                'subject' => '{{ $subject }}',
                'body' => "Hello {{ \$user->name }},\n\n{{ \$message }}\n\nBest,\nThe Treevest Team",
                'is_active' => true,
            ],
            [
                'type' => NotificationType::System->value,
                'channel' => NotificationChannel::Sms->value,
                'subject' => null,
                'body' => 'Treevest: {{ $message }}',
                'is_active' => true,
            ],
            [
                'type' => NotificationType::System->value,
                'channel' => NotificationChannel::Database->value,
                'subject' => null,
                'body' => '{{ $message }}',
                'is_active' => true,
            ],
        ];
    }
}
