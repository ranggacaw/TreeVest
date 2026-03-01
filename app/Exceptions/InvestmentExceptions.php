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

class KycNotVerifiedException extends Exception
{
    public function __construct()
    {
        parent::__construct('KYC verification is required before making investments.');
    }
}

class TreeNotInvestableException extends Exception
{
    public function __construct(int $treeId)
    {
        parent::__construct("Tree #{$treeId} is not currently available for investment.");
    }
}

class InvestmentNotCancellableException extends Exception
{
    public function __construct(int $investmentId)
    {
        parent::__construct("Investment #{$investmentId} cannot be cancelled in its current state.");
    }
}

class InvestmentNotFoundException extends Exception
{
    public function __construct(int $investmentId)
    {
        parent::__construct("Investment #{$investmentId} not found.");
    }
}

class InvalidInvestmentAmountException extends Exception
{
    public function __construct(int $amount, int $minAmount)
    {
        $amountFormatted = number_format($amount / 100, 2);
        $minFormatted = number_format($minAmount / 100, 2);
        parent::__construct("Investment amount of {$amountFormatted} is below minimum required: {$minFormatted}");
    }
}
