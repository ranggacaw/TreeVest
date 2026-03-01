<?php

namespace App\Services;

use App\Enums\HealthSeverity;
use App\Enums\HealthUpdateType;
use App\Models\Farm;
use App\Models\FruitCrop;
use App\Models\Tree;
use App\Models\TreeHealthUpdate;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Log;

class HealthMonitoringService
{
    public function getHealthFeedForInvestor(User $investor, array $filters = []): \Illuminate\Pagination\LengthAwarePaginator
    {
        $cropIds = $this->getInvestorCropIds($investor);
        
        if ($cropIds->isEmpty()) {
            return new \Illuminate\Pagination\LengthAwarePaginator([], 0, 15);
        }

        $query = TreeHealthUpdate::whereIn('fruit_crop_id', $cropIds)
            ->with(['fruitCrop.farm', 'author'])
            ->orderBy('created_at', 'desc');

        $query = $this->applyFilters($query, $filters);

        return $query->paginate(15);
    }

    public function getHealthStatusForTree(Tree $tree): array
    {
        $crop = $tree->fruitCrop;
        
        if (!$crop) {
            return $this->getDefaultHealthStatus();
        }

        $latestUpdate = $crop->healthUpdates()->first();
        $recentAlerts = $crop->healthAlerts()
            ->unresolved()
            ->recent(30)
            ->get();

        return [
            'tree_id' => $tree->id,
            'crop_id' => $crop->id,
            'latest_update' => $latestUpdate ? [
                'id' => $latestUpdate->id,
                'title' => $latestUpdate->title,
                'severity' => $latestUpdate->severity->value,
                'update_type' => $latestUpdate->update_type->value,
                'created_at' => $latestUpdate->created_at->toIso8601String(),
            ] : null,
            'active_alerts_count' => $recentAlerts->count(),
            'alerts' => $recentAlerts->map(fn($alert) => [
                'id' => $alert->id,
                'title' => $alert->title,
                'severity' => $alert->severity->value,
                'alert_type' => $alert->alert_type->value,
                'created_at' => $alert->created_at->toIso8601String(),
            ]),
            'overall_status' => $this->calculateOverallStatus($latestUpdate, $recentAlerts),
        ];
    }

    public function getHealthStatusForCrop(FruitCrop $crop): array
    {
        $latestUpdate = $crop->healthUpdates()->first();
        $recentAlerts = $crop->healthAlerts()
            ->unresolved()
            ->recent(30)
            ->get();

        return [
            'crop_id' => $crop->id,
            'farm_id' => $crop->farm_id,
            'latest_update' => $latestUpdate ? [
                'id' => $latestUpdate->id,
                'title' => $latestUpdate->title,
                'description' => $latestUpdate->description,
                'severity' => $latestUpdate->severity->value,
                'update_type' => $latestUpdate->update_type->value,
                'photos' => $latestUpdate->getPhotoUrls(),
                'created_at' => $latestUpdate->created_at->toIso8601String(),
            ] : null,
            'active_alerts_count' => $recentAlerts->count(),
            'alerts' => $recentAlerts->map(fn($alert) => [
                'id' => $alert->id,
                'title' => $alert->title,
                'message' => $alert->message,
                'severity' => $alert->severity->value,
                'alert_type' => $alert->alert_type->value,
                'is_resolved' => $alert->isResolved(),
                'created_at' => $alert->created_at->toIso8601String(),
            ]),
            'overall_status' => $this->calculateOverallStatus($latestUpdate, $recentAlerts),
            'update_count_30_days' => $crop->healthUpdates()
                ->recent(30)
                ->count(),
        ];
    }

    public function getHealthSummaryForFarms(array $farmIds): Collection
    {
        $farms = Farm::whereIn('id', $farmIds)->get();
        
        return $farms->map(function ($farm) {
            $recentUpdates = $farm->fruitCrops()
                ->with('healthUpdates')
                ->get()
                ->flatMap(fn($crop) => $crop->healthUpdates)
                ->sortByDesc('created_at')
                ->take(5);

            $activeAlerts = $farm->healthAlerts()
                ->unresolved()
                ->recent(30)
                ->count();

            return [
                'farm_id' => $farm->id,
                'farm_name' => $farm->name,
                'recent_updates' => $recentUpdates->map(fn($update) => [
                    'id' => $update->id,
                    'title' => $update->title,
                    'severity' => $update->severity->value,
                    'created_at' => $update->created_at->toIso8601String(),
                ]),
                'active_alerts_count' => $activeAlerts,
            ];
        });
    }

    public function getHealthAlertsForInvestor(User $investor, array $filters = []): \Illuminate\Pagination\LengthAwarePaginator
    {
        $cropIds = $this->getInvestorCropIds($investor);
        
        if ($cropIds->isEmpty()) {
            return new \Illuminate\Pagination\LengthAwarePaginator([], 0, 15);
        }

        $query = \App\Models\HealthAlert::whereIn('fruit_crop_id', $cropIds)
            ->orWhereIn('farm_id', function ($query) use ($cropIds) {
                $query->select('farm_id')
                    ->from('fruit_crops')
                    ->whereIn('id', $cropIds);
            })
            ->with(['farm', 'fruitCrop'])
            ->orderBy('created_at', 'desc');

        if (isset($filters['unresolved']) && $filters['unresolved']) {
            $query->unresolved();
        }

        if (isset($filters['severity'])) {
            $query->where('severity', $filters['severity']);
        }

        return $query->paginate(15);
    }

    private function getInvestorCropIds(User $investor): \Illuminate\Support\Collection
    {
        return $investor->investments()
            ->where('status', \App\Enums\InvestmentStatus::Active)
            ->with('tree.fruitCrop')
            ->get()
            ->pluck('tree.fruitCrop.id')
            ->filter()
            ->unique()
            ->values();
    }

    private function applyFilters($query, array $filters): mixed
    {
        if (isset($filters['severity'])) {
            $query->where('severity', $filters['severity']);
        }

        if (isset($filters['update_type'])) {
            $query->where('update_type', $filters['update_type']);
        }

        if (isset($filters['farm_id'])) {
            $query->whereHas('fruitCrop', fn($q) => 
                $q->where('farm_id', $filters['farm_id'])
            );
        }

        if (isset($filters['fruit_type'])) {
            $query->whereHas('fruitCrop.fruitType', fn($q) => 
                $q->where('name', 'like', '%' . $filters['fruit_type'] . '%')
            );
        }

        return $query;
    }

    private function calculateOverallStatus($latestUpdate, Collection $alerts): string
    {
        if ($alerts->isNotEmpty()) {
            if ($alerts->contains('severity', HealthSeverity::CRITICAL)) {
                return 'critical';
            }
            if ($alerts->contains('severity', HealthSeverity::HIGH)) {
                return 'warning';
            }
            return 'attention';
        }

        if (!$latestUpdate) {
            return 'unknown';
        }

        return match ($latestUpdate->severity) {
            HealthSeverity::CRITICAL => 'critical',
            HealthSeverity::HIGH => 'warning',
            HealthSeverity::MEDIUM => 'attention',
            HealthSeverity::LOW => 'healthy',
        };
    }

    private function getDefaultHealthStatus(): array
    {
        return [
            'latest_update' => null,
            'active_alerts_count' => 0,
            'alerts' => [],
            'overall_status' => 'unknown',
        ];
    }
}
