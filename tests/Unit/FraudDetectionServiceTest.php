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
        Config::set('fraud.enabled', true);
        Config::set('fraud.thresholds.rapid_investments.count', 2);
        Config::set('fraud.thresholds.rapid_investments.minutes', 1);

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

        $service = new FraudDetectionService();
        $service->evaluateTransaction($newTransaction);

        $this->assertDatabaseHas('fraud_alerts', [
            'user_id' => $user->id,
            'rule_type' => FraudRuleType::RAPID_INVESTMENTS->value,
        ]);
    }
}
