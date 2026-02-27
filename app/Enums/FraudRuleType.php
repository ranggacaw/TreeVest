<?php

namespace App\Enums;

enum FraudRuleType: string
{
    case RAPID_INVESTMENTS = 'rapid_investments';
    case UNUSUAL_AMOUNT = 'unusual_amount';
    case MULTIPLE_FAILED_AUTH = 'multiple_failed_auth';
}
