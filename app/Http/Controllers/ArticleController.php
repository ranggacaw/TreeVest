<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ArticleController extends Controller
{
    public function index(Request $request)
    {
        $category = $request->get('category');
        $tag = $request->get('tag');
        $search = $request->get('search');

        $cacheKey = "articles:{$category}:{$tag}:".md5($search ?? '');

        $articles = cache()->remember($cacheKey, 300, function () use ($category, $tag, $search) {
            $query = Article::published()->with(['categories', 'tags', 'author']);

            if ($category) {
                $query->whereHas('categories', function ($q) use ($category) {
                    $q->where('slug', $category);
                });
            }

            if ($tag) {
                $query->whereHas('tags', function ($q) use ($tag) {
                    $q->where('slug', $tag);
                });
            }

            if ($search) {
                $query->searchWithRanking($search);
            } else {
                $query->orderBy('published_at', 'desc');
            }

            return $query->paginate(12);
        });

        $categories = cache()->remember('categories:all', 3600, function () {
            return Category::all();
        });

        return Inertia::render('Education/Index', [
            'articles' => $articles,
            'categories' => $categories,
            'filters' => [
                'category' => $category,
                'tag' => $tag,
                'search' => $search,
            ],
        ]);
    }

    public function show(Article $article)
    {
        if (! $article->isPublished()) {
            abort(404);
        }

        $article->incrementViewCount();
        $article->load(['categories', 'tags', 'author']);

        $relatedCacheKey = "article:{$article->id}:related";

        $relatedArticles = cache()->remember($relatedCacheKey, 600, function () use ($article) {
            return Article::published()
                ->where('id', '!=', $article->id)
                ->whereHas('categories', function ($q) use ($article) {
                    $q->whereIn('categories.id', $article->categories->pluck('id'));
                })
                ->limit(4)
                ->get();
        });

        return Inertia::render('Education/Show', [
            'article' => $article,
            'relatedArticles' => $relatedArticles,
        ]);
    }
}
