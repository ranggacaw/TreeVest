<?php

namespace App\Exceptions;

use RuntimeException;

class InsufficientTreesException extends RuntimeException
{
    public function __construct(
        string $message = 'Not enough trees available in this lot.',
        int $code = 0,
        ?\Throwable $previous = null
    ) {
        parent::__construct($message, $code, $previous);
    }
}
