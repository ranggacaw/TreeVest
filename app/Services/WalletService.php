<?php

namespace App\Services;

use App\Enums\WalletTransactionType;
use App\Exceptions\InsufficientWalletBalanceException;
use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class WalletService
{
    /**
     * Gets or creates a wallet for the given user.
     */
    public function getOrCreateWallet(User $user): Wallet
    {
        return Wallet::firstOrCreate(
            ['user_id' => $user->id],
            [
                'balance_idr' => 0,
                'currency' => 'IDR',
                'is_platform' => false,
            ]
        );
    }

    /**
     * Gets or creates the platform system wallet.
     */
    public function getPlatformWallet(): Wallet
    {
        return Wallet::firstOrCreate(
            ['user_id' => null, 'is_platform' => true],
            [
                'balance_idr' => 0,
                'currency' => 'IDR',
                'is_platform' => true,
            ]
        );
    }

    /**
     * Credits a user's wallet. Safe for concurrent calls.
     */
    public function credit(
        User $user,
        int $amountIdr,
        WalletTransactionType $transactionType,
        Model $reference
    ): WalletTransaction {
        return DB::transaction(function () use ($user, $amountIdr, $transactionType, $reference) {
            $wallet = $this->getOrCreateWallet($user);
            $wallet = Wallet::lockForUpdate()->find($wallet->id);

            $wallet->balance_idr += $amountIdr;
            $wallet->save();

            return WalletTransaction::create([
                'wallet_id' => $wallet->id,
                'type' => 'credit',
                'transaction_type' => $transactionType->value,
                'amount_idr' => $amountIdr,
                'balance_after_idr' => $wallet->balance_idr,
                'reference_type' => class_basename($reference),
                'reference_id' => $reference->getKey(),
            ]);
        });
    }

    /**
     * Credits the platform wallet.
     */
    public function creditPlatform(
        int $amountIdr,
        WalletTransactionType $transactionType,
        Model $reference
    ): WalletTransaction {
        return DB::transaction(function () use ($amountIdr, $transactionType, $reference) {
            $wallet = $this->getPlatformWallet();
            $wallet = Wallet::lockForUpdate()->find($wallet->id);

            $wallet->balance_idr += $amountIdr;
            $wallet->save();

            return WalletTransaction::create([
                'wallet_id' => $wallet->id,
                'type' => 'credit',
                'transaction_type' => $transactionType->value,
                'amount_idr' => $amountIdr,
                'balance_after_idr' => $wallet->balance_idr,
                'reference_type' => class_basename($reference),
                'reference_id' => $reference->getKey(),
            ]);
        });
    }

    /**
     * Debits a user's wallet with pessimistic locking to prevent negative balances.
     *
     * @throws \App\Exceptions\InsufficientWalletBalanceException
     */
    public function debit(
        User $user,
        int $amountIdr,
        WalletTransactionType $transactionType,
        Model $reference
    ): WalletTransaction {
        return DB::transaction(function () use ($user, $amountIdr, $transactionType, $reference) {
            $wallet = $this->getOrCreateWallet($user);

            // Lock the row to prevent concurrent debits causing negative balance
            $wallet = Wallet::lockForUpdate()->find($wallet->id);

            if ($wallet->balance_idr < $amountIdr) {
                throw new InsufficientWalletBalanceException(
                    "Insufficient wallet balance. Available: {$wallet->getFormattedBalanceAttribute()}."
                );
            }

            $wallet->balance_idr -= $amountIdr;
            $wallet->save();

            return WalletTransaction::create([
                'wallet_id' => $wallet->id,
                'type' => 'debit',
                'transaction_type' => $transactionType->value,
                'amount_idr' => $amountIdr,
                'balance_after_idr' => $wallet->balance_idr,
                'reference_type' => class_basename($reference),
                'reference_id' => $reference->getKey(),
            ]);
        });
    }

    /**
     * Initiates a withdrawal — debits wallet and queues bank transfer.
     *
     * @throws \App\Exceptions\InsufficientWalletBalanceException
     */
    public function initiateWithdrawal(User $user, int $amountIdr): WalletTransaction
    {
        if ($amountIdr < 1000) {
            throw new \InvalidArgumentException('Minimum withdrawal amount is Rp 1.00 (1000 IDR).');
        }

        // Create a temporary placeholder model for the reference
        $wallet = $this->getOrCreateWallet($user);

        $tx = $this->debit(
            $user,
            $amountIdr,
            WalletTransactionType::Withdrawal,
            $wallet
        );

        Log::info('Withdrawal initiated', [
            'user_id' => $user->id,
            'amount_idr' => $amountIdr,
            'wallet_transaction_id' => $tx->id,
        ]);

        // TODO: Dispatch bank transfer job via EPIC-010 payment integration
        // \App\Jobs\ProcessBankWithdrawal::dispatch($user, $amountIdr, $tx->id);

        return $tx;
    }
}
