<?php

namespace App\Enums;

enum AgrotourismEventType: string
{
    case Online = 'online';
    case Offline = 'offline';
    case Hybrid = 'hybrid';
}
