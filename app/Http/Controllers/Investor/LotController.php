<?php

namespace App\Http\Controllers\Investor;

use App\Http\Controllers\Controller;
use App\Models\Lot;
use App\Services\DynamicPricingService;
use App\Services\LotInvestmentService;
use App\Services\WalletService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LotController extends Controller
{
    public function __construct(
        private readonly DynamicPricingService $pricingService,
        private readonly LotInvestmentService $investmentService,
        private readonly WalletService $walletService,
    ) {}

    public function index(Request $request): Response
    {
        $query = Lot::query()
            ->with(['rack.warehouse.farm', 'fruitCrop.fruitType'])
            ->where('status', 'active')
            ->where(function ($q) use ($request) {
                // Only show lots that are within investment window
                $q->whereRaw('cycle_started_at IS NULL OR DATEDIFF(NOW(), cycle_started_at) / 30 + 1 <= last_investment_month');
            })
            ->withCount('investments');

        // Filter by fruit type
        if ($request->filled('fruit_type_id')) {
            $query->whereHas('fruitCrop', fn ($q) => $q->where('fruit_type_id', $request->fruit_type_id));
        }

        // Filter by farm
        if ($request->filled('farm_id')) {
            $query->whereHas('rack.warehouse.farm', fn ($q) => $q->where('id', $request->farm_id));
        }

        // Search by name
        if ($request->filled('search')) {
            $query->where('name', 'like', '%'.$request->search.'%');
        }

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDir = $request->get('sort_dir', 'desc');
        $query->orderBy($sortBy, $sortDir);

        $lots = $query->paginate(12)->withQueryString();

        // Get filter options
        $fruitTypes = \App\Models\FruitType::where('is_active', true)->get();
        $farms = \App\Models\Farm::where('status', 'active')->get();

        return Inertia::render('Investor/Lots/Index', [
            'lots' => $lots,
            'filters' => $request->only(['fruit_type_id', 'farm_id', 'search', 'sort_by', 'sort_dir']),
            'fruitTypes' => $fruitTypes,
            'farms' => $farms,
        ]);
    }

    public function show(Lot $lot): Response
    {
        /** @var \App\Models\User $user */
        $user = auth()->user();

        $lot->load(['rack.warehouse.farm', 'fruitCrop', 'priceSnapshots']);
        $priceTable = $this->pricingService->getPriceTable($lot);
        $currentMonth = $this->pricingService->currentCycleMonth($lot);
        $isOpen = $this->pricingService->isInvestmentOpen($lot);

        // Check if this investor already has an investment in this lot
        $existingInvestment = $lot->investments()
            ->where('user_id', $user->id)
            ->first();

        return Inertia::render('Investor/Lots/Show', [
            'lot' => $lot,
            'priceTable' => $priceTable,
            'currentCycleMonth' => $currentMonth,
            'isInvestmentOpen' => $isOpen,
            'monthlyRatePercentage' => $lot->monthly_increase_rate * 100,
            'myInvestment' => $existingInvestment,
        ]);
    }

    public function invest(Request $request, Lot $lot)
    {
        /** @var \App\Models\User $user */
        $user = auth()->user();

        $quantity = max(1, (int) $request->input('trees', 1));

        try {
            $investment = $this->investmentService->purchase($user, $lot, $quantity);

            return redirect()->route('investments.show', $investment)
                ->with('success', "Investment confirmed! You've invested in {$lot->name}.");
        } catch (\App\Exceptions\InsufficientTreesException $e) {
            return back()->withErrors(['lot' => $e->getMessage()]);
        } catch (\App\Exceptions\InvestmentCycleClosedException $e) {
            return back()->withErrors(['lot' => $e->getMessage()]);
        } catch (\App\Exceptions\KycNotVerifiedException $e) {
            return redirect()->route('kyc.index')
                ->withErrors(['kyc' => $e->getMessage()]);
        }
    }

    public function reinvest(Request $request, Lot $lot)
    {
        /** @var \App\Models\User $user */
        $user = auth()->user();

        $quantity = max(1, (int) $request->input('trees', 1));

        try {
            $investment = $this->investmentService->reinvestFromWallet(
                $user,
                $lot,
                $this->walletService,
                $quantity,
            );

            return redirect()->route('investments.show', $investment)
                ->with('success', "Reinvestment from wallet successful for {$lot->name}.");
        } catch (\App\Exceptions\InsufficientTreesException $e) {
            return back()->withErrors(['lot' => $e->getMessage()]);
        } catch (\App\Exceptions\InvestmentCycleClosedException $e) {
            return back()->withErrors(['lot' => $e->getMessage()]);
        } catch (\App\Exceptions\InsufficientWalletBalanceException $e) {
            return back()->withErrors(['wallet' => $e->getMessage()]);
        } catch (\App\Exceptions\KycNotVerifiedException $e) {
            return redirect()->route('kyc.index')
                ->withErrors(['kyc' => $e->getMessage()]);
        }
    }
}
