<?php

namespace App\Listeners;

use App\Enums\NotificationType;
use App\Events\ListingPurchased;

class NotifySellerOfSale
{
    public function handle(ListingPurchased $event): void
    {
        $seller = $event->seller;
        $listing = $event->listing;
        $transfer = $event->transfer;

        $notification = \App\Models\Notification::create([
            'user_id' => $seller->id,
            'type' => NotificationType::SecondarySale,
            'title' => 'Investment Sold',
            'message' => "Your investment has been sold for {$listing->formatted_ask_price}.",
            'read_at' => null,
            'data' => [
                'listing_id' => $listing->id,
                'investment_id' => $listing->investment_id,
                'transfer_price_cents' => $transfer->transfer_price_cents,
                'platform_fee_cents' => $transfer->platform_fee_cents,
                'net_proceeds_cents' => $listing->net_proceeds_cents,
                'buyer_id' => $event->buyer->id,
            ],
        ]);

        $seller->notify(new \App\Notifications\SecondarySaleSoldNotification($listing, $transfer, $event->buyer));
    }
}
