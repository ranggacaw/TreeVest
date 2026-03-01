<?php

namespace App\Enums;

enum InvestmentStatus: string
{
    case PendingPayment = 'pending_payment';
    case Active = 'active';
    case Matured = 'matured';
    case Sold = 'sold';
    case Cancelled = 'cancelled';

    public function getLabel(): string
    {
        return match ($this) {
            self::PendingPayment => 'Pending Payment',
            self::Active => 'Active',
            self::Matured => 'Matured',
            self::Sold => 'Sold',
            self::Cancelled => 'Cancelled',
        };
    }

    public function canTransitionTo(InvestmentStatus $newStatus): bool
    {
        return match ($this) {
            self::PendingPayment => in_array($newStatus, [self::Active, self::Cancelled]),
            self::Active => in_array($newStatus, [self::Matured, self::Sold]),
            self::Matured, self::Sold, self::Cancelled => false,
        };
    }

    public function isActive(): bool
    {
        return $this === self::Active;
    }

    public function isFinalized(): bool
    {
        return in_array($this, [self::Matured, self::Sold, self::Cancelled]);
    }

    public function isPending(): bool
    {
        return $this === self::PendingPayment;
    }
}
