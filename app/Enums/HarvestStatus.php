<?php

namespace App\Enums;

enum HarvestStatus: string
{
    case Scheduled = 'scheduled';
    case InProgress = 'in_progress';
    case Completed = 'completed';
    case Failed = 'failed';

    public function canTransitionTo(self $to): bool
    {
        return match ($this) {
            self::Scheduled => in_array($to, [self::InProgress, self::Failed], true),
            self::InProgress => in_array($to, [self::Completed, self::Failed], true),
            self::Completed, self::Failed => false,
        };
    }

    public function label(): string
    {
        return match ($this) {
            self::Scheduled => 'Scheduled',
            self::InProgress => 'In Progress',
            self::Completed => 'Completed',
            self::Failed => 'Failed',
        };
    }
}
