<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\Category;

class SitemapController extends Controller
{
    public function index()
    {
        $articles = Article::published()
            ->orderBy('updated_at', 'desc')
            ->get();

        $categories = Category::all();

        return response()->view('sitemap', [
            'articles' => $articles,
            'categories' => $categories,
        ])->header('Content-Type', 'application/xml');
    }
}
