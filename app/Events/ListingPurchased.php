<?php

namespace App\Events;

use App\Models\InvestmentTransfer;
use App\Models\MarketListing;
use App\Models\User;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ListingPurchased
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public MarketListing $listing,
        public InvestmentTransfer $transfer,
        public User $buyer,
        public User $seller
    ) {}
}
