<?php

namespace Tests\Feature;

use App\Models\Tree;
use App\Models\User;
use App\Models\WishlistItem;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class WishlistControllerTest extends TestCase
{
    use RefreshDatabase;

    // ─── Index ─────────────────────────────────────────────────────────────────

    public function test_investor_can_view_wishlist_page(): void
    {
        $investor = User::factory()->create(['role' => 'investor']);

        $response = $this->actingAs($investor)->get(route('investor.wishlist.index'));

        $response->assertStatus(200);
        $response->assertInertia(
            fn (Assert $page) => $page->component('Investor/Wishlist')
        );
    }

    public function test_wishlist_page_returns_items_for_user(): void
    {
        $investor = User::factory()->create(['role' => 'investor']);
        $tree = Tree::factory()->create();

        WishlistItem::create([
            'user_id' => $investor->id,
            'wishlistable_type' => Tree::class,
            'wishlistable_id' => $tree->id,
        ]);

        $response = $this->actingAs($investor)->get(route('investor.wishlist.index'));

        $response->assertInertia(
            fn (Assert $page) => $page
                ->component('Investor/Wishlist')
                ->has('items', 1)
        );
    }

    public function test_guest_cannot_view_wishlist(): void
    {
        $response = $this->get(route('investor.wishlist.index'));

        $response->assertRedirect(route('login'));
    }

    public function test_non_investor_cannot_view_wishlist(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->get(route('investor.wishlist.index'));

        $response->assertStatus(403);
    }

    // ─── Toggle ────────────────────────────────────────────────────────────────

    public function test_toggle_adds_tree_to_wishlist(): void
    {
        $investor = User::factory()->create(['role' => 'investor']);
        $tree = Tree::factory()->create();

        $response = $this->actingAs($investor)->post(route('investor.wishlist.toggle'), [
            'type' => 'tree',
            'id' => $tree->id,
        ]);

        $response->assertStatus(200);
        $response->assertJson(['wishlisted' => true]);

        $this->assertDatabaseHas('wishlist_items', [
            'user_id' => $investor->id,
            'wishlistable_type' => Tree::class,
            'wishlistable_id' => $tree->id,
        ]);
    }

    public function test_toggle_removes_tree_already_in_wishlist(): void
    {
        $investor = User::factory()->create(['role' => 'investor']);
        $tree = Tree::factory()->create();

        WishlistItem::create([
            'user_id' => $investor->id,
            'wishlistable_type' => Tree::class,
            'wishlistable_id' => $tree->id,
        ]);

        $response = $this->actingAs($investor)->post(route('investor.wishlist.toggle'), [
            'type' => 'tree',
            'id' => $tree->id,
        ]);

        $response->assertStatus(200);
        $response->assertJson(['wishlisted' => false]);

        $this->assertDatabaseMissing('wishlist_items', [
            'user_id' => $investor->id,
            'wishlistable_type' => Tree::class,
            'wishlistable_id' => $tree->id,
        ]);
    }

    public function test_toggle_with_invalid_type_returns_error(): void
    {
        $investor = User::factory()->create(['role' => 'investor']);

        $response = $this->actingAs($investor)->post(route('investor.wishlist.toggle'), [
            'type' => 'invalid_type',
            'id' => 1,
        ]);

        $response->assertStatus(422);
    }

    public function test_guest_cannot_toggle_wishlist(): void
    {
        $tree = Tree::factory()->create();

        $response = $this->post(route('investor.wishlist.toggle'), [
            'type' => 'tree',
            'id' => $tree->id,
        ]);

        $response->assertRedirect(route('login'));
    }

    public function test_different_users_wishlists_are_independent(): void
    {
        $investor1 = User::factory()->create(['role' => 'investor']);
        $investor2 = User::factory()->create(['role' => 'investor']);
        $tree = Tree::factory()->create();

        $this->actingAs($investor1)->post(route('investor.wishlist.toggle'), [
            'type' => 'tree',
            'id' => $tree->id,
        ]);

        $this->assertDatabaseHas('wishlist_items', ['user_id' => $investor1->id, 'wishlistable_id' => $tree->id]);
        $this->assertDatabaseMissing('wishlist_items', ['user_id' => $investor2->id, 'wishlistable_id' => $tree->id]);
    }
}
