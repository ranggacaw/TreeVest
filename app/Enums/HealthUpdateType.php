<?php

namespace App\Enums;

enum HealthUpdateType: string
{
    case ROUTINE = 'routine';
    case PEST = 'pest';
    case DISEASE = 'disease';
    case DAMAGE = 'damage';
    case WEATHER_IMPACT = 'weather_impact';
    case OTHER = 'other';
}
