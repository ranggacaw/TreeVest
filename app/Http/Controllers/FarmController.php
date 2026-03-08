<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreFarmRequest;
use App\Http\Requests\UpdateFarmRequest;
use App\Models\Farm;
use App\Models\FarmImage;
use App\Services\FarmService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FarmController extends Controller
{
    public function __construct(
        protected FarmService $farmService
    ) {
    }

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
            ->with('success', __('farms.created') . ' ' . __('farms.pending_approval'));
    }

    public function show(Farm $farm)
    {
        $this->authorizeFarmAccess($farm);

        $farm->load(['images', 'certifications', 'owner']);

        // Load translated description
        $farm->description = $farm->translatedAttribute('description');

        return Inertia::render('Farms/Manage/Show', [
            'farm' => $farm,
        ]);
    }

    public function edit(Farm $farm)
    {
        $this->authorizeFarmAccess($farm);

        $farm->load(['images', 'certifications', 'fruitCrops.fruitType', 'fruitCrops.trees']);

        return Inertia::render('Farms/Manage/Edit', [
            'farm' => $farm,
        ]);
    }

    public function update(UpdateFarmRequest $request, Farm $farm)
    {
        $this->authorizeFarmAccess($farm);

        $farm = $this->farmService->updateFarm($farm, $request);

        $message = $farm->isPendingApproval()
            ? __('farms.updated') . ' ' . __('farms.pending_approval')
            : __('farms.updated');

        return redirect()->route('farms.manage.show', $farm)
            ->with('success', $message);
    }

    public function destroy(Farm $farm)
    {
        $this->authorizeFarmAccess($farm);

        $this->farmService->deleteFarm($farm);

        return redirect()->route('farms.manage.index')
            ->with('success', __('farms.deleted'));
    }

    public function deleteImage(Farm $farm, FarmImage $image)
    {
        $this->authorizeFarmAccess($farm);

        if ($image->farm_id !== $farm->id) {
            abort(403, 'Image does not belong to this farm.');
        }

        if (!str_starts_with($image->file_path, 'http')) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($image->file_path);
        }

        $image->delete();

        return back()->with('success', __('farms.image_deleted'));
    }

    protected function authorizeFarmAccess(Farm $farm): void
    {
        if ($farm->owner_id !== auth()->id()) {
            abort(403, 'You do not have access to this farm.');
        }
    }
}
