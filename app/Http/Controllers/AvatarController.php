<?php

namespace App\Http\Controllers;

use App\Services\AvatarService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AvatarController extends Controller
{
    public function __construct(
        private AvatarService $avatarService
    ) {}

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'avatar' => ['required', 'image', 'mimes:jpeg,png,webp', 'max:2048'],
        ]);

        $user = Auth::user();

        try {
            $avatarUrl = $this->avatarService->upload($user, $request->file('avatar'));

            $user->avatar_url = $avatarUrl;
            $user->save();

            return back()->with('status', 'avatar-uploaded');
        } catch (\Exception $e) {
            throw ValidationException::withMessages([
                'avatar' => 'Failed to upload avatar. Please try again.',
            ]);
        }
    }

    public function destroy(): RedirectResponse
    {
        $user = Auth::user();

        if (!$user->avatar_url) {
            return back()->with('error', 'No avatar to delete.');
        }

        $this->avatarService->delete($user);

        $user->avatar_url = null;
        $user->save();

        return back()->with('status', 'avatar-deleted');
    }
}
