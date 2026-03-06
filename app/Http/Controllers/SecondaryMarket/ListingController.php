<?php

namespace App\Http\Controllers\SecondaryMarket;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMarketListingRequest;
use App\Models\Investment;
use App\Models\MarketListing;
use App\Services\SecondaryMarketService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ListingController extends Controller
{
    public function __construct(
        private SecondaryMarketService $service
    ) {}

    public function index(Request $request)
    {
        $query = MarketListing::active()
            ->with(['investment.tree.fruitCrop.farm', 'investment.tree.fruitType', 'seller']);

        $filters = $request->only(['fruit_type_id', 'min_price_cents', 'max_price_cents', 'risk_rating']);

        if (isset($filters['fruit_type_id'])) {
            $query->whereHas('investment.tree', function ($q) use ($filters) {
                $q->where('fruit_type_id', $filters['fruit_type_id']);
            });
        }

        if (isset($filters['min_price_cents'])) {
            $query->where('ask_price_cents', '>=', $filters['min_price_cents']);
        }

        if (isset($filters['max_price_cents'])) {
            $query->where('ask_price_cents', '<=', $filters['max_price_cents']);
        }

        if (isset($filters['risk_rating'])) {
            $query->whereHas('investment.tree', function ($q) use ($filters) {
                $q->where('risk_rating', $filters['risk_rating']);
            });
        }

        $listings = $query->orderBy('created_at', 'desc')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('SecondaryMarket/Index', [
            'listings' => $listings,
            'filters' => $filters,
            'canCreateListing' => $request->user()?->hasVerifiedKyc() ?? false,
        ]);
    }

    public function show(MarketListing $listing)
    {
        $listing->load([
            'investment.tree.fruitCrop.farm',
            'investment.tree.fruitType',
            'seller',
        ]);

        $isOwner = $listing->seller_id === auth()->id();
        $isBuyer = $listing->buyer_id === auth()->id();
        $kycVerified = auth()->user()?->hasVerifiedKyc() ?? false;

        return Inertia::render('SecondaryMarket/Show', [
            'listing' => $listing,
            'isOwner' => $isOwner,
            'isBuyer' => $isBuyer,
            'canPurchase' => $kycVerified && ! $isOwner,
            'canCancel' => $isOwner && $listing->isActive(),
        ]);
    }

    public function create(Request $request)
    {
        if (! $request->user()->hasVerifiedKyc()) {
            return redirect()->back()->with('error', __('investments.kyc_required_for_listing'));
        }

        $activeInvestments = Investment::query()
            ->where('user_id', $request->user()->id)
            ->where('status', 'active')
            ->whereDoesntHave('activeListing')
            ->with(['tree.fruitCrop.farm', 'tree.fruitType'])
            ->get();

        return Inertia::render('SecondaryMarket/Create', [
            'activeInvestments' => $activeInvestments,
        ]);
    }

    public function store(StoreMarketListingRequest $request)
    {
        $investment = Investment::findOrFail($request->investment_id);

        try {
            $listing = $this->service->createListing(
                seller: $request->user(),
                investment: $investment,
                askPriceCents: $request->ask_price_cents,
                notes: $request->notes,
                expiresAt: $request->expires_at
            );

            return redirect()->route('secondary-market.show', $listing)
                ->with('success', __('investments.listing_created'));
        } catch (\Exception $e) {
            return redirect()->back()
                ->withInput()
                ->with('error', $e->getMessage());
        }
    }

    public function destroy(Request $request, MarketListing $listing)
    {
        try {
            $this->service->cancelListing($listing, $request->user());

            return redirect()->route('investments.show', $listing->investment_id)
                ->with('success', __('investments.listing_cancelled'));
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', $e->getMessage());
        }
    }
}
