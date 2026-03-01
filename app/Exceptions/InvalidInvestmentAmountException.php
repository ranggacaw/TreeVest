<?php

namespace App\Exceptions;

use Exception;

class InvalidInvestmentAmountException extends Exception
{
    public function __construct(int $amount, int $minAmount)
    {
        $amountFormatted = number_format($amount / 100, 2);
        $minFormatted = number_format($minAmount / 100, 2);
        parent::__construct("Investment amount of {$amountFormatted} is below minimum required: {$minFormatted}");
    }
}
