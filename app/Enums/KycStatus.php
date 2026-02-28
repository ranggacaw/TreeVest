<?php

namespace App\Enums;

enum KycStatus: string
{
    case PENDING = 'pending';
    case SUBMITTED = 'submitted';
    case VERIFIED = 'verified';
    case REJECTED = 'rejected';
}
