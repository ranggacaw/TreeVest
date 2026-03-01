<?php

namespace App\Exceptions;

use Exception;

class InvestmentLimitExceededException extends Exception
{
    public function __construct(int $requestedAmount, int $maxAmount)
    {
        $requested = number_format($requestedAmount / 100, 2);
        $max = number_format($maxAmount / 100, 2);
        parent::__construct("Investment amount of {$requested} exceeds maximum allowed: {$max}");
    }
}
