<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MarketListing;
use App\Services\SecondaryMarketService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MarketListingController extends Controller
{
    public function __construct(
        private SecondaryMarketService $service
    ) {}

    public function index(Request $request)
    {
        $query = MarketListing::with([
            'investment.tree.fruitCrop.farm',
            'investment.tree.fruitType',
            'seller',
            'buyer',
        ]);

        $filters = $request->only(['status', 'fruit_type_id']);

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['fruit_type_id'])) {
            $query->whereHas('investment.tree', function ($q) use ($filters) {
                $q->where('fruit_type_id', $filters['fruit_type_id']);
            });
        }

        $listings = $query->orderBy('created_at', 'desc')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/MarketListings/Index', [
            'listings' => $listings,
            'filters' => $filters,
        ]);
    }

    public function destroy(Request $request, MarketListing $listing)
    {
        try {
            $this->service->cancelListing($listing, $request->user());

            return back()->with('success', 'Listing has been cancelled successfully.');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }
}
