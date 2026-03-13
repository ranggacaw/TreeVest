<?php

namespace App\Exceptions;

use Exception;

class InvalidLotTransitionException extends Exception
{
    public function __construct(string $message = 'Invalid lot status transition.')
    {
        parent::__construct($message);
    }
}
