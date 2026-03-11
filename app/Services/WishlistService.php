<?php

namespace App\Services;

use App\Models\User;
use App\Models\WishlistItem;
use Illuminate\Database\Eloquent\Collection;

class WishlistService
{
    /**
     * Toggle a wishlist item for the given user and entity.
     * Returns ['wishlisted' => bool] indicating the new state.
     */
    public function toggle(User $user, string $type, int $id): array
    {
        $morphMap = [
            'tree' => \App\Models\Tree::class,
            'farm' => \App\Models\Farm::class,
            'fruitcrop' => \App\Models\FruitCrop::class,
        ];

        $morphType = $morphMap[$type] ?? null;

        if (! $morphType) {
            throw new \InvalidArgumentException("Invalid wishlist entity type: {$type}");
        }

        $existing = WishlistItem::where('user_id', $user->id)
            ->where('wishlistable_type', $morphType)
            ->where('wishlistable_id', $id)
            ->first();

        if ($existing) {
            $existing->delete();

            return ['wishlisted' => false];
        }

        WishlistItem::create([
            'user_id' => $user->id,
            'wishlistable_type' => $morphType,
            'wishlistable_id' => $id,
        ]);

        return ['wishlisted' => true];
    }

    /**
     * Get all wishlist items for a user, grouped by entity type, with morphed relations loaded.
     */
    public function getForUser(User $user): Collection
    {
        return WishlistItem::where('user_id', $user->id)
            ->with(['wishlistable'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Returns an array of tree IDs that the user has wishlisted.
     * Used for O(1) lookup in marketplace props.
     */
    public function getWishlistedTreeIds(User $user): array
    {
        return WishlistItem::where('user_id', $user->id)
            ->where('wishlistable_type', \App\Models\Tree::class)
            ->pluck('wishlistable_id')
            ->map(fn ($id) => (int) $id)
            ->toArray();
    }

    /**
     * Check if a specific entity is wishlisted by the user.
     */
    public function isWishlisted(User $user, string $type, int $id): bool
    {
        $morphMap = [
            'tree' => \App\Models\Tree::class,
            'farm' => \App\Models\Farm::class,
            'fruitcrop' => \App\Models\FruitCrop::class,
        ];

        $morphType = $morphMap[$type] ?? null;

        if (! $morphType) {
            return false;
        }

        return WishlistItem::where('user_id', $user->id)
            ->where('wishlistable_type', $morphType)
            ->where('wishlistable_id', $id)
            ->exists();
    }
}
