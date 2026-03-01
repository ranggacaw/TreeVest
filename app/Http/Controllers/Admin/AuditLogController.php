<?php

namespace App\Http\Controllers\Admin;

use App\Enums\AuditEventType;
use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Services\AuditLogService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AuditLogController extends Controller
{
    public function index(Request $request)
    {
        $query = AuditLog::query();

        if ($request->has('event_type') && $request->event_type) {
            $query->where('event_type', $request->event_type);
        }

        if ($request->has('user_id') && $request->user_id) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->has('user_email') && $request->user_email) {
            $userIds = \App\Models\User::where('email', 'like', "%{$request->user_email}%")
                ->pluck('id');
            $query->whereIn('user_id', $userIds);
        }

        if ($request->has('date_from') && $request->date_from) {
            $query->where('created_at', '>=', $request->date_from);
        }

        if ($request->has('date_to') && $request->date_to) {
            $query->where('created_at', '<=', $request->date_to.' 23:59:59');
        }

        $auditLogs = $query->orderBy('created_at', 'desc')->paginate(50);

        AuditLogService::log(auth()->user(), AuditEventType::ADMIN_AUDIT_LOG_ACCESSED, [
            'action' => 'viewed_audit_log_list',
            'filters' => $request->only(['event_type', 'user_id', 'user_email', 'date_from', 'date_to']),
        ]);

        return Inertia::render('Admin/AuditLogs/Index', [
            'auditLogs' => $auditLogs,
            'filters' => [
                'event_type' => $request->event_type,
                'user_id' => $request->user_id,
                'user_email' => $request->user_email,
                'date_from' => $request->date_from,
                'date_to' => $request->date_to,
            ],
        ]);
    }

    public function show(AuditLog $auditLog)
    {
        $auditLog->load('user');

        AuditLogService::log(auth()->user(), AuditEventType::ADMIN_AUDIT_LOG_ACCESSED, [
            'action' => 'viewed_audit_log_detail',
            'audit_log_id' => $auditLog->id,
            'event_type' => $auditLog->event_type,
            'target_user_id' => $auditLog->user_id,
        ]);

        return Inertia::render('Admin/AuditLogs/Show', [
            'auditLog' => $auditLog,
        ]);
    }
}
