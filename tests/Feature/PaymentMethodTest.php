<?php

namespace Tests\Feature;

use App\Models\PaymentMethod;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PaymentMethodTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_view_payment_methods()
    {
        $user = User::factory()->create();
        PaymentMethod::factory()->count(3)->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->get('/payment-methods');

        $response->assertStatus(200);
    }

    public function test_unauthenticated_user_cannot_access_payment_methods()
    {
        $response = $this->get('/payment-methods');

        $response->assertRedirect('/login');
    }

    public function test_authenticated_user_can_add_payment_method()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/payment-methods', [
            'stripe_payment_method_id' => 'pm_test_'.uniqid(),
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('payment_methods', [
            'user_id' => $user->id,
            'stripe_payment_method_id' => 'pm_test_'.uniqid(),
        ]);
    }

    public function test_user_can_delete_own_payment_method()
    {
        $user = User::factory()->create();
        $paymentMethod = PaymentMethod::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->delete("/payment-methods/{$paymentMethod->id}");

        $response->assertRedirect();
        $this->assertDatabaseMissing('payment_methods', [
            'id' => $paymentMethod->id,
        ]);
    }

    public function test_user_cannot_delete_other_users_payment_method()
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $paymentMethod = PaymentMethod::factory()->create(['user_id' => $user1->id]);

        $response = $this->actingAs($user2)->delete("/payment-methods/{$paymentMethod->id}");

        $response->assertStatus(403);
        $this->assertDatabaseHas('payment_methods', [
            'id' => $paymentMethod->id,
        ]);
    }

    public function test_user_can_set_payment_method_as_default()
    {
        $user = User::factory()->create();
        $pm1 = PaymentMethod::factory()->create(['user_id' => $user->id, 'is_default' => true]);
        $pm2 = PaymentMethod::factory()->create(['user_id' => $user->id, 'is_default' => false]);

        $response = $this->actingAs($user)->patch("/payment-methods/{$pm2->id}/set-default");

        $response->assertRedirect();

        $this->assertFalse($pm1->fresh()->is_default);
        $this->assertTrue($pm2->fresh()->is_default);
    }
}
