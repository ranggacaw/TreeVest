<?php

namespace App\Http\Controllers;

use App\Services\InvestmentPortfolioService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PortfolioDashboardController extends Controller
{
    public function __construct(
        private InvestmentPortfolioService $portfolioService
    ) {}

    public function index(Request $request)
    {
        $user = $request->user();
        $summary = $this->portfolioService->getPortfolioSummary($user->id);
        $diversification = $this->portfolioService->getDiversificationData($user->id);
        $performance = $this->portfolioService->getPerformanceMetrics($user->id);
        $upcomingHarvests = $this->portfolioService->getUpcomingHarvests($user->id);
        $investments = $this->portfolioService->getInvestmentsWithDetails($user->id, 20);

        return Inertia::render('Portfolio/Dashboard', [
            'summary' => $summary,
            'diversification' => $diversification,
            'performance' => $performance,
            'upcomingHarvests' => $upcomingHarvests,
            'investments' => $investments,
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
