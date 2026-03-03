<?php

namespace App\Exceptions;

use Exception;

class PaymentConfigurationException extends Exception
{
    public function __construct(string $message = 'Payment service is not correctly configured.')
    {
        parent::__construct($message);
    }
}
