<?php

namespace App\Enums;

enum HarvestCycle: string
{
    case ANNUAL = 'annual';
    case BIANNUAL = 'biannual';
    case SEASONAL = 'seasonal';

    public function getLabelAttribute(): string
    {
        return match ($this) {
            self::ANNUAL => 'Annual',
            self::BIANNUAL => 'Biannual',
            self::SEASONAL => 'Seasonal',
        };
    }
}
