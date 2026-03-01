<?php

namespace App\Http\Controllers\Investor;

use App\Http\Controllers\Controller;
use App\Models\HealthAlert;
use App\Models\TreeHealthUpdate;
use App\Services\HealthMonitoringService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HealthFeedController extends Controller
{
    public function __construct(
        private HealthMonitoringService $healthMonitoringService
    ) {}

    public function index(Request $request): Response
    {
        $filters = $request->only(['severity', 'update_type', 'farm_id', 'fruit_type']);

        $healthFeed = $this->healthMonitoringService->getHealthFeedForInvestor(
            $request->user(),
            $filters
        );

        $alertsFeed = $this->healthMonitoringService->getHealthAlertsForInvestor(
            $request->user(),
            $filters
        );

        return Inertia::render('Investments/HealthFeed/Index', [
            'healthUpdates' => $healthFeed,
            'healthAlerts' => $alertsFeed,
            'filters' => $filters,
        ]);
    }

    public function show(Request $request, TreeHealthUpdate $healthUpdate): Response
    {
        $healthUpdate->load(['fruitCrop.farm', 'fruitCrop.fruitType', 'author']);

        return Inertia::render('Investments/HealthFeed/Show', [
            'healthUpdate' => $healthUpdate,
        ]);
    }

    public function alerts(Request $request): Response
    {
        $filters = $request->only(['severity', 'unresolved']);

        $alerts = $this->healthMonitoringService->getHealthAlertsForInvestor(
            $request->user(),
            $filters
        );

        return Inertia::render('Investments/HealthFeed/Alerts', [
            'healthAlerts' => $alerts,
            'filters' => $filters,
        ]);
    }
}
