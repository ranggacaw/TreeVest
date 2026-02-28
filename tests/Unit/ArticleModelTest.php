<?php

namespace Tests\Unit;

use App\Models\Article;
use App\Models\Category;
use App\Models\Tag;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ArticleModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_article_can_be_created(): void
    {
        $article = Article::factory()->create([
            'title' => 'Test Article',
            'slug' => 'test-article',
            'content' => 'Test content',
            'excerpt' => 'Test excerpt',
            'status' => 'draft',
        ]);

        $this->assertDatabaseHas('articles', [
            'title' => 'Test Article',
            'slug' => 'test-article',
        ]);
    }

    public function test_article_slug_is_auto_generated(): void
    {
        $user = \App\Models\User::factory()->create();
        $article = Article::create([
            'author_id' => $user->id,
            'title' => 'Test Article With Custom Title',
            'content' => 'Test content',
            'status' => 'draft',
        ]);

        $this->assertEquals('test-article-with-custom-title', $article->slug);
    }

    public function test_article_can_be_published(): void
    {
        $article = Article::factory()->create([
            'title' => 'Test Article',
            'slug' => 'test-article',
            'content' => 'Test content',
            'status' => 'draft',
        ]);

        $article->publish();

        $this->assertEquals('published', $article->status);
        $this->assertNotNull($article->published_at);
    }

    public function test_article_can_be_unpublished(): void
    {
        $article = Article::factory()->create([
            'title' => 'Test Article',
            'slug' => 'test-article',
            'content' => 'Test content',
            'status' => 'published',
            'published_at' => now(),
        ]);

        $article->unpublish();

        $this->assertEquals('draft', $article->status);
    }

    public function test_article_view_count_can_be_incremented(): void
    {
        $article = Article::factory()->create([
            'title' => 'Test Article',
            'slug' => 'test-article',
            'content' => 'Test content',
            'status' => 'published',
            'view_count' => 0,
        ]);

        $article->incrementViewCount();

        $this->assertEquals(1, $article->fresh()->view_count);
    }

    public function test_published_scope_returns_only_published_articles(): void
    {
        Article::factory()->create([
            'title' => 'Published Article',
            'slug' => 'published-article',
            'content' => 'Content',
            'status' => 'published',
        ]);

        Article::factory()->create([
            'title' => 'Draft Article',
            'slug' => 'draft-article',
            'content' => 'Content',
            'status' => 'draft',
        ]);

        $publishedArticles = Article::published()->get();

        $this->assertEquals(1, $publishedArticles->count());
        $this->assertEquals('Published Article', $publishedArticles->first()->title);
    }

    public function test_article_has_categories_relationship(): void
    {
        $article = Article::factory()->create([
            'title' => 'Test Article',
            'slug' => 'test-article',
            'content' => 'Test content',
            'status' => 'draft',
        ]);

        $category = Category::create([
            'name' => 'Test Category',
            'slug' => 'test-category',
        ]);

        $article->categories()->attach($category);

        $this->assertTrue($article->categories->contains($category));
    }

    public function test_article_has_tags_relationship(): void
    {
        $article = Article::factory()->create([
            'title' => 'Test Article',
            'slug' => 'test-article',
            'content' => 'Test content',
            'status' => 'draft',
        ]);

        $tag = Tag::create([
            'name' => 'Test Tag',
            'slug' => 'test-tag',
        ]);

        $article->tags()->attach($tag);

        $this->assertTrue($article->tags->contains($tag));
    }

    public function test_is_published_returns_correct_status(): void
    {
        $publishedArticle = Article::factory()->create([
            'title' => 'Published Article',
            'slug' => 'published-article',
            'content' => 'Content',
            'status' => 'published',
        ]);

        $draftArticle = Article::factory()->create([
            'title' => 'Draft Article',
            'slug' => 'draft-article',
            'content' => 'Content',
            'status' => 'draft',
        ]);

        $this->assertTrue($publishedArticle->isPublished());
        $this->assertFalse($draftArticle->isPublished());
    }

    public function test_is_draft_returns_correct_status(): void
    {
        $draftArticle = Article::factory()->create([
            'title' => 'Draft Article',
            'slug' => 'draft-article',
            'content' => 'Content',
            'status' => 'draft',
        ]);

        $publishedArticle = Article::factory()->create([
            'title' => 'Published Article',
            'slug' => 'published-article',
            'content' => 'Content',
            'status' => 'published',
        ]);

        $this->assertTrue($draftArticle->isDraft());
        $this->assertFalse($publishedArticle->isDraft());
    }
}
