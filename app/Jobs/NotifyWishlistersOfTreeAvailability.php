<?php

namespace App\Jobs;

use App\Models\Tree;
use App\Models\WishlistItem;
use App\Notifications\WishlistTreeAvailableNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class NotifyWishlistersOfTreeAvailability implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public readonly Tree $tree) {}

    public function handle(): void
    {
        $tree = $this->tree->loadMissing(['fruitCrop.fruitType', 'fruitCrop.farm']);

        WishlistItem::where('wishlistable_type', Tree::class)
            ->where('wishlistable_id', $tree->id)
            ->with('user')
            ->each(function (WishlistItem $item) use ($tree) {
                $item->user?->notify(new WishlistTreeAvailableNotification($tree));
            });
    }
}
