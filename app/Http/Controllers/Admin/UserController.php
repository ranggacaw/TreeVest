<?php

namespace App\Http\Controllers\Admin;

use App\Enums\AuditEventType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SuspendUserRequest;
use App\Http\Requests\Admin\UpdateUserRoleRequest;
use App\Models\AuditLog;
use App\Models\Investment;
use App\Models\User;
use App\Services\AuditLogService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query();

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if ($request->has('role') && $request->role) {
            $query->where('role', $request->role);
        }

        if ($request->has('kyc_status') && $request->kyc_status) {
            $query->where('kyc_status', $request->kyc_status);
        }

        $users = $query->orderBy('created_at', 'desc')->paginate(10);

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'filters' => [
                'search' => $request->search,
                'role' => $request->role,
                'kyc_status' => $request->kyc_status,
            ],
        ]);
    }

    public function show(User $user)
    {
        $user->load([
            'kycVerifications' => function ($query) {
                $query->orderBy('created_at', 'desc')->limit(10);
            },
            'latestKycVerification.documents',
        ]);

        $auditEvents = AuditLog::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get();

        return Inertia::render('Admin/Users/Show', [
            'user' => $user,
            'auditEvents' => $auditEvents,
        ]);
    }

    public function update(UpdateUserRoleRequest $request, User $user)
    {
        $oldRole = $user->role;
        $newRole = $request->input('role');

        if ($user->id === auth()->user()->id) {
            return back()->with('error', __('admin.cannot_change_own_role'));
        }

        $user->role = $newRole;
        $user->save();

        AuditLogService::log(auth()->user(), AuditEventType::ROLE_CHANGED, [
            'target_user_id' => $user->id,
            'old_role' => $oldRole,
            'new_role' => $newRole,
        ]);

        return back()->with('success', __('admin.role_changed', ['role' => $newRole]));
    }

    public function suspend(SuspendUserRequest $request, User $user)
    {
        if ($user->role === 'admin') {
            return back()->with('error', __('admin.cannot_suspend_admin'));
        }

        if ($user->isSuspended()) {
            return back()->with('error', __('admin.already_suspended'));
        }

        $user->suspended_at = now();
        $user->suspended_reason = $request->input('reason');
        $user->save();

        AuditLogService::log(auth()->user(), AuditEventType::ADMIN_ACTION, [
            'action' => 'admin_user_suspended',
            'target_user_id' => $user->id,
            'reason' => $request->input('reason'),
        ]);

        return back()->with('success', __('admin.user_suspended'));
    }

    public function reactivate(User $user)
    {
        if (! $user->isSuspended()) {
            return back()->with('error', __('admin.not_suspended'));
        }

        $user->suspended_at = null;
        $user->suspended_reason = null;
        $user->save();

        AuditLogService::log(auth()->user(), AuditEventType::ADMIN_ACTION, [
            'action' => 'admin_user_reactivated',
            'target_user_id' => $user->id,
        ]);

        return back()->with('success', __('admin.user_reactivated'));
    }

    public function destroy(User $user)
    {
        if ($user->role === 'admin') {
            return back()->with('error', __('admin.cannot_delete_admin'));
        }

        $activeInvestments = Investment::where('user_id', $user->id)
            ->where('status', \App\Enums\InvestmentStatus::Active)
            ->count();

        if ($activeInvestments > 0) {
            return back()->with('error', __('admin.cannot_delete_with_investments'));
        }

        AuditLogService::log(auth()->user(), AuditEventType::ADMIN_ACTION, [
            'action' => 'admin_user_deleted',
            'target_user_id' => $user->id,
            'target_user_email' => $user->email,
        ]);

        $user->delete();

        return redirect()->route('admin.users.index')->with('success', __('admin.user_deleted_successfully'));
    }
}
