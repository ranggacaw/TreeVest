<?php

namespace App\Http\Controllers\Admin;

use App\Enums\NotificationChannel;
use App\Enums\NotificationType;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreNotificationTemplateRequest;
use App\Http\Requests\UpdateNotificationTemplateRequest;
use App\Models\NotificationTemplate;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationTemplateController extends Controller
{
    public function index(Request $request)
    {
        $templates = NotificationTemplate::query()
            ->orderBy('type')
            ->orderBy('channel')
            ->paginate(20);

        return Inertia::render('Admin/NotificationTemplates/Index', [
            'templates' => $templates,
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/NotificationTemplates/Create', [
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

    public function store(StoreNotificationTemplateRequest $request)
    {
        NotificationTemplate::create($request->validated());

        return redirect()->route('admin.notification-templates.index')
            ->with('success', 'Notification template created successfully.');
    }

    public function edit(NotificationTemplate $notificationTemplate)
    {
        return Inertia::render('Admin/NotificationTemplates/Edit', [
            'template' => $notificationTemplate,
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

    public function update(UpdateNotificationTemplateRequest $request, NotificationTemplate $notificationTemplate)
    {
        $notificationTemplate->update($request->validated());

        return redirect()->route('admin.notification-templates.index')
            ->with('success', 'Notification template updated successfully.');
    }

    public function destroy(NotificationTemplate $notificationTemplate)
    {
        $notificationTemplate->delete();

        return redirect()->route('admin.notification-templates.index')
            ->with('success', 'Notification template deleted successfully.');
    }
}
