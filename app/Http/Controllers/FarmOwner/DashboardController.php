<?php

namespace App\Http\Controllers\FarmOwner;

use App\Http\Controllers\Controller;
use App\Services\FarmOwnerDashboardService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request, FarmOwnerDashboardService $service)
    {
        $data = $service->getDashboardData($request->user());

        return Inertia::render('FarmOwner/Dashboard', $data);
    }
}
