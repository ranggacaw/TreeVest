<?php

namespace Tests\Feature;

use App\Enums\InvestmentStatus;
use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use App\Enums\TreeLifecycleStage;
use App\Models\Investment;
use App\Models\Transaction;
use App\Models\Tree;
use App\Models\User;
use App\Services\InvestmentService;
use App\Services\PaymentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Tests\TestCase;

class InvestmentWebhookIntegrationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Config::set('services.stripe.webhook_secret', 'whsec_test_secret');
    }

    protected function createVerifiedUserWithKyc(): User
    {
        return User::factory()->create([
            'kyc_status' => 'verified',
            'kyc_verified_at' => now(),
            'kyc_expires_at' => now()->addYear(),
        ]);
    }

    public function test_full_investment_flow_from_initiation_to_confirmation_via_webhook()
    {
        // Step 1: Create user and tree
        $user = $this->createVerifiedUserWithKyc();
        $tree = Tree::factory()->create([
            'status' => TreeLifecycleStage::PRODUCTIVE,
            'min_investment_cents' => 10000,
            'max_investment_cents' => 100000,
        ]);

        // Step 2: Initiate investment via HTTP
        $response = $this->actingAs($user)
            ->post(route('investments.store'), [
                'tree_id' => $tree->id,
                'amount_cents' => 50000,
                'acceptance_risk_disclosure' => true,
                'acceptance_terms' => true,
            ]);

        $response->assertRedirect();

        // Verify investment created with pending status
        $investment = Investment::where('user_id', $user->id)
            ->where('tree_id', $tree->id)
            ->first();

        $this->assertNotNull($investment);
        $this->assertEquals(InvestmentStatus::PendingPayment, $investment->status);
        $this->assertEquals(50000, $investment->amount_cents);

        // Verify transaction created
        $this->assertNotNull($investment->transaction_id);
        $transaction = $investment->transaction;
        $this->assertEquals(TransactionStatus::Pending, $transaction->status);
        $this->assertEquals(TransactionType::InvestmentPurchase, $transaction->type);
        $this->assertNotNull($transaction->stripe_payment_intent_id);

        // Step 3: Simulate Stripe webhook for successful payment
        $paymentService = app(PaymentService::class);
        $investmentService = app(InvestmentService::class);
        $paymentService->setInvestmentService($investmentService);

        $paymentService->handleWebhookEvent(
            'evt_test_success_'.uniqid(),
            'payment_intent.succeeded',
            [
                'object' => [
                    'id' => $transaction->stripe_payment_intent_id,
                    'status' => 'succeeded',
                    'amount' => 50000,
                    'currency' => 'myr',
                    'metadata' => [
                        'investment_id' => (string) $investment->id,
                    ],
                ],
            ]
        );

        // Step 4: Verify investment confirmed
        $investment->refresh();
        $this->assertEquals(InvestmentStatus::Active, $investment->status);

        // Step 5: Verify transaction completed
        $transaction->refresh();
        $this->assertEquals(TransactionStatus::Completed, $transaction->status);
        $this->assertNotNull($transaction->completed_at);

        // Step 6: Verify audit log created
        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $user->id,
        ]);
    }

    public function test_investment_remains_pending_when_payment_fails()
    {
        // Step 1: Create user and tree
        $user = $this->createVerifiedUserWithKyc();
        $tree = Tree::factory()->create([
            'status' => TreeLifecycleStage::PRODUCTIVE,
            'min_investment_cents' => 10000,
            'max_investment_cents' => 100000,
        ]);

        // Step 2: Initiate investment
        $this->actingAs($user)
            ->post(route('investments.store'), [
                'tree_id' => $tree->id,
                'amount_cents' => 50000,
                'acceptance_risk_disclosure' => true,
                'acceptance_terms' => true,
            ]);

        $investment = Investment::where('user_id', $user->id)->first();
        $transaction = $investment->transaction;

        // Step 3: Simulate Stripe webhook for failed payment
        $paymentService = app(PaymentService::class);
        $investmentService = app(InvestmentService::class);
        $paymentService->setInvestmentService($investmentService);

        $paymentService->handleWebhookEvent(
            'evt_test_fail_'.uniqid(),
            'payment_intent.payment_failed',
            [
                'object' => [
                    'id' => $transaction->stripe_payment_intent_id,
                    'status' => 'failed',
                    'last_payment_error' => [
                        'message' => 'Insufficient funds',
                    ],
                ],
            ]
        );

        // Step 4: Verify investment remains pending
        $investment->refresh();
        $this->assertEquals(InvestmentStatus::PendingPayment, $investment->status);

        // Step 5: Verify transaction marked as failed
        $transaction->refresh();
        $this->assertEquals(TransactionStatus::Failed, $transaction->status);
        $this->assertNotNull($transaction->failed_at);
        $this->assertEquals('Insufficient funds', $transaction->failure_reason);
    }

    public function test_webhook_is_idempotent_does_not_reprocess_same_event()
    {
        $user = $this->createVerifiedUserWithKyc();
        $tree = Tree::factory()->create([
            'status' => TreeLifecycleStage::PRODUCTIVE,
            'min_investment_cents' => 10000,
            'max_investment_cents' => 100000,
        ]);

        // Create investment
        $this->actingAs($user)
            ->post(route('investments.store'), [
                'tree_id' => $tree->id,
                'amount_cents' => 50000,
                'acceptance_risk_disclosure' => true,
                'acceptance_terms' => true,
            ]);

        $investment = Investment::where('user_id', $user->id)->first();
        $transaction = $investment->transaction;

        $paymentService = app(PaymentService::class);
        $investmentService = app(InvestmentService::class);
        $paymentService->setInvestmentService($investmentService);

        $eventId = 'evt_test_idempotent_'.uniqid();
        $eventData = [
            'object' => [
                'id' => $transaction->stripe_payment_intent_id,
                'status' => 'succeeded',
                'amount' => 50000,
                'currency' => 'myr',
                'metadata' => [
                    'investment_id' => (string) $investment->id,
                ],
            ],
        ];

        // Process webhook first time
        $paymentService->handleWebhookEvent($eventId, 'payment_intent.succeeded', $eventData);

        $investment->refresh();
        $this->assertEquals(InvestmentStatus::Active, $investment->status);

        // Count audit logs
        $auditLogCountBefore = \App\Models\AuditLog::count();

        // Process same webhook second time
        $paymentService->handleWebhookEvent($eventId, 'payment_intent.succeeded', $eventData);

        // Investment status should not change
        $investment->refresh();
        $this->assertEquals(InvestmentStatus::Active, $investment->status);

        // No new audit logs should be created
        $auditLogCountAfter = \App\Models\AuditLog::count();
        $this->assertEquals($auditLogCountBefore, $auditLogCountAfter);
    }

    public function test_investment_metadata_includes_investment_id()
    {
        $user = $this->createVerifiedUserWithKyc();
        $tree = Tree::factory()->create([
            'status' => TreeLifecycleStage::PRODUCTIVE,
            'min_investment_cents' => 10000,
            'max_investment_cents' => 100000,
        ]);

        $this->actingAs($user)
            ->post(route('investments.store'), [
                'tree_id' => $tree->id,
                'amount_cents' => 50000,
                'acceptance_risk_disclosure' => true,
                'acceptance_terms' => true,
            ]);

        $investment = Investment::where('user_id', $user->id)->first();
        $transaction = $investment->transaction;

        // Check that transaction metadata includes investment_id
        $this->assertNotNull($transaction->metadata);
        $this->assertArrayHasKey('investment_id', $transaction->metadata);
        $this->assertEquals($investment->id, $transaction->metadata['investment_id']);
    }
}
