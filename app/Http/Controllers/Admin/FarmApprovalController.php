<?php

namespace App\Http\Controllers\Admin;

use App\Enums\FarmStatus;
use App\Http\Controllers\Controller;
use App\Models\Farm;
use App\Services\FarmService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FarmApprovalController extends Controller
{
    public function __construct(
        protected FarmService $farmService
    ) {}

    public function index(Request $request)
    {
        $status = $request->get('status');

        $query = Farm::with(['owner', 'images']);

        if ($status) {
            $query->where('status', $status);
        } else {
            $query->whereIn('status', [
                FarmStatus::PENDING_APPROVAL->value,
                FarmStatus::SUSPENDED->value,
            ]);
        }

        $farms = $query->orderBy('created_at', 'desc')->paginate(20);

        return Inertia::render('Admin/Farms/Index', [
            'farms' => $farms,
            'filters' => [
                'status' => $status,
            ],
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
        $this->authorize('approve farms');

        $farm = $this->farmService->approveFarm($farm, auth()->user());

        return back()->with('success', 'Farm approved successfully.');
    }

    public function reject(Request $request, Farm $farm)
    {
        $request->validate([
            'reason' => ['required', 'string', 'max:1000'],
        ]);

        $this->authorize('reject farms');

        $farm = $this->farmService->rejectFarm($farm, auth()->user(), $request->input('reason'));

        return back()->with('success', 'Farm rejected.');
    }

    public function suspend(Farm $farm)
    {
        $this->authorize('suspend farms');

        $farm = $this->farmService->suspendFarm($farm, auth()->user());

        return back()->with('success', 'Farm suspended successfully.');
    }

    public function reinstate(Farm $farm)
    {
        $this->authorize('reinstate farms');

        $farm = $this->farmService->reinstateFarm($farm, auth()->user());

        return back()->with('success', 'Farm reinstated successfully.');
    }
}
