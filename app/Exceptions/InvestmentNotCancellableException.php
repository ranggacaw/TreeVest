<?php

namespace App\Exceptions;

use Exception;

class InvestmentNotCancellableException extends Exception
{
    public function __construct(int $investmentId)
    {
        parent::__construct("Investment #{$investmentId} cannot be cancelled in its current state.");
    }
}
