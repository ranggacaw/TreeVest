<?php

namespace App\Services;

use App\Enums\RiskRating;
use App\Enums\TreeLifecycleStage;
use Illuminate\Database\Eloquent\Builder;

class TreeFilterService
{
    public function applyFilters(Builder $query, array $filters): Builder
    {
        if (isset($filters['fruit_type'])) {
            $query->byFruitType((int) $filters['fruit_type']);
        }

        if (isset($filters['variant'])) {
            $query->whereHas('fruitCrop', function ($q) use ($filters) {
                $q->where('variant', 'like', '%'.$filters['variant'].'%');
            });
        }

        if (isset($filters['price_min']) && isset($filters['price_max'])) {
            $query->byPriceRange((int) $filters['price_min'], (int) $filters['price_max']);
        }

        if (isset($filters['roi_min'])) {
            $query->where('expected_roi_percent', '>=', (float) $filters['roi_min']);
        }

        if (isset($filters['roi_max'])) {
            $query->where('expected_roi_percent', '<=', (float) $filters['roi_max']);
        }

        if (isset($filters['risk_rating']) && is_array($filters['risk_rating'])) {
            $ratings = array_map(fn ($r) => RiskRating::from($r), $filters['risk_rating']);
            $query->byRiskRating($ratings);
        }

        if (isset($filters['harvest_cycle'])) {
            $query->whereHas('fruitCrop', function ($q) use ($filters) {
                $q->where('harvest_cycle', $filters['harvest_cycle']);
            });
        }

        if (isset($filters['status']) && is_array($filters['status'])) {
            $statuses = array_map(fn ($s) => TreeLifecycleStage::from($s), $filters['status']);
            $query->whereIn('status', $statuses);
        }

        return $query;
    }

    public function getSorting(Builder $query, ?string $sortBy = null): Builder
    {
        return match ($sortBy) {
            'price_asc' => $query->orderBy('price_cents', 'asc'),
            'price_desc' => $query->orderBy('price_cents', 'desc'),
            'roi_desc' => $query->orderBy('expected_roi_percent', 'desc'),
            'newest' => $query->orderBy('created_at', 'desc'),
            default => $query->orderBy('created_at', 'desc'),
        };
    }
}
