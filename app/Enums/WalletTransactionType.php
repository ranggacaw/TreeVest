<?php

namespace App\Enums;

enum WalletTransactionType: string
{
    case PayoutCredit = 'payout_credit';
    case Reinvestment = 'reinvestment';
    case Withdrawal = 'withdrawal';
    case PlatformFee = 'platform_fee';
    case TopUp = 'top_up';

    public function getLabel(): string
    {
        return match ($this) {
            self::PayoutCredit => 'Payout Credit',
            self::Reinvestment => 'Reinvestment',
            self::Withdrawal => 'Withdrawal',
            self::PlatformFee => 'Platform Fee',
            self::TopUp => 'Top Up',
        };
    }

    public function isCredit(): bool
    {
        return in_array($this, [self::PayoutCredit, self::TopUp]);
    }

    public function isDebit(): bool
    {
        return in_array($this, [self::Reinvestment, self::Withdrawal]);
    }
}
