<?php

namespace App\Listeners;

use App\Enums\AuditEventType;
use App\Services\AuditLogService;
use Illuminate\Auth\Events\Failed;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Events\Dispatcher;

class AuthenticationLogSubscriber
{
    public function __construct(
        protected AuditLogService $auditLogService
    ) {}

    /**
     * Handle user login events.
     */
    public function handleLogin(Login $event): void
    {
        $this->auditLogService->logAuthentication($event->user->id, true);
    }

    /**
     * Handle user logout events.
     */
    public function handleLogout(Logout $event): void
    {
        $this->auditLogService->logEvent(AuditEventType::LOGOUT, $event->user?->id);
    }

    /**
     * Handle failed authentication attempts.
     */
    public function handleFailed(Failed $event): void
    {
        // For failed attempts, we prioritize logging the user ID if available
        $userId = $event->user ? $event->user->id : null;
        
        $this->auditLogService->logAuthentication($userId, false);
    }

    /**
     * Register the listeners for the subscriber.
     */
    public function subscribe(Dispatcher $events): array
    {
        return [
            Login::class => 'handleLogin',
            Logout::class => 'handleLogout',
            Failed::class => 'handleFailed',
        ];
    }
}
