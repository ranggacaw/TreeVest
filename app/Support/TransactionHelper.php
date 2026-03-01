<?php

namespace App\Support;

use Illuminate\Support\Facades\DB;

class TransactionHelper
{
    /**
     * Execute a callback within a database transaction, or immediately if already in a transaction.
     *
     * @param  \Closure  $callback
     * @param  int  $attempts
     * @return mixed
     *
     * @throws \Throwable
     */
    public static function smart(\Closure $callback, int $attempts = 1)
    {
        // If we're already in a transaction, just execute the callback
        if (DB::transactionLevel() > 0) {
            return $callback();
        }

        // Otherwise, start a new transaction
        return DB::transaction($callback, $attempts);
    }
}
