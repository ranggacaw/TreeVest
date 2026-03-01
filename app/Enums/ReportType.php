<?php

namespace App\Enums;

enum ReportType: string
{
    case ProfitLoss = 'profit_loss';
    case TaxSummary = 'tax_summary';

    public function label(): string
    {
        return match ($this) {
            self::ProfitLoss => 'Profit & Loss',
            self::TaxSummary => 'Tax Summary',
        };
    }
}
