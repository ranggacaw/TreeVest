<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreMarketPriceRequest;
use App\Http\Requests\Admin\UpdateMarketPriceRequest;
use App\Models\FruitType;
use App\Models\MarketPrice;
use App\Services\MarketPriceService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class MarketPriceController extends Controller
{
    public function __construct(
        private MarketPriceService $marketPriceService
    ) {}

    public function index(): Response
    {
        $marketPrices = MarketPrice::with(['fruitType', 'createdBy'])
            ->orderBy('effective_date', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        $fruitTypes = FruitType::all();

        return Inertia::render('Admin/MarketPrices/Index', [
            'marketPrices' => $marketPrices,
            'fruitTypes' => $fruitTypes,
        ]);
    }

    public function create(): Response
    {
        $fruitTypes = FruitType::all();

        return Inertia::render('Admin/MarketPrices/Create', [
            'fruitTypes' => $fruitTypes,
        ]);
    }

    public function store(StoreMarketPriceRequest $request): RedirectResponse
    {
        $this->marketPriceService->createPrice($request->validated(), auth()->user());

        return redirect()->route('admin.market-prices.index')
            ->with('success', 'Market price created successfully.');
    }

    public function edit(MarketPrice $marketPrice): Response
    {
        $marketPrice->load(['fruitType', 'createdBy']);

        return Inertia::render('Admin/MarketPrices/Edit', [
            'marketPrice' => $marketPrice,
        ]);
    }

    public function update(UpdateMarketPriceRequest $request, MarketPrice $marketPrice): RedirectResponse
    {
        $this->marketPriceService->updatePrice($marketPrice, $request->validated(), auth()->user());

        return redirect()->route('admin.market-prices.index')
            ->with('success', 'Market price updated successfully.');
    }
}
