<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Category;
use App\Models\Tag;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ArticleController extends Controller
{
    public function index()
    {
        $articles = Article::with(['categories', 'tags', 'author'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('Admin/Articles/Index', [
            'articles' => $articles,
        ]);
    }

    public function create()
    {
        $categories = Category::all();
        $tags = Tag::all();

        return Inertia::render('Admin/Articles/Create', [
            'categories' => $categories,
            'tags' => $tags,
        ]);
    }

    public function store(Request $request)
    {
        $request->merge([
            'slug' => $request->slug ?: \Illuminate\Support\Str::slug($request->title),
        ]);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:articles,slug',
            'content' => 'required|string',
            'excerpt' => 'nullable|string|max:500',
            'featured_image' => 'nullable|string|max:500',
            'status' => 'required|in:draft,published',
            'category_ids' => 'required|array|min:1',
            'category_ids.*' => 'exists:categories,id',
            'tag_ids' => 'nullable|array',
            'tag_ids.*' => 'exists:tags,id',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:160',
            'meta_keywords' => 'nullable|string|max:255',
        ]);

        $article = Article::create([
            'title' => $validated['title'],
            'slug' => $validated['slug'],
            'content' => $validated['content'],
            'excerpt' => $validated['excerpt'] ?? null,
            'featured_image' => $validated['featured_image'] ?? null,
            'status' => $validated['status'],
            'published_at' => $validated['status'] === 'published' ? now() : null,
            'author_id' => auth()->id(),
            'meta_title' => $validated['meta_title'] ?? null,
            'meta_description' => $validated['meta_description'] ?? null,
            'meta_keywords' => $validated['meta_keywords'] ?? null,
        ]);

        $article->categories()->sync($validated['category_ids']);
        $article->tags()->sync($validated['tag_ids'] ?? []);

        return redirect()->route('admin.articles.index')->with('success', 'Article created successfully.');
    }

    public function edit(Article $article)
    {
        $article->load(['categories', 'tags']);
        $categories = Category::all();
        $tags = Tag::all();

        return Inertia::render('Admin/Articles/Edit', [
            'article' => $article,
            'categories' => $categories,
            'tags' => $tags,
        ]);
    }

    public function update(Request $request, Article $article)
    {
        $request->merge([
            'slug' => $request->slug ?: \Illuminate\Support\Str::slug($request->title),
        ]);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:articles,slug',
            'content' => 'required|string',
            'excerpt' => 'nullable|string|max:500',
            'featured_image' => 'nullable|string|max:500',
            'status' => 'required|in:draft,published',
            'category_ids' => 'required|array|min:1',
            'category_ids.*' => 'exists:categories,id',
            'tag_ids' => 'nullable|array',
            'tag_ids.*' => 'exists:tags,id',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:160',
            'meta_keywords' => 'nullable|string|max:255',
        ]);

        $article->update([
            'title' => $validated['title'],
            'slug' => $validated['slug'],
            'content' => $validated['content'],
            'excerpt' => $validated['excerpt'] ?? null,
            'featured_image' => $validated['featured_image'] ?? null,
            'status' => $validated['status'],
            'published_at' => $validated['status'] === 'published' && ! $article->published_at ? now() : $article->published_at,
            'meta_title' => $validated['meta_title'] ?? null,
            'meta_description' => $validated['meta_description'] ?? null,
            'meta_keywords' => $validated['meta_keywords'] ?? null,
        ]);

        $article->categories()->sync($validated['category_ids']);
        $article->tags()->sync($validated['tag_ids'] ?? []);

        return redirect()->route('admin.articles.index')->with('success', 'Article updated successfully.');
    }

    public function destroy(Article $article)
    {
        $article->delete();

        return redirect()->route('admin.articles.index')->with('success', 'Article deleted successfully.');
    }

    public function publish(Article $article)
    {
        $article->publish();

        return back()->with('success', 'Article published successfully.');
    }

    public function unpublish(Article $article)
    {
        $article->unpublish();

        return back()->with('success', 'Article unpublished successfully.');
    }
}
