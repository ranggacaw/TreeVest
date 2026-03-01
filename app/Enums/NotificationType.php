<?php

namespace App\Enums;

enum NotificationType: string
{
    case Investment = 'investment';
    case Harvest = 'harvest';
    case Payment = 'payment';
    case Market = 'market';
    case System = 'system';

    public function label(): string
    {
        return match ($this) {
            self::Investment => 'Investment',
            self::Harvest => 'Harvest',
            self::Payment => 'Payment',
            self::Market => 'Market',
            self::System => 'System',
        };
    }
}
