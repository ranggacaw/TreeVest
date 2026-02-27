<?php

namespace App\Services;

use App\Enums\FraudRuleType;
use App\Models\FraudAlert;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class FraudDetectionService
{
    /**
     * Evaluate a transaction for potential fraud.
     */
    public function evaluateTransaction(Transaction $transaction): void
    {
        if (! config('fraud-detection.enabled')) {
            return;
        }

        $this->checkRapidInvestments($transaction);
        $this->checkUnusualAmount($transaction);
    }

    /**
     * Check for rapid consecutive investments.
     */
    protected function checkRapidInvestments(Transaction $transaction): void
    {
        $threshold = config('fraud-detection.thresholds.rapid_investments.count', 3);
        $minutes = config('fraud-detection.thresholds.rapid_investments.minutes', 1);

        $count = Transaction::where('user_id', $transaction->user_id)
            ->where('created_at', '>=', now()->subMinutes($minutes))
            ->count();

        if ($count >= $threshold) {
            $this->flagSuspiciousActivity(
                $transaction->user_id,
                FraudRuleType::RAPID_INVESTMENTS,
                "User made {$count} transactions in the last {$minutes} minutes."
            );
        }
    }

    /**
     * Check for unusually large transaction amounts.
     */
    protected function checkUnusualAmount(Transaction $transaction): void
    {
        $limit = config('fraud-detection.thresholds.unusual_amount.limit', 10000);

        if ($transaction->amount >= $limit) {
            $this->flagSuspiciousActivity(
                $transaction->user_id,
                FraudRuleType::UNUSUAL_AMOUNT,
                "Transaction amount {$transaction->amount} exceeds limit of {$limit}."
            );
        }
    }

    /**
     * Check for multiple failed authentication attempts.
     */
    public function checkMultipleFailedAuth(User $user): void
    {
        $minutes = config('fraud-detection.thresholds.multiple_failed_auth.minutes', 15);
        $limit = config('fraud-detection.thresholds.multiple_failed_auth.count', 5);

        // Count failed logins from AuditLog
        // Note: The current failed attempt might be queued and not in DB yet.
        // We add 1 to the count to account for the current failure if we are calling this inside the failure handler.
        $failedCount = \App\Models\AuditLog::where('user_id', $user->id)
            ->where('event_type', \App\Enums\AuditEventType::FAILED_LOGIN)
            ->where('created_at', '>=', now()->subMinutes($minutes))
            ->count();

        // Assuming this is called ON failure, effective count is db_count + 1
        if (($failedCount + 1) >= $limit) {
            $this->flagSuspiciousActivity(
                $user->id,
                FraudRuleType::MULTIPLE_FAILED_AUTH,
                'User had '.($failedCount + 1)." failed login attempts in the last {$minutes} minutes."
            );
        }
    }

    /**
     * Flag suspicious activity.
     */
    public function flagSuspiciousActivity(int $userId, FraudRuleType $ruleType, string $notes): void
    {
        Log::warning("Suspicious activity detected for user {$userId}: {$ruleType->value}");

        FraudAlert::create([
            'user_id' => $userId,
            'rule_type' => $ruleType,
            'severity' => 'medium', // Default severity
            'notes' => $notes,
            'detected_at' => now(),
        ]);
    }
}
