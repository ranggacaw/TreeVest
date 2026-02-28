<?php

namespace App\Enums;

enum FarmStatus: string
{
    case PENDING_APPROVAL = 'pending_approval';
    case ACTIVE = 'active';
    case SUSPENDED = 'suspended';
    case DEACTIVATED = 'deactivated';

    public function canTransitionTo(self $newStatus): bool
    {
        return match ($this) {
            self::PENDING_APPROVAL => in_array($newStatus, [self::ACTIVE, self::DEACTIVATED]),
            self::ACTIVE => in_array($newStatus, [self::PENDING_APPROVAL, self::SUSPENDED]),
            self::SUSPENDED => in_array($newStatus, [self::ACTIVE, self::DEACTIVATED]),
            self::DEACTIVATED => false,
        };
    }

    public function getLabelAttribute(): string
    {
        return match ($this) {
            self::PENDING_APPROVAL => 'Pending Approval',
            self::ACTIVE => 'Active',
            self::SUSPENDED => 'Suspended',
            self::DEACTIVATED => 'Deactivated',
        };
    }
}
