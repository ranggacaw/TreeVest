<?php

namespace App\Http\Controllers\FarmOwner;

use App\Http\Controllers\Controller;
use App\Models\Rack;
use App\Models\Warehouse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class WarehouseController extends Controller
{
    public function index(Request $request): Response
    {
        $warehouses = Warehouse::with(['racks', 'racks.lots' => function ($q) {
            $q->withCount('investments');
        }])
            ->whereHas('farm', fn ($q) => $q->where('owner_id', auth()->id()))
            ->withTrashed(false)
            ->latest()
            ->get();

        return Inertia::render('FarmOwner/Warehouses/Index', [
            'warehouses' => $warehouses,
        ]);
    }

    public function create(): Response
    {
        $farms = auth()->user()->farms()->where('status', 'active')->get(['id', 'name']);

        return Inertia::render('FarmOwner/Warehouses/Create', [
            'farms' => $farms,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'farm_id' => ['required', 'integer', 'exists:farms,id'],
            'name' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
        ]);

        // Ensure the farm belongs to the authenticated user
        $farm = auth()->user()->farms()->findOrFail($validated['farm_id']);

        $warehouse = $farm->warehouses()->create([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
        ]);

        return redirect()->route('farm-owner.warehouses.show', $warehouse)
            ->with('success', 'Warehouse created successfully.');
    }

    public function show(Warehouse $warehouse): Response
    {
        $this->authorizeWarehouse($warehouse);

        $warehouse->load(['racks.lots' => function ($q) {
            $q->withCount('investments')->withCount('activeInvestments');
        }, 'farm']);

        return Inertia::render('FarmOwner/Warehouses/Show', [
            'warehouse' => $warehouse,
        ]);
    }

    public function edit(Warehouse $warehouse): Response
    {
        $this->authorizeWarehouse($warehouse);

        return Inertia::render('FarmOwner/Warehouses/Edit', [
            'warehouse' => $warehouse,
        ]);
    }

    public function update(Request $request, Warehouse $warehouse)
    {
        $this->authorizeWarehouse($warehouse);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
        ]);

        $warehouse->update($validated);

        return redirect()->route('farm-owner.warehouses.show', $warehouse)
            ->with('success', 'Warehouse updated.');
    }

    public function destroy(Warehouse $warehouse)
    {
        $this->authorizeWarehouse($warehouse);

        if ($warehouse->hasActiveLots()) {
            throw ValidationException::withMessages([
                'warehouse' => 'Cannot delete warehouse with active lots. Complete or cancel all lots first.',
            ]);
        }

        $warehouse->delete();

        return redirect()->route('farm-owner.warehouses.index')
            ->with('success', 'Warehouse deleted.');
    }

    // ----- Rack management -----

    public function storeRack(Request $request, Warehouse $warehouse)
    {
        $this->authorizeWarehouse($warehouse);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
        ]);

        $warehouse->racks()->create($validated);

        return back()->with('success', 'Rack added.');
    }

    public function updateRack(Request $request, Warehouse $warehouse, Rack $rack)
    {
        $this->authorizeWarehouse($warehouse);
        abort_unless($rack->warehouse_id === $warehouse->id, 403);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
        ]);

        $rack->update($validated);

        return back()->with('success', 'Rack updated.');
    }

    public function destroyRack(Warehouse $warehouse, Rack $rack)
    {
        $this->authorizeWarehouse($warehouse);
        abort_unless($rack->warehouse_id === $warehouse->id, 403);

        if ($rack->lots()->whereNotIn('status', ['completed', 'cancelled'])->exists()) {
            throw ValidationException::withMessages([
                'rack' => 'Cannot delete a rack with active lots.',
            ]);
        }

        $rack->delete();

        return back()->with('success', 'Rack deleted.');
    }

    private function authorizeWarehouse(Warehouse $warehouse): void
    {
        abort_unless(
            $warehouse->farm->owner_id === auth()->id(),
            403,
            'This warehouse does not belong to your farm.'
        );
    }
}
