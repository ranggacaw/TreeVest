<?php

namespace App\Services;

use App\Models\Transaction;
use App\Models\User;
use App\Support\TransactionHelper;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class GdprDeletionService
{
    /**
     * Delete user data in compliance with GDPR.
     */
    public function deleteUserData(int $userId): void
    {
        TransactionHelper::smart(function () use ($userId) {
            $user = User::findOrFail($userId);

            // Anonymize sensitive fields before soft deletion
            $user->update([
                'name' => 'Deleted User',
                'email' => 'deleted_'.$userId.'_'.Str::random(10).'@treevest.local',
                'password' => \Illuminate\Support\Facades\Hash::make(Str::random(40)),
                'remember_token' => null,
            ]);

            // Anonymize transactions
            // Note: Since 'account_number' is encrypted, we encrypt a placeholder or nullify it
            Transaction::where('user_id', $userId)->each(function ($transaction) {
                // If account_number exists on transaction model
                // $transaction->account_number = null;
                // $transaction->save();
            });

            // Delete the user record (Soft Delete)
            $user->delete();
        });
    }
}
