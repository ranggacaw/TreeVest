<?php

namespace Tests\Unit;

use App\Enums\TransactionType;
use PHPUnit\Framework\TestCase;

class TransactionTypeTest extends TestCase
{
    public function test_all_enum_cases_have_values()
    {
        $expectedCases = [
            'investment_purchase',
            'payout',
            'refund',
            'top_up',
            'withdrawal',
        ];

        foreach ($expectedCases as $expected) {
            $this->assertArrayHasKey($expected, array_column(TransactionType::cases(), 'value'));
        }
    }

    public function test_get_label_returns_correct_labels()
    {
        $this->assertEquals('Investment Purchase', TransactionType::InvestmentPurchase->getLabel());
        $this->assertEquals('Payout', TransactionType::Payout->getLabel());
        $this->assertEquals('Refund', TransactionType::Refund->getLabel());
        $this->assertEquals('Top Up', TransactionType::TopUp->getLabel());
        $this->assertEquals('Withdrawal', TransactionType::Withdrawal->getLabel());
    }

    public function test_enum_is_backed_by_string()
    {
        $this->assertIsString(TransactionType::InvestmentPurchase->value);
        $this->assertEquals('investment_purchase', TransactionType::InvestmentPurchase->value);
    }
}
