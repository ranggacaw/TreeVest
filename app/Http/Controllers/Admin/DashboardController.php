<?php

namespace App\Http\Controllers\Admin;

use App\Enums\FarmStatus;
use App\Enums\HarvestStatus;
use App\Enums\InvestmentStatus;
use App\Enums\KycStatus;
use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Farm;
use App\Models\Harvest;
use App\Models\Investment;
use App\Models\KycVerification;
use App\Models\Payout;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $metrics = $this->getMetrics();

        $popularArticles = Article::popular(5)->get();
        $staleArticles = Article::stale(6)->limit(5)->get();
        $totalArticles = Article::count();
        $publishedArticles = Article::where('status', 'published')->count();
        $draftArticles = Article::where('status', 'draft')->count();

        return Inertia::render('Admin/Dashboard', [
            'metrics' => $metrics,
            'popularArticles' => $popularArticles,
            'staleArticles' => $staleArticles,
            'totalArticles' => $totalArticles,
            'publishedArticles' => $publishedArticles,
            'draftArticles' => $draftArticles,
        ]);
    }

    protected function getMetrics(): array
    {
        return Cache::remember('admin.dashboard.metrics', 300, function () {
            return [
                'total_users' => User::count(),
                'kyc_verified_users' => User::where('kyc_status', KycStatus::VERIFIED)->count(),
                'active_investments_count' => Investment::where('status', InvestmentStatus::Active)->count(),
                'total_investment_volume_cents' => Investment::where('status', InvestmentStatus::Active)->sum('amount_cents'),
                'pending_kyc_review_count' => KycVerification::where('status', KycStatus::SUBMITTED)->count(),
                'pending_farm_approval_count' => Farm::where('status', FarmStatus::PENDING_APPROVAL)->count(),
                'completed_harvests_count' => Harvest::where('status', HarvestStatus::Completed)->count(),
                'total_payouts_distributed_cents' => Payout::where('status', \App\Enums\PayoutStatus::Completed)->sum('net_amount_cents'),
            ];
        });
    }

    public static function invalidateMetricsCache(): void
    {
        Cache::forget('admin.dashboard.metrics');
    }
}
