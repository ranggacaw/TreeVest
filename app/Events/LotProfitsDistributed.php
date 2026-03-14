<?php

namespace App\Events;

use App\Models\Lot;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class LotProfitsDistributed
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public readonly Lot $lot,
        public readonly int $investorPoolIdr,
        public readonly int $farmOwnerShareIdr,
        public readonly int $platformFeeIdr,
    ) {}
}
