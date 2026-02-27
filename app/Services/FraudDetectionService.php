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
        if (! config('fraud.enabled')) {
            return;
        }

        $this->checkRapidInvestments($transaction);
        // Add other checks here
    }

    /**
     * Check for rapid consecutive investments.
     */
    protected function checkRapidInvestments(Transaction $transaction): void
    {
        $threshold = config('fraud.thresholds.rapid_investments.count', 3);
        $minutes = config('fraud.thresholds.rapid_investments.minutes', 1);

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
