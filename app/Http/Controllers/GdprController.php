<?php

namespace App\Http\Controllers;

use App\Jobs\DeleteUserData;
use App\Jobs\ExportUserData;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;

class GdprController extends Controller
{
    /**
     * Request a data export.
     */
    public function export(Request $request): RedirectResponse
    {
        ExportUserData::dispatch($request->user()->id);

        return Redirect::back()->with('status', 'data-export-requested');
    }

    /**
     * Request account deletion.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        // Log the user out
        auth()->guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        // Dispatch deletion job
        DeleteUserData::dispatch($user->id);

        return Redirect::to('/');
    }
}
