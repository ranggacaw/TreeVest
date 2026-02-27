<?php

namespace App\Enums;

enum AuditEventType: string
{
    case LOGIN = 'login';
    case LOGOUT = 'logout';
    case LOGIN_EMAIL = 'user.login.email';
    case LOGIN_PHONE = 'user.login.phone';
    case LOGIN_OAUTH = 'user.login.oauth';
    case FAILED_LOGIN = 'failed_login';
    case REGISTERED_EMAIL = 'user.registered.email';
    case REGISTERED_PHONE = 'user.registered.phone';
    case REGISTERED_OAUTH = 'user.registered.oauth';
    case PASSWORD_CHANGED = 'user.password.changed';
    case PASSWORD_RESET = 'user.password.reset';
    case EMAIL_CHANGED = 'user.email.changed';
    case PHONE_ADDED = 'user.phone.added';
    case PHONE_CHANGED = 'user.phone.changed';
    case PHONE_VERIFIED = 'user.phone.verified';
    case TWO_FACTOR_ENABLED = 'user.2fa.enabled';
    case TWO_FACTOR_DISABLED = 'user.2fa.disabled';
    case TWO_FACTOR_RECOVERY_CODE_USED = 'user.2fa.recovery_code_used';
    case OAUTH_LINKED = 'user.oauth.linked';
    case OAUTH_UNLINKED = 'user.oauth.unlinked';
    case AVATAR_UPLOADED = 'user.avatar.uploaded';
    case AVATAR_DELETED = 'user.avatar.deleted';
    case SESSION_REVOKED = 'user.session.revoked';
    case ACCOUNT_DEACTIVATED = 'user.account.deactivated';
    case ACCOUNT_DELETION_REQUESTED = 'user.account.deletion_requested';
    case INVESTMENT_PURCHASED = 'investment_purchased';
    case PAYOUT_PROCESSED = 'payout_processed';
    case KYC_SUBMITTED = 'kyc_submitted';
    case ADMIN_ACTION = 'admin_action';
}
