<?php

namespace App\Models;

use App\Enums\NotificationChannel;
use App\Enums\NotificationDeliveryStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NotificationDeliveryLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'notification_id',
        'user_id',
        'channel',
        'status',
        'provider_id',
        'error_message',
        'sent_at',
        'delivered_at',
        'failed_at',
    ];

    protected $casts = [
        'sent_at' => 'datetime',
        'delivered_at' => 'datetime',
        'failed_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeForChannel($query, NotificationChannel|string $channel)
    {
        return $query->where('channel', $channel instanceof NotificationChannel ? $channel->value : $channel);
    }

    public function scopeForStatus($query, NotificationDeliveryStatus|string $status)
    {
        return $query->where('status', $status instanceof NotificationDeliveryStatus ? $status->value : $status);
    }

    public function scopeSuccessful($query)
    {
        return $query->whereIn('status', [
            NotificationDeliveryStatus::Sent->value,
            NotificationDeliveryStatus::Delivered->value,
        ]);
    }

    public function scopeFailed($query)
    {
        return $query->whereIn('status', [
            NotificationDeliveryStatus::Failed->value,
            NotificationDeliveryStatus::Bounced->value,
        ]);
    }

    public function markAsSent(): self
    {
        $this->update([
            'status' => NotificationDeliveryStatus::Sent->value,
            'sent_at' => now(),
        ]);

        return $this;
    }

    public function markAsDelivered(): self
    {
        $this->update([
            'status' => NotificationDeliveryStatus::Delivered->value,
            'delivered_at' => now(),
        ]);

        return $this;
    }

    public function markAsFailed(string $errorMessage): self
    {
        $this->update([
            'status' => NotificationDeliveryStatus::Failed->value,
            'error_message' => $errorMessage,
            'failed_at' => now(),
        ]);

        return $this;
    }
}
