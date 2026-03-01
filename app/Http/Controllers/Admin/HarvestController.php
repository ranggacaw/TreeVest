<?php

namespace App\Http\Controllers\Admin;

use App\Enums\HarvestStatus;
use App\Http\Controllers\Controller;
use App\Models\Harvest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HarvestController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Harvest::with(['tree', 'fruitCrop', 'tree.fruitCrop.farm']);

        if ($request->has('status')) {
            $query->where('status', HarvestStatus::from($request->status));
        }

        $harvests = $query->orderBy('scheduled_date', 'desc')
            ->paginate(20);

        return Inertia::render('Admin/Harvests/Index', [
            'harvests' => $harvests,
            'filters' => $request->only('status'),
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
