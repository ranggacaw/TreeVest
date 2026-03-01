<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateLocaleRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class ProfileLocaleController extends Controller
{
    public function update(UpdateLocaleRequest $request): RedirectResponse
    {
        $user = Auth::user();

        if (! $user) {
            abort(401);
        }

        $oldLocale = $user->locale;
        $newLocale = $request->validated('locale');

        $user->locale = $newLocale;
        $user->save();

        Log::info('User locale changed', [
            'user_id' => $user->id,
            'old_locale' => $oldLocale,
            'new_locale' => $newLocale,
        ]);

        return back()->with('success', __('messages.locale_updated'));
    }
}
