<?php

namespace Tests\Feature;

use App\Enums\InvestmentStatus;
use App\Enums\ListingStatus;
use App\Models\Investment;
use App\Models\MarketListing;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminMarketListingTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected User $seller;

    protected User $regularUser;

    protected Investment $investment;

    protected MarketListing $listing;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->admin()->create();
        $this->seller = User::factory()->create([
            'kyc_status' => 'verified',
            'kyc_verified_at' => now(),
        ]);
        $this->regularUser = User::factory()->investor()->create();

        $this->investment = Investment::factory()->create([
            'user_id' => $this->seller->id,
            'status' => InvestmentStatus::Listed,
        ]);

        $this->listing = MarketListing::factory()->active()->create([
            'investment_id' => $this->investment->id,
            'seller_id' => $this->seller->id,
        ]);
    }

    public function test_admin_can_access_market_listings_index()
    {
        $response = $this
            ->actingAs($this->admin)
            ->get(route('admin.market-listings.index'));

        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->component('Admin/MarketListings/Index')
                ->has('listings.data', 1)
        );
    }

    public function test_non_admin_cannot_access_market_listings_index()
    {
        $response = $this
            ->actingAs($this->regularUser)
            ->get(route('admin.market-listings.index'));

        $response->assertStatus(403);
    }

    public function test_admin_index_shows_all_listings()
    {
        MarketListing::factory()->active()->count(3)->create();
        MarketListing::factory()->sold()->count(2)->create();
        MarketListing::factory()->cancelled()->count(1)->create();

        $response = $this
            ->actingAs($this->admin)
            ->get(route('admin.market-listings.index'));

        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->has('listings.data', 7)
        );
    }

    public function test_admin_can_filter_by_status()
    {
        MarketListing::factory()->active()->count(3)->create();
        MarketListing::factory()->sold()->count(2)->create();

        $response = $this
            ->actingAs($this->admin)
            ->get(route('admin.market-listings.index', [
                'status' => ListingStatus::Active->value,
            ]));

        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->where('filters.status', ListingStatus::Active->value)
                ->has('listings.data', 4)
        );
    }

    public function test_admin_index_paginates_results()
    {
        MarketListing::factory()->count(25)->create();

        $response = $this
            ->actingAs($this->admin)
            ->get(route('admin.market-listings.index'));

        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->has('listings.data', 20)
                ->where('listings.current_page', 1)
                ->where('listings.last_page', 2)
        );
    }

    public function test_admin_index_includes_investment_and_seller_details()
    {
        $response = $this
            ->actingAs($this->admin)
            ->get(route('admin.market-listings.index'));

        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->where('listings.data.0.investment.id', $this->investment->id)
                ->where('listings.data.0.seller.id', $this->seller->id)
        );
    }

    public function test_admin_can_force_cancel_active_listing()
    {
        $response = $this
            ->actingAs($this->admin)
            ->delete(route('admin.market-listings.destroy', $this->listing));

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertEquals(ListingStatus::Cancelled, $this->listing->refresh()->status);
        $this->assertEquals(InvestmentStatus::Active, $this->investment->refresh()->status);
    }

    public function test_admin_force_cancel_creates_audit_log()
    {
        $this
            ->actingAs($this->admin)
            ->delete(route('admin.market-listings.destroy', $this->listing));

        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $this->admin->id,
            'event_type' => 'listing_admin_cancelled',
        ]);
    }

    public function test_non_admin_cannot_cancel_listing()
    {
        $response = $this
            ->actingAs($this->regularUser)
            ->delete(route('admin.market-listings.destroy', $this->listing));

        $response->assertStatus(403);

        $this->assertEquals(ListingStatus::Active, $this->listing->refresh()->status);
    }

    public function test_admin_cannot_cancel_already_sold_listing()
    {
        $this->listing->update(['status' => ListingStatus::Sold]);

        $response = $this
            ->actingAs($this->admin)
            ->delete(route('admin.market-listings.destroy', $this->listing));

        $response->assertRedirect();
        $response->assertSessionHas('error');

        $this->assertEquals(ListingStatus::Sold, $this->listing->refresh()->status);
    }

    public function test_admin_can_view_sold_listings()
    {
        $soldListing = MarketListing::factory()->sold()->create([
            'investment_id' => $this->investment->id,
            'seller_id' => $this->seller->id,
            'buyer_id' => $this->regularUser->id,
        ]);

        $response = $this
            ->actingAs($this->admin)
            ->get(route('admin.market-listings.index', [
                'status' => ListingStatus::Sold->value,
            ]));

        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->where('listings.data.0.id', $soldListing->id)
                ->where('listings.data.0.status', ListingStatus::Sold->value)
        );
    }

    public function test_admin_can_view_cancelled_listings()
    {
        $cancelledListing = MarketListing::factory()->cancelled()->create([
            'investment_id' => $this->investment->id,
            'seller_id' => $this->seller->id,
        ]);

        $response = $this
            ->actingAs($this->admin)
            ->get(route('admin.market-listings.index', [
                'status' => ListingStatus::Cancelled->value,
            ]));

        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->where('listings.data.0.id', $cancelledListing->id)
                ->where('listings.data.0.status', ListingStatus::Cancelled->value)
        );
    }
}
