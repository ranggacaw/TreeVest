<?php

namespace App\Enums;

enum HealthAlertType: string
{
    case WEATHER = 'weather';
    case PEST = 'pest';
    case DISEASE = 'disease';
    case MANUAL = 'manual';
}
