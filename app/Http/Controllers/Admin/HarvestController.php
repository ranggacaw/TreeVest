<?php

namespace App\Http\Controllers\Admin;

use App\Enums\HarvestStatus;
use App\Http\Controllers\Controller;
use App\Models\FruitType;
use App\Models\Harvest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HarvestController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Harvest::with(['tree', 'fruitCrop', 'fruitCrop.farm', 'fruitCrop.fruitType']);

        if ($request->has('status') && $request->status) {
            $query->where('status', HarvestStatus::from($request->status));
        }

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

        $fruitTypes = FruitType::active()
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('Admin/Harvests/Index', [
            'harvests' => $harvests,
            'filters' => $request->only(['status', 'search', 'fruit_type_id']),
            'fruitTypes' => $fruitTypes,
        ]);
    }

    public function show(Harvest $harvest): Response
    {
        $harvest->load(['tree', 'fruitCrop', 'marketPrice', 'confirmedBy', 'payouts.investor', 'tree.fruitCrop.farm']);

        return Inertia::render('Admin/Harvests/Show', [
            'harvest' => $harvest,
        ]);
    }
}
