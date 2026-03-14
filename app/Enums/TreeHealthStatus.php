<?php

namespace App\Enums;

enum TreeHealthStatus: string
{
    case EXCELLENT = 'excellent';
    case GOOD = 'good';
    case FAIR = 'fair';
    case POOR = 'poor';
    case CRITICAL = 'critical';

    public function label(): string
    {
        return match ($this) {
            self::EXCELLENT => 'Excellent',
            self::GOOD => 'Good',
            self::FAIR => 'Fair',
            self::POOR => 'Poor',
            self::CRITICAL => 'Critical',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::EXCELLENT => 'green',
            self::GOOD => 'blue',
            self::FAIR => 'yellow',
            self::POOR => 'orange',
            self::CRITICAL => 'red',
        };
    }

    public function icon(): string
    {
        return match ($this) {
            self::EXCELLENT => '🌟',
            self::GOOD => '✅',
            self::FAIR => '⚠️',
            self::POOR => '🔻',
            self::CRITICAL => '🚨',
        };
    }
}
