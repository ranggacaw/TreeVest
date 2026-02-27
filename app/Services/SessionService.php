<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Jenssegers\Agent\Agent;

class SessionService
{
    protected Agent $agent;

    public function __construct()
    {
        $this->agent = new Agent();
    }

    public function getActiveSessions(User $user): \Illuminate\Support\Collection
    {
        $currentSessionId = session()->getId();

        return DB::table('sessions')
            ->where('user_id', $user->id)
            ->orderBy('last_activity', 'desc')
            ->get()
            ->map(function ($session) use ($currentSessionId) {
                $this->agent->setUserAgent($session->user_agent);

                return [
                    'id' => $session->id,
                    'device' => $this->getDeviceName($session->user_agent),
                    'platform' => $this->agent->platform(),
                    'browser' => $this->agent->browser(),
                    'ip_address' => $session->ip_address,
                    'last_activity' => $this->formatLastActivity($session->last_activity),
                    'is_current' => $session->id === $currentSessionId,
                ];
            });
    }

    public function revokeSession(string $sessionId): bool
    {
        $currentSessionId = session()->getId();

        if ($sessionId === $currentSessionId) {
            return false;
        }

        $deleted = DB::table('sessions')
            ->where('id', $sessionId)
            ->delete();

        return $deleted > 0;
    }

    public function revokeAllOtherSessions(User $user): int
    {
        $currentSessionId = session()->getId();

        $deleted = DB::table('sessions')
            ->where('user_id', $user->id)
            ->where('id', '!=', $currentSessionId)
            ->delete();

        return $deleted;
    }

    public function updateLastLogin(User $user, Request $request): void
    {
        $user->update([
            'last_login_at' => now(),
            'last_login_ip' => $request->ip(),
        ]);
    }

    protected function getDeviceName(string $userAgent): string
    {
        $this->agent->setUserAgent($userAgent);

        if ($this->agent->isDesktop()) {
            return 'Desktop';
        }

        if ($this->agent->isTablet()) {
            return 'Tablet';
        }

        if ($this->agent->isMobile()) {
            return $this->agent->device() ?: 'Mobile';
        }

        return 'Unknown';
    }

    protected function formatLastActivity(int $timestamp): string
    {
        return \Carbon\Carbon::createFromTimestamp($timestamp)->diffForHumans();
    }
}
