<?php

namespace App\Http\Controllers;

use App\Models\Farm;
use App\Services\FarmService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MarketplaceFarmController extends Controller
{
    public function __construct(
        protected FarmService $farmService
    ) {}

    public function index(Request $request)
    {
        $farms = $this->farmService->getActiveFarms($request);

        $countries = Farm::active()
            ->distinct()
            ->pluck('country')
            ->filter()
            ->sort()
            ->values();

        $climates = Farm::active()
            ->distinct()
            ->pluck('climate')
            ->filter()
            ->sort()
            ->values();

        return Inertia::render('Farms/Index', [
            'farms' => $farms,
            'filters' => $request->only(['search', 'country', 'climate']),
            'options' => [
                'countries' => $countries,
                'climates' => $climates,
            ],
        ]);
    }

    public function show(Farm $farm)
    {
        if (!$farm->isActive()) {
            abort(404);
        }

        $farm->load(['images', 'certifications', 'owner']);

        return Inertia::render('Farms/Show', [
            'farm' => $farm,
        ]);
    }

    public function nearby(Request $request)
    {
        $request->validate([
            'lat' => ['required', 'numeric', 'min:-90', 'max:90'],
            'lng' => ['required', 'numeric', 'min:-180', 'max:180'],
            'radius' => ['nullable', 'numeric', 'min:1', 'max:500'],
        ]);

        $farms = $this->farmService->getNearbyFarms(
            $request->input('lat'),
            $request->input('lng'),
            $request->input('radius', 50)
        );

        return response()->json([
            'farms' => $farms,
        ]);
    }
}
