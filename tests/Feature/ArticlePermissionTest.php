<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ArticlePermissionTest extends TestCase
{
    use RefreshDatabase;

    public function test_non_admin_cannot_access_admin_article_routes(): void
    {
        $user = User::factory()->create([
            'role' => 'investor',
        ]);

        $this->actingAs($user);

        $response = $this->get(route('admin.articles.index'));
        $response->assertStatus(403);
    }

    public function test_farm_owner_cannot_access_admin_article_routes(): void
    {
        $user = User::factory()->create([
            'role' => 'farm_owner',
        ]);

        $this->actingAs($user);

        $response = $this->get(route('admin.articles.index'));
        $response->assertStatus(403);
    }

    public function test_guest_cannot_access_admin_article_routes(): void
    {
        $response = $this->get(route('admin.articles.index'));
        $response->assertRedirect('/login');
    }
}
