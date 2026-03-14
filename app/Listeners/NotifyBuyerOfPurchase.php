<?php

namespace App\Listeners;

use App\Enums\NotificationType;
use App\Events\ListingPurchased;

class NotifyBuyerOfPurchase
{
    public function handle(ListingPurchased $event): void
    {
        $buyer = $event->buyer;
        $listing = $event->listing;
        $transfer = $event->transfer;

        $notification = \App\Models\Notification::create([
            'user_id' => $buyer->id,
            'type' => NotificationType::SecondarySale,
            'title' => 'Investment Purchased',
            'message' => "You have successfully purchased an investment for {$listing->formatted_ask_price}.",
            'read_at' => null,
            'data' => [
                'listing_id' => $listing->id,
                'investment_id' => $listing->investment_id,
                'transfer_price_idr' => $transfer->transfer_price_idr,
                'seller_id' => $event->seller->id,
            ],
        ]);

        $buyer->notify(new \App\Notifications\SecondarySalePurchasedNotification($listing, $transfer, $event->seller));
    }
}
