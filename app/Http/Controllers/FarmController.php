<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreFarmRequest;
use App\Http\Requests\UpdateFarmRequest;
use App\Models\Farm;
use App\Services\FarmService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FarmController extends Controller
{
    public function __construct(
        protected FarmService $farmService
    ) {}

    public function index(Request $request)
    {
        $farms = $request->user()
            ->farms()
            ->with(['images', 'certifications'])
            ->orderBy('created_at', 'desc')
            ->paginate(12);

        return Inertia::render('Farms/Manage/Index', [
            'farms' => $farms,
        ]);
    }

    public function create()
    {
        return Inertia::render('Farms/Manage/Create');
    }

    public function store(StoreFarmRequest $request)
    {
        $farm = $this->farmService->createFarm($request->user(), $request);

        return redirect()->route('farms.manage.index')
            ->with('success', 'Farm created successfully. It is pending approval.');
    }

    public function show(Farm $farm)
    {
        $this->authorizeFarmAccess($farm);

        $farm->load(['images', 'certifications', 'owner']);

        return Inertia::render('Farms/Manage/Show', [
            'farm' => $farm,
        ]);
    }

    public function edit(Farm $farm)
    {
        $this->authorizeFarmAccess($farm);

        $farm->load(['images', 'certifications']);

        return Inertia::render('Farms/Manage/Edit', [
            'farm' => $farm,
        ]);
    }

    public function update(UpdateFarmRequest $request, Farm $farm)
    {
        $this->authorizeFarmAccess($farm);

        $farm = $this->farmService->updateFarm($farm, $request);

        $message = $farm->isPendingApproval()
            ? 'Farm updated successfully. It is pending approval.'
            : 'Farm updated successfully.';

        return redirect()->route('farms.manage.show', $farm)
            ->with('success', $message);
    }

    public function destroy(Farm $farm)
    {
        $this->authorizeFarmAccess($farm);

        $this->farmService->deleteFarm($farm);

        return redirect()->route('farms.manage.index')
            ->with('success', 'Farm deleted successfully.');
    }

    protected function authorizeFarmAccess(Farm $farm): void
    {
        if ($farm->owner_id !== auth()->id()) {
            abort(403, 'You do not have access to this farm.');
        }
    }
}
