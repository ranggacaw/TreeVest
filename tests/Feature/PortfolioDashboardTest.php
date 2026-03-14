<?php

namespace Tests\Feature;

use App\Models\Investment;
use App\Models\Tree;
use App\Models\User;
use App\Models\WishlistItem;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PortfolioDashboardTest extends TestCase
{
    use RefreshDatabase;

    // ─── Access ───────────────────────────────────────────────────────────────

    public function test_investor_can_access_portfolio_dashboard(): void
    {
        $investor = User::factory()->create(['role' => 'investor']);

        $response = $this->actingAs($investor)->get(route('portfolio.dashboard'));

        $response->assertStatus(200);
        $response->assertInertia(
            fn (Assert $page) => $page->component('Portfolio/Dashboard')
        );
    }

    public function test_guest_is_redirected_from_portfolio(): void
    {
        $response = $this->get(route('portfolio.dashboard'));

        $response->assertRedirect(route('login'));
    }

    public function test_non_investor_cannot_access_portfolio(): void
    {
        $farmOwner = User::factory()->create(['role' => 'farm_owner']);

        $response = $this->actingAs($farmOwner)->get(route('portfolio.dashboard'));

        $response->assertStatus(403);
    }

    // ─── Props ────────────────────────────────────────────────────────────────

    public function test_response_contains_required_props(): void
    {
        $investor = User::factory()->create(['role' => 'investor']);

        $response = $this->actingAs($investor)->get(route('portfolio.dashboard'));

        $response->assertInertia(
            fn (Assert $page) => $page
                ->component('Portfolio/Dashboard')
                ->has('summaryHeader')
                ->has('summaryHeader.total_invested_idr')
                ->has('summaryHeader.current_value_idr')
                ->has('summaryHeader.gain_loss_idr')
                ->has('summaryHeader.gain_loss_percent')
                ->has('summaryHeader.total_payouts_idr')
                ->has('summaryHeader.pending_payouts_idr')
                ->has('holdings')
                ->has('allocation')
                ->has('watchlist')
                ->has('transactions')
                ->has('activeTab')
                ->has('activeFilter')
        );
    }

    public function test_summary_header_includes_invested_amount(): void
    {
        $investor = User::factory()->create(['role' => 'investor']);
        $tree = Tree::factory()->create(['price_idr' => 10_000]);

        Investment::factory()->active()->create([
            'user_id' => $investor->id,
            'tree_id' => $tree->id,
            'amount_idr' => 50_000,
            'quantity' => 5,
        ]);

        $response = $this->actingAs($investor)->get(route('portfolio.dashboard'));

        $response->assertInertia(
            fn (Assert $page) => $page
                ->where('summaryHeader.total_invested_idr', 50_000)
        );
    }

    public function test_holdings_tab_contains_paginated_data(): void
    {
        $investor = User::factory()->create(['role' => 'investor']);

        $response = $this->actingAs($investor)->get(route('portfolio.dashboard'));

        $response->assertInertia(
            fn (Assert $page) => $page
                ->has('holdings.data')
                ->has('holdings.current_page')
                ->has('holdings.last_page')
                ->has('holdings.total')
        );
    }

    public function test_watchlist_includes_wishlisted_trees(): void
    {
        $investor = User::factory()->create(['role' => 'investor']);
        $tree = Tree::factory()->create();

        WishlistItem::create([
            'user_id' => $investor->id,
            'wishlistable_type' => Tree::class,
            'wishlistable_id' => $tree->id,
        ]);

        $response = $this->actingAs($investor)->get(route('portfolio.dashboard'));

        $response->assertInertia(
            fn (Assert $page) => $page->has('watchlist', 1)
        );
    }

    public function test_transactions_tab_contains_paginated_data(): void
    {
        $investor = User::factory()->create(['role' => 'investor']);

        $response = $this->actingAs($investor)->get(route('portfolio.dashboard'));

        $response->assertInertia(
            fn (Assert $page) => $page
                ->has('transactions.data')
                ->has('transactions.current_page')
                ->has('transactions.last_page')
                ->has('transactions.total')
        );
    }

    public function test_default_active_tab_is_holdings(): void
    {
        $investor = User::factory()->create(['role' => 'investor']);

        $response = $this->actingAs($investor)->get(route('portfolio.dashboard'));

        $response->assertInertia(
            fn (Assert $page) => $page->where('activeTab', 'holdings')
        );
    }

    public function test_tab_param_is_passed_through(): void
    {
        $investor = User::factory()->create(['role' => 'investor']);

        $response = $this->actingAs($investor)->get(route('portfolio.dashboard', ['tab' => 'transactions']));

        $response->assertInertia(
            fn (Assert $page) => $page->where('activeTab', 'transactions')
        );
    }

    public function test_allocation_data_has_expected_keys(): void
    {
        $investor = User::factory()->create(['role' => 'investor']);

        $response = $this->actingAs($investor)->get(route('portfolio.dashboard'));

        $response->assertInertia(
            fn (Assert $page) => $page
                ->has('allocation.by_fruit_type')
                ->has('allocation.by_farm')
                ->has('allocation.by_risk')
        );
    }
}
