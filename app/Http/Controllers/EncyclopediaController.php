<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\Category;
use Inertia\Inertia;

class EncyclopediaController extends Controller
{
    public function index()
    {
        $encyclopediaCategories = Category::whereIn('slug', [
            'durian', 'mango', 'grapes', 'melon', 'citrus', 'other-fruits',
        ])->with(['articles' => function ($q) {
            $q->published()->orderBy('published_at', 'desc');
        }])->get();

        return Inertia::render('Encyclopedia/Index', [
            'categories' => $encyclopediaCategories,
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

        return Inertia::render('Encyclopedia/Show', [
            'article' => $article,
            'relatedArticles' => $relatedArticles,
        ]);
    }
}
