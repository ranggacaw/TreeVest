<?php

namespace App\Observers;

use App\Jobs\NotifyWishlistersOfTreeAvailability;
use App\Jobs\NotifyWishlistersOfTreePriceChange;
use App\Models\Tree;

class TreeObserver
{
    /**
     * Handle the Tree "updated" event.
     * Dispatches notifications when a tree becomes investable or its price changes.
     */
    public function updated(Tree $tree): void
    {
        // Notify wishlisted users if the tree just became investable
        if ($tree->wasChanged('status') && $tree->isInvestable()) {
            NotifyWishlistersOfTreeAvailability::dispatch($tree);
        }

        // Notify wishlisted users if the price changed
        if ($tree->wasChanged('price_idr')) {
            NotifyWishlistersOfTreePriceChange::dispatch(
                $tree,
                (int) $tree->getOriginal('price_idr'),
                (int) $tree->price_idr,
            );
        }
    }
}
