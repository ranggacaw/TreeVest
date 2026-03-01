<?php

namespace Tests\Feature;

use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class StripeWebhookTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Config::set('services.stripe.webhook_secret', 'whsec_test_secret');
    }

    public function test_webhook_with_invalid_signature_rejected()
    {
        $response = $this->call('POST', '/stripe/webhook', [], [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_Stripe-Signature' => 'invalid_signature',
        ]);

        $response->assertStatus(403);
    }

    public function test_webhook_dispatches_job_on_valid_signature()
    {
        Queue::fake();

        $user = User::factory()->create();
        $transaction = Transaction::factory()->create([
            'user_id' => $user->id,
            'status' => TransactionStatus::Processing,
        ]);

        $payload = json_encode([
            'id' => 'evt_test_123',
            'type' => 'payment_intent.succeeded',
            'data' => [
                'object' => [
                    'id' => 'pi_test_456',
                    'status' => 'succeeded',
                    'amount' => 10000,
                    'currency' => 'myr',
                ],
            ],
        ]);

        $timestamp = time();
        $signature = hash_hmac('sha256', $timestamp.'.'.$payload, 'whsec_test_secret');

        $response = $this->call('POST', '/stripe/webhook', [], [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_Stripe-Signature' => "t={$timestamp},v1={$signature}",
        ], $payload);

        $response->assertStatus(202);
    }

    public function test_payment_intent_succeeded_updates_transaction_status()
    {
        $user = User::factory()->create();
        $transaction = Transaction::factory()->create([
            'user_id' => $user->id,
            'type' => TransactionType::InvestmentPurchase,
            'status' => TransactionStatus::Processing,
            'stripe_payment_intent_id' => 'pi_test_456',
        ]);

        $this->assertEquals(TransactionStatus::Processing, $transaction->status);

        $payload = json_encode([
            'id' => 'evt_test_success',
            'type' => 'payment_intent.succeeded',
            'data' => [
                'id' => 'pi_test_456',
                'status' => 'succeeded',
                'amount' => 10000,
            ],
        ]);

        $timestamp = time();
        $signature = hash_hmac('sha256', $timestamp.'.'.$payload, 'whsec_test_secret');

        $this->call('POST', '/stripe/webhook', [], [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_Stripe-Signature' => "t={$timestamp},v1={$signature}",
        ], $payload);

        $transaction->refresh();
        $this->assertEquals(TransactionStatus::Completed, $transaction->status);
        $this->assertNotNull($transaction->completed_at);
    }

    public function test_payment_intent_failed_updates_transaction_status()
    {
        $user = User::factory()->create();
        $transaction = Transaction::factory()->create([
            'user_id' => $user->id,
            'status' => TransactionStatus::Processing,
            'stripe_payment_intent_id' => 'pi_test_789',
        ]);

        $payload = json_encode([
            'id' => 'evt_test_fail',
            'type' => 'payment_intent.payment_failed',
            'data' => [
                'id' => 'pi_test_789',
                'last_payment_error' => [
                    'message' => 'Card declined',
                ],
            ],
        ]);

        $timestamp = time();
        $signature = hash_hmac('sha256', $timestamp.'.'.$payload, 'whsec_test_secret');

        $this->call('POST', '/stripe/webhook', [], [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_Stripe-Signature' => "t={$timestamp},v1={$signature}",
        ], $payload);

        $transaction->refresh();
        $this->assertEquals(TransactionStatus::Failed, $transaction->status);
        $this->assertNotNull($transaction->failed_at);
        $this->assertEquals('Card declined', $transaction->failure_reason);
    }
}
