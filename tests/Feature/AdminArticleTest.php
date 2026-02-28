<?php

namespace Tests\Feature;

use App\Models\Article;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminArticleTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create([
            'role' => 'admin',
        ]);

        $this->actingAs($this->admin);
    }

    public function test_admin_can_view_article_list(): void
    {
        $response = $this->get(route('admin.articles.index'));

        $response->assertStatus(200);
    }

    public function test_admin_can_view_create_article_page(): void
    {
        $response = $this->get(route('admin.articles.create'));

        $response->assertStatus(200);
    }

    public function test_admin_can_create_article(): void
    {
        $category = \App\Models\Category::factory()->create();

        $response = $this->post(route('admin.articles.store'), [
            'title' => 'New Article',
            'slug' => 'new-article',
            'content' => '<p>Article content</p>',
            'excerpt' => 'Article excerpt',
            'status' => 'draft',
            'category_ids' => [$category->id],
        ]);

        $this->assertDatabaseHas('articles', [
            'title' => 'New Article',
            'slug' => 'new-article',
        ]);
    }

    public function test_admin_can_view_edit_article_page(): void
    {
        $article = Article::factory()->create([
            'title' => 'Test Article',
            'slug' => 'test-article',
            'content' => 'Content',
            'status' => 'draft',
        ]);

        $response = $this->get(route('admin.articles.edit', $article->id));

        $response->assertStatus(200);
    }

    public function test_admin_can_update_article(): void
    {
        $article = Article::factory()->create([
            'title' => 'Test Article',
            'slug' => 'test-article',
            'content' => 'Content',
            'status' => 'draft',
        ]);

        $category = \App\Models\Category::factory()->create();

        $response = $this->put(route('admin.articles.update', $article->id), [
            'title' => 'Updated Title',
            'slug' => 'updated-title',
            'content' => '<p>Updated content</p>',
            'excerpt' => 'Updated excerpt',
            'status' => 'draft',
            'category_ids' => [$category->id],
        ]);

        $this->assertDatabaseHas('articles', [
            'title' => 'Updated Title',
            'slug' => 'updated-title',
        ]);
    }

    public function test_admin_can_delete_article(): void
    {
        $article = Article::factory()->create([
            'title' => 'Test Article',
            'slug' => 'test-article',
            'content' => 'Content',
            'status' => 'draft',
        ]);

        $response = $this->delete(route('admin.articles.destroy', $article->id));

        $this->assertSoftDeleted('articles', [
            'id' => $article->id,
        ]);
    }

    public function test_admin_can_publish_article(): void
    {
        $article = Article::factory()->create([
            'title' => 'Test Article',
            'slug' => 'test-article',
            'content' => 'Content',
            'status' => 'draft',
        ]);

        $response = $this->post(route('admin.articles.publish', $article->id));

        $this->assertEquals('published', $article->fresh()->status);
        $this->assertNotNull($article->fresh()->published_at);
    }

    public function test_admin_can_unpublish_article(): void
    {
        $article = Article::factory()->create([
            'title' => 'Test Article',
            'slug' => 'test-article',
            'content' => 'Content',
            'status' => 'published',
            'published_at' => now(),
        ]);

        $response = $this->post(route('admin.articles.unpublish', $article->id));

        $this->assertEquals('draft', $article->fresh()->status);
    }

    public function test_article_creation_requires_title(): void
    {
        $response = $this->post(route('admin.articles.store'), [
            'slug' => 'test-article',
            'content' => 'Content',
            'status' => 'draft',
        ]);

        $response->assertSessionHasErrors('title');
    }

    public function test_article_slug_must_be_unique(): void
    {
        $category = \App\Models\Category::factory()->create();

        Article::factory()->create([
            'title' => 'Existing Article',
            'slug' => 'existing-article',
            'content' => 'Content',
            'status' => 'draft',
        ]);

        $response = $this->post(route('admin.articles.store'), [
            'title' => 'New Article',
            'slug' => 'existing-article',
            'content' => 'Content',
            'status' => 'draft',
            'category_ids' => [$category->id],
        ]);

        $response->assertSessionHasErrors('slug');
    }
}
