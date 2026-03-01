<?php

namespace Tests\Feature;

use App\Enums\AuditEventType;
use App\Enums\InvestmentStatus;
use App\Enums\ListingStatus;
use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use App\Events\ListingPurchased;
use App\Models\Investment;
use App\Models\MarketListing;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Tests\TestCase;

class SecondaryMarketPurchaseTest extends TestCase
{
    use RefreshDatabase;

    protected User $seller;

    protected User $buyer;

    protected Investment $investment;

    protected MarketListing $listing;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seller = User::factory()->create(['kyc_status' => 'verified', 'kyc_verified_at' => now()]);
        $this->buyer = User::factory()->create(['kyc_status' => 'verified', 'kyc_verified_at' => now()]);

        $this->investment = Investment::factory()->active()->create([
            'user_id' => $this->seller->id,
            'amount_cents' => 10000,
        ]);

        $this->listing = MarketListing::factory()->active()->create([
            'investment_id' => $this->investment->id,
            'seller_id' => $this->seller->id,
            'ask_price_cents' => 15000,
        ]);
    }

    public function test_happy_path_initiate_purchase_creates_transaction()
    {
        $response = $this
            ->actingAs($this->buyer)
            ->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class)
            ->post(route('secondary-market.purchase.confirm', $this->listing), [
                'payment_intent_id' => 'pi_test123',
                'transaction_id' => $transaction->id,
            ]);

        $response->assertRedirect();

        $this->assertEquals($this->buyer->id, $this->investment->refresh()->user_id);
        $this->assertEquals(InvestmentStatus::Sold, $this->investment->status);
        $this->assertEquals(ListingStatus::Sold, $this->listing->refresh()->status);
        $this->assertEquals($this->buyer->id, $this->listing->buyer_id);
        $this->assertNotNull($this->listing->purchased_at);
    }

    public function test_confirm_purchase_creates_investment_transfer()
    {
        $transaction = Transaction::factory()->create([
            'user_id' => $this->buyer->id,
            'type' => TransactionType::SecondaryPurchase,
            'status' => TransactionStatus::Pending,
            'amount_cents' => $this->listing->ask_price_cents,
        ]);

        $this
            ->actingAs($this->buyer)
            ->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class)
            ->post(route('secondary-market.purchase.confirm', $this->listing), [
                'payment_intent_id' => 'pi_test123',
                'transaction_id' => $transaction->id,
            ]);

        $this->assertDatabaseHas('investment_transfers', [
            'investment_id' => $this->investment->id,
            'listing_id' => $this->listing->id,
            'from_user_id' => $this->seller->id,
            'to_user_id' => $this->buyer->id,
            'transfer_price_cents' => $this->listing->ask_price_cents,
        ]);
    }

    public function test_confirm_purchase_marks_transaction_completed()
    {
        $transaction = Transaction::factory()->create([
            'user_id' => $this->buyer->id,
            'type' => TransactionType::SecondaryPurchase,
            'status' => TransactionStatus::Pending,
            'amount_cents' => $this->listing->ask_price_cents,
        ]);

        $this
            ->actingAs($this->buyer)
            ->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class)
            ->post(route('secondary-market.purchase.confirm', $this->listing), [
                'payment_intent_id' => 'pi_test123',
                'transaction_id' => $transaction->id,
            ]);

        $this->assertEquals(TransactionStatus::Completed, $transaction->refresh()->status);
        $this->assertNotNull($transaction->completed_at);
    }

    public function test_confirm_purchase_creates_audit_logs()
    {
        $transaction = Transaction::factory()->create([
            'user_id' => $this->buyer->id,
            'type' => TransactionType::SecondaryPurchase,
            'status' => TransactionStatus::Pending,
            'amount_cents' => $this->listing->ask_price_cents,
        ]);

        $this
            ->actingAs($this->buyer)
            ->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class)
            ->post(route('secondary-market.purchase.confirm', $this->listing), [
                'payment_intent_id' => 'pi_test123',
                'transaction_id' => $transaction->id,
            ]);

        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $this->buyer->id,
            'event_type' => AuditEventType::LISTING_PURCHASED,
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $this->buyer->id,
            'event_type' => AuditEventType::OWNERSHIP_TRANSFERRED,
        ]);
    }

    public function test_confirm_purchase_dispatches_listing_purchased_event()
    {
        Event::fake([ListingPurchased::class]);

        $transaction = Transaction::factory()->create([
            'user_id' => $this->buyer->id,
            'type' => TransactionType::SecondaryPurchase,
            'status' => TransactionStatus::Pending,
            'amount_cents' => $this->listing->ask_price_cents,
        ]);

        $this
            ->actingAs($this->buyer)
            ->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class)
            ->post(route('secondary-market.purchase.confirm', $this->listing), [
                'payment_intent_id' => 'pi_test123',
                'transaction_id' => $transaction->id,
            ]);

        Event::assertDispatched(ListingPurchased::class, function ($event) {
            return $event->listing->id === $this->listing->id
                && $event->buyer->id === $this->buyer->id
                && $event->seller->id === $this->seller->id;
        });
    }

    public function test_concurrent_purchase_second_request_fails()
    {
        $transaction1 = Transaction::factory()->create([
            'user_id' => $this->buyer->id,
            'type' => TransactionType::SecondaryPurchase,
            'status' => TransactionStatus::Pending,
            'amount_cents' => $this->listing->ask_price_cents,
        ]);

        $otherBuyer = User::factory()->create(['kyc_status' => 'verified', 'kyc_verified_at' => now()]);
        $transaction2 = Transaction::factory()->create([
            'user_id' => $otherBuyer->id,
            'type' => TransactionType::SecondaryPurchase,
            'status' => TransactionStatus::Pending,
            'amount_cents' => $this->listing->ask_price_cents,
        ]);

        $this->travelBack();

        $firstResponse = $this
            ->actingAs($this->buyer)
            ->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class)
            ->post(route('secondary-market.purchase.confirm', $this->listing), [
                'payment_intent_id' => 'pi_test1',
                'transaction_id' => $transaction1->id,
            ]);

        $firstResponse->assertRedirect();

        $secondResponse = $this
            ->actingAs($otherBuyer)
            ->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class)
            ->post(route('secondary-market.purchase.confirm', $this->listing), [
                'payment_intent_id' => 'pi_test2',
                'transaction_id' => $transaction2->id,
            ]);

        $secondResponse->assertSessionHas('error');

        $this->assertDatabaseCount('investment_transfers', 1);
        $this->assertEquals($this->buyer->id, $this->investment->refresh()->user_id);
    }

    public function test_duplicate_webhook_idempotency_prevents_double_transfer()
    {
        $transaction = Transaction::factory()->create([
            'user_id' => $this->buyer->id,
            'type' => TransactionType::SecondaryPurchase,
            'status' => TransactionStatus::Pending,
            'amount_cents' => $this->listing->ask_price_cents,
        ]);

        $this
            ->actingAs($this->buyer)
            ->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class)
            ->post(route('secondary-market.purchase.confirm', $this->listing), [
                'payment_intent_id' => 'pi_test123',
                'transaction_id' => $transaction->id,
            ]);

        $secondResponse = $this
            ->actingAs($this->buyer)
            ->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class)
            ->post(route('secondary-market.purchase.confirm', $this->listing), [
                'payment_intent_id' => 'pi_test123',
                'transaction_id' => $transaction->id,
            ]);

        $secondResponse->assertSessionHas('error');

        $this->assertDatabaseCount('investment_transfers', 1);
    }

    public function test_initiate_purchase_requires_kyc_verified_buyer()
    {
        $unverifiedBuyer = User::factory()->create(['kyc_status' => 'pending']);

        $response = $this
            ->actingAs($unverifiedBuyer)
            ->post(route('secondary-market.purchase.store', $this->listing));

        $response->assertStatus(403);
    }

    public function test_initiate_purchase_prevents_buying_own_listing()
    {
        $response = $this
            ->actingAs($this->seller)
            ->post(route('secondary-market.purchase.store', $this->listing));

        $response->assertStatus(500);
    }

    public function test_initiate_purchase_prevents_buying_sold_listing()
    {
        $this->listing->update(['status' => ListingStatus::Sold]);

        $response = $this
            ->actingAs($this->buyer)
            ->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class)
            ->post(route('secondary-market.purchase.store', $this->listing));

        $response->assertStatus(500);
    }
}
