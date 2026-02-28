<?php

namespace Tests\Integration;

use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use App\Models\AuditLog;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Tests\TestCase;

class PaymentFlowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        if (!config('services.stripe.secret') || config('services.stripe.secret') === 'sk_test_your_stripe_secret_key') {
            $this->markTestSkipped('Stripe API keys not configured');
        }
    }

    public function test_end_to_end_payment_flow()
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post('/api/payment-intents', [
                'amount' => 10000,
                'currency' => 'MYR',
                'type' => 'investment_purchase',
            ])
            ->assertStatus(200)
            ->assertJsonStructure([
                'client_secret',
                'transaction_id',
            ]);

        $transaction = Transaction::where('user_id', $user->id)->first();
        $this->assertNotNull($transaction);
        $this->assertEquals(TransactionStatus::Processing, $transaction->status);
        $this->assertEquals(TransactionType::InvestmentPurchase, $transaction->type);
    }

    public function test_payment_failure_scenario()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->post('/api/payment-intents', [
                'amount' => 10000,
                'currency' => 'MYR',
                'type' => 'investment_purchase',
            ]);

        $data = json_decode($response->getContent(), true);

        $this->assertArrayHasKey('client_secret', $data);
    }

    public function test_transaction_ledger_records_events()
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post('/api/payment-intents', [
                'amount' => 10000,
                'currency' => 'MYR',
                'type' => 'investment_purchase',
            ]);

        $transaction = Transaction::where('user_id', $user->id)->first();

        $this->assertDatabaseHas('audit_logs', [
            'event_type' => 'investment_purchased',
            'user_id' => $user->id,
        ]);
    }
}
