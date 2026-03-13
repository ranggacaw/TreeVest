<?php

namespace Tests\Feature;

use App\Enums\WalletTransactionType;
use App\Exceptions\InsufficientWalletBalanceException;
use App\Models\Lot;
use App\Models\User;
use App\Models\Wallet;
use App\Services\WalletService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WalletServiceTest extends TestCase
{
    use RefreshDatabase;

    private WalletService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(WalletService::class);
    }

    // -------------------------------------------------------------------------
    // getOrCreateWallet
    // -------------------------------------------------------------------------

    public function test_get_or_create_wallet_creates_wallet_for_new_user(): void
    {
        $user = User::factory()->investor()->create();

        $wallet = $this->service->getOrCreateWallet($user);

        $this->assertNotNull($wallet->id);
        $this->assertEquals($user->id, $wallet->user_id);
        $this->assertEquals(0, $wallet->balance_cents);
        $this->assertEquals('IDR', $wallet->currency);
        $this->assertFalse($wallet->is_platform);
    }

    public function test_get_or_create_wallet_returns_existing_wallet(): void
    {
        $user = User::factory()->investor()->create();
        $existing = Wallet::factory()->funded(50_000)->create(['user_id' => $user->id]);

        $wallet = $this->service->getOrCreateWallet($user);

        $this->assertEquals($existing->id, $wallet->id);
        $this->assertEquals(50_000, $wallet->balance_cents);
    }

    // -------------------------------------------------------------------------
    // credit
    // -------------------------------------------------------------------------

    public function test_credit_increases_wallet_balance(): void
    {
        $user = User::factory()->investor()->create();
        $lot = Lot::factory()->selling()->create();

        $this->service->credit($user, 100_000, WalletTransactionType::PayoutCredit, $lot);

        $wallet = Wallet::where('user_id', $user->id)->first();
        $this->assertEquals(100_000, $wallet->balance_cents);
    }

    public function test_credit_creates_wallet_transaction_record(): void
    {
        $user = User::factory()->investor()->create();
        $lot = Lot::factory()->selling()->create();

        $tx = $this->service->credit($user, 200_000, WalletTransactionType::PayoutCredit, $lot);

        $this->assertEquals('credit', $tx->type);
        $this->assertEquals(WalletTransactionType::PayoutCredit, $tx->transaction_type);
        $this->assertEquals(200_000, $tx->amount_cents);
        $this->assertEquals(200_000, $tx->balance_after_cents);
    }

    public function test_credit_accumulates_multiple_credits(): void
    {
        $user = User::factory()->investor()->create();
        $lot = Lot::factory()->selling()->create();

        $this->service->credit($user, 100_000, WalletTransactionType::PayoutCredit, $lot);
        $this->service->credit($user, 50_000, WalletTransactionType::PayoutCredit, $lot);

        $wallet = Wallet::where('user_id', $user->id)->first();
        $this->assertEquals(150_000, $wallet->balance_cents);
    }

    // -------------------------------------------------------------------------
    // debit
    // -------------------------------------------------------------------------

    public function test_debit_decreases_wallet_balance(): void
    {
        $user = User::factory()->investor()->create();
        Wallet::factory()->funded(500_000)->create(['user_id' => $user->id]);
        $lot = Lot::factory()->active()->create();

        $this->service->debit($user, 200_000, WalletTransactionType::Reinvestment, $lot);

        $wallet = Wallet::where('user_id', $user->id)->first();
        $this->assertEquals(300_000, $wallet->balance_cents);
    }

    public function test_debit_creates_wallet_transaction_record(): void
    {
        $user = User::factory()->investor()->create();
        Wallet::factory()->funded(500_000)->create(['user_id' => $user->id]);
        $lot = Lot::factory()->active()->create();

        $tx = $this->service->debit($user, 100_000, WalletTransactionType::Reinvestment, $lot);

        $this->assertEquals('debit', $tx->type);
        $this->assertEquals(WalletTransactionType::Reinvestment, $tx->transaction_type);
        $this->assertEquals(100_000, $tx->amount_cents);
        $this->assertEquals(400_000, $tx->balance_after_cents);
    }

    public function test_debit_throws_insufficient_balance_exception(): void
    {
        $user = User::factory()->investor()->create();
        Wallet::factory()->funded(10_000)->create(['user_id' => $user->id]);
        $lot = Lot::factory()->active()->create();

        $this->expectException(InsufficientWalletBalanceException::class);
        $this->service->debit($user, 50_000, WalletTransactionType::Reinvestment, $lot);
    }

    public function test_debit_does_not_allow_negative_balance(): void
    {
        $user = User::factory()->investor()->create();
        Wallet::factory()->funded(1_000)->create(['user_id' => $user->id]);
        $lot = Lot::factory()->active()->create();

        try {
            $this->service->debit($user, 2_000, WalletTransactionType::Reinvestment, $lot);
        } catch (InsufficientWalletBalanceException) {
        }

        $wallet = Wallet::where('user_id', $user->id)->first();
        $this->assertEquals(1_000, $wallet->balance_cents); // unchanged
    }

    // -------------------------------------------------------------------------
    // initiateWithdrawal
    // -------------------------------------------------------------------------

    public function test_initiate_withdrawal_debits_user_wallet(): void
    {
        $user = User::factory()->investor()->create();
        Wallet::factory()->funded(1_000_000)->create(['user_id' => $user->id]);

        $this->service->initiateWithdrawal($user, 500_000);

        $wallet = Wallet::where('user_id', $user->id)->first();
        $this->assertEquals(500_000, $wallet->balance_cents);
    }

    public function test_initiate_withdrawal_throws_for_amount_below_minimum(): void
    {
        $user = User::factory()->investor()->create();
        Wallet::factory()->funded(1_000_000)->create(['user_id' => $user->id]);

        $this->expectException(\InvalidArgumentException::class);
        $this->service->initiateWithdrawal($user, 500); // below 1000 minimum
    }

    public function test_initiate_withdrawal_throws_if_balance_insufficient(): void
    {
        $user = User::factory()->investor()->create();
        Wallet::factory()->funded(5_000)->create(['user_id' => $user->id]);

        $this->expectException(InsufficientWalletBalanceException::class);
        $this->service->initiateWithdrawal($user, 100_000);
    }

    // -------------------------------------------------------------------------
    // creditPlatform
    // -------------------------------------------------------------------------

    public function test_credit_platform_creates_or_uses_platform_wallet(): void
    {
        $lot = Lot::factory()->selling()->create();

        $this->service->creditPlatform(100_000, WalletTransactionType::PlatformFee, $lot);

        $platformWallet = Wallet::where('is_platform', true)->whereNull('user_id')->first();
        $this->assertNotNull($platformWallet);
        $this->assertEquals(100_000, $platformWallet->balance_cents);
    }

    public function test_credit_platform_accumulates_fees(): void
    {
        $lot = Lot::factory()->selling()->create();

        $this->service->creditPlatform(50_000, WalletTransactionType::PlatformFee, $lot);
        $this->service->creditPlatform(30_000, WalletTransactionType::PlatformFee, $lot);

        $platformWallet = Wallet::where('is_platform', true)->first();
        $this->assertEquals(80_000, $platformWallet->balance_cents);
    }

    // -------------------------------------------------------------------------
    // Investor wallet HTTP endpoint tests
    // -------------------------------------------------------------------------

    public function test_investor_can_withdraw_from_wallet_via_http(): void
    {
        $investor = User::factory()->investor()->create();
        Wallet::factory()->funded(1_000_000)->create(['user_id' => $investor->id]);

        $response = $this->actingAs($investor)->post(
            route('investor.wallet.withdraw'),
            ['amount_cents' => 200_000]
        );

        $response->assertRedirect();
        $wallet = Wallet::where('user_id', $investor->id)->first();
        $this->assertEquals(800_000, $wallet->balance_cents);
    }

    public function test_withdrawal_fails_validation_when_amount_below_1000(): void
    {
        $investor = User::factory()->investor()->create();
        Wallet::factory()->funded(1_000_000)->create(['user_id' => $investor->id]);

        $response = $this->actingAs($investor)->post(
            route('investor.wallet.withdraw'),
            ['amount_cents' => 500]
        );

        $response->assertSessionHasErrors('amount_cents');
    }

    public function test_withdrawal_returns_error_when_balance_insufficient(): void
    {
        $investor = User::factory()->investor()->create();
        Wallet::factory()->funded(5_000)->create(['user_id' => $investor->id]);

        $response = $this->actingAs($investor)->post(
            route('investor.wallet.withdraw'),
            ['amount_cents' => 100_000]
        );

        $response->assertSessionHasErrors('amount_cents');
    }

    public function test_unauthenticated_user_cannot_withdraw(): void
    {
        $response = $this->post(
            route('investor.wallet.withdraw'),
            ['amount_cents' => 10_000]
        );

        $response->assertRedirect(route('login'));
    }
}
