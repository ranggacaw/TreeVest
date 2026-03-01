<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Farm;
use App\Models\Investment;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InvestmentController extends Controller
{
    public function index(Request $request)
    {
        $query = Investment::with(['user', 'tree.fruitCrop.farm']);

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        if ($request->has('farm_id') && $request->farm_id) {
            $query->whereHas('tree.fruitCrop.farm', function ($q) use ($request) {
                $q->where('id', $request->farm_id);
            });
        }

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $investments = $query->orderBy('created_at', 'desc')->paginate(20);

        $farms = Farm::where('status', \App\Enums\FarmStatus::ACTIVE)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('Admin/Investments/Index', [
            'investments' => $investments,
            'farms' => $farms,
            'filters' => [
                'status' => $request->status,
                'farm_id' => $request->farm_id,
                'search' => $request->search,
            ],
        ]);
    }

    public function show(Investment $investment)
    {
        $investment->load([
            'user',
            'tree.fruitCrop.farm',
            'transaction',
            'payouts' => function ($query) {
                $query->orderBy('created_at', 'desc');
            },
        ]);

        return Inertia::render('Admin/Investments/Show', [
            'investment' => $investment,
        ]);
    }
}
