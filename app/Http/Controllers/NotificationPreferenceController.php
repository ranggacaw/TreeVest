<?php

namespace App\Http\Controllers;

use App\Enums\NotificationChannel;
use App\Enums\NotificationType;
use App\Http\Requests\UpdateNotificationPreferencesRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationPreferenceController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $preferences = [];
        foreach (NotificationType::cases() as $type) {
            foreach (NotificationChannel::cases() as $channel) {
                $pref = $user->notificationPreferences()
                    ->forType($type)
                    ->forChannel($channel)
                    ->first();

                $preferences[$type->value][$channel->value] = $pref ? $pref->enabled : true;
            }
        }

        return Inertia::render('Settings/Notifications', [
            'preferences' => $preferences,
            'types' => collect(NotificationType::cases())->map(fn ($t) => [
                'value' => $t->value,
                'label' => $t->label(),
            ]),
            'channels' => collect(NotificationChannel::cases())->map(fn ($c) => [
                'value' => $c->value,
                'label' => $c->label(),
            ]),
        ]);
    }

    public function update(UpdateNotificationPreferencesRequest $request)
    {
        $user = $request->user();
        $preferences = $request->validated();

        foreach ($preferences as $type => $channels) {
            foreach ($channels as $channel => $enabled) {
                $user->notificationPreferences()
                    ->forType($type)
                    ->forChannel($channel)
                    ->updateOrCreate(
                        [
                            'user_id' => $user->id,
                            'notification_type' => $type,
                            'channel' => $channel,
                        ],
                        [
                            'enabled' => $enabled,
                        ]
                    );
            }
        }

        return back()->with('success', 'Notification preferences updated successfully.');
    }
}
