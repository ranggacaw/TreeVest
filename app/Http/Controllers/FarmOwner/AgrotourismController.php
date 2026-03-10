<?php

namespace App\Http\Controllers\FarmOwner;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAgrotourismEventRequest;
use App\Http\Requests\UpdateAgrotourismEventRequest;
use App\Models\AgrotourismEvent;
use App\Models\Farm;
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
        $events = AgrotourismEvent::with(['farm'])
            ->whereHas('farm', fn ($q) => $q->where('owner_id', auth()->id()))
            ->withCount('confirmedRegistrations')
            ->latest('event_date')
            ->paginate(20);

        return Inertia::render('FarmOwner/Agrotourism/Index', [
            'events' => $events,
        ]);
    }

    public function create(): Response
    {
        $farms = Farm::where('owner_id', auth()->id())
            ->where('status', 'active')
            ->get(['id', 'name']);

        return Inertia::render('FarmOwner/Agrotourism/Create', [
            'farms' => $farms,
        ]);
    }

    public function store(StoreAgrotourismEventRequest $request): RedirectResponse
    {
        $farm = Farm::where('owner_id', auth()->id())
            ->findOrFail($request->farm_id);

        $event = $this->agrotourismService->createEvent($farm, $request->validated());

        return redirect()
            ->route('farm-owner.agrotourism.show', $event)
            ->with('success', __('Agrotourism event created successfully.'));
    }

    public function show(AgrotourismEvent $event): Response
    {
        $this->authorizeOwnership($event);

        $event->load(['farm', 'registrations.investor']);

        return Inertia::render('FarmOwner/Agrotourism/Show', [
            'event' => $event,
        ]);
    }

    public function edit(AgrotourismEvent $event): Response
    {
        $this->authorizeOwnership($event);

        $farms = Farm::where('owner_id', auth()->id())
            ->where('status', 'active')
            ->get(['id', 'name']);

        return Inertia::render('FarmOwner/Agrotourism/Edit', [
            'event' => $event,
            'farms' => $farms,
        ]);
    }

    public function update(UpdateAgrotourismEventRequest $request, AgrotourismEvent $event): RedirectResponse
    {
        $this->agrotourismService->updateEvent($event, $request->validated());

        return redirect()
            ->route('farm-owner.agrotourism.show', $event)
            ->with('success', __('Event updated successfully.'));
    }

    public function cancel(AgrotourismEvent $event): RedirectResponse
    {
        $this->authorizeOwnership($event);

        $this->agrotourismService->cancelEvent($event);

        return redirect()
            ->route('farm-owner.agrotourism.index')
            ->with('success', __('Event cancelled successfully.'));
    }

    public function closeRegistrations(AgrotourismEvent $event): RedirectResponse
    {
        $this->authorizeOwnership($event);

        $this->agrotourismService->closeRegistrations($event);

        return redirect()
            ->route('farm-owner.agrotourism.show', $event)
            ->with('success', __('Registrations closed.'));
    }

    private function authorizeOwnership(AgrotourismEvent $event): void
    {
        $event->loadMissing('farm');

        abort_unless($event->farm->owner_id === auth()->id(), 403);
    }
}
