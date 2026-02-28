<?php

namespace App\Enums;

enum RiskRating: string
{
    case LOW = 'low';
    case MEDIUM = 'medium';
    case HIGH = 'high';

    public function getLabelAttribute(): string
    {
        return match ($this) {
            self::LOW => 'Low',
            self::MEDIUM => 'Medium',
            self::HIGH => 'High',
        };
    }

    public function getMultiplier(): float
    {
        return match ($this) {
            self::LOW => 1.0,
            self::MEDIUM => 1.1,
            self::HIGH => 1.2,
        };
    }
}
