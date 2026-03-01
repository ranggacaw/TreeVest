<?php

namespace Tests\Unit;

use App\Enums\TransactionStatus;
use PHPUnit\Framework\TestCase;

class TransactionStatusTest extends TestCase
{
    public function test_all_enum_cases_have_values()
    {
        $expectedCases = [
            'pending',
            'processing',
            'completed',
            'failed',
            'cancelled',
        ];

        $actualValues = array_map(fn ($case) => $case->value, TransactionStatus::cases());

        foreach ($expectedCases as $expected) {
            $this->assertContains($expected, $actualValues);
        }
    }

    public function test_get_label_returns_correct_labels()
    {
        $this->assertEquals('Pending', TransactionStatus::Pending->getLabel());
        $this->assertEquals('Processing', TransactionStatus::Processing->getLabel());
        $this->assertEquals('Completed', TransactionStatus::Completed->getLabel());
        $this->assertEquals('Failed', TransactionStatus::Failed->getLabel());
        $this->assertEquals('Cancelled', TransactionStatus::Cancelled->getLabel());
    }

    public function test_is_final_returns_true_for_final_statuses()
    {
        $this->assertTrue(TransactionStatus::Completed->isFinal());
        $this->assertTrue(TransactionStatus::Failed->isFinal());
        $this->assertTrue(TransactionStatus::Cancelled->isFinal());
    }

    public function test_is_final_returns_false_for_non_final_statuses()
    {
        $this->assertFalse(TransactionStatus::Pending->isFinal());
        $this->assertFalse(TransactionStatus::Processing->isFinal());
    }
}
