<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        if (! $request->user()) {
            return redirect()->route('login');
        }

        $userRole = $request->user()->role;

        if (! in_array($userRole, $roles)) {
            $this->logUnauthorizedAccess($request, $userRole, $roles);
            abort(403, 'Unauthorized access');
        }

        return $next($request);
    }

    protected function logUnauthorizedAccess(Request $request, string $userRole, array $requiredRoles): void
    {
        \App\Models\AuditLog::create([
            'user_id' => $request->user()?->id,
            'event_type' => \App\Enums\AuditEventType::UNAUTHORIZED_ACCESS_ATTEMPT,
            'event_data' => [
                'action' => 'unauthorized_access_attempt',
                'user_role' => $userRole,
                'required_roles' => $requiredRoles,
                'route' => $request->route()?->getName(),
                'url' => $request->fullUrl(),
            ],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);
    }
}
