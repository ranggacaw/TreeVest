<?php

namespace App\Exceptions;

use Exception;

class InvestmentNotFoundException extends Exception
{
    public function __construct(int $investmentId)
    {
        parent::__construct("Investment #{$investmentId} not found.");
    }
}
