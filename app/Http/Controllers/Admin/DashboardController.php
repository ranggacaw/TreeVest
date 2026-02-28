<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Article;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $popularArticles = Article::popular(5)->get();
        $staleArticles = Article::stale(6)->limit(5)->get();
        $totalArticles = Article::count();
        $publishedArticles = Article::where('status', 'published')->count();
        $draftArticles = Article::where('status', 'draft')->count();

        return Inertia::render('Admin/Dashboard', [
            'popularArticles' => $popularArticles,
            'staleArticles' => $staleArticles,
            'totalArticles' => $totalArticles,
            'publishedArticles' => $publishedArticles,
            'draftArticles' => $draftArticles,
        ]);
    }
}
