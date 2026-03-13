<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
        ]);
    }

    /**
     * Display the detailed profile edit form.
     */
    public function editDetails(Request $request): Response
    {
        $user = $request->user();
        $view = 'Profile/EditDetails';

        if ($user->hasRole('investor')) {
            $view = 'Investor/Profile/EditDetails';
        }

        return Inertia::render($view, [
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status' => session('status'),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }

    /**
     * Update the user's phone number.
     */
    public function updatePhone(Request $request): RedirectResponse
    {
        $request->validate([
            'phone' => ['nullable', 'string', 'max:20'],
            'phone_country_code' => ['nullable', 'string', 'size:2'],
        ]);

        $user = $request->user();
        $user->phone = $request->input('phone');
        $user->phone_country_code = $request->input('phone_country_code', 'MY');
        $user->phone_verified_at = null;
        $user->save();

        return Redirect::route('profile.edit-details')->with('status', 'phone-updated');
    }
}
