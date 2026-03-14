<?php

namespace App\Http\Controllers\FarmOwner;

use App\Http\Controllers\Controller;
use App\Models\Lot;
use App\Models\Rack;
use App\Services\DynamicPricingService;
use App\Services\LotSellingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class LotController extends Controller
{
    public function __construct(
        private readonly DynamicPricingService $pricingService,
        private readonly LotSellingService $sellingService,
    ) {}

    public function index(): Response
    {
        $lots = Lot::with(['rack.warehouse.farm', 'fruitCrop'])
            ->forFarmOwner(auth()->id())
            ->withCount('investments')
            ->latest()
            ->paginate(20);

        return Inertia::render('FarmOwner/Lots/Index', [
            'lots' => $lots,
        ]);
    }

    public function create(): Response
    {
        $racks = Rack::with('warehouse.farm')
            ->whereHas('warehouse.farm', fn ($q) => $q->where('owner_id', auth()->id()))
            ->get()
            ->map(fn ($rack) => [
                'id' => $rack->id,
                'label' => "{$rack->warehouse->farm->name} → {$rack->warehouse->name} → {$rack->name}",
            ]);

        $fruitCrops = \App\Models\FruitCrop::whereHas('farm', fn ($q) => $q->where('owner_id', auth()->id()))
            ->get(['id', 'variant']);

        return Inertia::render('FarmOwner/Lots/Create', [
            'racks' => $racks,
            'fruitCrops' => $fruitCrops,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'rack_id' => ['required', 'integer', 'exists:racks,id'],
            'fruit_crop_id' => ['required', 'integer', 'exists:fruit_crops,id'],
            'name' => ['required', 'string', 'max:100'],
            'total_trees' => ['required', 'integer', 'min:1'],
            'base_price_per_tree_idr' => ['required', 'integer', 'min:1'],
            'monthly_increase_rate' => ['required', 'numeric', 'min:0', 'max:100'],
            'cycle_months' => ['required', 'integer', 'min:1', 'max:120'],
            'last_investment_month' => ['required', 'integer', 'min:1'],
            'cycle_started_at' => ['nullable', 'date'],
        ]);

        if ($validated['last_investment_month'] >= $validated['cycle_months']) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'last_investment_month' => 'Last investment month must be less than total cycle duration.',
            ]);
        }

        $lot = Lot::create([
            'rack_id' => $validated['rack_id'],
            'fruit_crop_id' => $validated['fruit_crop_id'],
            'name' => $validated['name'],
            'total_trees' => $validated['total_trees'],
            'base_price_per_tree_idr' => $validated['base_price_per_tree_idr'],
            'current_price_per_tree_idr' => $validated['base_price_per_tree_idr'],
            'monthly_increase_rate' => $validated['monthly_increase_rate'] / 100,
            'cycle_months' => $validated['cycle_months'],
            'last_investment_month' => $validated['last_investment_month'],
            'cycle_started_at' => $validated['cycle_started_at'],
            'status' => 'active',
        ]);

        return redirect()->route('farm-owner.lots.show', $lot)
            ->with('success', 'Lot created successfully.');
    }

    public function show(Lot $lot): Response
    {
        $this->authorizeLot($lot);

        $lot->load(['rack.warehouse.farm', 'fruitCrop', 'investments.user', 'priceSnapshots']);
        $priceTable = $this->pricingService->getPriceTable($lot);

        return Inertia::render('FarmOwner/Lots/Show', [
            'lot' => $lot,
            'priceTable' => $priceTable,
            'currentCycleMonth' => $this->pricingService->currentCycleMonth($lot),
            'monthlyRatePercentage' => $lot->monthly_increase_rate * 100,
        ]);
    }

    public function edit(Lot $lot): Response
    {
        $this->authorizeLot($lot);
        abort_unless($lot->status->isInvestable(), 422, 'Only active lots can be edited.');

        $racks = Rack::with('warehouse.farm')
            ->whereHas('warehouse.farm', fn ($q) => $q->where('owner_id', auth()->id()))
            ->get()
            ->map(fn ($rack) => [
                'id' => $rack->id,
                'label' => "{$rack->warehouse->farm->name} → {$rack->warehouse->name} → {$rack->name}",
            ]);

        $fruitCrops = \App\Models\FruitCrop::whereHas('farm', fn ($q) => $q->where('owner_id', auth()->id()))
            ->get(['id', 'variant']);

        return Inertia::render('FarmOwner/Lots/Edit', [
            'lot' => $lot,
            'racks' => $racks,
            'fruitCrops' => $fruitCrops,
        ]);
    }

    public function update(Request $request, Lot $lot)
    {
        $this->authorizeLot($lot);
        abort_unless($lot->status->isInvestable(), 422, 'Only active lots can be edited.');

        $validated = $request->validate([
            'rack_id' => ['required', 'integer', 'exists:racks,id'],
            'fruit_crop_id' => ['required', 'integer', 'exists:fruit_crops,id'],
            'name' => ['required', 'string', 'max:100'],
            'total_trees' => ['required', 'integer', 'min:1'],
            'base_price_per_tree_idr' => ['required', 'integer', 'min:1'],
            'monthly_increase_rate' => ['required', 'numeric', 'min:0', 'max:100'],
            'cycle_months' => ['required', 'integer', 'min:1', 'max:120'],
            'last_investment_month' => ['required', 'integer', 'min:1'],
            'cycle_started_at' => ['nullable', 'date'],
        ]);

        if ($validated['last_investment_month'] >= $validated['cycle_months']) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'last_investment_month' => 'Last investment month must be less than total cycle duration.',
            ]);
        }

        $lot->update([
            'rack_id' => $validated['rack_id'],
            'fruit_crop_id' => $validated['fruit_crop_id'],
            'name' => $validated['name'],
            'total_trees' => $validated['total_trees'],
            'base_price_per_tree_idr' => $validated['base_price_per_tree_idr'],
            'current_price_per_tree_idr' => $validated['base_price_per_tree_idr'],
            'monthly_increase_rate' => $validated['monthly_increase_rate'] / 100,
            'cycle_months' => $validated['cycle_months'],
            'last_investment_month' => $validated['last_investment_month'],
            'cycle_started_at' => $validated['cycle_started_at'],
        ]);

        return redirect()->route('farm-owner.lots.show', $lot)
            ->with('success', 'Lot updated.');
    }

    public function destroy(Lot $lot)
    {
        $this->authorizeLot($lot);

        $lot->loadCount('investments');

        if ($lot->investments_count > 0) {
            return back()->with('error', 'Cannot delete a lot that has investments.');
        }

        $lot->delete();

        return redirect()->route('farm-owner.lots.index')
            ->with('success', 'Lot deleted.');
    }

    public function recordHarvest(Request $request, Lot $lot)
    {
        $this->authorizeLot($lot);

        $validated = $request->validate([
            'total_fruit' => ['required', 'integer', 'min:0'],
            'total_weight_kg' => ['required', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string'],
            'proof_photo' => ['required', 'file', 'image', 'max:5120'],
        ]);

        $photoPath = $request->file('proof_photo')->store('lot-harvest-photos', 'public');

        $this->sellingService->recordHarvest(
            $lot,
            $validated['total_fruit'],
            (float) $validated['total_weight_kg'],
            $photoPath,
            $validated['notes'] ?? null
        );

        return redirect()->route('farm-owner.lots.show', $lot)
            ->with('success', 'Harvest data recorded. You can now submit sales revenue.');
    }

    public function submitSelling(Request $request, Lot $lot)
    {
        $this->authorizeLot($lot);

        $validated = $request->validate([
            'selling_revenue_idr' => ['required', 'integer', 'min:0'],
            'proof_photo' => ['required', 'file', 'image', 'max:5120'],
        ]);

        $photoPath = $request->file('proof_photo')->store('lot-selling-proofs', 'public');

        $this->sellingService->submitSellingRevenue(
            $lot,
            $validated['selling_revenue_idr'],
            $photoPath,
        );

        return redirect()->route('farm-owner.lots.show', $lot)
            ->with('success', 'Sales revenue submitted. Profit distribution is being processed.');
    }

    private function authorizeLot(Lot $lot): void
    {
        // Load hierarchy if not already loaded
        if (! $lot->relationLoaded('rack')) {
            $lot->load('rack.warehouse.farm');
        }

        abort_unless(
            $lot->rack->warehouse->farm->owner_id === auth()->id(),
            403,
            'This lot does not belong to your farm.'
        );
    }
}
