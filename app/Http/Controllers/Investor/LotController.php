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

        try {
            $investment = $this->investmentService->purchase($user, $lot);

            return redirect()->route('investments.show', $investment)
                ->with('success', "Investment confirmed! You've invested in {$lot->name}.");
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

        try {
            $investment = $this->investmentService->reinvestFromWallet(
                $user,
                $lot,
                $this->walletService
            );

            return redirect()->route('investments.show', $investment)
                ->with('success', "Reinvestment from wallet successful for {$lot->name}.");
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
