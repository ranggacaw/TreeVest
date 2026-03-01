<?php

namespace App\Notifications;

use App\Enums\NotificationChannel;
use App\Enums\NotificationDeliveryStatus;
use App\Enums\NotificationType;
use App\Models\NotificationDeliveryLog;
use App\Models\NotificationPreference;
use App\Models\NotificationTemplate;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

abstract class BaseNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected string $notificationType;

    protected array $data;

    protected ?NotificationTemplate $template = null;

    public function __construct(array $data = [])
    {
        $this->data = $data;
        $this->notificationType = $this->getNotificationType()->value;
    }

    abstract protected function getNotificationType(): NotificationType;

    protected function getDefaultSubject(): string
    {
        return match ($this->notificationType) {
            'investment' => 'Investment Update',
            'harvest' => 'Harvest Update',
            'payment' => 'Payment Update',
            'market' => 'Market Alert',
            'system' => 'System Notification',
            default => 'Notification',
        };
    }

    protected function getDefaultBody(): string
    {
        return 'You have a new notification.';
    }

    protected function getIcon(): string
    {
        return match ($this->notificationType) {
            'investment' => '🌳',
            'harvest' => '🌾',
            'payment' => '💳',
            'market' => '📈',
            'system' => '🔔',
            default => '📢',
        };
    }

    protected function getActionUrl(): ?string
    {
        return null;
    }

    public function via(User $notifiable): array
    {
        $channels = [];

        foreach (NotificationChannel::cases() as $channel) {
            $preference = NotificationPreference::where('user_id', $notifiable->id)
                ->forType($this->notificationType)
                ->forChannel($channel)
                ->enabled()
                ->first();

            if ($preference) {
                $channels[] = $channel->value;
            }
        }

        return $channels;
    }

    public function toMail(User $notifiable): MailMessage
    {
        $template = $this->getTemplate(NotificationChannel::Email);
        $subject = $template ? $template->renderSubject($this->getData()) : $this->getDefaultSubject();
        $body = $template ? $template->renderBody($this->getData()) : $this->getDefaultBody();

        $message = (new MailMessage)
            ->subject($subject)
            ->greeting('Hello '.$notifiable->name)
            ->line($body);

        if ($url = $this->getActionUrl()) {
            $message->action('View Details', $url);
        }

        return $message;
    }

    public function toDatabase(User $notifiable): array
    {
        return [
            'type' => $this->notificationType,
            'title' => $this->getDefaultSubject(),
            'message' => $this->getDefaultBody(),
            'icon' => $this->getIcon(),
            'action_url' => $this->getActionUrl(),
            'data' => $this->getData(),
        ];
    }

    public function toBroadcast(User $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'type' => $this->notificationType,
            'title' => $this->getDefaultSubject(),
            'message' => $this->getDefaultBody(),
            'icon' => $this->getIcon(),
            'action_url' => $this->getActionUrl(),
        ]);
    }

    public function toSms(User $notifiable): string
    {
        $template = $this->getTemplate(NotificationChannel::Sms);
        $body = $template ? $template->renderBody($this->getData()) : $this->getDefaultBody();

        return $body;
    }

    protected function getTemplate(NotificationChannel $channel): ?NotificationTemplate
    {
        if (! $this->template) {
            $this->template = NotificationTemplate::active()
                ->forType($this->notificationType)
                ->forChannel($channel)
                ->first();
        }

        return $this->template;
    }

    protected function getData(): array
    {
        return array_merge($this->data, [
            'notificationType' => $this->notificationType,
        ]);
    }

    protected function logDelivery(User $notifiable, NotificationChannel $channel, NotificationDeliveryStatus $status, ?string $errorMessage = null, ?string $providerId = null): void
    {
        NotificationDeliveryLog::create([
            'notification_id' => $this->id,
            'user_id' => $notifiable->id,
            'channel' => $channel->value,
            'status' => $status->value,
            'provider_id' => $providerId,
            'error_message' => $errorMessage,
            'sent_at' => $status === NotificationDeliveryStatus::Sent ? now() : null,
            'failed_at' => $status === NotificationDeliveryStatus::Failed ? now() : null,
        ]);
    }
}
