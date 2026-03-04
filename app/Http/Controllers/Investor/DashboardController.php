<?php

namespace App\Http\Controllers\Investor;

use App\Http\Controllers\Controller;
use App\Services\InvestorDashboardService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request, InvestorDashboardService $service)
    {
        $data = $service->getDashboardData($request->user());

        return Inertia::render('Investor/Dashboard', $data);
    }
}
