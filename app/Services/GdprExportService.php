<?php

namespace App\Services;

use App\Models\User;
use App\Models\Transaction;
use App\Models\AuditLog;
use Illuminate\Support\Facades\Json;

class GdprExportService
{
    /**
     * Export all user data.
     */
    public function exportUserData(int $userId): array
    {
        $user = User::with(['notifications'])->findOrFail($userId);

        // Fetch related data
        // $transactions = Transaction::where('user_id', $userId)->get();
        // $auditLogs = AuditLog::where('user_id', $userId)->get();

        return [
            'user_profile' => $user->toArray(),
            // 'transactions' => $transactions->toArray(),
            // 'audit_logs' => $auditLogs->toArray(),
            'exported_at' => now()->toIso8601String(),
        ];
    }
}
