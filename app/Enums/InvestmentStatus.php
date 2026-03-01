<?php

namespace App\Enums;

enum InvestmentStatus: string
{
    case PendingPayment = 'pending_payment';
    case Active = 'active';
    case Listed = 'listed';
    case Matured = 'matured';
    case Sold = 'sold';
    case Cancelled = 'cancelled';

    public function getLabel(): string
    {
        return match ($this) {
            self::PendingPayment => 'Pending Payment',
            self::Active => 'Active',
            self::Listed => 'Listed',
            self::Matured => 'Matured',
            self::Sold => 'Sold',
            self::Cancelled => 'Cancelled',
        };
    }

    public function canTransitionTo(InvestmentStatus $newStatus): bool
    {
        return match ($this) {
            self::PendingPayment => in_array($newStatus, [self::Active, self::Cancelled]),
            self::Active => in_array($newStatus, [self::Listed, self::Matured, self::Sold]),
            self::Listed => in_array($newStatus, [self::Active, self::Sold]),
            self::Matured, self::Sold, self::Cancelled => false,
        };
    }

    public function isActive(): bool
    {
        return in_array($this, [self::Active, self::Listed]);
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
