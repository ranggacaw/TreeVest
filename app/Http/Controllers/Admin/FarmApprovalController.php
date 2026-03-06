<?php

namespace App\Http\Controllers\Admin;

use App\Enums\FarmStatus;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Controller;
use App\Models\Farm;
use App\Services\FarmService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FarmApprovalController extends Controller
{
    public function __construct(
        protected FarmService $farmService
    ) {
    }

    public function index(Request $request)
    {
        $status = $request->get('status');

        $query = Farm::with(['owner', 'images']);

        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        $farms = $query->orderBy('created_at', 'desc')->paginate(20);

        $stats = [
            'total' => Farm::count(),
            'pending' => Farm::where('status', FarmStatus::PENDING_APPROVAL->value)->count(),
            'active' => Farm::where('status', FarmStatus::ACTIVE->value)->count(),
        ];

        return Inertia::render('Admin/Farms/Index', [
            'farms' => $farms,
            'filters' => [
                'status' => $status,
            ],
            'stats' => $stats,
        ]);
    }

    public function show(Farm $farm)
    {
        $farm->load(['owner', 'images', 'certifications']);

        return Inertia::render('Admin/Farms/Show', [
            'farm' => $farm,
        ]);
    }

    public function approve(Farm $farm)
    {
        // $this->authorize('approve farms');

        $farm = $this->farmService->approveFarm($farm, auth()->user());

        DashboardController::invalidateMetricsCache();

        return back()->with('success', __('admin.farm_approved'));
    }

    public function reject(Request $request, Farm $farm)
    {
        $request->validate([
            'reason' => ['required', 'string', 'max:1000'],
        ]);

        // $this->authorize('reject farms');

        $farm = $this->farmService->rejectFarm($farm, auth()->user(), $request->input('reason'));

        DashboardController::invalidateMetricsCache();

        return back()->with('success', __('admin.farm_rejected'));
    }

    public function suspend(Farm $farm)
    {
        // $this->authorize('suspend farms');

        $farm = $this->farmService->suspendFarm($farm, auth()->user());

        DashboardController::invalidateMetricsCache();

        return back()->with('success', __('admin.farm_suspended'));
    }

    public function reinstate(Farm $farm)
    {
        // $this->authorize('reinstate farms');

        $farm = $this->farmService->reinstateFarm($farm, auth()->user());

        DashboardController::invalidateMetricsCache();

        return back()->with('success', __('farms.reactivated'));
    }
}
