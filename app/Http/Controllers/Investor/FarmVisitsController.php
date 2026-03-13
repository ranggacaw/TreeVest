<?php

namespace App\Http\Controllers\Investor;

use App\Http\Controllers\Controller;
use App\Models\AgrotourismRegistration;
use Inertia\Inertia;
use Inertia\Response;

class FarmVisitsController extends Controller
{
    public function index(): Response
    {
        $registrations = AgrotourismRegistration::with(['event.farm'])
            ->where('user_id', auth()->id())
            ->whereHas('event', fn ($q) => $q->where('event_date', '>=', now()))
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Investor/FarmVisits/Index', [
            'registrations' => $registrations,
        ]);
    }
}
