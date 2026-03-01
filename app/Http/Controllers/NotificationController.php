<?php

namespace App\Http\Controllers;

use App\Services\NotificationService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationController extends Controller
{
    public function __construct(
        private NotificationService $notificationService
    ) {}

    public function index(Request $request)
    {
        $user = $request->user();

        $notifications = $user->notifications()
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        $unreadCount = $user->unreadNotifications()->count();

        return Inertia::render('Notifications/Index', [
            'notifications' => $notifications,
            'unreadCount' => $unreadCount,
        ]);
    }

    public function show(Request $request, $id)
    {
        $user = $request->user();
        $notification = $user->notifications()->findOrFail($id);

        $this->notificationService->markAsRead($user, $notification->id);

        return back();
    }

    public function markAsRead(Request $request, $id)
    {
        $user = $request->user();
        $notification = $user->notifications()->findOrFail($id);

        $this->notificationService->markAsRead($user, $notification->id);

        return back();
    }

    public function markAllAsRead(Request $request)
    {
        $user = $request->user();
        $this->notificationService->markAsRead($user);

        return back()->with('success', 'All notifications marked as read.');
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $this->notificationService->deleteNotification($user, $id);

        return back()->with('success', 'Notification deleted.');
    }

    public function unreadCount(Request $request)
    {
        $user = $request->user();
        $count = $this->notificationService->getUnreadCount($user);

        return response()->json(['count' => $count]);
    }
}
