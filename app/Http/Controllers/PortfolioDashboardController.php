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

        return Inertia::render('Portfolio/Dashboard', [
            'summaryHeader' => $summaryHeader,
            'holdings' => $holdings,
            'allocation' => $allocation,
            'watchlist' => $formattedWishlist,
            'transactions' => $transactions,
            'activeTab' => $tab,
            'activeFilter' => $filter,
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
