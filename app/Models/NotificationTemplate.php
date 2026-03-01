<?php

namespace App\Models;

use App\Enums\NotificationChannel;
use App\Enums\NotificationType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Blade;

class NotificationTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'channel',
        'subject',
        'body',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function scopeForType($query, NotificationType|string $type)
    {
        return $query->where('type', $type instanceof NotificationType ? $type->value : $type);
    }

    public function scopeForChannel($query, NotificationChannel|string $channel)
    {
        return $query->where('channel', $channel instanceof NotificationChannel ? $channel->value : $channel);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function renderSubject(array $data = []): string
    {
        if (! $this->subject) {
            return '';
        }

        return Blade::render($this->subject, $data);
    }

    public function renderBody(array $data = []): string
    {
        return Blade::render($this->body, $data);
    }
}
