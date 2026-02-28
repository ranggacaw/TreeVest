<?php

namespace Tests\Feature;

use App\Models\Article;
use App\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicArticleTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_can_view_education_index(): void
    {
        $response = $this->get(route('education.index'));

        $response->assertStatus(200);
    }

    public function test_public_can_view_published_article(): void
    {
        $article = Article::create([
            'title' => 'Test Article',
            'slug' => 'test-article',
            'content' => 'Test content',
            'status' => 'published',
            'published_at' => now(),
        ]);

        $response = $this->get(route('education.show', $article->slug));

        $response->assertStatus(200);
        $response->assertSee('Test Article');
    }

    public function test_public_cannot_view_draft_article(): void
    {
        $article = Article::create([
            'title' => 'Draft Article',
            'slug' => 'draft-article',
            'content' => 'Test content',
            'status' => 'draft',
        ]);

        $response = $this->get(route('education.show', $article->slug));

        $response->assertStatus(404);
    }

    public function test_article_view_count_increments_on_view(): void
    {
        $article = Article::create([
            'title' => 'Test Article',
            'slug' => 'test-article',
            'content' => 'Test content',
            'status' => 'published',
            'published_at' => now(),
            'view_count' => 0,
        ]);

        $this->get(route('education.show', $article->slug));

        $this->assertEquals(1, $article->fresh()->view_count);
    }

    public function test_education_index_shows_only_published_articles(): void
    {
        Article::create([
            'title' => 'Published Article',
            'slug' => 'published-article',
            'content' => 'Content',
            'status' => 'published',
            'published_at' => now(),
        ]);

        Article::create([
            'title' => 'Draft Article',
            'slug' => 'draft-article',
            'content' => 'Content',
            'status' => 'draft',
        ]);

        $response = $this->get(route('education.index'));

        $response->assertSee('Published Article');
        $response->assertDontSee('Draft Article');
    }

    public function test_education_index_filters_by_category(): void
    {
        $category = Category::create([
            'name' => 'Test Category',
            'slug' => 'test-category',
        ]);

        $article = Article::create([
            'title' => 'Test Article',
            'slug' => 'test-article',
            'content' => 'Content',
            'status' => 'published',
            'published_at' => now(),
        ]);

        $article->categories()->attach($category);

        $response = $this->get(route('education.index', ['category' => 'test-category']));

        $response->assertSee('Test Article');
    }

    public function test_education_index_search_works(): void
    {
        Article::create([
            'title' => 'Unique Search Term Article',
            'slug' => 'unique-search-term-article',
            'content' => 'Content about something',
            'status' => 'published',
            'published_at' => now(),
        ]);

        Article::create([
            'title' => 'Other Article',
            'slug' => 'other-article',
            'content' => 'Different content',
            'status' => 'published',
            'published_at' => now(),
        ]);

        $response = $this->get(route('education.index', ['search' => 'Unique']));

        $response->assertSee('Unique Search Term Article');
        $response->assertDontSee('Other Article');
    }
}
