<?php

namespace Tests\Feature;

use App\Enums\InvestmentStatus;
use App\Enums\ListingStatus;
use App\Models\FruitType;
use App\Models\Investment;
use App\Models\MarketListing;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SecondaryMarketListingTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create([
            'kyc_status' => 'verified',
            'kyc_verified_at' => now(),
        ]);
    }

    public function test_browse_listings_shows_active_listings()
    {
        $listings = MarketListing::factory()->active()->count(5)->create();

        $response = $this
            ->actingAs($this->user)
            ->get(route('secondary-market.index'));

        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->component('SecondaryMarket/Index')
                ->has('listings.data', 5)
        );
    }

    public function test_browse_listings_filters_by_fruit_type()
    {
        $fruitType1 = FruitType::factory()->create();
        $fruitType2 = FruitType::factory()->create();

        $listing1 = MarketListing::factory()->active()->create();
        $listing1->investment->tree->update(['fruit_type_id' => $fruitType1->id]);

        $listing2 = MarketListing::factory()->active()->create();
        $listing2->investment->tree->update(['fruit_type_id' => $fruitType2->id]);

        $response = $this
            ->actingAs($this->user)
            ->get(route('secondary-market.index', [
                'fruit_type_id' => $fruitType1->id,
            ]));

        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->where('filters.fruit_type_id', $fruitType1->id)
                ->has('listings.data', 1)
        );
    }

    public function test_browse_listings_filters_by_price_range()
    {
        MarketListing::factory()->active()->create(['ask_price_cents' => 5000]);
        MarketListing::factory()->active()->create(['ask_price_cents' => 15000]);
        MarketListing::factory()->active()->create(['ask_price_cents' => 25000]);

        $response = $this
            ->actingAs($this->user)
            ->get(route('secondary-market.index', [
                'min_price_cents' => 10000,
                'max_price_cents' => 20000,
            ]));

        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->has('listings.data', 1)
        );
    }

    public function test_browse_listings_paginates_results()
    {
        MarketListing::factory()->active()->count(15)->create();

        $response = $this
            ->actingAs($this->user)
            ->get(route('secondary-market.index'));

        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->has('listings.data', 12)
                ->where('listings.current_page', 1)
                ->where('listings.last_page', 2)
        );
    }

    public function test_show_listing_displays_details()
    {
        $listing = MarketListing::factory()->active()->create();

        $response = $this
            ->actingAs($this->user)
            ->get(route('secondary-market.show', $listing));

        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->component('SecondaryMarket/Show')
                ->where('listing.id', $listing->id)
        );
    }

    public function test_create_listing_requires_authentication()
    {
        $response = $this->get(route('secondary-market.create'));

        $response->assertRedirectToRoute('login');
    }

    public function test_create_listing_requires_kyc_verification()
    {
        $unverifiedUser = User::factory()->create(['kyc_status' => 'pending']);

        $response = $this
            ->actingAs($unverifiedUser)
            ->get(route('secondary-market.create'));

        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->where('activeInvestments', fn ($investments) => $investments->count() === 0)
        );
    }

    public function test_create_listing_page_shows_active_investments()
    {
        $investment1 = Investment::factory()->active()->create(['user_id' => $this->user->id]);
        $investment2 = Investment::factory()->active()->create(['user_id' => $this->user->id]);
        Investment::factory()->matured()->create(['user_id' => $this->user->id]);

        $response = $this
            ->actingAs($this->user)
            ->get(route('secondary-market.create'));

        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->has('activeInvestments', 2)
        );
    }

    public function test_store_listing_requires_kyc_verified()
    {
        $unverifiedUser = User::factory()->create(['kyc_status' => 'pending']);
        $investment = Investment::factory()->active()->create(['user_id' => $unverifiedUser->id]);

        $response = $this
            ->actingAs($unverifiedUser)
            ->post(route('secondary-market.store'), [
                'investment_id' => $investment->id,
                'ask_price_cents' => 15000,
            ]);

        $response->assertStatus(403);
    }

    public function test_store_listing_with_valid_data()
    {
        $investment = Investment::factory()->active()->create([
            'user_id' => $this->user->id,
            'amount_cents' => 10000,
        ]);

        $response = $this
            ->actingAs($this->user)
            ->post(route('secondary-market.store'), [
                'investment_id' => $investment->id,
                'ask_price_cents' => 15000,
                'notes' => 'Reason for selling',
            ]);

        $response->assertRedirect(route('secondary-market.show', 1));
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('market_listings', [
            'investment_id' => $investment->id,
            'seller_id' => $this->user->id,
            'ask_price_cents' => 15000,
            'status' => ListingStatus::Active,
        ]);

        $this->assertEquals(InvestmentStatus::Listed, $investment->refresh()->status);
    }

    public function test_store_listing_validates_ask_price_greater_than_cost()
    {
        $investment = Investment::factory()->active()->create([
            'user_id' => $this->user->id,
            'amount_cents' => 10000,
        ]);

        $response = $this
            ->actingAs($this->user)
            ->post(route('secondary-market.store'), [
                'investment_id' => $investment->id,
                'ask_price_cents' => 5000,
            ]);

        $response->assertSessionHasErrors();
    }

    public function test_store_listing_validates_investment_ownership()
    {
        $otherUser = User::factory()->create(['kyc_status' => 'verified', 'kyc_verified_at' => now()]);
        $investment = Investment::factory()->active()->create(['user_id' => $otherUser->id]);

        $response = $this
            ->actingAs($this->user)
            ->post(route('secondary-market.store'), [
                'investment_id' => $investment->id,
                'ask_price_cents' => 15000,
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('error');
    }

    public function test_store_listing_validates_investment_status()
    {
        $investment = Investment::factory()->matured()->create([
            'user_id' => $this->user->id,
        ]);

        $response = $this
            ->actingAs($this->user)
            ->post(route('secondary-market.store'), [
                'investment_id' => $investment->id,
                'ask_price_cents' => 15000,
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('error');
    }

    public function test_cancel_listing_allows_seller()
    {
        $investment = Investment::factory()->create([
            'user_id' => $this->user->id,
            'status' => InvestmentStatus::Listed,
        ]);
        $listing = MarketListing::factory()->active()->create([
            'investment_id' => $investment->id,
            'seller_id' => $this->user->id,
        ]);

        $response = $this
            ->actingAs($this->user)
            ->delete(route('secondary-market.destroy', $listing));

        $response->assertRedirect(route('investments.show', $investment->id));
        $response->assertSessionHas('success');

        $this->assertEquals(ListingStatus::Cancelled, $listing->refresh()->status);
        $this->assertEquals(InvestmentStatus::Active, $investment->refresh()->status);
    }

    public function test_cancel_listing_prevents_non_seller()
    {
        $otherUser = User::factory()->create(['kyc_status' => 'verified', 'kyc_verified_at' => now()]);
        $investment = Investment::factory()->create([
            'user_id' => $otherUser->id,
            'status' => InvestmentStatus::Listed,
        ]);
        $listing = MarketListing::factory()->active()->create([
            'investment_id' => $investment->id,
            'seller_id' => $otherUser->id,
        ]);

        $response = $this
            ->actingAs($this->user)
            ->delete(route('secondary-market.destroy', $listing));

        $response->assertRedirect();
        $response->assertSessionHas('error');

        $this->assertEquals(ListingStatus::Active, $listing->refresh()->status);
    }

    public function test_cancel_listing_prevents_cancelling_sold_listing()
    {
        $investment = Investment::factory()->create([
            'user_id' => $this->user->id,
            'status' => InvestmentStatus::Sold,
        ]);
        $listing = MarketListing::factory()->sold()->create([
            'investment_id' => $investment->id,
            'seller_id' => $this->user->id,
        ]);

        $response = $this
            ->actingAs($this->user)
            ->delete(route('secondary-market.destroy', $listing));

        $response->assertRedirect();
        $response->assertSessionHas('error');

        $this->assertEquals(ListingStatus::Sold, $listing->refresh()->status);
    }

    public function test_create_listing_prevents_duplicate_active_listing()
    {
        $investment = Investment::factory()->active()->create(['user_id' => $this->user->id]);
        MarketListing::factory()->active()->create([
            'investment_id' => $investment->id,
            'seller_id' => $this->user->id,
        ]);

        $response = $this
            ->actingAs($this->user)
            ->post(route('secondary-market.store'), [
                'investment_id' => $investment->id,
                'ask_price_cents' => 15000,
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('error');

        $this->assertDatabaseCount('market_listings', 1);
    }
}
