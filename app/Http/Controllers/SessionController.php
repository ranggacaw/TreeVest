<?php

namespace App\Http\Controllers;

use App\Services\SessionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class SessionController extends Controller
{
    public function __construct(
        private SessionService $sessionService
    ) {}

    public function index(): Response
    {
        return Inertia::render('Profile/ActiveSessions', [
            'sessions' => $this->sessionService->getActiveSessions(Auth::user()),
        ]);
    }

    public function destroy(string $sessionId): RedirectResponse
    {
        $success = $this->sessionService->revokeSession($sessionId);

        if (! $success) {
            return back()->with('error', 'Failed to revoke session.');
        }

        return back()->with('status', 'session-revoked');
    }

    public function destroyAll(): RedirectResponse
    {
        $count = $this->sessionService->revokeAllOtherSessions(Auth::user());

        return back()->with('status', "other-sessions-revoked-$count");
    }
}
