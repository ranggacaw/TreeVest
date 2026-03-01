<?php

namespace App\Http\Controllers\FarmOwner;

use App\Enums\QualityGrade;
use App\Http\Controllers\Controller;
use App\Http\Requests\FarmOwner\RecordYieldRequest;
use App\Http\Requests\FarmOwner\StoreHarvestRequest;
use App\Models\Harvest;
use App\Models\Tree;
use App\Services\HarvestService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class HarvestController extends Controller
{
    public function __construct(
        private HarvestService $harvestService
    ) {}

    public function index(): Response
    {
        $harvests = Harvest::with(['tree', 'fruitCrop'])
            ->whereRelation('tree.fruitCrop.farm', 'owner_id', auth()->id())
            ->orderBy('scheduled_date', 'desc')
            ->paginate(20);

        return Inertia::render('FarmOwner/Harvests/Index', [
            'harvests' => $harvests,
        ]);
    }

    public function create(): Response
    {
        $trees = Tree::whereRelation('fruitCrop.farm', 'owner_id', auth()->id())
            ->investable()
            ->get();

        return Inertia::render('FarmOwner/Harvests/Create', [
            'trees' => $trees,
        ]);
    }

    public function store(StoreHarvestRequest $request): RedirectResponse
    {
        $tree = Tree::findOrFail($request->tree_id);

        if ($tree->fruitCrop->farm->owner_id !== auth()->id()) {
            abort(403);
        }

        $this->harvestService->scheduleHarvest(auth()->user(), $tree, $request->validated());

        return redirect()->route('farm-owner.harvests.index')
            ->with('success', 'Harvest scheduled successfully.');
    }

    public function show(Harvest $harvest): Response
    {
        if ($harvest->tree->fruitCrop->farm->owner_id !== auth()->id()) {
            abort(403);
        }

        $harvest->load(['tree', 'fruitCrop', 'marketPrice', 'confirmedBy', 'payouts.investor']);

        return Inertia::render('FarmOwner/Harvests/Show', [
            'harvest' => $harvest,
        ]);
    }

    public function startHarvest(Harvest $harvest): RedirectResponse
    {
        if ($harvest->tree->fruitCrop->farm->owner_id !== auth()->id()) {
            abort(403);
        }

        $this->harvestService->startHarvest($harvest, auth()->user());

        return back()->with('success', 'Harvest started.');
    }

    public function recordYield(RecordYieldRequest $request, Harvest $harvest): RedirectResponse
    {
        if ($harvest->tree->fruitCrop->farm->owner_id !== auth()->id()) {
            abort(403);
        }

        $grade = QualityGrade::from($request->quality_grade);

        $this->harvestService->recordActualYield(
            $harvest,
            (float) $request->actual_yield_kg,
            $grade,
            auth()->user()
        );

        return back()->with('success', 'Yield recorded successfully.');
    }

    public function confirm(Harvest $harvest): RedirectResponse
    {
        if ($harvest->tree->fruitCrop->farm->owner_id !== auth()->id()) {
            abort(403);
        }

        $this->harvestService->confirmComplete($harvest, auth()->user());

        return back()->with('success', 'Harvest confirmed and payouts calculated.');
    }

    public function fail(\Illuminate\Http\Request $request, Harvest $harvest): RedirectResponse
    {
        if ($harvest->tree->fruitCrop->farm->owner_id !== auth()->id()) {
            abort(403);
        }

        $request->validate([
            'notes' => ['required', 'string'],
        ]);

        $this->harvestService->failHarvest($harvest, auth()->user(), $request->notes);

        return back()->with('success', 'Harvest marked as failed.');
    }
}
