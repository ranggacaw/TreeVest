<?php

namespace App\Services;

use App\Enums\InvestmentStatus;
use App\Models\Investment;
use App\Models\TreeHarvest;
use Illuminate\Support\Collection;

class InvestmentPortfolioService
{
    public function getPortfolioSummary(int $userId): array
    {
        $investments = $this->getUserActiveInvestments($userId);

        if ($investments->isEmpty()) {
            return [
                'total_value_cents' => 0,
                'tree_count' => 0,
                'total_invested_cents' => 0,
                'average_roi_percent' => 0,
                'total_payouts_cents' => 0,
                'tree_count_by_status' => [],
            ];
        }

        $totalValue = $investments->sum('amount_cents');
        $totalInvested = $totalValue;
        $averageRoi = $investments->avg('tree.expected_roi_percent') ?? 0;

        $treeCountByStatus = $investments->groupBy(function ($investment) {
            return $investment->tree?->status?->value ?? 'unknown';
        })->map(fn ($group) => $group->count())->toArray();

        $totalPayouts = $this->getTotalPayouts($userId);

        return [
            'total_value_cents' => $totalValue,
            'tree_count' => $investments->count(),
            'total_invested_cents' => $totalInvested,
            'average_roi_percent' => round($averageRoi, 2),
            'total_payouts_cents' => $totalPayouts,
            'tree_count_by_status' => $treeCountByStatus,
        ];
    }

    public function getInvestmentsByCategory(int $userId, string $groupBy): Collection
    {
        $investments = $this->getUserActiveInvestments($userId);

        return $investments->groupBy(function ($investment) use ($groupBy) {
            return match ($groupBy) {
                'fruit_type' => $investment->tree?->fruitCrop?->fruitType?->name ?? 'Unknown',
                'farm' => $investment->tree?->fruitCrop?->farm?->name ?? 'Unknown',
                'risk' => $investment->tree?->risk_rating?->value ?? 'unknown',
                default => 'Unknown',
            };
        })->map(function ($group) {
            return [
                'count' => $group->count(),
                'total_value_cents' => $group->sum('amount_cents'),
            ];
        });
    }

    public function getUpcomingHarvests(int $userId, int $limit = 10): Collection
    {
        $investments = $this->getUserActiveInvestments($userId);

        $treeIds = $investments->pluck('tree_id')->filter()->unique();

        return TreeHarvest::whereIn('tree_id', $treeIds)
            ->where('harvest_date', '>=', now()->toDateString())
            ->orderBy('harvest_date', 'asc')
            ->limit($limit)
            ->with(['tree.fruitCrop.farm', 'tree.fruitCrop.fruitType'])
            ->get()
            ->map(function ($harvest) {
                return [
                    'id' => $harvest->id,
                    'harvest_date' => $harvest->harvest_date->format('Y-m-d'),
                    'estimated_yield_kg' => $harvest->estimated_yield_kg,
                    'tree_id' => $harvest->tree_id,
                    'tree_identifier' => $harvest->tree?->tree_identifier,
                    'fruit_type' => $harvest->tree?->fruitCrop?->fruitType?->name,
                    'variant' => $harvest->tree?->fruitCrop?->variant,
                    'farm_name' => $harvest->tree?->fruitCrop?->farm?->name,
                    'status' => $harvest->status ?? 'scheduled',
                ];
            });
    }

    public function getPerformanceMetrics(int $userId): array
    {
        $investments = $this->getUserActiveInvestments($userId);

        if ($investments->isEmpty()) {
            return [
                'projected_returns_cents' => 0,
                'actual_returns_cents' => 0,
                'difference_cents' => 0,
                'percentage_gain_loss' => 0,
                'investments' => [],
            ];
        }

        $investmentMetrics = $investments->map(function ($investment) {
            $projectedReturn = (int) ($investment->amount_cents * ($investment->tree?->expected_roi_percent ?? 0) / 100);
            $actualReturn = $this->calculateActualReturns($investment);

            return [
                'investment_id' => $investment->id,
                'tree_identifier' => $investment->tree?->tree_identifier,
                'amount_cents' => $investment->amount_cents,
                'projected_return_cents' => $projectedReturn,
                'actual_return_cents' => $actualReturn,
                'difference_cents' => $actualReturn - $projectedReturn,
            ];
        });

        $projectedTotal = $investmentMetrics->sum('projected_return_cents');
        $actualTotal = $investmentMetrics->sum('actual_return_cents');
        $difference = $actualTotal - $projectedTotal;
        $percentageGainLoss = $projectedTotal > 0 ? round(($difference / $projectedTotal) * 100, 2) : 0;

        return [
            'projected_returns_cents' => $projectedTotal,
            'actual_returns_cents' => $actualTotal,
            'difference_cents' => $difference,
            'percentage_gain_loss' => $percentageGainLoss,
            'investments' => $investmentMetrics->toArray(),
        ];
    }

    public function getInvestmentDetails(int $investmentId, int $userId): ?array
    {
        $investment = Investment::with([
            'tree.fruitCrop.farm.images',
            'tree.fruitCrop.fruitType',
            'tree.harvests',
        ])
            ->where('user_id', $userId)
            ->find($investmentId);

        if (! $investment) {
            return null;
        }

        $currentValue = $this->calculateCurrentValue($investment);
        $projectedReturn = (int) ($investment->amount_cents * ($investment->tree?->expected_roi_percent ?? 0) / 100);
        $actualReturn = $this->calculateActualReturns($investment);

        return [
            'id' => $investment->id,
            'amount_cents' => $investment->amount_cents,
            'purchase_date' => $investment->purchase_date?->format('Y-m-d'),
            'status' => $investment->status->value,
            'current_value_cents' => $currentValue,
            'projected_return_cents' => $projectedReturn,
            'actual_return_cents' => $actualReturn,
            'tree' => $this->formatTreeDetails($investment->tree),
            'farm' => $investment->tree?->fruitCrop?->farm ? $this->formatFarmDetails($investment->tree->fruitCrop->farm) : null,
            'harvests' => $investment->tree?->harvests?->map(fn ($h) => [
                'id' => $h->id,
                'harvest_date' => $h->harvest_date?->format('Y-m-d'),
                'estimated_yield_kg' => $h->estimated_yield_kg,
                'actual_yield_kg' => $h->actual_yield_kg,
                'quality_grade' => $h->quality_grade,
                'notes' => $h->notes,
            ])->toArray() ?? [],
        ];
    }

    public function getInvestmentsWithDetails(int $userId, int $perPage = 20): array
    {
        $investments = Investment::with([
            'tree.fruitCrop.farm',
            'tree.fruitCrop.fruitType',
            'tree.harvests' => function ($query) {
                $query->where('harvest_date', '<=', now()->toDateString())
                    ->orderBy('harvest_date', 'desc');
            },
        ])
            ->where('user_id', $userId)
            ->where('status', InvestmentStatus::Active)
            ->orderBy('purchase_date', 'desc')
            ->paginate($perPage);

        return [
            'data' => $investments->map(function ($investment) {
                return [
                    'id' => $investment->id,
                    'amount_cents' => $investment->amount_cents,
                    'purchase_date' => $investment->purchase_date?->format('Y-m-d'),
                    'current_value_cents' => $this->calculateCurrentValue($investment),
                    'projected_return_cents' => (int) ($investment->amount_cents * ($investment->tree?->expected_roi_percent ?? 0) / 100),
                    'actual_return_cents' => $this->calculateActualReturns($investment),
                    'status' => $investment->status->value,
                    'tree' => $this->formatTreeSummary($investment->tree),
                    'next_harvest' => $investment->tree?->harvests
                        ->where('harvest_date', '>=', now()->toDateString())
                        ->first()?->harvest_date?->format('Y-m-d'),
                ];
            })->toArray(),
            'current_page' => $investments->currentPage(),
            'last_page' => $investments->lastPage(),
            'per_page' => $investments->perPage(),
            'total' => $investments->total(),
        ];
    }

    public function getDiversificationData(int $userId): array
    {
        $byFruitType = $this->getInvestmentsByCategory($userId, 'fruit_type')
            ->map(fn ($data, $category) => [
                'category' => $category,
                'value_cents' => $data['total_value_cents'],
                'count' => $data['count'],
            ])->values();

        $byFarm = $this->getInvestmentsByCategory($userId, 'farm')
            ->map(fn ($data, $category) => [
                'category' => $category,
                'value_cents' => $data['total_value_cents'],
                'count' => $data['count'],
            ])->values();

        $byRisk = $this->getInvestmentsByCategory($userId, 'risk')
            ->map(fn ($data, $category) => [
                'category' => $category,
                'value_cents' => $data['total_value_cents'],
                'count' => $data['count'],
            ])->values();

        return [
            'by_fruit_type' => $byFruitType->toArray(),
            'by_farm' => $byFarm->toArray(),
            'by_risk' => $byRisk->toArray(),
        ];
    }

    private function getUserActiveInvestments(int $userId): Collection
    {
        return Investment::with(['tree.fruitCrop.farm', 'tree.fruitCrop.fruitType'])
            ->where('user_id', $userId)
            ->where('status', InvestmentStatus::Active)
            ->get();
    }

    private function calculateCurrentValue(Investment $investment): int
    {
        return $investment->amount_cents;
    }

    private function calculateActualReturns(Investment $investment): int
    {
        $completedHarvests = $investment->tree?->harvests
            ->whereNotNull('actual_yield_kg')
            ->where('harvest_date', '<=', now()->toDateString()) ?? collect();

        if ($completedHarvests->isEmpty()) {
            return 0;
        }

        $totalYield = $completedHarvests->sum('actual_yield_kg');
        $investmentAmount = $investment->amount_cents;

        return (int) ($investmentAmount * ($totalYield / 100));
    }

    private function getTotalPayouts(int $userId): int
    {
        return 0;
    }

    private function formatTreeDetails(?\App\Models\Tree $tree): ?array
    {
        if (! $tree) {
            return null;
        }

        return [
            'id' => $tree->id,
            'identifier' => $tree->tree_identifier,
            'status' => $tree->status?->value,
            'age_years' => $tree->age_years,
            'productive_lifespan_years' => $tree->productive_lifespan_years,
            'expected_roi_percent' => $tree->expected_roi_percent,
            'risk_rating' => $tree->risk_rating?->value,
            'fruit_type' => $tree->fruitCrop?->fruitType?->name,
            'variant' => $tree->fruitCrop?->variant,
            'harvest_cycle' => $tree->fruitCrop?->harvest_cycle?->value,
        ];
    }

    private function formatTreeSummary(?\App\Models\Tree $tree): ?array
    {
        if (! $tree) {
            return null;
        }

        return [
            'id' => $tree->id,
            'identifier' => $tree->tree_identifier,
            'status' => $tree->status?->value,
            'risk_rating' => $tree->risk_rating?->value,
            'expected_roi_percent' => $tree->expected_roi_percent,
            'fruit_type' => $tree->fruitCrop?->fruitType?->name,
            'variant' => $tree->fruitCrop?->variant,
            'farm_name' => $tree->fruitCrop?->farm?->name,
        ];
    }

    private function formatFarmDetails(\App\Models\Farm $farm): array
    {
        return [
            'id' => $farm->id,
            'name' => $farm->name,
            'city' => $farm->city,
            'state' => $farm->state,
            'image_url' => $farm->featuredImage()?->file_path,
        ];
    }
}
