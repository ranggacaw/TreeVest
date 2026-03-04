<?php

namespace App\Services;

use App\Models\Harvest;
use App\Models\Investment;
use App\Models\Payout;
use App\Models\User;
use App\Enums\InvestmentStatus;
use Illuminate\Support\Facades\Cache;

class InvestorDashboardService
{
    public function getDashboardData(User $investor): array
    {
        return Cache::remember("investor.dashboard.metrics.{$investor->id}", 300, function () use ($investor) {
            $userId = $investor->id;

            $investments = Investment::where('user_id', $userId)->get();
            $activeInvestments = $investments->where('status', InvestmentStatus::Active);

            $totalInvestedCents = $activeInvestments->sum('amount_cents');
            $totalInvestmentsCount = $investments->count();
            $activeTrees = $activeInvestments->count();

            $payouts = Payout::with('investment.tree.fruitCrop.farm')
                ->where('investor_id', $userId)
                ->orderBy('created_at', 'desc')
                ->get();

            $completedPayouts = $payouts->where('status', \App\Enums\PayoutStatus::Completed);

            $totalPayoutsCents = $completedPayouts->sum('net_amount_cents');

            $portfolioRoiPercent = $totalInvestedCents > 0 ? ($totalPayoutsCents / $totalInvestedCents) * 100 : 0;

            $upcomingHarvests = Harvest::with('tree.fruitCrop.farm', 'fruitCrop.farm')
                ->whereHas('tree.investments', function ($q) use ($userId) {
                    $q->where('user_id', $userId)->where('status', InvestmentStatus::Active);
                })
                ->where('scheduled_date', '>=', now())
                ->orderBy('scheduled_date', 'asc')
                ->limit(5)
                ->get()
                ->map(function ($h) {
                    $farmName = 'Unknown';
                    $fruitType = 'Unknown';

                    if ($h->tree && $h->tree->fruitCrop) {
                        $farmName = $h->tree->fruitCrop->farm->name ?? 'Unknown';
                        $fruitType = $h->tree->fruitCrop->variant ?? 'Unknown';
                    } elseif ($h->fruitCrop) {
                        $farmName = $h->fruitCrop->farm->name ?? 'Unknown';
                        $fruitType = $h->fruitCrop->variant ?? 'Unknown';
                    }

                    return [
                        'id' => $h->id,
                        'harvest_date' => $h->scheduled_date,
                        'farm_name' => $farmName,
                        'fruit_type' => $fruitType,
                        'estimated_yield_kg' => (float) $h->estimated_yield_kg,
                        'status' => $h->status->value,
                    ];
                })->toArray();

            $recentPayoutsList = $payouts->take(5)->map(function ($p) {
                $farmName = 'Unknown';
                if ($p->investment && $p->investment->tree && $p->investment->tree->fruitCrop && $p->investment->tree->fruitCrop->farm) {
                    $farmName = $p->investment->tree->fruitCrop->farm->name;
                }
                return [
                    'id' => $p->id,
                    'date' => $p->created_at->toIso8601String(),
                    'amount_cents' => (int) $p->net_amount_cents,
                    'farm_name' => $farmName,
                    'status' => $p->status->value,
                ];
            })->values()->toArray();

            $recentInvestmentsList = Investment::with('tree.fruitCrop.farm')
                ->where('user_id', $userId)
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get()
                ->map(function ($i) {
                    $farmName = 'Unknown';
                    if ($i->tree && $i->tree->fruitCrop && $i->tree->fruitCrop->farm) {
                        $farmName = $i->tree->fruitCrop->farm->name;
                    }
                    return [
                        'id' => $i->id,
                        'date' => $i->created_at->toIso8601String(),
                        'amount_cents' => (int) $i->amount_cents,
                        'farm_name' => $farmName,
                        'status' => $i->status->value,
                    ];
                })->toArray();

            $kycStatus = 'pending';
            if ($investor->kyc_status) {
                $kycStatus = $investor->kyc_status->value ?? (string) $investor->kyc_status;
            }

            return [
                'metrics' => [
                    'total_invested_cents' => (int) $totalInvestedCents,
                    'active_trees' => $activeTrees,
                    'total_payouts_cents' => (int) $totalPayoutsCents,
                    'portfolio_roi_percent' => (float) $portfolioRoiPercent,
                    'total_investments_count' => $totalInvestmentsCount,
                ],
                'kyc_status' => $kycStatus,
                'upcoming_harvests' => $upcomingHarvests,
                'recent_payouts' => $recentPayoutsList,
                'recent_investments' => $recentInvestmentsList,
            ];
        });
    }

    public static function invalidate(User $investor): void
    {
        Cache::forget("investor.dashboard.metrics.{$investor->id}");
    }
}
