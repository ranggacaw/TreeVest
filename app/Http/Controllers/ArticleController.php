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
            $query->search($search);
        }

        $articles = $query->orderBy('published_at', 'desc')->paginate(12);
        $categories = Category::all();

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

        $relatedArticles = Article::published()
            ->where('id', '!=', $article->id)
            ->whereHas('categories', function ($q) use ($article) {
                $q->whereIn('categories.id', $article->categories->pluck('id'));
            })
            ->limit(4)
            ->get();

        return Inertia::render('Education/Show', [
            'article' => $article,
            'relatedArticles' => $relatedArticles,
        ]);
    }
}
