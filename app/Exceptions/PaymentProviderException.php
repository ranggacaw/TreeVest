<?php

namespace App\Exceptions;

use Exception;

class PaymentProviderException extends Exception
{
    protected ?string $providerCode;

    public function __construct(string $message = "", ?string $providerCode = null, int $code = 0, ?Exception $previous = null)
    {
        parent::__construct($message, $code, $previous);
        $this->providerCode = $providerCode;
    }

    public function getProviderCode(): ?string
    {
        return $this->providerCode;
    }

    public function setProviderCode(?string $providerCode): self
    {
        $this->providerCode = $providerCode;
        return $this;
    }
}