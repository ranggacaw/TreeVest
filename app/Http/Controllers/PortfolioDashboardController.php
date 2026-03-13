<?php

namespace App\Http\Controllers;

use App\Services\InvestmentPortfolioService;
use App\Services\WishlistService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PortfolioDashboardController extends Controller
{
    public function __construct(
        private InvestmentPortfolioService $portfolioService,
        private WishlistService $wishlistService,
    ) {}

    public function index(Request $request)
    {
        $user = $request->user();
        $userId = $user->id;

        $tab = $request->input('tab', 'holdings');
        $filter = $request->input('filter', 'all');
        $page = (int) $request->input('page', 1);

        $summaryHeader = $this->portfolioService->getSummaryHeader($userId);

        // Wishlist items for Watchlist tab
        $wishlistItems = $this->wishlistService->getForUser($user);
        $formattedWishlist = $wishlistItems->filter(fn ($item) => class_basename($item->wishlistable_type) === 'Tree')
            ->map(function ($item) {
                $tree = $item->wishlistable;
                if (! $tree) {
                    return null;
                }
                $crop = $tree->fruitCrop;

                return [
                    'wishlist_id' => $item->id,
                    'id' => $tree->id,
                    'identifier' => $tree->tree_identifier,
                    'price_cents' => $tree->price_cents,
                    'expected_roi_percent' => (float) $tree->expected_roi_percent,
                    'risk_rating' => $tree->risk_rating?->value ?? $tree->risk_rating,
                    'status' => $tree->status?->value ?? $tree->status,
                    'fruit_crop' => [
                        'variant' => $crop?->variant,
                        'fruit_type' => $crop?->fruitType?->name,
                        'harvest_cycle' => $crop?->harvest_cycle,
                    ],
                    'farm' => [
                        'id' => $crop?->farm?->id,
                        'name' => $crop?->farm?->name,
                    ],
                    'added_at' => $item->created_at->toIso8601String(),
                ];
            })
            ->filter()
            ->values()
            ->toArray();

        $topTrees = collect(['Durian', 'Alpukat', 'Mangga'])->mapWithKeys(function ($type) {
            $trees = \App\Models\Tree::with(['fruitCrop.fruitType'])
                ->whereHas('fruitCrop.fruitType', function ($q) use ($type) {
                    $q->where('name', $type);
                })
                ->whereIn('status', [\App\Enums\TreeLifecycleStage::GROWING, \App\Enums\TreeLifecycleStage::PRODUCTIVE]) // Investable
                ->orderByDesc('expected_roi_percent')
                ->limit(3)
                ->get()
                ->map(function ($tree) use ($type) {
                    $variant = $tree->fruitCrop?->variant;
                    $name = str_contains(strtolower((string)$variant), strtolower($type)) ? $variant : $type . ' ' . $variant;
                    return [
                        'id' => $tree->id,
                        'name' => trim($name),
                        'return' => rtrim(rtrim(number_format((float) $tree->expected_roi_percent, 2), '0'), '.') . '%',
                    ];
                });
            return [$type => $trees];
        });

        // For partial reload: only send Holdings data if on holdings tab
        if ($request->header('X-Inertia-Partial-Data') && $tab === 'transactions') {
            $transactions = $this->portfolioService->getTransactions($userId, $filter, $page);

            return Inertia::render('Portfolio/Dashboard', [
                'transactions' => $transactions,
            ]);
        }

        $holdings = $this->portfolioService->getHoldingsWithSparklines($userId);
        $allocation = $this->portfolioService->getAllocationData($userId);
        $transactions = $this->portfolioService->getTransactions($userId, $filter, $page);

        // ── Promo Banner: pull the nearest upcoming harvest for this investor ──
        $nextHarvest = \App\Models\Harvest::query()
            ->join('investments', 'harvests.tree_id', '=', 'investments.tree_id')
            ->where('investments.user_id', $userId)
            ->where('harvests.status', \App\Enums\HarvestStatus::Scheduled->value)
            ->where('harvests.scheduled_date', '>', now())
            ->with(['tree.fruitCrop.fruitType'])
            ->orderBy('harvests.scheduled_date')
            ->select('harvests.*')
            ->first();

        $promoBanner = null;
        if ($nextHarvest) {
            $daysUntil = (int) now()->diffInDays($nextHarvest->scheduled_date, false);
            $monthsUntil = round($daysUntil / 30, 1);
            $fruitType = $nextHarvest->tree?->fruitCrop?->fruitType?->name ?? 'Pohon';
            $variant = $nextHarvest->tree?->fruitCrop?->variant ?? '';
            $roi = $nextHarvest->tree?->expected_roi_percent ?? null;

            $promoBanner = [
                'title' => "Musim Panen {$fruitType} {$variant} Segera Tiba",
                'days_until' => $daysUntil,
                'months_until_label' => $monthsUntil <= 1
                    ? "{$daysUntil} hari lagi"
                    : number_format($monthsUntil, 1) . ' bulan lagi',
                'roi_range' => $roi ? rtrim(rtrim(number_format((float) $roi, 2), '0'), '.') . '%' : null,
                'tree_id' => $nextHarvest->tree_id,
            ];
        }

        return Inertia::render('Portfolio/Dashboard', [
            'summaryHeader' => $summaryHeader,
            'holdings' => $holdings,
            'allocation' => $allocation,
            'watchlist' => $formattedWishlist,
            'transactions' => $transactions,
            'topTrees' => $topTrees,
            'activeTab' => $tab,
            'activeFilter' => $filter,
            'promoBanner' => $promoBanner,
        ]);
    }

    public function showInvestment(Request $request, int $investmentId)
    {
        $user = $request->user();

        $investment = $this->portfolioService->getInvestmentDetails($investmentId, $user->id);

        if (! $investment) {
            abort(404);
        }

        return Inertia::render('Investments/Show', [
            'investment' => $investment,
        ]);
    }
}
