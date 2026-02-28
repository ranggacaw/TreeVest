<?php

namespace App\Http\Controllers\FarmOwner;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTreeRequest;
use App\Http\Requests\UpdateTreeRequest;
use App\Http\Requests\UpdateTreeStatusRequest;
use App\Models\Tree;
use App\Services\TreePricingService;
use Illuminate\Http\RedirectResponse;
use Illuminate\View\View;
use Inertia\Inertia;

class TreeController extends Controller
{
    public function __construct(
        private TreePricingService $pricingService
    ) {}

    public function index(): View
    {
        $trees = Tree::whereHas('fruitCrop.farm', function ($q) {
            $q->where('owner_id', auth()->id());
        })->with(['fruitCrop.fruitType', 'fruitCrop.farm'])->paginate(20);

        return Inertia::render('FarmOwner/Trees/Index', [
            'trees' => $trees,
        ]);
    }

    public function create(): View
    {
        $user = auth()->user();
        $crops = \App\Models\FruitCrop::whereHas('farm', function ($q) use ($user) {
            $q->where('owner_id', $user->id);
        })->with('fruitType')->get();

        return Inertia::render('FarmOwner/Trees/Create', [
            'crops' => $crops,
        ]);
    }

    public function store(StoreTreeRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $validated['pricing_config_json'] = $validated['pricing_config'];
        unset($validated['pricing_config']);

        $tree = Tree::create($validated);
        $this->pricingService->updateTreePrice($tree);

        return redirect()->route('farm-owner.trees.index')
            ->with('success', 'Tree created successfully.');
    }

    public function edit(Tree $tree): View
    {
        $user = auth()->user();
        $crops = \App\Models\FruitCrop::whereHas('farm', function ($q) use ($user) {
            $q->where('owner_id', $user->id);
        })->with('fruitType')->get();

        return Inertia::render('FarmOwner/Trees/Edit', [
            'tree' => $tree->load(['fruitCrop.fruitType', 'fruitCrop.farm']),
            'crops' => $crops,
        ]);
    }

    public function update(UpdateTreeRequest $request, Tree $tree): RedirectResponse
    {
        $validated = $request->validated();
        $validated['pricing_config_json'] = $validated['pricing_config'];
        unset($validated['pricing_config']);

        $tree->update($validated);
        $this->pricingService->updateTreePrice($tree);

        return redirect()->route('farm-owner.trees.index')
            ->with('success', 'Tree updated successfully.');
    }

    public function updateStatus(UpdateTreeStatusRequest $request, Tree $tree): RedirectResponse
    {
        $tree->status = $request->input('status');
        $tree->save();

        return back()->with('success', 'Tree status updated successfully.');
    }
}
