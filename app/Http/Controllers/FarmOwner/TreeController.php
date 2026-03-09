<?php

namespace App\Http\Controllers\FarmOwner;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTreeRequest;
use App\Http\Requests\UpdateTreeRequest;
use App\Http\Requests\UpdateTreeStatusRequest;
use App\Models\Tree;
use App\Services\TreePricingService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class TreeController extends Controller
{
    public function __construct(
        private TreePricingService $pricingService
    ) {
    }

    public function index(): Response
    {
        $search = request('search');

        $trees = Tree::whereHas('fruitCrop.farm', function ($q) {
            $q->where('owner_id', auth()->id());
        })
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('tree_identifier', 'like', "%{$search}%")
                        ->orWhereHas('fruitCrop.fruitType', function ($q2) use ($search) {
                            $q2->where('name', 'like', "%{$search}%");
                        })
                        ->orWhereHas('fruitCrop.farm', function ($q3) use ($search) {
                            $q3->where('name', 'like', "%{$search}%");
                        });
                });
            })
            ->with(['fruitCrop.fruitType', 'fruitCrop.farm'])
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('FarmOwner/Trees/Index', [
            'trees' => $trees,
            'filters' => request()->only(['search']),
        ]);
    }

    public function create(): Response
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
        $validated['price_cents'] = 0;

        $tempTree = new Tree($validated);
        $validated['expected_roi_percent'] = $this->pricingService->calculateRoi($tempTree);

        unset($validated['pricing_config']);

        $tree = Tree::create($validated);
        $this->pricingService->updateTreePrice($tree);

        return redirect()->route('farm-owner.trees.index')
            ->with('success', 'Tree created successfully.');
    }

    public function edit(Tree $tree): Response
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

    public function destroy(Tree $tree): RedirectResponse
    {
        $tree->delete();

        return redirect()->route('farm-owner.trees.index')
            ->with('success', 'Tree deleted successfully.');
    }
}
