<?php

namespace App\Exceptions;

use Exception;

class InvestmentCycleClosedException extends Exception
{
    public function __construct(string $message = 'Investment window for this lot has closed.')
    {
        parent::__construct($message);
    }
}
