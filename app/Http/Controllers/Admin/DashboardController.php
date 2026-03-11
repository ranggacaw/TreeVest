<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Article;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(\Illuminate\Http\Request $request, \App\Services\AdminDashboardService $adminDashboardService)
    {
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');

        $metrics = $adminDashboardService->getMetrics($dateFrom, $dateTo);
        $recentActivity = $adminDashboardService->getRecentActivity();

        $popularArticles = Article::popular(5)->get();
        $staleArticles = Article::stale(6)->limit(5)->get();
        $totalArticles = Article::count();
        $publishedArticles = Article::where('status', 'published')->count();
        $draftArticles = Article::where('status', 'draft')->count();

        return Inertia::render('Admin/Dashboard', [
            'metrics' => $metrics,
            'recentActivity' => $recentActivity,
            'date_from' => $dateFrom,
            'date_to' => $dateTo,
            'popularArticles' => $popularArticles,
            'staleArticles' => $staleArticles,
            'totalArticles' => $totalArticles,
            'publishedArticles' => $publishedArticles,
            'draftArticles' => $draftArticles,
        ]);
    }

    public static function invalidateMetricsCache(): void
    {
        Cache::forget('admin.dashboard.metrics');
    }
}
