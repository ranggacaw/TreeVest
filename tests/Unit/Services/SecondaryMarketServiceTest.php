<?php

namespace Tests\Unit\Services;

use App\Enums\AuditEventType;
use App\Enums\InvestmentStatus;
use App\Enums\ListingStatus;
use App\Models\Investment;
use App\Models\MarketListing;
use App\Models\User;
use App\Services\SecondaryMarketService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SecondaryMarketServiceTest extends TestCase
{
    use RefreshDatabase;

    protected SecondaryMarketService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(SecondaryMarketService::class);
    }

    public function test_create_listing_requires_kyc_verified_seller()
    {
        $seller = User::factory()->create(['kyc_status' => 'pending']);
        $investment = Investment::factory()->active()->create(['user_id' => $seller->id]);

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Seller must have verified KYC to create a listing.');

        $this->service->createListing($seller, $investment, 15000);
    }

    public function test_create_listing_requires_investment_ownership()
    {
        $seller = User::factory()->create(['kyc_status' => 'verified', 'kyc_verified_at' => now()]);
        $otherUser = User::factory()->create();
        $investment = Investment::factory()->active()->create(['user_id' => $otherUser->id]);

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('You do not own this investment.');

        $this->service->createListing($seller, $investment, 15000);
    }

    public function test_create_listing_requires_active_investment()
    {
        $seller = User::factory()->create(['kyc_status' => 'verified', 'kyc_verified_at' => now()]);
        $investment = Investment::factory()->matured()->create(['user_id' => $seller->id]);

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Only active investments can be listed for sale.');

        $this->service->createListing($seller, $investment, 15000);
    }

    public function test_create_listing_prevents_duplicate_active_listings()
    {
        $seller = User::factory()->create(['kyc_status' => 'verified', 'kyc_verified_at' => now()]);
        $investment = Investment::factory()->active()->create(['user_id' => $seller->id]);
        MarketListing::factory()->create([
            'investment_id' => $investment->id,
            'seller_id' => $seller->id,
            'status' => ListingStatus::Active,
        ]);

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('This investment already has an active listing.');

        $this->service->createListing($seller, $investment, 15000);
    }

    public function test_create_listing_prevents_ask_below_cost()
    {
        $seller = User::factory()->create(['kyc_status' => 'verified', 'kyc_verified_at' => now()]);
        $investment = Investment::factory()->active()->create([
            'user_id' => $seller->id,
            'amount_idr' => 10000,
        ]);

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Ask price cannot be less than the original investment amount.');

        $this->service->createListing($seller, $investment, 5000);
    }

    public function test_create_listing_calculates_fee_correctly()
    {
        $seller = User::factory()->create(['kyc_status' => 'verified', 'kyc_verified_at' => now()]);
        $investment = Investment::factory()->active()->create([
            'user_id' => $seller->id,
            'amount_idr' => 10000,
        ]);

        $askPriceIdr = 15000;
        $expectedFeeIdr = (int) ceil($askPriceIdr * 0.02);
        $expectedNetProceedsIdr = $askPriceIdr - $expectedFeeIdr;

        $listing = $this->service->createListing($seller, $investment, $askPriceIdr);

        $this->assertEquals($expectedFeeIdr, $listing->platform_fee_idr);
        $this->assertEquals($expectedNetProceedsIdr, $listing->net_proceeds_idr);
    }

    public function test_create_listing_creates_audit_log()
    {
        $seller = User::factory()->create(['kyc_status' => 'verified', 'kyc_verified_at' => now()]);
        $investment = Investment::factory()->active()->create(['user_id' => $seller->id, 'amount_idr' => 10000]);

        $this->service->createListing($seller, $investment, 15000);

        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $seller->id,
            'event_type' => AuditEventType::LISTING_CREATED,
        ]);
    }

    public function test_create_listing_transitions_investment_to_listed()
    {
        $seller = User::factory()->create(['kyc_status' => 'verified', 'kyc_verified_at' => now()]);
        $investment = Investment::factory()->active()->create(['user_id' => $seller->id, 'amount_idr' => 10000]);

        $this->service->createListing($seller, $investment, 15000);

        $this->assertEquals(InvestmentStatus::Listed, $investment->refresh()->status);
    }

    public function test_cancel_listing_allows_seller()
    {
        $seller = User::factory()->create(['kyc_status' => 'verified', 'kyc_verified_at' => now()]);
        $investment = Investment::factory()->create([
            'user_id' => $seller->id,
            'status' => InvestmentStatus::Listed,
        ]);
        $listing = MarketListing::factory()->active()->create([
            'investment_id' => $investment->id,
            'seller_id' => $seller->id,
        ]);

        $this->service->cancelListing($listing, $seller);

        $this->assertEquals(ListingStatus::Cancelled, $listing->refresh()->status);
        $this->assertEquals(InvestmentStatus::Active, $investment->refresh()->status);
    }

    public function test_cancel_listing_allows_admin()
    {
        $seller = User::factory()->create(['kyc_status' => 'verified', 'kyc_verified_at' => now()]);
        $investment = Investment::factory()->create([
            'user_id' => $seller->id,
            'status' => InvestmentStatus::Listed,
        ]);
        $listing = MarketListing::factory()->active()->create([
            'investment_id' => $investment->id,
            'seller_id' => $seller->id,
        ]);
        $admin = User::factory()->create(['role' => 'admin']);

        $this->service->cancelListing($listing, $admin);

        $this->assertEquals(ListingStatus::Cancelled, $listing->refresh()->status);
    }

    public function test_cancel_listing_prevents_non_seller_non_admin()
    {
        $seller = User::factory()->create(['kyc_status' => 'verified', 'kyc_verified_at' => now()]);
        $investment = Investment::factory()->create([
            'user_id' => $seller->id,
            'status' => InvestmentStatus::Listed,
        ]);
        $listing = MarketListing::factory()->active()->create([
            'investment_id' => $investment->id,
            'seller_id' => $seller->id,
        ]);
        $otherUser = User::factory()->create();

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('You are not authorized to cancel this listing.');

        $this->service->cancelListing($listing, $otherUser);
    }

    public function test_cancel_listing_prevents_cancelling_non_active_listing()
    {
        $seller = User::factory()->create(['kyc_status' => 'verified', 'kyc_verified_at' => now()]);
        $investment = Investment::factory()->create([
            'user_id' => $seller->id,
            'status' => InvestmentStatus::Listed,
        ]);
        $listing = MarketListing::factory()->sold()->create([
            'investment_id' => $investment->id,
            'seller_id' => $seller->id,
        ]);

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Only active listings can be cancelled.');

        $this->service->cancelListing($listing, $seller);
    }

    public function test_initiate_purchase_requires_kyc_verified_buyer()
    {
        $buyer = User::factory()->create(['kyc_status' => 'pending']);
        $listing = MarketListing::factory()->active()->create();

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Buyer must have verified KYC to purchase.');

        $this->service->initiatePurchase($listing, $buyer);
    }

    public function test_initiate_purchase_prevents_buying_own_listing()
    {
        $seller = User::factory()->create(['kyc_status' => 'verified', 'kyc_verified_at' => now()]);
        $listing = MarketListing::factory()->active()->create(['seller_id' => $seller->id]);

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('You cannot purchase your own listing.');

        $this->service->initiatePurchase($listing, $seller);
    }

    public function test_initiate_purchase_prevents_buying_non_active_listing()
    {
        $buyer = User::factory()->create(['kyc_status' => 'verified', 'kyc_verified_at' => now()]);
        $listing = MarketListing::factory()->sold()->create();

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('This listing is no longer available.');

        $this->service->initiatePurchase($listing, $buyer);
    }

    public function test_expire_listings_transitions_expired_active_listings()
    {
        $seller = User::factory()->create(['kyc_status' => 'verified', 'kyc_verified_at' => now()]);
        $investment = Investment::factory()->create([
            'user_id' => $seller->id,
            'status' => InvestmentStatus::Listed,
        ]);
        MarketListing::factory()->active()->create([
            'investment_id' => $investment->id,
            'seller_id' => $seller->id,
            'expires_at' => now()->subDay(),
        ]);

        $expiredCount = $this->service->expireListings();

        $this->assertEquals(1, $expiredCount);
        $this->assertEquals(InvestmentStatus::Active, $investment->refresh()->status);
    }

    public function test_expire_listings_returns_zero_when_no_expired()
    {
        $seller = User::factory()->create(['kyc_status' => 'verified', 'kyc_verified_at' => now()]);
        $investment = Investment::factory()->create([
            'user_id' => $seller->id,
            'status' => InvestmentStatus::Listed,
        ]);
        MarketListing::factory()->active()->create([
            'investment_id' => $investment->id,
            'seller_id' => $seller->id,
            'expires_at' => now()->addWeek(),
        ]);

        $expiredCount = $this->service->expireListings();

        $this->assertEquals(0, $expiredCount);
    }
}
