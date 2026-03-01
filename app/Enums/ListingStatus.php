<?php

namespace App\Enums;

enum ListingStatus: string
{
    case Active = 'active';
    case Sold = 'sold';
    case Cancelled = 'cancelled';

    public function getLabel(): string
    {
        return match ($this) {
            self::Active => 'Active',
            self::Sold => 'Sold',
            self::Cancelled => 'Cancelled',
        };
    }

    public function isActive(): bool
    {
        return $this === self::Active;
    }

    public function isSold(): bool
    {
        return $this === self::Sold;
    }

    public function isCancelled(): bool
    {
        return $this === self::Cancelled;
    }

    public function isFinalized(): bool
    {
        return in_array($this, [self::Sold, self::Cancelled]);
    }

    public function canTransitionTo(ListingStatus $newStatus): bool
    {
        return match ($this) {
            self::Active => in_array($newStatus, [self::Sold, self::Cancelled]),
            self::Sold, self::Cancelled => false,
        };
    }
}
