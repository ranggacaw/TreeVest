<?php

namespace App\Http\Controllers;

use App\Models\Tree;
use App\Services\HealthMonitoringService;
use App\Services\WeatherService;
use App\Services\WishlistService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TreeMarketplaceController extends Controller
{
    public function __construct(
        private WishlistService $wishlistService,
        private HealthMonitoringService $healthMonitoringService,
        private WeatherService $weatherService,
    ) {}

    public function index(Request $request): Response
    {
        $filters = $request->only([
            'fruit_type', 'variant', 'risk_rating',
            'harvest_cycle', 'price_min', 'price_max', 'search',
        ]);

        $query = Tree::investable()
            ->with([
                'fruitCrop.fruitType',
                'fruitCrop.farm.images' => fn ($q) => $q->where('is_featured', true)->limit(1),
            ]);

        // Search by farm name, fruit type, or tree identifier
        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->whereHas('fruitCrop.farm', fn ($sq) => $sq->where('name', 'like', '%'.$search.'%'))
                    ->orWhereHas('fruitCrop.fruitType', fn ($sq) => $sq->where('name', 'like', '%'.$search.'%'))
                    ->orWhere('tree_identifier', 'like', '%'.$search.'%');
            });
        }

        if (! empty($filters['variant'])) {
            $query->whereHas('fruitCrop', fn ($q) => $q->where('variant', 'like', '%'.$filters['variant'].'%'));
        }

        if (! empty($filters['risk_rating'])) {
            $query->where('risk_rating', $filters['risk_rating']);
        }

        if (! empty($filters['harvest_cycle'])) {
            $query->whereHas('fruitCrop', fn ($q) => $q->where('harvest_cycle', $filters['harvest_cycle']));
        }

        if (! empty($filters['price_min'])) {
            $query->where('price_idr', '>=', (int) $filters['price_min']);
        }

        if (! empty($filters['price_max'])) {
            $query->where('price_idr', '<=', (int) $filters['price_max']);
        }

        $trees = $query->orderBy('expected_roi_percent', 'desc')->paginate(12)->through(function (Tree $tree) {
            $crop = $tree->fruitCrop;
            $farm = $crop?->farm;
            $featuredImage = $farm?->images->first();

            return [
                'id' => $tree->id,
                'tree_identifier' => $tree->tree_identifier,
                'price_idr' => $tree->price_idr,
                'expected_roi_percent' => (float) $tree->expected_roi_percent,
                'risk_rating' => $tree->risk_rating?->value ?? $tree->risk_rating,
                'status' => $tree->status?->value ?? $tree->status,
                'min_investment_idr' => $tree->min_investment_idr,
                'max_investment_idr' => $tree->max_investment_idr,
                'age_years' => $tree->age_years,
                'productive_lifespan_years' => $tree->productive_lifespan_years,
                'fruit_crop' => [
                    'variant' => $crop?->variant,
                    'harvest_cycle' => $crop?->harvest_cycle,
                    'fruit_type' => $crop?->fruitType?->name,
                    'fruit_type_id' => $crop?->fruit_type_id,
                ],
                'farm' => [
                    'id' => $farm?->id,
                    'name' => $farm?->name,
                    'city' => $farm?->city,
                    'image_url' => $featuredImage?->file_path
                        ? asset('storage/'.$featuredImage->file_path)
                        : null,
                ],
            ];
        });

        // Wishlist tree IDs — only for authenticated investors
        $wishlistedTreeIds = [];
        $user = $request->user();
        if ($user && $user->hasRole('investor')) {
            $wishlistedTreeIds = $this->wishlistService->getWishlistedTreeIds($user);
        }

        return Inertia::render('Trees/Index', [
            'trees' => $trees,
            'filters' => $filters,
            'wishlistedTreeIds' => $wishlistedTreeIds,
        ]);
    }

    public function show(Request $request, Tree $tree): Response
    {
        $tree->load([
            'fruitCrop.fruitType',
            'fruitCrop.farm.images' => fn ($q) => $q->where('is_featured', true)->limit(1),
            'harvests' => fn ($q) => $q->orderBy('scheduled_date', 'desc')->limit(10),
        ]);

        $crop = $tree->fruitCrop;
        $farm = $crop?->farm;

        $healthStatus = null;
        $recentUpdates = [];
        $currentWeather = null;

        if ($crop) {
            try {
                $healthStatus = $this->healthMonitoringService->getHealthStatusForCrop($crop);
                $recentUpdates = $crop->healthUpdates()
                    ->with('author')
                    ->orderBy('created_at', 'desc')
                    ->limit(5)
                    ->get()
                    ->map(fn ($u) => [
                        'id' => $u->id,
                        'title' => $u->title,
                        'severity' => $u->severity?->value ?? $u->severity,
                        'created_at' => $u->created_at->toIso8601String(),
                    ])
                    ->toArray();
            } catch (\Throwable) {
                // graceful degradation
            }
        }

        if ($farm) {
            try {
                $weather = $this->weatherService->getCachedWeatherForFarm($farm);
                if ($weather) {
                    $currentWeather = [
                        'temperature_celsius' => $weather->temperature_celsius,
                        'humidity_percent' => $weather->humidity_percent,
                        'wind_speed_kmh' => $weather->wind_speed_kmh,
                        'rainfall_mm' => $weather->rainfall_mm,
                        'weather_condition' => $weather->weather_condition,
                        'recorded_at' => $weather->recorded_at->toIso8601String(),
                    ];
                }
            } catch (\Throwable) {
                // graceful degradation
            }
        }

        $isWishlisted = false;
        $user = $request->user();
        if ($user && $user->hasRole('investor')) {
            $isWishlisted = $this->wishlistService->isWishlisted($user, 'tree', $tree->id);
        }

        $featuredImage = $farm?->images->first();

        return Inertia::render('Trees/Show', [
            'tree' => [
                'id' => $tree->id,
                'tree_identifier' => $tree->tree_identifier,
                'price_idr' => $tree->price_idr,
                'expected_roi_percent' => (float) $tree->expected_roi_percent,
                'risk_rating' => $tree->risk_rating?->value ?? $tree->risk_rating,
                'status' => $tree->status?->value ?? $tree->status,
                'min_investment_idr' => $tree->min_investment_idr,
                'max_investment_idr' => $tree->max_investment_idr,
                'age_years' => $tree->age_years,
                'productive_lifespan_years' => $tree->productive_lifespan_years,
                'fruit_crop' => [
                    'variant' => $crop?->variant,
                    'harvest_cycle' => $crop?->harvest_cycle,
                    'fruit_type' => [
                        'id' => $crop?->fruitType?->id,
                        'name' => $crop?->fruitType?->name,
                    ],
                    'farm' => [
                        'id' => $farm?->id,
                        'name' => $farm?->name,
                        'city' => $farm?->city,
                        'image_url' => $featuredImage?->file_path
                            ? asset('storage/'.$featuredImage->file_path)
                            : null,
                    ],
                ],
                'harvests' => $tree->harvests->map(fn ($h) => [
                    'id' => $h->id,
                    'harvest_date' => $h->scheduled_date?->format('Y-m-d'),
                    'estimated_yield_kg' => $h->estimated_yield_kg,
                    'actual_yield_kg' => $h->actual_yield_kg,
                    'quality_grade' => $h->quality_grade?->value ?? $h->quality_grade,
                ])->toArray(),
            ],
            'isWishlisted' => $isWishlisted,
            'healthStatus' => $healthStatus,
            'recentUpdates' => $recentUpdates,
            'currentWeather' => $currentWeather,
        ]);
    }
}
