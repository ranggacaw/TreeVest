<?php

namespace App\Observers;

use App\Models\Transaction;
use App\Services\FraudDetectionService;

class TransactionObserver
{
    public function __construct(
        protected FraudDetectionService $fraudDetectionService
    ) {}

    /**
     * Handle the Transaction "created" event.
     */
    public function created(Transaction $transaction): void
    {
        $this->fraudDetectionService->evaluateTransaction($transaction);
    }
}
