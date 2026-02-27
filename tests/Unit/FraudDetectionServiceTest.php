<?php

namespace Tests\Unit;

use App\Enums\FraudRuleType;
use App\Models\Transaction;
use App\Models\User;
use App\Services\FraudDetectionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Tests\TestCase;

class FraudDetectionServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_detects_rapid_investments()
    {
        Config::set('fraud-detection.enabled', true);
        Config::set('fraud-detection.thresholds.rapid_investments.count', 2);
        Config::set('fraud-detection.thresholds.rapid_investments.minutes', 1);

        $user = User::factory()->create();

        // Create 2 transactions in the last minute
        Transaction::forceCreate([
            'user_id' => $user->id,
            'amount' => 100,
            'created_at' => now(),
        ]);
        Transaction::forceCreate([
            'user_id' => $user->id,
            'amount' => 100,
            'created_at' => now(),
        ]);

        $newTransaction = new Transaction([
            'user_id' => $user->id,
            'amount' => 100,
        ]); // Not saved yet

        $service = new FraudDetectionService;
        $service->evaluateTransaction($newTransaction);

        $this->assertDatabaseHas('fraud_alerts', [
            'user_id' => $user->id,
            'rule_type' => FraudRuleType::RAPID_INVESTMENTS->value,
        ]);
    }

    public function test_it_detects_unusual_amount()
    {
        Config::set('fraud-detection.enabled', true);
        Config::set('fraud-detection.thresholds.unusual_amount.limit', 1000);

        $user = User::factory()->create();
        $transaction = new Transaction([
            'user_id' => $user->id,
            'amount' => 1500, // Above limit
        ]);

        $service = new FraudDetectionService;
        $service->evaluateTransaction($transaction);

        $this->assertDatabaseHas('fraud_alerts', [
            'user_id' => $user->id,
            'rule_type' => FraudRuleType::UNUSUAL_AMOUNT->value,
        ]);
    }

    public function test_it_detects_multiple_failed_auth()
    {
        Config::set('fraud-detection.enabled', true);
        Config::set('fraud-detection.thresholds.multiple_failed_auth.count', 2);
        Config::set('fraud-detection.thresholds.multiple_failed_auth.minutes', 5);

        $user = User::factory()->create();

        // Simulate 2 failed login logs
        \App\Models\AuditLog::create([
            'user_id' => $user->id,
            'event_type' => \App\Enums\AuditEventType::FAILED_LOGIN,
            'ip_address' => '127.0.0.1',
            'user_agent' => 'Test',
            'created_at' => now(),
        ]);
        \App\Models\AuditLog::create([
            'user_id' => $user->id,
            'event_type' => \App\Enums\AuditEventType::FAILED_LOGIN,
            'ip_address' => '127.0.0.1',
            'user_agent' => 'Test',
            'created_at' => now(),
        ]);

        $service = new FraudDetectionService;
        $service->checkMultipleFailedAuth($user);

        $this->assertDatabaseHas('fraud_alerts', [
            'user_id' => $user->id,
            'rule_type' => \App\Enums\FraudRuleType::MULTIPLE_FAILED_AUTH->value,
        ]);
    }
}
