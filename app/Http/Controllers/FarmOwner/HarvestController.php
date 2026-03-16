<?php

namespace App\Http\Controllers\FarmOwner;

use App\Enums\QualityGrade;
use App\Http\Controllers\Controller;
use App\Http\Requests\FarmOwner\RecordYieldRequest;
use App\Http\Requests\FarmOwner\StoreHarvestRequest;
use App\Models\FruitType;
use App\Models\Harvest;
use App\Models\Tree;
use App\Services\HarvestService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HarvestController extends Controller
{
    public function __construct(
        private HarvestService $harvestService
    ) {}

    public function index(Request $request): Response
    {
        $query = Harvest::with(['tree', 'fruitCrop', 'fruitCrop.fruitType', 'fruitCrop.farm'])
            ->whereRelation('tree.fruitCrop.farm', 'owner_id', auth()->id());

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('tree', function ($treeQuery) use ($search) {
                    $treeQuery->where('tree_identifier', 'like', "%{$search}%");
                })
                    ->orWhereHas('fruitCrop.farm', function ($farmQuery) use ($search) {
                        $farmQuery->where('name', 'like', "%{$search}%");
                    });
            });
        }

        if ($request->has('fruit_type_id') && $request->fruit_type_id) {
            $query->whereHas('fruitCrop', function ($cropQuery) use ($request) {
                $cropQuery->where('fruit_type_id', $request->fruit_type_id);
            });
        }

        $harvests = $query->orderBy('scheduled_date', 'desc')
            ->paginate(20);

        $fruitTypeIds = Harvest::whereRelation('tree.fruitCrop.farm', 'owner_id', auth()->id())
            ->with('fruitCrop')
            ->get()
            ->pluck('fruitCrop.fruit_type_id')
            ->filter()
            ->unique();

        $fruitTypes = FruitType::whereIn('id', $fruitTypeIds)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('FarmOwner/Harvests/Index', [
            'harvests' => $harvests,
            'filters' => $request->only(['search', 'fruit_type_id']),
            'fruitTypes' => $fruitTypes,
        ]);
    }

    public function create(): Response
    {
        $trees = Tree::with(['fruitCrop.fruitType', 'fruitCrop.farm'])
            ->whereRelation('fruitCrop.farm', 'owner_id', auth()->id())
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
            ->with('success', __('harvests.scheduled', ['date' => $request->validated()['scheduled_date']]));
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

        return back()->with('success', __('harvests.started'));
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

        return back()->with('success', __('harvests.yield_recorded', ['yield' => $request->actual_yield_kg]));
    }

    public function confirm(Harvest $harvest): RedirectResponse
    {
        if ($harvest->tree->fruitCrop->farm->owner_id !== auth()->id()) {
            abort(403);
        }

        $this->harvestService->confirmComplete($harvest, auth()->user());

        return back()->with('success', __('harvests.completed'));
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

        return back()->with('success', __('harvests.failed'));
    }
}
