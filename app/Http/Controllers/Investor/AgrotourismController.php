<?php

namespace App\Http\Controllers\Investor;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAgrotourismRegistrationRequest;
use App\Models\AgrotourismEvent;
use App\Models\AgrotourismRegistration;
use App\Services\AgrotourismService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class AgrotourismController extends Controller
{
    public function __construct(
        private readonly AgrotourismService $agrotourismService
    ) {
    }

    public function index(): Response
    {
        $events = AgrotourismEvent::with(['farm'])
            ->upcoming()
            ->open()
            ->withCount('confirmedRegistrations')
            ->orderBy('event_date')
            ->paginate(20);

        $myRegistrations = AgrotourismRegistration::with(['event.farm'])
            ->where('user_id', auth()->id())
            ->latest()
            ->get();

        return Inertia::render('Investor/Agrotourism/Index', [
            'events' => $events,
            'myRegistrations' => $myRegistrations,
        ]);
    }

    public function register(StoreAgrotourismRegistrationRequest $request, AgrotourismEvent $event): RedirectResponse
    {
        $this->agrotourismService->registerInvestor(
            $event,
            auth()->user(),
            $request->validated('registration_type')
        );

        return redirect()
            ->route('investor.agrotourism.index')
            ->with('success', __('You have been registered for the event.'));
    }

    public function cancelRegistration(AgrotourismRegistration $registration): RedirectResponse
    {
        abort_unless($registration->user_id === auth()->id(), 403);

        $this->agrotourismService->cancelRegistration($registration);

        return redirect()
            ->route('investor.agrotourism.index')
            ->with('success', __('Your registration has been cancelled.'));
    }
}
