<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AgrotourismEvent;
use App\Services\AgrotourismService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class AgrotourismController extends Controller
{
    public function __construct(
        private readonly AgrotourismService $agrotourismService
    ) {}

    public function index(): Response
    {
        $events = AgrotourismEvent::with(['farm.owner'])
            ->withCount('confirmedRegistrations')
            ->latest('event_date')
            ->paginate(30);

        return Inertia::render('Admin/Agrotourism/Index', [
            'events' => $events,
        ]);
    }

    public function suspend(AgrotourismEvent $event): RedirectResponse
    {
        $this->agrotourismService->cancelEvent($event);

        return redirect()
            ->route('admin.agrotourism.index')
            ->with('success', __('Event suspended successfully.'));
    }
}
