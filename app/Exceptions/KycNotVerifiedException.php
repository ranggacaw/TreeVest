<?php

namespace App\Exceptions;

use Exception;

class KycNotVerifiedException extends Exception
{
    public function __construct()
    {
        parent::__construct('KYC verification is required before making investments.');
    }
}
