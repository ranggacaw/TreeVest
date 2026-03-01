<?php

namespace App\Exceptions;

use Exception;

class TreeNotInvestableException extends Exception
{
    public function __construct(int $treeId)
    {
        parent::__construct("Tree #{$treeId} is not currently available for investment.");
    }
}
