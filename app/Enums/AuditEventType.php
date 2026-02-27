<?php

namespace App\Enums;

enum AuditEventType: string
{
    case LOGIN = 'login';
    case LOGOUT = 'logout';
    case INVESTMENT_PURCHASED = 'investment_purchased';
    case PAYOUT_PROCESSED = 'payout_processed';
    case KYC_SUBMITTED = 'kyc_submitted';
    case ADMIN_ACTION = 'admin_action';
    case FAILED_LOGIN = 'failed_login';
}
