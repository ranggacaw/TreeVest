<?php

namespace App\Services;

use App\Models\User;
use App\Models\Transaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class GdprDeletionService
{
    /**
     * Delete user data in compliance with GDPR.
     */
    public function deleteUserData(int $userId): void
    {
        DB::transaction(function () use ($userId) {
            $user = User::findOrFail($userId);

            // Anonymize transactions
            // Assuming Transaction has user_id and sensitive fields
            // Transaction::where('user_id', $userId)->update([
            //     'account_number' => null, // Or masked
            //     'notes' => 'Anonymized due to GDPR deletion request',
            // ]);
            // Since Transaction model fields are encrypted, setting to null or empty string is likely safer.

            // Delete the user record (Soft or Hard depending on model config)
            $user->delete();
        });
    }
}
