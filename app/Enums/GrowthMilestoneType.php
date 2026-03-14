<?php

namespace App\Enums;

enum GrowthMilestoneType: string
{
    case PLANTING = 'planting';
    case PRUNING = 'pruning';
    case FERTILIZING = 'fertilizing';
    case FLOWERING = 'flowering';
    case FRUITING = 'fruiting';
    case PRE_HARVEST = 'pre_harvest';
    case HARVEST = 'harvest';
    case POST_HARVEST = 'post_harvest';
    case HEALTH_CHECK = 'health_check';
    case MAINTENANCE = 'maintenance';
    case OTHER = 'other';

    public function label(): string
    {
        return match ($this) {
            self::PLANTING => 'Planting',
            self::PRUNING => 'Pruning',
            self::FERTILIZING => 'Fertilizing',
            self::FLOWERING => 'Flowering',
            self::FRUITING => 'Fruiting',
            self::PRE_HARVEST => 'Pre-Harvest',
            self::HARVEST => 'Harvest',
            self::POST_HARVEST => 'Post-Harvest',
            self::HEALTH_CHECK => 'Health Check',
            self::MAINTENANCE => 'Maintenance',
            self::OTHER => 'Other',
        };
    }

    public function icon(): string
    {
        return match ($this) {
            self::PLANTING => '🌱',
            self::PRUNING => '✂️',
            self::FERTILIZING => '🌾',
            self::FLOWERING => '🌸',
            self::FRUITING => '🍎',
            self::PRE_HARVEST => '📋',
            self::HARVEST => '🧺',
            self::POST_HARVEST => '📦',
            self::HEALTH_CHECK => '🔍',
            self::MAINTENANCE => '🔧',
            self::OTHER => '📝',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::PLANTING => 'green',
            self::PRUNING => 'blue',
            self::FERTILIZING => 'yellow',
            self::FLOWERING => 'pink',
            self::FRUITING => 'orange',
            self::PRE_HARVEST => 'purple',
            self::HARVEST => 'red',
            self::POST_HARVEST => 'gray',
            self::HEALTH_CHECK => 'indigo',
            self::MAINTENANCE => 'cyan',
            self::OTHER => 'slate',
        };
    }
}
