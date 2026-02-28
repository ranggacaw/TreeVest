<?php

namespace App\Enums;

enum TreeLifecycleStage: string
{
    case SEEDLING = 'seedling';
    case GROWING = 'growing';
    case PRODUCTIVE = 'productive';
    case DECLINING = 'declining';
    case RETIRED = 'retired';

    public function getLabelAttribute(): string
    {
        return match ($this) {
            self::SEEDLING => 'Seedling',
            self::GROWING => 'Growing',
            self::PRODUCTIVE => 'Productive',
            self::DECLINING => 'Declining',
            self::RETIRED => 'Retired',
        };
    }

    public function canTransitionTo(self $newStatus): bool
    {
        return match ($this) {
            self::SEEDLING => in_array($newStatus, [self::GROWING, self::RETIRED]),
            self::GROWING => in_array($newStatus, [self::PRODUCTIVE, self::DECLINING, self::RETIRED]),
            self::PRODUCTIVE => in_array($newStatus, [self::DECLINING, self::RETIRED]),
            self::DECLINING => in_array($newStatus, [self::RETIRED]),
            self::RETIRED => false,
        };
    }

    public function isInvestable(): bool
    {
        return in_array($this, [self::GROWING, self::PRODUCTIVE]);
    }
}
