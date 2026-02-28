<?php

namespace Tests\Unit;

use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use App\Models\PaymentMethod;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TransactionModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_transaction_belongs_to_user()
    {
        $user = User::factory()->create();
        $transaction = Transaction::factory()->create(['user_id' => $user->id]);

        $this->assertInstanceOf(User::class, $transaction->user);
        $this->assertEquals($user->id, $transaction->user->id);
    }

    public function test_transaction_belongs_to_payment_method()
    {
        $user = User::factory()->create();
        $paymentMethod = PaymentMethod::factory()->create(['user_id' => $user->id]);
        $transaction = Transaction::factory()->create([
            'user_id' => $user->id,
            'payment_method_id' => $paymentMethod->id,
        ]);

        $this->assertInstanceOf(PaymentMethod::class, $transaction->paymentMethod);
        $this->assertEquals($paymentMethod->id, $transaction->paymentMethod->id);
    }

    public function test_formatted_amount_returns_correct_format()
    {
        $transaction = Transaction::factory()->create(['amount' => 15000]);

        $this->assertEquals('150.00', $transaction->formatted_amount);
    }

    public function test_type_is_casted_to_enum()
    {
        $transaction = Transaction::factory()->create(['type' => 'investment_purchase']);

        $this->assertInstanceOf(TransactionType::class, $transaction->type);
        $this->assertEquals(TransactionType::InvestmentPurchase, $transaction->type);
    }

    public function test_status_is_casted_to_enum()
    {
        $transaction = Transaction::factory()->create(['status' => 'pending']);

        $this->assertInstanceOf(TransactionStatus::class, $transaction->status);
        $this->assertEquals(TransactionStatus::Pending, $transaction->status);
    }

    public function test_scope_completed_filters_by_status()
    {
        Transaction::factory()->create(['status' => TransactionStatus::Pending->value]);
        Transaction::factory()->create(['status' => TransactionStatus::Processing->value]);
        $completed = Transaction::factory()->create(['status' => TransactionStatus::Completed->value]);

        $results = Transaction::completed()->get();

        $this->assertCount(1, $results);
        $this->assertEquals($completed->id, $results->first()->id);
    }

    public function test_scope_pending_filters_by_status()
    {
        Transaction::factory()->create(['status' => TransactionStatus::Completed->value]);
        $pending = Transaction::factory()->create(['status' => TransactionStatus::Pending->value]);
        Transaction::factory()->create(['status' => TransactionStatus::Processing->value]);

        $results = Transaction::pending()->get();

        $this->assertCount(1, $results);
        $this->assertEquals($pending->id, $results->first()->id);
    }

    public function test_scope_for_user_filters_by_user_id()
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        Transaction::factory()->create(['user_id' => $user1->id]);
        $transaction2 = Transaction::factory()->create(['user_id' => $user2->id]);
        Transaction::factory()->create(['user_id' => $user1->id]);

        $results = Transaction::forUser($user2->id)->get();

        $this->assertCount(1, $results);
        $this->assertEquals($transaction2->id, $results->first()->id);
    }

    public function test_scope_by_type_filters_by_type()
    {
        Transaction::factory()->create(['type' => TransactionType::Refund->value]);
        $investment = Transaction::factory()->create(['type' => TransactionType::InvestmentPurchase->value]);
        Transaction::factory()->create(['type' => TransactionType::TopUp->value]);

        $results = Transaction::byType(TransactionType::InvestmentPurchase)->get();

        $this->assertCount(1, $results);
        $this->assertEquals($investment->id, $results->first()->id);
    }
}
