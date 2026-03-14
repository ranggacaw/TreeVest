<?php

namespace App\Services;

use App\Enums\FarmStatus;
use App\Enums\InvestmentStatus;
use App\Models\Farm;
use App\Models\Harvest;
use App\Models\Investment;
use App\Models\Tree;
use App\Models\TreeHealthUpdate;
use App\Models\User;
use Illuminate\Support\Facades\Cache;

class FarmOwnerDashboardService
{
    public function getDashboardData(User $owner): array
    {
        return Cache::remember("farm_owner.dashboard.metrics.{$owner->id}", 300, function () use ($owner) {
            $farms = Farm::where('owner_id', $owner->id)->get();
            $farmIds = $farms->pluck('id');

            $totalFarms = $farms->count();
            $activeFarms = $farms->filter(fn ($f) => $f->status === FarmStatus::ACTIVE)->count();

            $totalTrees = Tree::whereHas('fruitCrop', function ($q) use ($farmIds) {
                $q->whereIn('farm_id', $farmIds);
            })->count();

            $totalInvestors = Investment::whereHas('tree.fruitCrop', function ($q) use ($farmIds) {
                $q->whereIn('farm_id', $farmIds);
            })->distinct('user_id')->count('user_id');

            // Defaulting total earnings to sum of all investments made on the owner's farms
            $totalEarningsIdr = Investment::whereHas('tree.fruitCrop', function ($q) use ($farmIds) {
                $q->whereIn('farm_id', $farmIds);
            })->where('status', InvestmentStatus::Active)
                ->sum('amount_idr');

            $farmsList = $farms->map(function ($f) {
                return [
                    'id' => $f->id,
                    'name' => $f->name,
                    'status' => $f->status->value,
                ];
            })->toArray();

            $upcomingHarvests = Harvest::with('fruitCrop.farm')
                ->whereHas('fruitCrop', function ($q) use ($farmIds) {
                    $q->whereIn('farm_id', $farmIds);
                })
                ->where('scheduled_date', '>=', now())
                ->orderBy('scheduled_date', 'asc')
                ->limit(5)
                ->get()
                ->map(function ($h) {
                    return [
                        'id' => $h->id,
                        'harvest_date' => $h->scheduled_date,
                        'farm_name' => $h->fruitCrop ? ($h->fruitCrop->farm ? $h->fruitCrop->farm->name : 'Unknown') : 'Unknown',
                        'fruit_type' => $h->fruitCrop ? $h->fruitCrop->variant : 'Unknown',
                        'status' => $h->status->value,
                    ];
                })->toArray();

            $recentHealthUpdates = TreeHealthUpdate::with('fruitCrop.farm')
                ->whereHas('fruitCrop', function ($q) use ($farmIds) {
                    $q->whereIn('farm_id', $farmIds);
                })
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get()
                ->map(function ($update) {
                    return [
                        'id' => $update->id,
                        'date' => $update->created_at->toIso8601String(),
                        'farm_name' => $update->fruitCrop ? ($update->fruitCrop->farm ? $update->fruitCrop->farm->name : 'Unknown') : 'Unknown',
                        'severity' => $update->severity->value,
                        'description' => $update->description,
                    ];
                })->toArray();

            return [
                'metrics' => [
                    'total_farms' => $totalFarms,
                    'active_farms' => $activeFarms,
                    'total_trees' => $totalTrees,
                    'total_investors' => $totalInvestors,
                    'total_earnings_idr' => (int) $totalEarningsIdr,
                ],
                'farms' => $farmsList,
                'upcoming_harvests' => $upcomingHarvests,
                'recent_health_updates' => $recentHealthUpdates,
            ];
        });
    }

    public static function invalidate(User $owner): void
    {
        Cache::forget("farm_owner.dashboard.metrics.{$owner->id}");
    }
}
