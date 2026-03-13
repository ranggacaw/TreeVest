<?php

namespace App\Enums;

enum LotStatus: string
{
    case Active = 'active';
    case InProgress = 'in_progress';
    case Harvest = 'harvest';
    case Selling = 'selling';
    case Completed = 'completed';
    case Cancelled = 'cancelled';

    public function getLabel(): string
    {
        return match ($this) {
            self::Active => 'Active',
            self::InProgress => 'In Progress',
            self::Harvest => 'Harvest',
            self::Selling => 'Selling',
            self::Completed => 'Completed',
            self::Cancelled => 'Cancelled',
        };
    }

    public function canTransitionTo(LotStatus $newStatus): bool
    {
        return match ($this) {
            self::Active => in_array($newStatus, [self::InProgress, self::Cancelled]),
            self::InProgress => $newStatus === self::Harvest,
            self::Harvest => $newStatus === self::Selling,
            self::Selling => $newStatus === self::Completed,
            self::Completed, self::Cancelled => false,
        };
    }

    public function isInvestable(): bool
    {
        return $this === self::Active;
    }

    public function isFinalized(): bool
    {
        return in_array($this, [self::Completed, self::Cancelled]);
    }

    public function requiresAction(): bool
    {
        return in_array($this, [self::Harvest, self::Selling]);
    }
}
