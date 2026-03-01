<?php

namespace Tests\Unit;

use App\Enums\AuditEventType;
use App\Enums\InvestmentStatus;
use App\Enums\RiskRating;
use App\Enums\TreeLifecycleStage;
use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use App\Exceptions\InvestmentLimitExceededException;
use App\Exceptions\InvestmentNotCancellableException;
use App\Exceptions\InvalidInvestmentAmountException;
use App\Exceptions\KycNotVerifiedException;
use App\Exceptions\TreeNotInvestableException;
use App\Models\Investment;
use App\Models\Transaction;
use App\Models\Tree;
use App\Models\User;
use App\Services\AuditLogService;
use App\Services\InvestmentService;
use App\Services\PaymentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Mockery;
use Tests\TestCase;

class InvestmentServiceTest extends TestCase
{
    use RefreshDatabase;

    protected InvestmentService $service;

    protected PaymentService $paymentService;

    protected AuditLogService $auditLogService;

    protected function setUp(): void
    {
        parent::setUp();

        $this->paymentService = Mockery::mock(PaymentService::class);
        $this->auditLogService = Mockery::mock(AuditLogService::class);
        $this->service = new InvestmentService($this->paymentService, $this->auditLogService);
    }

    public function test_validate_investment_eligibility_returns_eligible_with_valid_inputs()
    {
        $user = User::factory()->create([
            'kyc_status' => 'verified',
            'kyc_verified_at' => now(),
            'kyc_expires_at' => now()->addYear(),
        ]);

        $tree = Tree::factory()->create([
            'status' => TreeLifecycleStage::PRODUCTIVE,
            'min_investment_cents' => 10000,
            'max_investment_cents' => 100000,
        ]);

        $result = $this->service->validateInvestmentEligibility($user, $tree, 50000);

        $this->assertTrue($result['eligible']);
        $this->assertEmpty($result['errors']);
    }

    public function test_validate_investment_eligibility_fails_when_kyc_not_verified()
    {
        $user = User::factory()->create([
            'kyc_status' => 'pending',
        ]);

        $tree = Tree::factory()->create([
            'status' => TreeLifecycleStage::PRODUCTIVE,
            'min_investment_cents' => 10000,
            'max_investment_cents' => 100000,
        ]);

        $result = $this->service->validateInvestmentEligibility($user, $tree, 50000);

        $this->assertFalse($result['eligible']);
        $this->assertArrayHasKey('kyc', $result['errors']);
        $this->assertEquals('KYC verification is required before investing.', $result['errors']['kyc']);
    }

    public function test_validate_investment_eligibility_fails_when_kyc_expired()
    {
        $user = User::factory()->create([
            'kyc_status' => 'verified',
            'kyc_verified_at' => now()->subYears(2),
            'kyc_expires_at' => now()->subDay(),
        ]);

        $tree = Tree::factory()->create([
            'status' => TreeLifecycleStage::PRODUCTIVE,
            'min_investment_cents' => 10000,
            'max_investment_cents' => 100000,
        ]);

        $result = $this->service->validateInvestmentEligibility($user, $tree, 50000);

        $this->assertFalse($result['eligible']);
        $this->assertArrayHasKey('kyc', $result['errors']);
    }

    public function test_validate_investment_eligibility_fails_when_tree_not_investable()
    {
        $user = User::factory()->create([
            'kyc_status' => 'verified',
            'kyc_verified_at' => now(),
            'kyc_expires_at' => now()->addYear(),
        ]);

        $tree = Tree::factory()->create([
            'status' => TreeLifecycleStage::RETIRED,
            'min_investment_cents' => 10000,
            'max_investment_cents' => 100000,
        ]);

        $result = $this->service->validateInvestmentEligibility($user, $tree, 50000);

        $this->assertFalse($result['eligible']);
        $this->assertArrayHasKey('tree', $result['errors']);
        $this->assertEquals('This tree is not currently available for investment.', $result['errors']['tree']);
    }

    public function test_validate_investment_eligibility_fails_when_amount_below_minimum()
    {
        $user = User::factory()->create([
            'kyc_status' => 'verified',
            'kyc_verified_at' => now(),
            'kyc_expires_at' => now()->addYear(),
        ]);

        $tree = Tree::factory()->create([
            'status' => TreeLifecycleStage::PRODUCTIVE,
            'min_investment_cents' => 10000,
            'max_investment_cents' => 100000,
        ]);

        $result = $this->service->validateInvestmentEligibility($user, $tree, 5000);

        $this->assertFalse($result['eligible']);
        $this->assertArrayHasKey('amount_min', $result['errors']);
        $this->assertStringContainsString('100.00', $result['errors']['amount_min']);
    }

    public function test_validate_investment_eligibility_fails_when_amount_above_maximum()
    {
        $user = User::factory()->create([
            'kyc_status' => 'verified',
            'kyc_verified_at' => now(),
            'kyc_expires_at' => now()->addYear(),
        ]);

        $tree = Tree::factory()->create([
            'status' => TreeLifecycleStage::PRODUCTIVE,
            'min_investment_cents' => 10000,
            'max_investment_cents' => 100000,
        ]);

        $result = $this->service->validateInvestmentEligibility($user, $tree, 150000);

        $this->assertFalse($result['eligible']);
        $this->assertArrayHasKey('amount_max', $result['errors']);
        $this->assertStringContainsString('1,000.00', $result['errors']['amount_max']);
    }

    public function test_validate_investment_eligibility_fails_at_minimum_boundary()
    {
        $user = User::factory()->create([
            'kyc_status' => 'verified',
            'kyc_verified_at' => now(),
            'kyc_expires_at' => now()->addYear(),
        ]);

        $tree = Tree::factory()->create([
            'status' => TreeLifecycleStage::PRODUCTIVE,
            'min_investment_cents' => 10000,
            'max_investment_cents' => 100000,
        ]);

        $result = $this->service->validateInvestmentEligibility($user, $tree, 9999);

        $this->assertFalse($result['eligible']);
        $this->assertArrayHasKey('amount_min', $result['errors']);
    }

    public function test_validate_investment_eligibility_succeeds_at_minimum_boundary()
    {
        $user = User::factory()->create([
            'kyc_status' => 'verified',
            'kyc_verified_at' => now(),
            'kyc_expires_at' => now()->addYear(),
        ]);

        $tree = Tree::factory()->create([
            'status' => TreeLifecycleStage::PRODUCTIVE,
            'min_investment_cents' => 10000,
            'max_investment_cents' => 100000,
        ]);

        $result = $this->service->validateInvestmentEligibility($user, $tree, 10000);

        $this->assertTrue($result['eligible']);
        $this->assertEmpty($result['errors']);
    }

    public function test_validate_investment_eligibility_succeeds_at_maximum_boundary()
    {
        $user = User::factory()->create([
            'kyc_status' => 'verified',
            'kyc_verified_at' => now(),
            'kyc_expires_at' => now()->addYear(),
        ]);

        $tree = Tree::factory()->create([
            'status' => TreeLifecycleStage::PRODUCTIVE,
            'min_investment_cents' => 10000,
            'max_investment_cents' => 100000,
        ]);

        $result = $this->service->validateInvestmentEligibility($user, $tree, 100000);

        $this->assertTrue($result['eligible']);
        $this->assertEmpty($result['errors']);
    }

    public function test_validate_investment_eligibility_fails_above_maximum_boundary()
    {
        $user = User::factory()->create([
            'kyc_status' => 'verified',
            'kyc_verified_at' => now(),
            'kyc_expires_at' => now()->addYear(),
        ]);

        $tree = Tree::factory()->create([
            'status' => TreeLifecycleStage::PRODUCTIVE,
            'min_investment_cents' => 10000,
            'max_investment_cents' => 100000,
        ]);

        $result = $this->service->validateInvestmentEligibility($user, $tree, 100001);

        $this->assertFalse($result['eligible']);
        $this->assertArrayHasKey('amount_max', $result['errors']);
    }

    public function test_initiate_investment_creates_investment_and_transaction()
    {
        $user = User::factory()->create([
            'kyc_status' => 'verified',
            'kyc_verified_at' => now(),
            'kyc_expires_at' => now()->addYear(),
        ]);

        $tree = Tree::factory()->create([
            'status' => TreeLifecycleStage::PRODUCTIVE,
            'min_investment_cents' => 10000,
            'max_investment_cents' => 100000,
        ]);

        $transaction = Transaction::factory()->create([
            'user_id' => $user->id,
            'status' => TransactionStatus::Pending,
            'amount' => 50000,
            'stripe_payment_intent_id' => 'pi_test_123',
        ]);

        $this->paymentService
            ->shouldReceive('initiatePayment')
            ->once()
            ->with(
                $user->id,
                50000,
                'MYR',
                TransactionType::InvestmentPurchase,
                null
            )
            ->andReturn($transaction);

        $this->auditLogService
            ->shouldReceive('logEvent')
            ->once()
            ->with(
                AuditEventType::INVESTMENT_PURCHASED,
                $user->id,
                Mockery::on(function ($eventData) {
                    return isset($eventData['investment_id']) &&
                           isset($eventData['tree_id']) &&
                           $eventData['event'] === 'investment_initiated';
                })
            );

        $investment = $this->service->initiateInvestment($user, $tree, 50000);

        $this->assertInstanceOf(Investment::class, $investment);
        $this->assertEquals($user->id, $investment->user_id);
        $this->assertEquals($tree->id, $investment->tree_id);
        $this->assertEquals(50000, $investment->amount_cents);
        $this->assertEquals('MYR', $investment->currency);
        $this->assertEquals(InvestmentStatus::PendingPayment, $investment->status);
        $this->assertEquals($transaction->id, $investment->transaction_id);
        $this->assertDatabaseHas('investments', [
            'user_id' => $user->id,
            'tree_id' => $tree->id,
            'amount_cents' => 50000,
            'status' => InvestmentStatus::PendingPayment->value,
        ]);
    }

    public function test_initiate_investment_throws_kyc_not_verified_exception()
    {
        $user = User::factory()->create([
            'kyc_status' => 'pending',
        ]);

        $tree = Tree::factory()->create([
            'status' => TreeLifecycleStage::PRODUCTIVE,
            'min_investment_cents' => 10000,
            'max_investment_cents' => 100000,
        ]);

        $this->expectException(KycNotVerifiedException::class);

        $this->service->initiateInvestment($user, $tree, 50000);
    }

    public function test_initiate_investment_throws_tree_not_investable_exception()
    {
        $user = User::factory()->create([
            'kyc_status' => 'verified',
            'kyc_verified_at' => now(),
            'kyc_expires_at' => now()->addYear(),
        ]);

        $tree = Tree::factory()->create([
            'status' => TreeLifecycleStage::RETIRED,
            'min_investment_cents' => 10000,
            'max_investment_cents' => 100000,
        ]);

        $this->expectException(TreeNotInvestableException::class);
        $this->expectExceptionMessage((string) $tree->id);

        $this->service->initiateInvestment($user, $tree, 50000);
    }

    public function test_initiate_investment_throws_invalid_investment_amount_exception_below_min()
    {
        $user = User::factory()->create([
            'kyc_status' => 'verified',
            'kyc_verified_at' => now(),
            'kyc_expires_at' => now()->addYear(),
        ]);

        $tree = Tree::factory()->create([
            'status' => TreeLifecycleStage::PRODUCTIVE,
            'min_investment_cents' => 10000,
            'max_investment_cents' => 100000,
        ]);

        $this->expectException(InvalidInvestmentAmountException::class);

        $this->service->initiateInvestment($user, $tree, 5000);
    }

    public function test_initiate_investment_throws_investment_limit_exceeded_exception_above_max()
    {
        $user = User::factory()->create([
            'kyc_status' => 'verified',
            'kyc_verified_at' => now(),
            'kyc_expires_at' => now()->addYear(),
        ]);

        $tree = Tree::factory()->create([
            'status' => TreeLifecycleStage::PRODUCTIVE,
            'min_investment_cents' => 10000,
            'max_investment_cents' => 100000,
        ]);

        $this->expectException(InvestmentLimitExceededException::class);

        $this->service->initiateInvestment($user, $tree, 150000);
    }

    public function test_initiate_investment_uses_db_transaction_for_atomicity()
    {
        $user = User::factory()->create([
            'kyc_status' => 'verified',
            'kyc_verified_at' => now(),
            'kyc_expires_at' => now()->addYear(),
        ]);

        $tree = Tree::factory()->create([
            'status' => TreeLifecycleStage::PRODUCTIVE,
            'min_investment_cents' => 10000,
            'max_investment_cents' => 100000,
        ]);

        $this->paymentService
            ->shouldReceive('initiatePayment')
            ->andThrow(new \Exception('Payment service failed'));

        $this->auditLogService->shouldNotReceive('logEvent');

        $this->expectException(\Exception::class);

        $this->service->initiateInvestment($user, $tree, 50000);

        $this->assertDatabaseMissing('investments', [
            'user_id' => $user->id,
            'tree_id' => $tree->id,
        ]);
    }

    public function test_confirm_investment_transitions_to_active()
    {
        $investment = Investment::factory()->create([
            'status' => InvestmentStatus::PendingPayment,
        ]);

        $this->auditLogService
            ->shouldReceive('logEvent')
            ->once()
            ->with(
                AuditEventType::INVESTMENT_PURCHASED,
                $investment->user_id,
                Mockery::on(function ($eventData) use ($investment) {
                    return isset($eventData['investment_id']) &&
                           $eventData['investment_id'] === $investment->id &&
                           $eventData['event'] === 'investment_confirmed';
                })
            );

        $result = $this->service->confirmInvestment($investment->id);

        $this->assertEquals(InvestmentStatus::Active, $result->status);
        $this->assertDatabaseHas('investments', [
            'id' => $investment->id,
            'status' => InvestmentStatus::Active->value,
        ]);
    }

    public function test_confirm_investment_is_idempotent()
    {
        $investment = Investment::factory()->create([
            'status' => InvestmentStatus::Active,
        ]);

        $result = $this->service->confirmInvestment($investment->id);

        $this->assertEquals(InvestmentStatus::Active, $result->status);
        $this->assertDatabaseHas('investments', [
            'id' => $investment->id,
            'status' => InvestmentStatus::Active->value,
        ]);
    }

    public function test_cancel_investment_transitions_to_cancelled()
    {
        $investment = Investment::factory()->create([
            'status' => InvestmentStatus::PendingPayment,
            'transaction_id' => null,
        ]);

        $this->auditLogService
            ->shouldReceive('logEvent')
            ->once()
            ->with(
                AuditEventType::INVESTMENT_PURCHASED,
                $investment->user_id,
                Mockery::on(function ($eventData) use ($investment) {
                    return isset($eventData['investment_id']) &&
                           $eventData['investment_id'] === $investment->id &&
                           $eventData['event'] === 'investment_cancelled';
                })
            );

        $result = $this->service->cancelInvestment($investment->id);

        $this->assertEquals(InvestmentStatus::Cancelled, $result->status);
        $this->assertDatabaseHas('investments', [
            'id' => $investment->id,
            'status' => InvestmentStatus::Cancelled->value,
        ]);
    }

    public function test_cancel_investment_cancels_payment_transaction()
    {
        $transaction = Transaction::factory()->create([
            'status' => TransactionStatus::Pending,
        ]);

        $investment = Investment::factory()->create([
            'status' => InvestmentStatus::PendingPayment,
            'transaction_id' => $transaction->id,
        ]);

        $this->paymentService
            ->shouldReceive('cancelPendingTransaction')
            ->once()
            ->with($transaction->id)
            ->andReturn($transaction);

        $this->auditLogService
            ->shouldReceive('logEvent')
            ->once();

        $this->service->cancelInvestment($investment->id);
    }

    public function test_cancel_investment_throws_exception_for_active_investment()
    {
        $investment = Investment::factory()->create([
            'status' => InvestmentStatus::Active,
        ]);

        $this->expectException(InvestmentNotCancellableException::class);
        $this->expectExceptionMessage((string) $investment->id);

        $this->service->cancelInvestment($investment->id);
    }

    public function test_cancel_investment_throws_exception_for_cancelled_investment()
    {
        $investment = Investment::factory()->create([
            'status' => InvestmentStatus::Cancelled,
        ]);

        $this->expectException(InvestmentNotCancellableException::class);

        $this->service->cancelInvestment($investment->id);
    }

    public function test_cancel_investment_includes_cancellation_reason()
    {
        $investment = Investment::factory()->create([
            'status' => InvestmentStatus::PendingPayment,
            'transaction_id' => null,
        ]);

        $this->auditLogService
            ->shouldReceive('logEvent')
            ->once()
            ->with(
                AuditEventType::INVESTMENT_PURCHASED,
                $investment->user_id,
                Mockery::on(function ($eventData) {
                    return isset($eventData['reason']) &&
                           $eventData['reason'] === 'Changed my mind';
                })
            );

        $this->service->cancelInvestment($investment->id, 'Changed my mind');
    }

    public function test_top_up_investment_adds_to_amount()
    {
        $tree = Tree::factory()->create([
            'max_investment_cents' => 100000,
        ]);

        $investment = Investment::factory()->create([
            'status' => InvestmentStatus::Active,
            'amount_cents' => 50000,
            'tree_id' => $tree->id,
        ]);

        $transaction = Transaction::factory()->create([
            'user_id' => $investment->user_id,
            'status' => TransactionStatus::Pending,
            'amount' => 20000,
            'type' => TransactionType::TopUp,
        ]);

        $this->paymentService
            ->shouldReceive('initiatePayment')
            ->once()
            ->with(
                $investment->user_id,
                20000,
                'MYR',
                TransactionType::TopUp,
                null
            )
            ->andReturn($transaction);

        $this->auditLogService
            ->shouldReceive('logEvent')
            ->once()
            ->with(
                AuditEventType::INVESTMENT_PURCHASED,
                $investment->user_id,
                Mockery::on(function ($eventData) use ($investment) {
                    return isset($eventData['investment_id']) &&
                           $eventData['investment_id'] === $investment->id &&
                           $eventData['event'] === 'investment_top_up' &&
                           $eventData['original_amount'] === 50000 &&
                           $eventData['top_up_amount'] === 20000 &&
                           $eventData['new_total'] === 70000;
                })
            );

        $result = $this->service->topUpInvestment($investment->id, 20000);

        $this->assertEquals(70000, $result->amount_cents);
        $this->assertDatabaseHas('investments', [
            'id' => $investment->id,
            'amount_cents' => 70000,
        ]);
    }

    public function test_top_up_investment_throws_exception_for_non_active_investment()
    {
        $investment = Investment::factory()->create([
            'status' => InvestmentStatus::PendingPayment,
        ]);

        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Only active investments can be topped up');

        $this->service->topUpInvestment($investment->id, 10000);
    }

    public function test_top_up_investment_throws_exception_when_exceeds_max()
    {
        $tree = Tree::factory()->create([
            'max_investment_cents' => 100000,
        ]);

        $investment = Investment::factory()->create([
            'status' => InvestmentStatus::Active,
            'amount_cents' => 80000,
            'tree_id' => $tree->id,
        ]);

        $this->expectException(InvestmentLimitExceededException::class);

        $this->service->topUpInvestment($investment->id, 30000);
    }

    public function test_top_up_investment_succeeds_at_exact_max()
    {
        $tree = Tree::factory()->create([
            'max_investment_cents' => 100000,
        ]);

        $investment = Investment::factory()->create([
            'status' => InvestmentStatus::Active,
            'amount_cents' => 80000,
            'tree_id' => $tree->id,
        ]);

        $transaction = Transaction::factory()->create([
            'user_id' => $investment->user_id,
            'status' => TransactionStatus::Pending,
            'amount' => 20000,
            'type' => TransactionType::TopUp,
        ]);

        $this->paymentService
            ->shouldReceive('initiatePayment')
            ->andReturn($transaction);

        $this->auditLogService
            ->shouldReceive('logEvent');

        $result = $this->service->topUpInvestment($investment->id, 20000);

        $this->assertEquals(100000, $result->amount_cents);
    }

    public function test_get_user_investments_returns_all_user_investments()
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        $userInvestments = Investment::factory()
            ->count(3)
            ->for($user)
            ->create();

        Investment::factory()
            ->count(2)
            ->for($otherUser)
            ->create();

        $investments = $this->service->getUserInvestments($user);

        $this->assertCount(3, $investments);
        $this->assertTrue($investments->every(function ($investment) use ($user) {
            return $investment->user_id === $user->id;
        }));
    }

    public function test_get_user_investments_includes_tree_and_transaction_relationships()
    {
        $user = User::factory()->create();

        $investment = Investment::factory()
            ->for($user)
            ->withTransaction(Transaction::factory()->create())
            ->create();

        $investments = $this->service->getUserInvestments($user);

        $this->assertTrue($investments->first()->relationLoaded('tree'));
        $this->assertTrue($investments->first()->relationLoaded('transaction'));
    }

    public function test_get_user_investments_returns_ordered_by_created_at_desc()
    {
        $user = User::factory()->create();

        $investment1 = Investment::factory()
            ->for($user)
            ->create(['created_at' => now()->subDays(3)]);

        $investment2 = Investment::factory()
            ->for($user)
            ->create(['created_at' => now()->subDays(1)]);

        $investment3 = Investment::factory()
            ->for($user)
            ->create(['created_at' => now()->subDays(2)]);

        $investments = $this->service->getUserInvestments($user);

        $this->assertEquals($investment2->id, $investments->first()->id);
        $this->assertEquals($investment1->id, $investments->last()->id);
    }

    public function test_get_active_investments_returns_only_active_investments()
    {
        $user = User::factory()->create();

        Investment::factory()
            ->for($user)
            ->active()
            ->count(2)
            ->create();

        Investment::factory()
            ->for($user)
            ->cancelled()
            ->create();

        Investment::factory()
            ->for($user)
            ->create(['status' => InvestmentStatus::Matured]);

        $activeInvestments = $this->service->getActiveInvestments($user);

        $this->assertCount(2, $activeInvestments);
        $this->assertTrue($activeInvestments->every(function ($investment) {
            return $investment->status === InvestmentStatus::Active;
        }));
    }

    public function test_get_total_investment_value_sums_active_investments()
    {
        $user = User::factory()->create();

        Investment::factory()
            ->for($user)
            ->active()
            ->create(['amount_cents' => 50000]);

        Investment::factory()
            ->for($user)
            ->active()
            ->create(['amount_cents' => 30000]);

        Investment::factory()
            ->for($user)
            ->cancelled()
            ->create(['amount_cents' => 20000]);

        $total = $this->service->getTotalInvestmentValue($user);

        $this->assertEquals(80000, $total);
    }

    public function test_get_total_investment_value_returns_zero_for_no_investments()
    {
        $user = User::factory()->create();

        $total = $this->service->getTotalInvestmentValue($user);

        $this->assertEquals(0, $total);
    }
}
