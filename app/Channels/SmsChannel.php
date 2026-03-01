<?php

namespace App\Channels;

use App\Enums\NotificationChannel;
use App\Enums\NotificationDeliveryStatus;
use App\Models\NotificationDeliveryLog;
use Illuminate\Notifications\Notification;

class SmsChannel
{
    public function send($notifiable, Notification $notification): void
    {
        if (! method_exists($notification, 'toSms')) {
            return;
        }

        $message = $notification->toSms($notifiable);
        $to = $notifiable->phone;

        try {
            $twilio = new \Twilio\Rest\Client(config('services.twilio.sid'), config('services.twilio.token'));
            $result = $twilio->messages->create($to, [
                'from' => config('services.twilio.from'),
                'body' => $message,
            ]);

            NotificationDeliveryLog::create([
                'notification_id' => $notification->id,
                'user_id' => $notifiable->id,
                'channel' => NotificationChannel::Sms->value,
                'status' => NotificationDeliveryStatus::Sent->value,
                'provider_id' => $result->sid,
                'sent_at' => now(),
            ]);
        } catch (\Exception $e) {
            NotificationDeliveryLog::create([
                'notification_id' => $notification->id,
                'user_id' => $notifiable->id,
                'channel' => NotificationChannel::Sms->value,
                'status' => NotificationDeliveryStatus::Failed->value,
                'error_message' => $e->getMessage(),
                'failed_at' => now(),
            ]);
        }
    }
}
