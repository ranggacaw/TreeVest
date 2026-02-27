<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AccountController extends Controller
{
    public function deactivate(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = Auth::user();

        $user->delete();

        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/')->with('status', 'account-deactivated');
    }

    public function requestDeletion(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
            'reason' => ['nullable', 'string', 'max:500'],
        ]);

        $user = Auth::user();

        $user->deletion_requested_at = now();
        $user->deletion_reason = $request->input('reason');
        $user->save();

        return back()->with('status', 'deletion-requested');
    }
}
