<?php

namespace App\Enums;

enum TransactionType: string
{
    case InvestmentPurchase = 'investment_purchase';
    case SecondaryPurchase = 'secondary_purchase';
    case Payout = 'payout';
    case Refund = 'refund';
    case TopUp = 'top_up';
    case Withdrawal = 'withdrawal';

    public function getLabel(): string
    {
        return match ($this) {
            self::InvestmentPurchase => 'Investment Purchase',
            self::SecondaryPurchase => 'Secondary Purchase',
            self::Payout => 'Payout',
            self::Refund => 'Refund',
            self::TopUp => 'Top Up',
            self::Withdrawal => 'Withdrawal',
        };
    }
}
