<?php

namespace App\Http\Controllers\FarmOwner;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreFruitCropRequest;
use App\Http\Requests\UpdateFruitCropRequest;
use App\Models\FruitCrop;
use Illuminate\Http\RedirectResponse;
use Illuminate\View\View;
use Inertia\Inertia;

class FruitCropController extends Controller
{
    public function index(): View
    {
        $crops = FruitCrop::whereHas('farm', function ($q) {
            $q->where('owner_id', auth()->id());
        })->with(['fruitType', 'farm'])->paginate(20);

        return Inertia::render('FarmOwner/Crops/Index', [
            'crops' => $crops,
        ]);
    }

    public function create(): View
    {
        $user = auth()->user();
        $farms = $user->farms ?? collect();
        $fruitTypes = \App\Models\FruitType::active()->get();

        return Inertia::render('FarmOwner/Crops/Create', [
            'farms' => $farms,
            'fruitTypes' => $fruitTypes,
        ]);
    }

    public function store(StoreFruitCropRequest $request): RedirectResponse
    {
        FruitCrop::create($request->validated());

        return redirect()->route('farm-owner.crops.index')
            ->with('success', 'Fruit crop created successfully.');
    }

    public function edit(FruitCrop $fruitCrop): View
    {
        $user = auth()->user();
        $farms = $user->farms ?? collect();
        $fruitTypes = \App\Models\FruitType::active()->get();

        return Inertia::render('FarmOwner/Crops/Edit', [
            'fruitCrop' => $fruitCrop->load(['fruitType', 'farm']),
            'farms' => $farms,
            'fruitTypes' => $fruitTypes,
        ]);
    }

    public function update(UpdateFruitCropRequest $request, FruitCrop $fruitCrop): RedirectResponse
    {
        $fruitCrop->update($request->validated());

        return redirect()->route('farm-owner.crops.index')
            ->with('success', 'Fruit crop updated successfully.');
    }

    public function destroy(FruitCrop $fruitCrop): RedirectResponse
    {
        if ($fruitCrop->trees()->exists()) {
            return back()->with('error', 'Cannot delete fruit crop with existing trees.');
        }

        $fruitCrop->delete();

        return redirect()->route('farm-owner.crops.index')
            ->with('success', 'Fruit crop deleted successfully.');
    }
}
