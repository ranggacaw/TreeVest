<?php

namespace Tests\Unit;

use App\Models\PaymentMethod;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PaymentMethodModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_payment_method_belongs_to_user()
    {
        $user = User::factory()->create();
        $paymentMethod = PaymentMethod::factory()->create(['user_id' => $user->id]);

        $this->assertInstanceOf(User::class, $paymentMethod->user);
        $this->assertEquals($user->id, $paymentMethod->user->id);
    }

    public function test_payment_method_has_many_transactions()
    {
        $user = User::factory()->create();
        $paymentMethod = PaymentMethod::factory()->create(['user_id' => $user->id]);

        $transaction1 = Transaction::factory()->create([
            'user_id' => $user->id,
            'payment_method_id' => $paymentMethod->id,
        ]);

        $transaction2 = Transaction::factory()->create([
            'user_id' => $user->id,
            'payment_method_id' => $paymentMethod->id,
        ]);

        $this->assertCount(2, $paymentMethod->transactions);
        $this->assertEquals($transaction1->id, $paymentMethod->transactions->first()->id);
        $this->assertEquals($transaction2->id, $paymentMethod->transactions->last()->id);
    }

    public function test_is_default_is_casted_to_boolean()
    {
        $paymentMethod = PaymentMethod::factory()->create(['is_default' => true]);

        $this->assertIsBool($paymentMethod->is_default);
        $this->assertTrue($paymentMethod->is_default);
    }

    public function test_first_payment_method_becomes_default_automatically()
    {
        $user = User::factory()->create();
        $paymentMethod = PaymentMethod::factory()->create([
            'user_id' => $user->id,
            'is_default' => false,
        ]);

        $this->assertTrue($paymentMethod->fresh()->is_default);
    }

    public function test_setting_new_default_clears_other_defaults()
    {
        $user = User::factory()->create();

        $pm1 = PaymentMethod::factory()->create([
            'user_id' => $user->id,
            'is_default' => true,
        ]);

        $pm2 = PaymentMethod::factory()->create([
            'user_id' => $user->id,
            'is_default' => false,
        ]);

        $this->assertTrue($pm2->fresh()->is_default);
        $this->assertFalse($pm1->fresh()->is_default);
    }
}
